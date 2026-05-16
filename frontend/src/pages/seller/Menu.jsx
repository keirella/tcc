import { useState } from "react";

const COLORS = {
  darkGreen: "#0A3323",
  mossGreen: "#839958",
  beige: "#F7F4D5",
  rosyBrown: "#D3968C",
  midnightGreen: "#105666",
};

const sidebarStyles = `
  .seller-sidebar {
    width: 240px; background: #0A3323; min-height: 100vh;
    position: fixed; left: 0; top: 0;
    display: flex; flex-direction: column; z-index: 10;
    font-family: 'Poppins', sans-serif;
  }
  .sidebar-logo { padding: 28px 24px 20px; border-bottom: 1px solid rgba(131,153,88,0.25); }
  .sidebar-logo h2 { color: #F7F4D5; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0; line-height: 1.2; }
  .sidebar-logo span { color: #839958; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; }
  .sidebar-nav { padding: 16px 12px; flex: 1; }
  .sidebar-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-radius: 10px; cursor: pointer;
    color: rgba(247,244,213,0.55); font-size: 14px; font-weight: 500;
    transition: all 0.2s; margin-bottom: 4px;
    border: none; background: none; width: 100%; text-align: left;
    font-family: 'Poppins', sans-serif;
  }
  .sidebar-nav-item:hover { background: rgba(131,153,88,0.18); color: #F7F4D5; }
  .sidebar-nav-item.active { background: #839958; color: #0A3323; font-weight: 700; }
  .sidebar-nav-item .nav-icon { font-size: 17px; width: 20px; text-align: center; flex-shrink: 0; }
  .sidebar-badge {
    margin: 16px 12px; background: rgba(16,86,102,0.5);
    border-radius: 10px; padding: 14px 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .sidebar-avatar {
    width: 38px; height: 38px; border-radius: 50%; background: #839958;
    display: flex; align-items: center; justify-content: center;
    color: #0A3323; font-weight: 800; font-size: 15px; flex-shrink: 0;
  }
  .sidebar-badge h4 { color: #F7F4D5; font-size: 13px; font-weight: 600; margin: 0 0 2px; }
  .sidebar-badge p  { color: #839958; font-size: 11px; margin: 0; }
  .sidebar-logout {
    margin: 0 12px 16px; display: flex; align-items: center; gap: 10px;
    padding: 11px 16px; border-radius: 10px; cursor: pointer;
    color: rgba(247,244,213,0.4); font-size: 13px; font-weight: 500;
    border: 1px solid rgba(247,244,213,0.1); background: none;
    width: calc(100% - 24px); font-family: 'Poppins', sans-serif; transition: all 0.2s;
  }
  .sidebar-logout:hover { background: rgba(211,150,140,0.15); color: #D3968C; border-color: rgba(211,150,140,0.3); }
`;

const navItems = [
  { icon: "📊", label: "Dashboard", key: "dashboard" },
  { icon: "🍽️", label: "Menu",      key: "menu" },
  { icon: "📋", label: "Pesanan",   key: "orders" },
  { icon: "⚙️", label: "Pengaturan", key: "settings" },
];
const seller = { name: "Seller Padang", stall: "Stan Padang", code: "STAN001" };

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="seller-sidebar">
      <div className="sidebar-logo">
        <h2>Kantin Digital</h2>
        <span>Seller Portal</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`sidebar-nav-item${item.key === active ? " active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-badge">
        <div className="sidebar-avatar">{seller.name[0]}</div>
        <div>
          <h4>{seller.name}</h4>
          <p>{seller.code}</p>
        </div>
      </div>
      <button className="sidebar-logout" onClick={() => onNavigate("logout")}>
        🚪 Keluar
      </button>
    </aside>
  );
}


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
  ${sidebarStyles}

  .menu-root {
    font-family: 'Poppins', sans-serif;
    background-color: ${COLORS.beige};
    min-height: 100vh;
    color: ${COLORS.darkGreen};
    display: flex;
  }
  .menu-main { margin-left: 240px; padding: 36px 40px; flex: 1; min-height: 100vh; }

  .menu-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
  .menu-header h1 { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
  .menu-header p  { font-size: 13px; color: ${COLORS.mossGreen}; margin: 0; font-weight: 500; }

  .add-btn {
    background: ${COLORS.darkGreen}; color: ${COLORS.beige};
    border: none; padding: 12px 22px; border-radius: 12px;
    font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
  }
  .add-btn:hover { background: ${COLORS.midnightGreen}; transform: translateY(-1px); }

  .menu-search-row { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; }
  .search-input {
    flex: 1; padding: 12px 18px;
    border: 2px solid rgba(10,51,35,0.1); border-radius: 12px;
    font-family: 'Poppins', sans-serif; font-size: 13px;
    background: white; color: ${COLORS.darkGreen}; outline: none; transition: border 0.2s;
  }
  .search-input:focus { border-color: ${COLORS.mossGreen}; }
  .filter-btn {
    padding: 10px 18px; border-radius: 12px; border: 2px solid transparent;
    font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; background: white; color: #999; transition: all 0.2s;
  }
  .filter-btn.active { background: ${COLORS.mossGreen}; color: ${COLORS.darkGreen}; border-color: ${COLORS.mossGreen}; }

  .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .menu-card {
    background: white; border-radius: 18px; overflow: hidden;
    box-shadow: 0 2px 14px rgba(10,51,35,0.07); transition: transform 0.2s, box-shadow 0.2s; position: relative;
  }
  .menu-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(10,51,35,0.12); }
  .menu-card-img {
    height: 160px;
    background: linear-gradient(135deg, ${COLORS.mossGreen}33, ${COLORS.midnightGreen}33);
    display: flex; align-items: center; justify-content: center;
    font-size: 56px; position: relative;
  }
  .stock-badge {
    position: absolute; top: 12px; right: 12px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700; font-family: 'Poppins', sans-serif;
  }
  .stock-badge.ok  { background: rgba(131,153,88,0.2);  color: ${COLORS.mossGreen}; }
  .stock-badge.low { background: rgba(211,150,140,0.25); color: ${COLORS.rosyBrown}; }
  .stock-badge.out { background: rgba(220,50,50,0.1);    color: #c0392b; }
  .menu-card-body { padding: 18px 20px; }
  .menu-card-name { font-size: 16px; font-weight: 700; color: ${COLORS.darkGreen}; margin: 0 0 4px; }
  .menu-card-meta { font-size: 12px; color: #aaa; margin: 0 0 14px; font-weight: 500; }
  .menu-card-footer { display: flex; align-items: center; justify-content: space-between; }
  .menu-price { font-size: 18px; font-weight: 800; color: ${COLORS.midnightGreen}; }
  .menu-actions { display: flex; gap: 8px; }
  .icon-btn {
    width: 34px; height: 34px; border-radius: 10px; border: none;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: all 0.2s;
  }
  .icon-btn.edit   { background: rgba(16,86,102,0.1);   color: ${COLORS.midnightGreen}; }
  .icon-btn.edit:hover { background: rgba(16,86,102,0.2); }
  .icon-btn.delete { background: rgba(211,150,140,0.15); color: ${COLORS.rosyBrown}; }
  .icon-btn.delete:hover { background: rgba(211,150,140,0.3); }
  .stock-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .stock-label { font-size: 12px; color: #aaa; font-weight: 500; white-space: nowrap; }
  .stock-bar-bg { flex: 1; height: 6px; background: #f0ede0; border-radius: 10px; overflow: hidden; }
  .stock-bar-fill { height: 100%; border-radius: 10px; transition: width 0.6s ease; }
  .stock-count { font-size: 12px; font-weight: 700; white-space: nowrap; }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(10,51,35,0.45); z-index: 100;
    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
  }
  .modal {
    background: white; border-radius: 20px; padding: 32px;
    width: 460px; max-width: 95vw; box-shadow: 0 20px 60px rgba(10,51,35,0.2);
  }
  .modal h2 { font-size: 20px; font-weight: 800; color: ${COLORS.darkGreen}; margin: 0 0 24px; }
  .form-group { margin-bottom: 18px; }
  .form-group label {
    display: block; font-size: 12px; font-weight: 700; color: ${COLORS.darkGreen};
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
  }
  .form-input {
    width: 100%; padding: 11px 16px;
    border: 2px solid rgba(10,51,35,0.12); border-radius: 10px;
    font-family: 'Poppins', sans-serif; font-size: 13px; color: ${COLORS.darkGreen};
    outline: none; transition: border 0.2s; box-sizing: border-box;
  }
  .form-input:focus { border-color: ${COLORS.mossGreen}; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .modal-actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
  .cancel-btn {
    padding: 11px 22px; border-radius: 10px; border: 2px solid rgba(10,51,35,0.15);
    background: none; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
    color: #999; cursor: pointer; transition: all 0.2s;
  }
  .cancel-btn:hover { border-color: ${COLORS.rosyBrown}; color: ${COLORS.rosyBrown}; }
  .save-btn {
    padding: 11px 28px; border-radius: 10px; border: none;
    background: ${COLORS.darkGreen}; font-family: 'Poppins', sans-serif;
    font-size: 13px; font-weight: 700; color: ${COLORS.beige}; cursor: pointer; transition: all 0.2s;
  }
  .save-btn:hover { background: ${COLORS.midnightGreen}; }
  .empty-state { text-align: center; padding: 60px 20px; color: #bbb; grid-column: 1/-1; }
  .empty-state .emoji { font-size: 48px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 16px; font-weight: 600; margin: 0 0 8px; color: ${COLORS.darkGreen}; }
  .empty-state p { font-size: 13px; margin: 0; }
`;

const EMOJIS = {
  "Nasi Rendang": "🍛", "Ayam Gulai": "🍲",
  "Ayam Geprek Level 1": "🌶️", "Ayam Geprek Level 5": "🔥",
};
const INITIAL_MENUS = [
  { id: 1, nama: "Nasi Rendang",        harga: 15000, stok: 20, foto_url: "" },
  { id: 2, nama: "Ayam Gulai",          harga: 18000, stok: 15, foto_url: "" },
  { id: 3, nama: "Ayam Geprek Level 1", harga: 12000, stok: 25, foto_url: "" },
  { id: 4, nama: "Ayam Geprek Level 5", harga: 15000, stok: 3,  foto_url: "" },
];

function getStockStatus(stok) {
  if (stok === 0) return { label: "Habis",       cls: "out" };
  if (stok < 5)  return { label: "Hampir Habis", cls: "low" };
  return              { label: `Stok: ${stok}`, cls: "ok"  };
}
function formatRupiah(val) { return "Rp " + Number(val).toLocaleString("id-ID"); }

export default function Menu({ onNavigate }) {
  const [menus, setMenus]         = useState(INITIAL_MENUS);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({ nama: "", harga: "", stok: "", foto_url: "" });

  const filtered = menus.filter((m) => {
    const matchSearch = m.nama.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "low" && m.stok < 5) || (filter === "ok" && m.stok >= 5);
    return matchSearch && matchFilter;
  });

  const openAdd  = () => { setEditing(null); setForm({ nama: "", harga: "", stok: "", foto_url: "" }); setShowModal(true); };
  const openEdit = (m)  => { setEditing(m.id); setForm({ nama: m.nama, harga: m.harga, stok: m.stok, foto_url: m.foto_url }); setShowModal(true); };

  const handleSave = () => {
    if (!form.nama || !form.harga) return;
    if (editing) {
      setMenus((prev) => prev.map((m) => m.id === editing ? { ...m, ...form, harga: +form.harga, stok: +form.stok } : m));
    } else {
      setMenus((prev) => [...prev, { id: Date.now(), ...form, harga: +form.harga, stok: +form.stok }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Hapus menu ini?")) setMenus((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="menu-root">
      <style>{styles}</style>

      <Sidebar active="menu" onNavigate={onNavigate} />

      <main className="menu-main">
        <div className="menu-header">
          <div>
            <h1>Kelola Menu 🍽️</h1>
            <p>Stan Padang · {menus.length} menu tersedia</p>
          </div>
          <button className="add-btn" onClick={openAdd}>＋ Tambah Menu</button>
        </div>

        <div className="menu-search-row">
          <input
            className="search-input"
            placeholder="🔍 Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {["all", "ok", "low"].map((f) => (
            <button key={f} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "Semua" : f === "ok" ? "Stok Aman" : "⚠️ Stok Rendah"}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">🍽️</div>
              <h3>Belum ada menu</h3>
              <p>Tambah menu pertama kamu!</p>
            </div>
          ) : (
            filtered.map((m) => {
              const { label, cls } = getStockStatus(m.stok);
              const barColor = cls === "out" ? "#e74c3c" : cls === "low" ? COLORS.rosyBrown : COLORS.mossGreen;
              const barWidth = Math.min(100, (m.stok / 30) * 100);
              const emoji = EMOJIS[m.nama] || "🍴";
              return (
                <div key={m.id} className="menu-card">
                  <div className="menu-card-img">
                    {emoji}
                    <span className={`stock-badge ${cls}`}>{label}</span>
                  </div>
                  <div className="menu-card-body">
                    <div className="menu-card-name">{m.nama}</div>
                    <div className="menu-card-meta">Stan Padang</div>
                    <div className="stock-row">
                      <span className="stock-label">Stok</span>
                      <div className="stock-bar-bg">
                        <div className="stock-bar-fill" style={{ width: `${barWidth}%`, background: barColor }} />
                      </div>
                      <span className="stock-count" style={{ color: barColor }}>{m.stok}</span>
                    </div>
                    <div className="menu-card-footer">
                      <span className="menu-price">{formatRupiah(m.harga)}</span>
                      <div className="menu-actions">
                        <button className="icon-btn edit"   onClick={() => openEdit(m)}       title="Edit">✏️</button>
                        <button className="icon-btn delete" onClick={() => handleDelete(m.id)} title="Hapus">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Menu" : "Tambah Menu Baru"}</h2>
            <div className="form-group">
              <label>Nama Menu</label>
              <input className="form-input" placeholder="Contoh: Nasi Rendang" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Harga (Rp)</label>
                <input className="form-input" type="number" placeholder="15000" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Stok</label>
                <input className="form-input" type="number" placeholder="20" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>URL Foto</label>
              <input className="form-input" placeholder="https://..." value={form.foto_url} onChange={(e) => setForm({ ...form, foto_url: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Batal</button>
              <button className="save-btn" onClick={handleSave}>{editing ? "Simpan Perubahan" : "Tambah Menu"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}