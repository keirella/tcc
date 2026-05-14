import { useState } from "react";

const COLORS = {
  darkGreen: "#0A3323",
  mossGreen: "#839958",
  beige: "#F7F4D5",
  rosyBrown: "#D3968C",
  midnightGreen: "#105666",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .orders-root {
    font-family: 'Poppins', sans-serif;
    background-color: ${COLORS.beige};
    min-height: 100vh;
    padding: 36px 40px;
    color: ${COLORS.darkGreen};
    margin-left: 240px;
  }

  .orders-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .orders-header h1 {
    font-size: 26px;
    font-weight: 800;
    margin: 0 0 4px;
  }

  .orders-header p {
    font-size: 13px;
    color: ${COLORS.mossGreen};
    margin: 0;
    font-weight: 500;
  }

  .export-btn {
    background: white;
    color: ${COLORS.darkGreen};
    border: 2px solid rgba(10,51,35,0.12);
    padding: 11px 20px;
    border-radius: 12px;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .export-btn:hover { border-color: ${COLORS.mossGreen}; color: ${COLORS.mossGreen}; }

  .stat-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }

  .strip-card {
    background: white;
    border-radius: 14px;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 2px 10px rgba(10,51,35,0.05);
  }

  .strip-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .strip-text {}

  .strip-value {
    font-size: 20px;
    font-weight: 800;
    color: ${COLORS.darkGreen};
    line-height: 1.2;
  }

  .strip-label {
    font-size: 11px;
    color: #aaa;
    font-weight: 500;
  }

  .filter-toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1;
    min-width: 180px;
    padding: 11px 18px;
    border: 2px solid rgba(10,51,35,0.1);
    border-radius: 12px;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    background: white;
    color: ${COLORS.darkGreen};
    outline: none;
    transition: border 0.2s;
  }

  .search-input:focus { border-color: ${COLORS.mossGreen}; }

  .tab-btn {
    padding: 10px 18px;
    border-radius: 12px;
    border: 2px solid transparent;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: white;
    color: #999;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .tab-btn.active.all { background: ${COLORS.darkGreen}; color: ${COLORS.beige}; }
  .tab-btn.active.paid { background: ${COLORS.mossGreen}; color: ${COLORS.darkGreen}; }
  .tab-btn.active.pending { background: ${COLORS.rosyBrown}; color: white; }
  .tab-btn.active.processing { background: ${COLORS.midnightGreen}; color: white; }

  .orders-table-wrap {
    background: white;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 14px rgba(10,51,35,0.06);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead tr {
    background: ${COLORS.darkGreen};
  }

  thead th {
    padding: 14px 18px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: rgba(247,244,213,0.7);
    text-transform: uppercase;
    letter-spacing: 1px;
    white-space: nowrap;
  }

  tbody tr {
    border-bottom: 1px solid #f5f2e8;
    transition: background 0.15s;
  }

  tbody tr:last-child { border-bottom: none; }

  tbody tr:hover { background: rgba(247,244,213,0.4); }

  td {
    padding: 16px 18px;
    font-size: 13px;
    color: ${COLORS.darkGreen};
    vertical-align: middle;
  }

  .order-id-cell {
    font-weight: 700;
    color: ${COLORS.midnightGreen};
    font-size: 14px;
  }

  .buyer-cell {}
  .buyer-name { font-weight: 600; font-size: 13px; }
  .buyer-sub { font-size: 11px; color: #aaa; margin-top: 2px; }

  .items-cell {
    max-width: 200px;
  }

  .item-tag {
    display: inline-block;
    background: ${COLORS.beige};
    color: ${COLORS.darkGreen};
    padding: 3px 9px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    margin: 2px 2px 2px 0;
  }

  .amount-cell {
    font-size: 15px;
    font-weight: 800;
    color: ${COLORS.darkGreen};
    white-space: nowrap;
  }

  .date-cell {
    font-size: 12px;
    color: #aaa;
    white-space: nowrap;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: capitalize;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }

  .status-badge.paid {
    background: rgba(131,153,88,0.15);
    color: ${COLORS.mossGreen};
  }

  .status-badge.pending {
    background: rgba(211,150,140,0.18);
    color: ${COLORS.rosyBrown};
  }

  .status-badge.processing {
    background: rgba(16,86,102,0.12);
    color: ${COLORS.midnightGreen};
  }

  .status-badge.cancelled {
    background: rgba(200,50,50,0.1);
    color: #c0392b;
  }

  .action-btn {
    padding: 7px 14px;
    border-radius: 8px;
    border: none;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .action-btn.process {
    background: rgba(16,86,102,0.12);
    color: ${COLORS.midnightGreen};
  }

  .action-btn.process:hover { background: ${COLORS.midnightGreen}; color: white; }

  .action-btn.done {
    background: rgba(131,153,88,0.15);
    color: ${COLORS.mossGreen};
  }

  .action-btn.done:hover { background: ${COLORS.mossGreen}; color: ${COLORS.darkGreen}; }

  .action-btn.view {
    background: rgba(10,51,35,0.07);
    color: ${COLORS.darkGreen};
  }

  .action-btn.view:hover { background: rgba(10,51,35,0.15); }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #bbb;
  }

  .empty-state .emoji { font-size: 48px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 16px; font-weight: 600; color: ${COLORS.darkGreen}; margin: 0 0 8px; }
  .empty-state p { font-size: 13px; margin: 0; }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-top: 1px solid #f5f2e8;
  }

  .page-info {
    font-size: 12px;
    color: #aaa;
    font-weight: 500;
  }

  .page-btns {
    display: flex;
    gap: 6px;
  }

  .page-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 2px solid rgba(10,51,35,0.1);
    background: white;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #999;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .page-btn:hover, .page-btn.active {
    background: ${COLORS.darkGreen};
    color: ${COLORS.beige};
    border-color: ${COLORS.darkGreen};
  }

  /* Detail drawer */
  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10,51,35,0.35);
    z-index: 100;
    backdrop-filter: blur(3px);
  }

  .drawer {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 380px;
    background: white;
    z-index: 101;
    padding: 32px 28px;
    overflow-y: auto;
    box-shadow: -8px 0 40px rgba(10,51,35,0.12);
    animation: slideIn 0.25s ease;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .drawer-header h2 {
    font-size: 20px;
    font-weight: 800;
    color: ${COLORS.darkGreen};
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    color: #aaa;
    transition: color 0.2s;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover { color: ${COLORS.darkGreen}; }

  .drawer-section {
    margin-bottom: 22px;
  }

  .drawer-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #bbb;
    margin-bottom: 10px;
  }

  .drawer-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f5f2e8;
    font-size: 13px;
  }

  .drawer-info-row:last-child { border-bottom: none; }
  .drawer-info-label { color: #aaa; font-weight: 500; }
  .drawer-info-value { font-weight: 600; color: ${COLORS.darkGreen}; }

  .drawer-item {
    background: ${COLORS.beige};
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  .drawer-item-name { font-weight: 600; }
  .drawer-item-qty { color: #aaa; font-size: 12px; margin-top: 2px; }
  .drawer-item-price { font-weight: 700; color: ${COLORS.midnightGreen}; }

  .drawer-total {
    background: ${COLORS.darkGreen};
    color: ${COLORS.beige};
    border-radius: 12px;
    padding: 16px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
  }

  .drawer-total span { font-size: 14px; font-weight: 600; }
  .drawer-total strong { font-size: 20px; font-weight: 800; }

  .drawer-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }

  .drawer-action-btn {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    border: none;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .drawer-action-btn.primary {
    background: ${COLORS.mossGreen};
    color: ${COLORS.darkGreen};
  }

  .drawer-action-btn.primary:hover { background: ${COLORS.darkGreen}; color: ${COLORS.beige}; }

  .drawer-action-btn.secondary {
    background: rgba(211,150,140,0.15);
    color: ${COLORS.rosyBrown};
  }

  .drawer-action-btn.secondary:hover { background: ${COLORS.rosyBrown}; color: white; }
`;

const ORDERS = [
  {
    id: 5,
    buyer: "Budi Santoso",
    buyerEmail: "budi@gmail.com",
    total: 30000,
    status: "paid",
    created_at: "2026-05-13 06:51",
    items: [{ name: "Nasi Rendang", qty: 2, subtotal: 30000 }],
    payment: "paid",
  },
  {
    id: 6,
    buyer: "Siti Rahma",
    buyerEmail: "siti@gmail.com",
    total: 15000,
    status: "pending",
    created_at: "2026-05-13 07:10",
    items: [{ name: "Ayam Geprek Level 5", qty: 1, subtotal: 15000 }],
    payment: "unpaid",
  },
  {
    id: 7,
    buyer: "Ahmad Rizki",
    buyerEmail: "ahmad@gmail.com",
    total: 33000,
    status: "processing",
    created_at: "2026-05-14 08:05",
    items: [
      { name: "Nasi Rendang", qty: 1, subtotal: 15000 },
      { name: "Ayam Gulai", qty: 1, subtotal: 18000 },
    ],
    payment: "paid",
  },
];

const STATUS_FLOW = { pending: "processing", processing: "paid" };

function formatRupiah(v) {
  return "Rp " + Number(v).toLocaleString("id-ID");
}

const STAT_CONFIGS = [
  { key: "all", label: "Total Pesanan", icon: "📋", bg: "#0A332315", color: COLORS.darkGreen },
  { key: "paid", label: "Selesai", icon: "✅", bg: "#83995820", color: COLORS.mossGreen },
  { key: "pending", label: "Menunggu", icon: "⏳", bg: "#D3968C20", color: COLORS.rosyBrown },
  { key: "processing", label: "Diproses", icon: "🔄", bg: "#10566620", color: COLORS.midnightGreen },
];

export default function Orders() {
  const [orders, setOrders] = useState(ORDERS);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const stats = STAT_CONFIGS.map((s) => ({
    ...s,
    count: s.key === "all" ? orders.length : orders.filter((o) => o.status === s.key).length,
    total: s.key === "all"
      ? orders.reduce((a, o) => a + o.total, 0)
      : orders.filter((o) => o.status === s.key).reduce((a, o) => a + o.total, 0),
  }));

  const filtered = orders.filter((o) => {
    const matchTab = tab === "all" || o.status === tab;
    const matchSearch =
      search === "" ||
      o.buyer.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    return matchTab && matchSearch;
  });

  const advanceStatus = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id && STATUS_FLOW[o.status]
          ? { ...o, status: STATUS_FLOW[o.status] }
          : o
      )
    );
    if (selected?.id === id) {
      setSelected((prev) => ({ ...prev, status: STATUS_FLOW[prev.status] || prev.status }));
    }
  };

  return (
    <div className="orders-root">
      <style>{styles}</style>

      <div className="orders-header">
        <div>
          <h1>Pesanan Masuk 📋</h1>
          <p>Stan Padang · {orders.length} total pesanan</p>
        </div>
        <button className="export-btn">📤 Export</button>
      </div>

      {/* Stats */}
      <div className="stat-strip">
        {stats.map((s) => (
          <div key={s.key} className="strip-card">
            <div className="strip-icon" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <div className="strip-text">
              <div className="strip-value" style={{ color: s.color }}>{s.count}</div>
              <div className="strip-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-toolbar">
        <input
          className="search-input"
          placeholder="🔍 Cari pembeli atau ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {["all", "pending", "processing", "paid"].map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ` active ${t}` : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "all" ? "Semua" : t === "pending" ? "⏳ Pending" : t === "processing" ? "🔄 Diproses" : "✅ Selesai"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="orders-table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID Pesanan</th>
              <th>Pembeli</th>
              <th>Menu</th>
              <th>Total</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="emoji">📭</div>
                    <h3>Tidak ada pesanan</h3>
                    <p>Belum ada pesanan masuk untuk filter ini</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id}>
                  <td className="order-id-cell">#{String(o.id).padStart(3, "0")}</td>
                  <td>
                    <div className="buyer-name">{o.buyer}</div>
                    <div className="buyer-sub">{o.buyerEmail}</div>
                  </td>
                  <td className="items-cell">
                    {o.items.map((item, i) => (
                      <span key={i} className="item-tag">{item.name} ×{item.qty}</span>
                    ))}
                  </td>
                  <td className="amount-cell">{formatRupiah(o.total)}</td>
                  <td className="date-cell">{o.created_at}</td>
                  <td>
                    <span className={`status-badge ${o.status}`}>
                      {o.status === "paid" ? "✅ Selesai" : o.status === "pending" ? "⏳ Pending" : "🔄 Diproses"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="action-btn view" onClick={() => setSelected(o)}>Detail</button>
                      {STATUS_FLOW[o.status] && (
                        <button
                          className={`action-btn ${o.status === "pending" ? "process" : "done"}`}
                          onClick={() => advanceStatus(o.id)}
                        >
                          {o.status === "pending" ? "Proses" : "Selesai"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
          <span className="page-info">Menampilkan {filtered.length} dari {orders.length} pesanan</span>
          <div className="page-btns">
            <button className="page-btn">‹</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">›</button>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <>
          <div className="drawer-overlay" onClick={() => setSelected(null)} />
          <div className="drawer">
            <div className="drawer-header">
              <h2>Detail Pesanan #{String(selected.id).padStart(3, "0")}</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="drawer-section">
              <div className="drawer-section-title">Informasi Pembeli</div>
              <div className="drawer-info-row">
                <span className="drawer-info-label">Nama</span>
                <span className="drawer-info-value">{selected.buyer}</span>
              </div>
              <div className="drawer-info-row">
                <span className="drawer-info-label">Email</span>
                <span className="drawer-info-value">{selected.buyerEmail}</span>
              </div>
              <div className="drawer-info-row">
                <span className="drawer-info-label">Tanggal</span>
                <span className="drawer-info-value">{selected.created_at}</span>
              </div>
              <div className="drawer-info-row">
                <span className="drawer-info-label">Status</span>
                <span className={`status-badge ${selected.status}`}>
                  {selected.status === "paid" ? "✅ Selesai" : selected.status === "pending" ? "⏳ Pending" : "🔄 Diproses"}
                </span>
              </div>
              <div className="drawer-info-row">
                <span className="drawer-info-label">Pembayaran</span>
                <span className={`status-badge ${selected.payment === "paid" ? "paid" : "pending"}`}>
                  {selected.payment === "paid" ? "Lunas" : "Belum Bayar"}
                </span>
              </div>
            </div>

            <div className="drawer-section">
              <div className="drawer-section-title">Item Pesanan</div>
              {selected.items.map((item, i) => (
                <div key={i} className="drawer-item">
                  <div>
                    <div className="drawer-item-name">{item.name}</div>
                    <div className="drawer-item-qty">×{item.qty} porsi</div>
                  </div>
                  <div className="drawer-item-price">{formatRupiah(item.subtotal)}</div>
                </div>
              ))}
              <div className="drawer-total">
                <span>Total Pembayaran</span>
                <strong>{formatRupiah(selected.total)}</strong>
              </div>
            </div>

            {STATUS_FLOW[selected.status] && (
              <div className="drawer-actions">
                <button
                  className="drawer-action-btn primary"
                  onClick={() => advanceStatus(selected.id)}
                >
                  {selected.status === "pending" ? "🔄 Proses Pesanan" : "✅ Tandai Selesai"}
                </button>
                <button className="drawer-action-btn secondary">✕ Batalkan</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}