// frontend/src/components/FloatingButton.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../styles/FloatingButton.scss';

const FloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="floating-button">
      <button onClick={toggleMenu} className="btn btn-primary">
        <FaBars />
      </button>
      {isOpen && (
        <div className="floating-menu show">
          <nav className="nav flex-column">
            <NavLink to="/" className="nav-link" onClick={toggleMenu}>Home</NavLink>
            <NavLink to="/menus" className="nav-link" onClick={toggleMenu}>Menús</NavLink>
            <NavLink to="/realizar-pedido" className="nav-link" onClick={toggleMenu}>Realizar Pedido</NavLink>
            <NavLink to="/pedidos" className="nav-link" onClick={toggleMenu}>Pedidos</NavLink>
            <NavLink to="/pacientes" className="nav-link" onClick={toggleMenu}>Pacientes</NavLink>
            <NavLink to="/servicios-habitaciones" className="nav-link" onClick={toggleMenu}>Servicios y Habitaciones</NavLink>
          </nav>
        </div>
      )}
    </div>
  );
};

export default FloatingButton;
