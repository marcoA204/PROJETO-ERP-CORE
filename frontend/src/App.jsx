import { useState } from "react";

// ── Paleta de cores ──────────────────────────────────────────
const C = {
  navyDark:  "#1A2B4A",
  navyMid:   "#2E4D80",
  navyLight: "#3D6199",
  white:     "#FFFFFF",
  bgPage:    "#F0F3F8",
  bgCard:    "#FFFFFF",
  grayMid:   "#6B7A99",
  grayLight: "#D1D9E8",
  green:     "#22A869",
  greenBg:   "#E6F7F0",
  red:       "#E04444",
  redBg:     "#FDEAEA",
  yellow:    "#F5A623",
  yellowBg:  "#FEF6E7",
};

// ── Dados de exemplo ─────────────────────────────────────────
const initialProducts = [
  { id: 1, nome: "Notebook Dell", categoria: "Eletrônicos", estoque: 14, minimo: 5,  preco: 3200 },
  { id: 2, nome: "Mouse Logitech", categoria: "Periféricos",  estoque: 3,  minimo: 10, preco: 120  },
  { id: 3, nome: "Teclado Mecânico", categoria: "Periféricos", estoque: 8, minimo: 5,  preco: 350  },
  { id: 4, nome: "Monitor 24\"",    categoria: "Eletrônicos", estoque: 6,  minimo: 3,  preco: 1100 },
  { id: 5, nome: "Cabo HDMI",       categoria: "Acessórios",  estoque: 30, minimo: 10, preco: 35   },
];

const initialTransactions = [
  { id: 1, data: "2026-06-01", tipo: "entrada", produto: "Notebook Dell",    qtd: 5,  valor: 16000, obs: "Compra fornecedor A" },
  { id: 2, data: "2026-06-02", tipo: "saida",   produto: "Mouse Logitech",   qtd: 8,  valor: 960,   obs: "Venda cliente B"    },
  { id: 3, data: "2026-06-03", tipo: "entrada", produto: "Cabo HDMI",        qtd: 20, valor: 700,   obs: "Reposição estoque"  },
  { id: 4, data: "2026-06-05", tipo: "saida",   produto: "Teclado Mecânico", qtd: 2,  valor: 700,   obs: "Venda cliente C"    },
  { id: 5, data: "2026-06-07", tipo: "saida",   produto: "Monitor 24\"",     qtd: 1,  valor: 1100,  obs: "Venda cliente D"    },
  { id: 6, data: "2026-06-09", tipo: "entrada", produto: "Mouse Logitech",   qtd: 5,  valor: 600,   obs: "Compra fornecedor A"},
];

// ── Ícones SVG inline ────────────────────────────────────────
const Icon = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  stock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    </svg>
  ),
  cashflow: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  register: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  arrowUp: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
  ),
  arrowDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
    </svg>
  ),
  alert: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  ),
};

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ── Componente: Sidebar ──────────────────────────────────────
function Sidebar({ active, onNav, onLogout }) {
  const items = [
    { id: "dashboard", label: "Dashboard",    icon: Icon.dashboard },
    { id: "estoque",   label: "Estoque",       icon: Icon.stock     },
    { id: "fluxo",     label: "Fluxo de Caixa",icon: Icon.cashflow  },
    { id: "cadastro",  label: "Cadastrar Produto", icon: Icon.register },
  ];

  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: C.navyDark,
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 24px 20px", borderBottom: `1px solid ${C.navyMid}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
  width: 48, height: 48, borderRadius: 10,
  background: C.navyDark, display: "flex", alignItems: "center",
  justifyContent: "center", fontSize: 18, fontWeight: 800, color: C.white,
}}>
  <img src="/logo.png" alt="LogiFlow" style={{ width: 125, height: 125, objectFit: "contain" }} />
</div>
          <div>
            <div style={{ color: C.white, fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}>LogiFlow</div>
            <div style={{ color: C.grayMid, fontSize: 11 }}>Gestão de Estoque</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <div style={{ color: C.grayMid, fontSize: 10, fontWeight: 600, letterSpacing: 1, padding: "0 12px 8px", textTransform: "uppercase" }}>Menu</div>
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: isActive ? C.navyMid : "transparent",
              color: isActive ? C.white : C.grayMid,
              fontFamily: "inherit", fontSize: 14, fontWeight: isActive ? 600 : 400,
              marginBottom: 2, transition: "all 0.15s",
              textAlign: "left",
            }}>
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "16px 12px", borderTop: `1px solid ${C.navyMid}` }}>
        <button onClick={onLogout} style={{
          width: "100%", padding: "10px 12px", borderRadius: 8, border: "none",
          background: "transparent", color: C.grayMid, cursor: "pointer",
          fontFamily: "inherit", fontSize: 14, fontWeight: 500, textAlign: "left",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
        <div style={{ color: C.grayMid, fontSize: 11, paddingLeft: 12, marginTop: 4 }}>v1.0.0</div>
      </div>
    </aside>
  );
}

// ── Componente: Card de Stat ─────────────────────────────────
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: C.bgCard, borderRadius: 12, padding: "20px 24px",
      boxShadow: "0 1px 4px rgba(26,43,74,0.08)", flex: 1, minWidth: 160,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: C.grayMid, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ color: C.navyDark, fontSize: 26, fontWeight: 700 }}>{value}</div>
          {sub && <div style={{ color, fontSize: 12, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>{icon}{sub}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Tela: Dashboard ──────────────────────────────────────────
function Dashboard({ products, transactions }) {
  const totalEntradas = transactions.filter(t => t.tipo === "entrada").reduce((s, t) => s + t.valor, 0);
  const totalSaidas   = transactions.filter(t => t.tipo === "saida").reduce((s, t) => s + t.valor, 0);
  const saldo         = totalEntradas - totalSaidas;
  const alertas       = products.filter(p => p.estoque < p.minimo).length;
  const recentes      = [...transactions].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);

  return (
    <div>
      <h1 style={{ color: C.navyDark, fontWeight: 700, fontSize: 22, marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: C.grayMid, fontSize: 14, marginBottom: 28 }}>Visão geral do seu negócio</p>

      {/* Cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard label="Total Entradas" value={fmt(totalEntradas)} sub="no período" color={C.green} icon={Icon.arrowUp} />
        <StatCard label="Total Saídas"   value={fmt(totalSaidas)}   sub="no período" color={C.red}   icon={Icon.arrowDown} />
        <StatCard label="Saldo"          value={fmt(saldo)}         sub={saldo >= 0 ? "positivo" : "negativo"} color={saldo >= 0 ? C.green : C.red} />
        <StatCard label="Alertas Estoque" value={alertas} sub={alertas > 0 ? "produtos abaixo do mínimo" : "tudo em ordem"} color={alertas > 0 ? C.yellow : C.green} icon={alertas > 0 ? Icon.alert : null} />
      </div>

      {/* Últimas movimentações */}
      <div style={{ background: C.bgCard, borderRadius: 12, boxShadow: "0 1px 4px rgba(26,43,74,0.08)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.grayLight}` }}>
          <span style={{ color: C.navyDark, fontWeight: 600, fontSize: 15 }}>Últimas Movimentações</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bgPage }}>
              {["Data", "Tipo", "Produto", "Qtd", "Valor"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.grayMid, fontSize: 12, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentes.map((t) => (
              <tr key={t.id} style={{ borderTop: `1px solid ${C.grayLight}` }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.grayMid }}>{t.data.split("-").reverse().join("/")}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    background: t.tipo === "entrada" ? C.greenBg : C.redBg,
                    color: t.tipo === "entrada" ? C.green : C.red,
                    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    {t.tipo === "entrada" ? Icon.arrowUp : Icon.arrowDown}
                    {t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.navyDark, fontWeight: 500 }}>{t.produto}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.navyDark }}>{t.qtd}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: t.tipo === "entrada" ? C.green : C.red }}>{fmt(t.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tela: Estoque ────────────────────────────────────────────
function Estoque({ products }) {
  const [busca, setBusca] = useState("");
  const filtrados = products.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ color: C.navyDark, fontWeight: 700, fontSize: 22, marginBottom: 6 }}>Estoque</h1>
      <p style={{ color: C.grayMid, fontSize: 14, marginBottom: 24 }}>{products.length} produtos cadastrados</p>

      {/* Busca */}
      <input
        placeholder="Buscar produto ou categoria..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        style={{
          width: "100%", maxWidth: 360, padding: "10px 14px", borderRadius: 8,
          border: `1.5px solid ${C.grayLight}`, fontSize: 14, marginBottom: 20,
          outline: "none", fontFamily: "inherit", boxSizing: "border-box",
          color: C.navyDark,
        }}
      />

      <div style={{ background: C.bgCard, borderRadius: 12, boxShadow: "0 1px 4px rgba(26,43,74,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bgPage }}>
              {["Produto", "Categoria", "Estoque", "Mínimo", "Preço Unitário", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: C.grayMid, fontSize: 12, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => {
              const baixo = p.estoque < p.minimo;
              return (
                <tr key={p.id} style={{ borderTop: `1px solid ${C.grayLight}` }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: C.navyDark, fontSize: 14 }}>{p.nome}</td>
                  <td style={{ padding: "14px 16px", color: C.grayMid, fontSize: 13 }}>{p.categoria}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: baixo ? C.red : C.navyDark }}>{p.estoque}</span>
                  </td>
                  <td style={{ padding: "14px 16px", color: C.grayMid, fontSize: 13 }}>{p.minimo}</td>
                  <td style={{ padding: "14px 16px", color: C.navyDark, fontSize: 13, fontWeight: 500 }}>{fmt(p.preco)}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      background: baixo ? C.yellowBg : C.greenBg,
                      color: baixo ? C.yellow : C.green,
                      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      display: "inline-flex", alignItems: "center", gap: 4,
                    }}>
                      {baixo ? <>{Icon.alert} Estoque baixo</> : "OK"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtrados.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: C.grayMid }}>Nenhum produto encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tela: Fluxo de Caixa ─────────────────────────────────────
function FluxoCaixa({ transactions, setTransactions, products }) {
  const [filtro, setFiltro] = useState("todos");
  const [form, setForm]     = useState({ data: "", tipo: "entrada", produto: "", qtd: "", valor: "", obs: "" });
  const [erro, setErro]     = useState("");

  const filtrados = transactions
    .filter(t => filtro === "todos" || t.tipo === filtro)
    .sort((a, b) => b.data.localeCompare(a.data));

  const totalEntradas = transactions.filter(t => t.tipo === "entrada").reduce((s, t) => s + t.valor, 0);
  const totalSaidas   = transactions.filter(t => t.tipo === "saida").reduce((s, t) => s + t.valor, 0);

  const handleAdd = () => {
    if (!form.data || !form.produto || !form.qtd || !form.valor) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    const nova = {
      id: Date.now(),
      data: form.data,
      tipo: form.tipo,
      produto: form.produto,
      qtd: Number(form.qtd),
      valor: Number(form.valor),
      obs: form.obs,
    };
    setTransactions(prev => [...prev, nova]);
    setForm({ data: "", tipo: "entrada", produto: "", qtd: "", valor: "", obs: "" });
    setErro("");
  };

  const handleDelete = (id) => setTransactions(prev => prev.filter(t => t.id !== id));

  const inputStyle = {
    padding: "9px 12px", borderRadius: 7, border: `1.5px solid ${C.grayLight}`,
    fontSize: 13, fontFamily: "inherit", color: C.navyDark, outline: "none",
    background: C.white,
  };

  return (
    <div>
      <h1 style={{ color: C.navyDark, fontWeight: 700, fontSize: 22, marginBottom: 6 }}>Fluxo de Caixa</h1>
      <p style={{ color: C.grayMid, fontSize: 14, marginBottom: 24 }}>Registre entradas e saídas de produtos</p>

      {/* Resumo */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard label="Entradas" value={fmt(totalEntradas)} color={C.green} sub="total geral" icon={Icon.arrowUp} />
        <StatCard label="Saídas"   value={fmt(totalSaidas)}   color={C.red}   sub="total geral" icon={Icon.arrowDown} />
        <StatCard label="Saldo"    value={fmt(totalEntradas - totalSaidas)} color={totalEntradas - totalSaidas >= 0 ? C.green : C.red} sub="total geral" />
      </div>

      {/* Formulário de nova movimentação */}
      <div style={{ background: C.bgCard, borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(26,43,74,0.08)", marginBottom: 28 }}>
        <div style={{ fontWeight: 600, color: C.navyDark, marginBottom: 16, fontSize: 15 }}>Nova Movimentação</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})}
            style={{...inputStyle, flex: "1 1 140px"}} />
          <select value={form.produto} onChange={e => {
  const prod = products.find(p => p.nome === e.target.value);
  setForm({...form, produto: e.target.value, valor: prod ? prod.preco * (form.qtd || 1) : ""});
}}
            style={{...inputStyle, flex: "1 1 120px"}}>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <select value={form.produto} onChange={e => { const prod = products.find(p => p.nome === e.target.value); setForm({...form, produto: e.target.value, valor: prod ? prod.preco : ""}); }}
            style={{...inputStyle, flex: "1 1 160px"}}>
            <option value="">Selecione o produto</option>
            {products.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
          </select>
          <input type="number" placeholder="Qtd *" value={form.qtd} onChange={e => setForm({...form, qtd: e.target.value})}
            style={{...inputStyle, flex: "1 1 80px"}} min="1" />
          <input type="number" placeholder="Valor R$ *" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})}
            style={{...inputStyle, flex: "1 1 120px"}} min="0" />
          <input placeholder="Observação" value={form.obs} onChange={e => setForm({...form, obs: e.target.value})}
            style={{...inputStyle, flex: "2 1 200px"}} />
          <button onClick={handleAdd} style={{
            background: C.navyDark, color: C.white, border: "none", borderRadius: 8,
            padding: "9px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", flex: "0 0 auto",
          }}>Registrar</button>
        </div>
        {erro && <div style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{erro}</div>}
      </div>

      {/* Filtro e tabela */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["todos","Todos"], ["entrada","Entradas"], ["saida","Saídas"]].map(([val, label]) => (
          <button key={val} onClick={() => setFiltro(val)} style={{
            padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${filtro === val ? C.navyDark : C.grayLight}`,
            background: filtro === val ? C.navyDark : C.white,
            color: filtro === val ? C.white : C.grayMid,
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ background: C.bgCard, borderRadius: 12, boxShadow: "0 1px 4px rgba(26,43,74,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bgPage }}>
              {["Data", "Tipo", "Produto", "Qtd", "Valor", "Observação", ""].map((h, i) => (
                <th key={i} style={{ padding: "12px 16px", textAlign: "left", color: C.grayMid, fontSize: 12, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((t) => (
              <tr key={t.id} style={{ borderTop: `1px solid ${C.grayLight}` }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.grayMid }}>{t.data.split("-").reverse().join("/")}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    background: t.tipo === "entrada" ? C.greenBg : C.redBg,
                    color: t.tipo === "entrada" ? C.green : C.red,
                    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    {t.tipo === "entrada" ? Icon.arrowUp : Icon.arrowDown}
                    {t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: C.navyDark }}>{t.produto}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.navyDark }}>{t.qtd}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: t.tipo === "entrada" ? C.green : C.red }}>{fmt(t.valor)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.grayMid }}>{t.obs}</td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => handleDelete(t.id)} style={{
                    background: C.redBg, color: C.red, border: "none", borderRadius: 6,
                    padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center",
                  }}>{Icon.trash}</button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: C.grayMid }}>Nenhuma movimentação encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tela: Cadastro de Produto ────────────────────────────────
function CadastroProduto({ products, setProducts }) {
  const [form, setForm]   = useState({ nome: "", categoria: "", estoque: "", minimo: "", preco: "" });
  const [erro, setErro]   = useState("");
  const [ok, setOk]       = useState(false);

  const handleSalvar = () => {
    if (!form.nome || !form.categoria || !form.estoque || !form.minimo || !form.preco) {
      setErro("Preencha todos os campos."); setOk(false); return;
    }
    const novo = {
      id: Date.now(),
      nome: form.nome,
      categoria: form.categoria,
      estoque: Number(form.estoque),
      minimo: Number(form.minimo),
      preco: Number(form.preco),
    };
    setProducts(prev => [...prev, novo]);
    setForm({ nome: "", categoria: "", estoque: "", minimo: "", preco: "" });
    setErro(""); setOk(true);
    setTimeout(() => setOk(false), 3000);
  };

  const handleDelete = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1.5px solid ${C.grayLight}`, fontSize: 14,
    fontFamily: "inherit", color: C.navyDark, outline: "none",
    boxSizing: "border-box", background: C.white,
  };

  return (
    <div>
      <h1 style={{ color: C.navyDark, fontWeight: 700, fontSize: 22, marginBottom: 6 }}>Cadastrar Produto</h1>
      <p style={{ color: C.grayMid, fontSize: 14, marginBottom: 24 }}>Adicione novos produtos ao sistema</p>

      {/* Formulário */}
      <div style={{ background: C.bgCard, borderRadius: 12, padding: 28, boxShadow: "0 1px 4px rgba(26,43,74,0.08)", maxWidth: "100%", marginBottom: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.navyDark, display: "block", marginBottom: 5 }}>Nome do Produto *</label>
            <input placeholder="Ex: Notebook Dell" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.navyDark, display: "block", marginBottom: 5 }}>Categoria *</label>
            <input placeholder="Ex: Eletrônicos" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navyDark, display: "block", marginBottom: 5 }}>Estoque Inicial *</label>
              <input type="number" placeholder="0" min="0" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navyDark, display: "block", marginBottom: 5 }}>Estoque Mínimo *</label>
              <input type="number" placeholder="0" min="0" value={form.minimo} onChange={e => setForm({...form, minimo: e.target.value})} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.navyDark, display: "block", marginBottom: 5 }}>Preço Unitário (R$) *</label>
            <input type="number" placeholder="0.00" min="0" step="0.01" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} style={inputStyle} />
          </div>

          {erro && <div style={{ color: C.red, fontSize: 13, background: C.redBg, borderRadius: 7, padding: "8px 12px" }}>{erro}</div>}
          {ok  && <div style={{ color: C.green, fontSize: 13, background: C.greenBg, borderRadius: 7, padding: "8px 12px" }}>✓ Produto cadastrado com sucesso!</div>}

          <button onClick={handleSalvar} style={{
            background: C.navyDark, color: C.white, border: "none", borderRadius: 8,
            padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
          }}>Cadastrar Produto</button>
        </div>
      </div>

      {/* Lista de produtos */}
      <div>
        <div style={{ fontWeight: 600, color: C.navyDark, fontSize: 15, marginBottom: 12 }}>Produtos Cadastrados ({products.length})</div>
        <div style={{ background: C.bgCard, borderRadius: 12, boxShadow: "0 1px 4px rgba(26,43,74,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.bgPage }}>
                {["Produto", "Categoria", "Estoque", "Mínimo", "Preço", ""].map((h, i) => (
                  <th key={i} style={{ padding: "11px 16px", textAlign: "left", color: C.grayMid, fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderTop: `1px solid ${C.grayLight}` }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: C.navyDark, fontSize: 13 }}>{p.nome}</td>
                  <td style={{ padding: "12px 16px", color: C.grayMid, fontSize: 13 }}>{p.categoria}</td>
                  <td style={{ padding: "12px 16px", color: p.estoque < p.minimo ? C.red : C.navyDark, fontWeight: 600, fontSize: 13 }}>{p.estoque}</td>
                  <td style={{ padding: "12px 16px", color: C.grayMid, fontSize: 13 }}>{p.minimo}</td>
                  <td style={{ padding: "12px 16px", color: C.navyDark, fontSize: 13 }}>{fmt(p.preco)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => handleDelete(p.id)} style={{
                      background: C.redBg, color: C.red, border: "none", borderRadius: 6,
                      padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center",
                    }}>{Icon.trash}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Hook LocalStorage ────────────────────────────────────────
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });
  const set = (v) => {
    const next = typeof v === "function" ? v(value) : v;
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
  return [value, set];
}

// ── App principal ────────────────────────────────────────────
export default function App() {
  const [logado, setLogado] = useState(() => localStorage.getItem("lf_logado") === "true");
  const [tela, setTela]               = useState("dashboard");
  const [products, setProducts]       = useLocalStorage("lf_products", initialProducts);
  const [transactions, setTransactions] = useLocalStorage("lf_transactions", initialTransactions);

  const renderTela = () => {
    switch (tela) {
      case "dashboard": return <Dashboard products={products} transactions={transactions} />;
      case "estoque":   return <Estoque products={products} />;
      case "fluxo":     return <FluxoCaixa transactions={transactions} setTransactions={setTransactions} products={products} />;
      case "cadastro":  return <CadastroProduto products={products} setProducts={setProducts} />;
      default:          return null;
    }
  };

  if (!logado) return <Login onLogin={() => { localStorage.setItem("lf_logado", "true"); setLogado(true); }} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: C.bgPage }}>
      <Sidebar active={tela} onNav={setTela} onLogout={() => { localStorage.removeItem("lf_logado"); setLogado(false); }} />
      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto", width: "100%" }}>
        {renderTela()}
      </main>
    </div>
  );
}
// ── Tela: Login ──────────────────────────────────────────────
function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = () => {
    if (user === "admin" && pass === "admin123") {
      onLogin();
    } else {
      setErro("Usuário ou senha incorretos.");
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 8,
    border: `1.5px solid ${C.grayLight}`, fontSize: 14,
    fontFamily: "inherit", color: C.navyDark, outline: "none",
    boxSizing: "border-box", background: C.white,
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: C.navyDark, fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: C.grayLight, borderRadius: 16, padding: "48px 40px",
        width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <img src="/logo.png" alt="LogiFlow" style={{ width: 150, height: 150, objectFit: "contain" }} />
          <div>
            <div style={{ color: C.navyDark, fontWeight: 700, fontSize: 22 }}>LogiFlow</div>
            <div style={{ color: C.grayMid, fontSize: 13 }}>Gestão de Estoque</div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: C.navyDark, fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Bem-vindo!</div>
          <div style={{ color: C.grayMid, fontSize: 14 }}>Entre com suas credenciais para continuar</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.navyDark, display: "block", marginBottom: 5 }}>Usuário</label>
            <input placeholder="Digite seu usuário" value={user} onChange={e => setUser(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.navyDark, display: "block", marginBottom: 5 }}>Senha</label>
            <input type="password" placeholder="Digite sua senha" value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} style={inputStyle} />
          </div>

          {erro && <div style={{ color: C.red, fontSize: 13, background: C.redBg, borderRadius: 7, padding: "8px 12px" }}>{erro}</div>}

          <button onClick={handleLogin} style={{
            background: C.navyDark, color: C.white, border: "none", borderRadius: 8,
            padding: "13px", fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", marginTop: 4,
          }}>Entrar</button>
        </div>

        <div style={{ marginTop: 20, padding: "12px", background: C.bgPage, borderRadius: 8, fontSize: 12, color: C.grayMid }}>
          👤 Usuário: <strong>admin</strong> &nbsp;|&nbsp; 🔑 Senha: <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
}

