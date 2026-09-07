from fastapi import FastAPI
from app.routes import produtos

app = FastAPI(title="API depósito Macedo")

app.include_router(produtos.router, prefix="/app/v1")

@app.get("/")

def home():
    return {"status": "Online", "documentacao": "/docs"}