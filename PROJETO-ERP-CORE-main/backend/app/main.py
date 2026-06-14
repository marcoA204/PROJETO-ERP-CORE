from fastapi import FastAPI
from app.routes import produtos, caixa, vendas, despesas

app = FastAPI(
    title="Core ERP & PDV API",
    description="Backend transacional para automação comercial de pequenos varejos.",
    version="1.0.0"
)

# Acoplamento de rotas do sistema distribuído
app.include_router(produtos.router, prefix="/api/v1")
app.include_router(caixa.router, prefix="/api/v1")
app.include_router(vendas.router, prefix="/api/v1")
app.include_router(despesas.router, prefix="/api/v1")

@app.get("/", tags=["Root"])
def home():
    return {
        "status": "Online",
        "ambiente": "Desenvolvimento/Testes",
        "documentacao": "/docs"
    }