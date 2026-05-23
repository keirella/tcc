import React, { useState } from 'react';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/buyer/Home';
import Cart from './pages/buyer/Cart';
import OrderStatus from './pages/buyer/OrderStatus';
import History from './pages/buyer/History';
import Dashboard from './pages/seller/Dashboard';
import Menu from './pages/seller/Menu';
import Orders from './pages/seller/Orders';

function App() {
  const [cart, setCart] = useState({});
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null); // { id, name, role, ... }

  const go = (target) => setPage(target);

  // Dipanggil setelah login/register berhasil
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === "buyer") go("home");
    else go("dashboard");
  };

  // Logout — reset semua state
  const handleLogout = () => {
    setUser(null);
    setCart({});
    go("login");
  };

  const buyerProps = {
    cart,
    setCart,
    user,
    onGoToHome:    () => go("home"),
    onGoToCart:    () => go("cart"),
    onGoToStatus:  () => go("status"),
    onGoToHistory: () => go("history"),
    onLogout:      handleLogout,
  };

  // ── RENDER ────────────────────────────────────────────────────
  // Auth pages
  if (page === "login") {
    return <Login onLoginSuccess={handleLoginSuccess} onGoToRegister={() => go("register")} />;
  }
  if (page === "register") {
    return <Register onRegisterSuccess={handleLoginSuccess} onGoToLogin={() => go("login")} />;
  }

  // Buyer pages
  if (user?.role === "buyer") {
    switch (page) {
      case "cart":    return <Cart        {...buyerProps} onBack={() => go("home")} />;
      case "status":  return <OrderStatus {...buyerProps} />;
      case "history": return <History     {...buyerProps} />;
      default:        return <Home        {...buyerProps} />;
    }
  }

  // Seller pages
if (user?.role === "seller") {
  if (page === "dashboard") {
    return <Dashboard onNavigate={go} user={user} onLogout={handleLogout} />;
  }
  // Handle logout dari seller
  if (page === "logout") {
    handleLogout();
    return null;
  }
  return (
    <div style={{ position: 'relative' }}>
      <Dashboard onNavigate={go} user={user} onLogout={handleLogout} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 20 }}>
        {page === "menu"
          ? <Menu onNavigate={go} user={user} />
          : <Orders onNavigate={go} user={user} />}
      </div>
    </div>
  );
}

  // Fallback
  return <Login onLoginSuccess={handleLoginSuccess} onGoToRegister={() => go("register")} />;
}

export default App;