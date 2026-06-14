from fastapi import APIRouter, HTTPException, status
from app.database import get_db_connection, row_to_dict
from app.schemas.schemas_erp import CaixaAbrir, CaixaFechar
from datetime import datetime

router = APIRouter(prefix="/caixa", tags=["Controle de Caixa"])

@router.post("/abrir", status_code=status.HTTP_201_CREATED)
def abrir_caixa(dados: CaixaAbrir):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Valida se já não existe um caixa aberto para evitar duplicidade
        cursor.execute("SELECT id_caixa FROM Controle_Caixa WHERE status_caixa = 'ABERTO'")
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Já existe um terminal de caixa aberto.")
            
        sql = """
            INSERT INTO Controle_Caixa (data_abertura, troco_inicial, status_caixa)
            VALUES (?, ?, 'ABERTO')
        """
        cursor.execute(sql, (datetime.now(), dados.troco_inicial))
        conn.commit()
        conn.close()
        return {"status": "Sucesso", "mensagem": "Caixa aberto com sucesso!"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.put("/fechar/{id_caixa}", status_code=200)
def fechar_caixa(id_caixa: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = """
            UPDATE Controle_Caixa 
            SET data_fechamento = ?, status_caixa = 'FECHADO'
            WHERE id_caixa = ? AND status_caixa = 'ABERTO'
        """
        cursor.execute(sql, (datetime.now(), id_caixa))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Caixa não encontrado ou já fechado.")
            
        conn.commit()
        conn.close()
        return {"status": "Sucesso", "mensagem": f"Caixa {id_caixa} fechado com sucesso."}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")