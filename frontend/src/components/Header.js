import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.scss";
import logo from "../assets/logo.png";
import api from "../services/api";

const Header = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch (error) {
      console.error("Error al registrar logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      window.location.href = "/login";
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <div className="header-right">
            {name && <span className="username">Bienvenido, {name}</span>}
            <Link to="/login" className="logout-link" onClick={handleLogout}>
              Cerrar sesión
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
