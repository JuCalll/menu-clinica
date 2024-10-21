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
