from fastapi import APIRouter, HTTPException, status
from app.database import get_db_connection
from app.schemas.schemas_erp import VendaCreate

router = APIRouter(prefix="/vendas", tags=["Operações de Venda / PDV"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def registrar_venda_complexa(venda: VendaCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Criação do cabeçalho da venda ligado ao Caixa ativo
        cursor.execute(
            "INSERT INTO Vendas (id_caixa, data_venda, valor_total, valor_desconto) OUTPUT INSERTED.id_venda VALUES (?, GETDATE(), 0, ?)",
            (venda.id_caixa, venda.valor_desconto)
        )
        id_venda = cursor.fetchone()[0]
        
        # 2. Processamento dos Itens chamando a Procedure do banco (Baixa automática de estoque)
        for item in venda.itens:
            # A procedure gera um RAISERROR caso o estoque fique negativo
            cursor.execute(
                "EXEC sp_RegistrarItemVenda @id_venda=?, @codigo_barras=?, @quantidade=?",
                (id_venda, item.codigo_barras, item.quantidade)
            )
            
        # 3. Processamento do(s) Pagamento(s) - Permite múltiplos formatos (Dinheiro + Pix)
        for pag in venda.pagamentos:
            cursor.execute(
                "INSERT INTO PagamentosVenda (id_venda, forma_pagamento, valor_pago) VALUES (?, ?, ?)",
                (id_venda, pag.forma_pagamento, pag.valor_pago)
            )
            
        # Se tudo rodar perfeitamente, commita todas as alterações de uma vez só
        conn.commit()
        conn.close()
        return {"status": "Sucesso", "id_venda": id_venda, "mensagem": "Venda transacionada e estoque atualizado!"}
        
    except Exception as e:
        conn.rollback() # Cancela TUDO se der erro (Evita estoque furado ou venda sem item)
        conn.close()
        raise HTTPException(
            status_code=400, 
            detail=f"Falha Crítica na Transação. Operação abortada pelo banco: {str(e)}"
        )