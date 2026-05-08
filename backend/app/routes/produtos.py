from fastapi import APIRouter, HTTPException
from app.database import get_db_connection, row_to_dict
from app.schemas.produto_schema import ProdutoCreate

router = APIRouter(prefix="/produtos", tags=["Produtos"])


@router.get("/")
def listar_catalogo():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM Produtos")

        rows = cursor.fetchall()

        produtos = [row_to_dict(cursor, row) for row in rows]

        conn.close()
        return produtos

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao acessar o banco: {str(e)}"
        )


@router.post("/", status_code=201)
def cadastrar_produto(produto: ProdutoCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = """
            EXEC sp_SalvarProduto 
                @nome=?, @preco_custo=?, @preco_venda=?, 
                @estoque_inicial=?, @estoque_minimo=?, 
                @codigo_barras=?, @nome_categoria=?, @nome_marca=?
        """
    
        valores = (
            produto.nome, 
            produto.preco_custo, 
            produto.preco_venda, 
            produto.estoque_inicial, 
            produto.estoque_minimo, 
            produto.codigo_barras, 
            produto.nome_categoria, 
            produto.nome_marca
        )
    
        cursor.execute(sql, valores)
        conn.commit()
        conn.close()

        return {"mensagem": f"Produto '{produto.nome}' cadastrado com sucesso!"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao cadastrar produto: {str(e)}"
        )