from pydantic import BaseModel
from typing import Optional

class ProdutoCreate(BaseModel):
    nome: str = "PRODUTO TESTE"
    preco_custo: float = 10.0
    preco_venda: float = 20.0
    estoque_inicial: int = 100
    estoque_minimo: int = 10
    codigo_barras: Optional[str] = "123456789"
    nome_categoria: str = "Geral"
    nome_marca: str = "Marca X"