/* 
   SISTEMA PDV & MINI-ERP - VERSÃO 3.3 (GOLD REVISION FINAL -)
   = */

USE master;
GO

-- 1. RESET DO BANCO (Cuidado: Apaga tudo para subir a versão limpa)
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'ERP_PDV_Master')
BEGIN
    ALTER DATABASE ERP_PDV_Master SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ERP_PDV_Master;
END
GO

CREATE DATABASE ERP_PDV_Master;
GO

USE ERP_PDV_Master;
GO

-- Configuração de segurança para garantir integridade em caso de erro
SET XACT_ABORT ON; 
GO

-- =========================================================================
-- 2. TABELAS (ESTRUTURA RELACIONAL PROFISSIONAL)
-- =========================================================================

CREATE TABLE Categorias (
    id_categoria INT PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Marcas (
    id_marca INT PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Produtos (
    id_produto INT PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(100) NOT NULL,
    preco_custo DECIMAL(10,2) NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    estoque_atual INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 5,
    codigo_barras VARCHAR(13),
    id_categoria INT NULL FOREIGN KEY REFERENCES Categorias(id_categoria),
    id_marca INT NULL FOREIGN KEY REFERENCES Marcas(id_marca),
    ativo BIT DEFAULT 1
);
-- Índice para busca instantânea por código de barras (essencial para PDV)
CREATE UNIQUE INDEX UIX_Produtos_Codigo ON Produtos(codigo_barras) WHERE ativo = 1;

CREATE TABLE Controle_Caixa (
    id_caixa INT PRIMARY KEY IDENTITY(1,1),
    data_abertura DATETIME DEFAULT GETDATE(),
    troco_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
    data_fechamento DATETIME NULL,
    status_caixa VARCHAR(20) DEFAULT 'ABERTO' 
);

CREATE TABLE Vendas (
    id_venda INT PRIMARY KEY IDENTITY(1,1),
    id_caixa INT NOT NULL FOREIGN KEY REFERENCES Controle_Caixa(id_caixa),
    data_venda DATETIME DEFAULT GETDATE(),
    valor_total DECIMAL(10,2) DEFAULT 0,
    valor_desconto DECIMAL(10,2) NOT NULL DEFAULT 0 -- Permite descontos no balcão
);

CREATE TABLE PagamentosVenda (
    id_pagamento INT PRIMARY KEY IDENTITY(1,1),
    id_venda INT NOT NULL FOREIGN KEY REFERENCES Vendas(id_venda),
    forma_pagamento VARCHAR(50) NOT NULL, -- DINHEIRO, PIX, CARTÃO
    valor_pago DECIMAL(10,2) NOT NULL
);

CREATE TABLE ItensVenda (
    id_item INT PRIMARY KEY IDENTITY(1,1),
    id_venda INT NOT NULL FOREIGN KEY REFERENCES Vendas(id_venda),
    id_produto INT NOT NULL FOREIGN KEY REFERENCES Produtos(id_produto),
    quantidade INT NOT NULL,
    preco_unitario_praticado DECIMAL(10,2) NOT NULL,
    preco_custo_momento DECIMAL(10,2) NOT NULL 
);
-- Índice de cobertura para relatórios rápidos de vendas
CREATE INDEX IX_ItensVenda_Produto ON ItensVenda(id_produto);

CREATE TABLE Historico_Movimentacao_Estoque (
    id_movimento INT PRIMARY KEY IDENTITY(1,1),
    id_produto INT NOT NULL FOREIGN KEY REFERENCES Produtos(id_produto),
    data_movimento DATETIME DEFAULT GETDATE(),
    tipo_movimento VARCHAR(10) NOT NULL, -- ENTRADA / SAÍDA
    quantidade INT NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    usuario_responsavel VARCHAR(50) DEFAULT 'Sistema'
);

CREATE TABLE Despesas (
    id_despesa INT PRIMARY KEY IDENTITY(1,1),
    descricao VARCHAR(100) NOT NULL, 
    data_vencimento DATE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status_pagamento VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE / PAGO
    data_pagamento DATE NULL
);
GO

-- =========================================================================
-- 3. PROCEDURES (LÓGICA E AUTOMAÇÃO)
-- =========================================================================

-- 3.1 SALVAR PRODUTO (Criação Dinâmica de Marca/Categoria)
CREATE OR ALTER PROCEDURE sp_SalvarProduto
    @nome VARCHAR(100),
    @preco_custo DECIMAL(10,2),
    @preco_venda DECIMAL(10,2),
    @estoque_inicial INT,
    @estoque_minimo INT = 5,
    @codigo_barras VARCHAR(13) = NULL,
    @nome_categoria VARCHAR(100) = NULL,
    @nome_marca VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_cat INT = NULL, @id_mar INT = NULL, @id_novo INT;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Resolve Categoria
        IF ISNULL(@nome_categoria, '') <> ''
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM Categorias WHERE nome = @nome_categoria)
                INSERT INTO Categorias (nome) VALUES (@nome_categoria);
            SELECT @id_cat = id_categoria FROM Categorias WHERE nome = @nome_categoria;
        END
        
        -- Resolve Marca
        IF ISNULL(@nome_marca, '') <> ''
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM Marcas WHERE nome = @nome_marca)
                INSERT INTO Marcas (nome) VALUES (@nome_marca);
            SELECT @id_mar = id_marca FROM Marcas WHERE nome = @nome_marca;
        END

        INSERT INTO Produtos (nome, preco_custo, preco_venda, estoque_atual, estoque_minimo, codigo_barras, id_categoria, id_marca) 
        VALUES (@nome, @preco_custo, @preco_venda, @estoque_inicial, @estoque_minimo, @codigo_barras, @id_cat, @id_mar);
        
        SET @id_novo = SCOPE_IDENTITY();
        
        -- Auditoria de entrada
        INSERT INTO Historico_Movimentacao_Estoque (id_produto, tipo_movimento, quantidade, motivo)
        VALUES (@id_novo, 'ENTRADA', @estoque_inicial, 'Cadastro Inicial');

        -- Gerador de código interno se não fornecido
        IF ISNULL(@codigo_barras, '') = ''
            UPDATE Produtos SET codigo_barras = '200' + RIGHT('0000000000' + CAST(@id_novo AS VARCHAR), 10) WHERE id_produto = @id_novo;
        
        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK; THROW;
    END CATCH
END
GO

-- 3.2 REGISTRAR ITEM NA VENDA (Baixa de Estoque + Auditoria)
CREATE OR ALTER PROCEDURE sp_RegistrarItemVenda
    @id_venda INT, @codigo_barras VARCHAR(13), @quantidade INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_p INT, @est INT, @prcV DECIMAL(10,2), @prcC DECIMAL(10,2);
    
    SELECT @id_p = id_produto, @est = estoque_atual, @prcV = preco_venda, @prcC = preco_custo 
    FROM Produtos WHERE codigo_barras = @codigo_barras AND ativo = 1;

    IF @id_p IS NULL RAISERROR('Produto não encontrado.', 16, 1);
    IF @est < @quantidade RAISERROR('Estoque insuficiente.', 16, 1);

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO ItensVenda (id_venda, id_produto, quantidade, preco_unitario_praticado, preco_custo_momento) 
        VALUES (@id_venda, @id_p, @quantidade, @prcV, @prcC);

        UPDATE Produtos SET estoque_atual = estoque_atual - @quantidade WHERE id_produto = @id_p;

        -- Registro na Auditoria de Saída
        INSERT INTO Historico_Movimentacao_Estoque (id_produto, tipo_movimento, quantidade, motivo)
        VALUES (@id_p, 'SAÍDA', @quantidade, 'Venda ID: ' + CAST(@id_venda AS VARCHAR));

        -- Atualiza o valor total bruto da venda no cabeçalho
        UPDATE Vendas SET valor_total = valor_total + (@quantidade * @prcV) WHERE id_venda = @id_venda;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK; THROW;
    END CATCH
END
GO

-- =========================================================================
-- 4. VIEWS (RELATÓRIOS E DASHBOARDS)
-- =========================================================================

-- 4.1 Catálogo Geral de Produtos
CREATE OR ALTER VIEW vw_CatalogoProdutos AS
SELECT P.codigo_barras, P.nome AS Produto, ISNULL(C.nome, 'Geral') AS Categoria, ISNULL(M.nome, 'Geral') AS Marca, P.estoque_atual, P.preco_venda 
FROM Produtos P LEFT JOIN Categorias C ON P.id_categoria = C.id_categoria LEFT JOIN Marcas M ON P.id_marca = M.id_marca WHERE P.ativo = 1;
GO

-- 4.2 Alerta de Compras (Stock Baixo)
CREATE OR ALTER VIEW vw_SugestaoCompra AS
SELECT P.nome AS Produto, P.estoque_atual, P.estoque_minimo, (P.estoque_minimo - P.estoque_atual + 1) AS Qtd_Comprar, P.preco_custo
FROM Produtos P WHERE P.estoque_atual <= P.estoque_minimo AND P.ativo = 1;
GO

-- 4.3 Fechamento de Caixa (Conferência de Gaveta)
CREATE OR ALTER VIEW vw_FechamentoCaixa AS
SELECT 
    C.id_caixa AS Turno,
    C.status_caixa AS Status,
    C.troco_inicial,
    ISNULL(SUM(P.valor_pago), 0) AS Faturamento_Total,
    (C.troco_inicial + ISNULL(SUM(CASE WHEN P.forma_pagamento = 'DINHEIRO' THEN P.valor_pago ELSE 0 END), 0)) AS Dinheiro_Em_Caixa_Fisico
FROM Controle_Caixa C
LEFT JOIN Vendas V ON C.id_caixa = V.id_caixa
LEFT JOIN PagamentosVenda P ON V.id_venda = P.id_venda
GROUP BY C.id_caixa, C.status_caixa, C.troco_inicial;
GO

-- 4.4 DRE Mensal (Lucro Líquido Real - VISÃO ENXUTA SEM MOSTRAR DESCONTO)
CREATE OR ALTER VIEW vw_RelatorioMensal_DRE AS
SELECT 
    Vendas_Agrupadas.Mes,
    
    -- O Faturamento já aparece com o desconto abatido (Escondendo a coluna de desconto)
    (Vendas_Agrupadas.Faturamento_Bruto - ISNULL(Vendas_Agrupadas.Total_Descontos, 0)) AS Faturamento_Real_Recebido, 
    
    Vendas_Agrupadas.Custo_Produtos,
    ISNULL(Despesas_Agrupadas.Total_Despesas, 0) AS Despesas_Operacionais,
    
    -- O Lucro Líquido já considera a subtração do desconto
    (Vendas_Agrupadas.Faturamento_Bruto - ISNULL(Vendas_Agrupadas.Total_Descontos, 0) - Vendas_Agrupadas.Custo_Produtos - ISNULL(Despesas_Agrupadas.Total_Despesas, 0)) AS Lucro_Liquido
FROM (
    SELECT 
        FORMAT(V.data_venda, 'yyyy-MM') AS Mes,
        SUM(V.valor_total) AS Faturamento_Bruto,
        SUM(V.valor_desconto) AS Total_Descontos,
        SUM(IV_Custo.Custo_Total) AS Custo_Produtos
    FROM Vendas V
    LEFT JOIN (
        SELECT id_venda, SUM(quantidade * preco_custo_momento) AS Custo_Total
        FROM ItensVenda
        GROUP BY id_venda
    ) AS IV_Custo ON V.id_venda = IV_Custo.id_venda
    GROUP BY FORMAT(V.data_venda, 'yyyy-MM')
) AS Vendas_Agrupadas
LEFT JOIN (
    SELECT FORMAT(data_pagamento, 'yyyy-MM') AS MesD, SUM(valor_total) AS Total_Despesas
    FROM Despesas WHERE status_pagamento = 'PAGO'
    GROUP BY FORMAT(data_pagamento, 'yyyy-MM')
) AS Despesas_Agrupadas ON Vendas_Agrupadas.Mes = Despesas_Agrupadas.MesD;
GO

PRINT '=== ERP_PDV_Master v3.3 (GOLD FINAL ) INSTALADO COM SUCESSO! ===';