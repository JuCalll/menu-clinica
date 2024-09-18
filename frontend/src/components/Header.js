import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.scss";
import logo from "../assets/logo.png";

const Header = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name"); 
  };

  return (
    <header className="header">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="header-left d-flex align-items-center">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="header-right d-flex align-items-center">
          {name && <span className="username">Bienvenido, {name}</span>} 
          <Link
            to="/login"
            className="nav-link logout-link"
            onClick={handleLogout}
          >
            Cerrar sesión
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
