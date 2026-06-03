import React, { useState, useEffect } from "react";
import { logout, getSavedUser } from "./services/api";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/buyer/Home";
import Cart from "./pages/buyer/Cart";
import OrderStatus from "./pages/buyer/OrderStatus";
import History from "./pages/buyer/History";
import Dashboard from "./pages/seller/Dashboard";
import Menu from "./pages/seller/Menu";
import Orders from "./pages/seller/Orders";

function App() {
  const [cart, setCart] = useState({});
  const [page, setPage] = useState("login");

  // Load user dari localStorage saat pertama render
  // Supaya refresh tidak balik ke login
  const [user, setUser] = useState(() => getSavedUser());

  // const go = (target) => setPage(target);
  const go = (target) => {
    console.log("GO TO:", target);
    setPage(target);
  };

  // Saat mount — kalau sudah ada user (dari localStorage), langsung ke halaman yang sesuai
  useEffect(() => {
    const savedUser = getSavedUser();
    if (savedUser) {
      setUser(savedUser);
      // Restore halaman terakhir kalau ada, fallback ke home/dashboard
      const lastPage = sessionStorage.getItem("lastPage");
      if (lastPage) {
        setPage(lastPage);
      } else {
        setPage(savedUser.role === "buyer" ? "home" : "dashboard");
      }
    }
  }, []);

  // Simpan halaman aktif ke sessionStorage supaya bisa di-restore setelah refresh
  useEffect(() => {
    if (user && page !== "login" && page !== "register") {
      sessionStorage.setItem("lastPage", page);
    }
  }, [page, user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // Bersihkan halaman terakhir dari sesi sebelumnya
    sessionStorage.removeItem("lastPage");
    if (userData.role === "buyer") go("home");
    else go("dashboard");
  };

  const handleLogout = async () => {
    await logout(); // hapus FCM token dari DB + bersihkan localStorage
    setUser(null);
    setCart({});
    sessionStorage.removeItem("lastPage");
    go("login");
  };

  const buyerProps = {
    cart,
    setCart,
    user,
    onGoToHome: () => go("home"),
    onGoToCart: () => go("cart"),
    onGoToStatus: () => go("status"),
    onGoToHistory: () => go("history"),
    onLogout: handleLogout,
  };

  const sellerProps = {
    user,
    onNavigate: (key) => {
      if (key === "logout") {
        handleLogout();
        return;
      }
      go(key);
    },
  };

  // ── Auth ─────────────────────────────────────────────────────
  if (page === "register") {
  return (
    <Register
      onRegisterSuccess={handleLoginSuccess}
      onGoToLogin={() => go("login")}
    />
  );
}

if (!user || page === "login") {
  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      onGoToRegister={() => go("register")}
    />
  );
}

  // ── Buyer ─────────────────────────────────────────────────────
  if (user?.role === "buyer") {
    switch (page) {
      case "cart":
        return <Cart {...buyerProps} onBack={() => go("home")} />;
      case "status":
        return <OrderStatus {...buyerProps} />;
      case "history":
        return <History {...buyerProps} />;
      default:
        return <Home {...buyerProps} />;
    }
  }

  // ── Seller ─────────────────────────────────────────────────────
  if (user?.role === "seller") {
    switch (page) {
      case "menu":
        return <Menu {...sellerProps} />;
      case "orders":
        return <Orders {...sellerProps} />;
      default:
        return <Dashboard {...sellerProps} />;
    }
  }

  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      onGoToRegister={() => go("register")}
    />
  );
}

export default App;
