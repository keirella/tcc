import React, { useState } from 'react';
import Home from './pages/buyer/Home';
import Cart from './pages/buyer/Cart';
import OrderStatus from './pages/buyer/OrderStatus';
import Dashboard from './pages/seller/Dashboard';
import Menu from './pages/seller/Menu';
import Orders from './pages/seller/Orders';

function App() {
  const [cart, setCart] = useState({});
  const [page, setPage] = useState("home");
  const [role, setRole] = useState("buyer");

  const go = (target) => setPage(target);

  const handleSwitchRole = () => {
    if (role === "seller") {
      setRole("buyer");
      setPage("home");
    } else {
      setRole("seller");
      setPage("dashboard");
    }
  };

  // ── BUYER PAGES ──────────────────────────────────────────────────
  const renderBuyer = () => {
    switch (page) {
      case "cart":
        return (
          <Cart
            cart={cart}
            setCart={setCart}
            onBack={() => go("home")}
            onGoToHome={() => go("home")}
            onGoToStatus={() => go("status")}
            onGoToHistory={() => go("history")}
            onLogout={handleSwitchRole}
          />
        );
      case "status":
        return (
          <OrderStatus
            cart={cart}
            onGoToHome={() => go("home")}
            onGoToCart={() => go("cart")}
            onGoToHistory={() => go("history")}
            onLogout={handleSwitchRole}
          />
        );
      case "history":
        // TODO: buat halaman History nanti
        return (
          <div style={{ padding: 40, fontFamily: 'Poppins, sans-serif', color: '#105666' }}>
            <h2>Riwayat Pesanan (coming soon)</h2>
            <button onClick={() => go("home")} style={{ marginTop: 16, cursor: 'pointer' }}>← Kembali</button>
          </div>
        );
      default: // "home"
        return (
          <Home
            cart={cart}
            setCart={setCart}
            onGoToCart={() => go("cart")}
            onGoToStatus={() => go("status")}
            onGoToHistory={() => go("history")}
            onLogout={handleSwitchRole}
          />
        );
    }
  };

  // ── SELLER PAGES ─────────────────────────────────────────────────
  const renderSeller = () => {
    if (page === "dashboard") return <Dashboard onNavigate={go} />;
    return (
      <div style={{ position: 'relative' }}>
        <Dashboard onNavigate={go} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 20 }}>
          {page === "menu" ? <Menu /> : <Orders />}
        </div>
      </div>
    );
  };

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div>
      {/* Tombol Switch Role (untuk testing) */}
      <div style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 9999 }}>
        <button
          onClick={handleSwitchRole}
          style={{
            padding: '8px 16px', cursor: 'pointer',
            borderRadius: '8px', background: '#105666',
            color: '#F7F4D5', fontFamily: 'Poppins, sans-serif',
            fontSize: 13, border: 'none',
          }}
        >
          Switch to {role === "buyer" ? "Seller" : "Buyer"}
        </button>
      </div>

      {role === "seller" ? renderSeller() : renderBuyer()}
    </div>
  );
}

export default App;