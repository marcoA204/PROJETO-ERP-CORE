from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

# --- SCHEMA DE PRODUTOS ---
class ProdutoCreate(BaseModel):
    nome: str
    preco_custo: float
    preco_venda: float
    estoque_inicial: int
    estoque_minimo: int
    codigo_barras: Optional[str] = None
    nome_categoria: str
    nome_marca: str

# --- SCHEMAS DE CAIXA ---
class CaixaAbrir(BaseModel):
    troco_inicial: float = Field(..., ge=0, description="Troco inicial na gaveta")

class CaixaFechar(BaseModel):
    status_caixa: str = "FECHADO"

# --- SCHEMAS DE VENDA COMPLEXA ---
class ItemVendaInput(BaseModel):
    codigo_barras: str
    quantidade: int = Field(..., gt=0, description="Quantidade deve ser maior que zero")

class PagamentoInput(BaseModel):
    forma_pagamento: str # PIX, DINHEIRO, CARTAO
    valor_pago: float

class VendaCreate(BaseModel):
    id_caixa: int
    valor_desconto: float = 0.0
    itens: List[ItemVendaInput]
    pagamentos: List[PagamentoInput]

# --- SCHEMAS DE DESPESAS (FINANCEIRO) ---
class DespesaCreate(BaseModel):
    descricao: str
    data_vencimento: date
    valor_total: float
    status_pagamento: str = "PENDENTE"