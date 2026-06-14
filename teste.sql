-- 1. Cria a tabela de Clientes
CREATE TABLE Clientes (
    ClienteID INT IDENTITY(1,1) PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    Ativo BIT DEFAULT 1,
    DataCadastro DATETIME DEFAULT GETDATE()
);
GO

-- 2. Insere dados na tabela
INSERT INTO Clientes (Nome, Email) 
VALUES ('Ana Souza', 'ana@exemplo.com'),
       ('Carlos Silva', 'carlos@exemplo.com');
GO

-- 3. Consulta os dados inseridos
SELECT ClienteID, Nome, Email, Ativo 
FROM Clientes;
GO

-- 4. Atualiza o e-mail de um cliente
UPDATE Clientes
SET Email = 'ana.souza@novoemail.com'
WHERE Nome = 'Ana Souza';
GO

-- 5. Exclui um cliente da tabela
DELETE FROM Clientes
WHERE Nome = 'Carlos Silva';
GO

-- 6. Limpeza (opcional): Apaga a tabela para reiniciar
DROP TABLE Clientes;
GO
