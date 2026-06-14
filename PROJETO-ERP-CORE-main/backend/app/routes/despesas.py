from fastapi import APIRouter, HTTPException, status
from app.database import get_db_connection, row_to_dict
from app.schemas.schemas_erp import DespesaCreate

router = APIRouter(prefix="/despesas", tags=["Financeiro / Contas a Pagar"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def lancar_despesa(despesa: DespesaCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
            INSERT INTO Despesas (descricao, data_vencimento, valor_total, status_pagamento, data_pagamento)
            VALUES (?, ?, ?, ?, NULL)
        """
        cursor.execute(sql, (despesa.descricao, despesa.data_vencimento, despesa.valor_total, despesa.status_pagamento))
        conn.commit()
        conn.close()
        return {"status": "Sucesso", "mensagem": "Despesa provisionada no fluxo de caixa."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/baixar/{id_despesa}", status_code=200)
def liquidar_despesa(id_despesa: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
            UPDATE Despesas 
            SET status_pagamento = 'PAGO', data_pagamento = GETDATE()
            WHERE id_despesa = ?
        """
        cursor.execute(sql, (id_despesa,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Despesa não encontrada.")
        conn.commit()
        conn.close()
        return {"status": "Sucesso", "mensagem": "Despesa liquidada com sucesso!"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))