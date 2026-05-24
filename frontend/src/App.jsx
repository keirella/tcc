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
  const [user, setUser] = useState(null);

  const go = (target) => setPage(target);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === "buyer") go("home");
    else go("dashboard");
  };

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

  const sellerProps = {
    user,
    onNavigate: (key) => {
      if (key === "logout") { handleLogout(); return; }
      go(key);
    },
  };

  // ── Auth ─────────────────────────────────────────────────────
  if (page === "login") {
    return <Login onLoginSuccess={handleLoginSuccess} onGoToRegister={() => go("register")} />;
  }
  if (page === "register") {
    return <Register onRegisterSuccess={handleLoginSuccess} onGoToLogin={() => go("login")} />;
  }

  // ── Buyer ─────────────────────────────────────────────────────
  if (user?.role === "buyer") {
    switch (page) {
      case "cart":    return <Cart        {...buyerProps} onBack={() => go("home")} />;
      case "status":  return <OrderStatus {...buyerProps} />;
      case "history": return <History     {...buyerProps} />;
      default:        return <Home        {...buyerProps} />;
    }
  }

  // ── Seller ─────────────────────────────────────────────────────
  if (user?.role === "seller") {
    switch (page) {
      case "menu":      return <Menu    {...sellerProps} />;
      case "orders":    return <Orders  {...sellerProps} />;
      default:          return <Dashboard {...sellerProps} />;
    }
  }

  // Fallback
  return <Login onLoginSuccess={handleLoginSuccess} onGoToRegister={() => go("register")} />;
}

export default App;