import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../styles/FloatingButton.scss';

const FloatingButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPedidosOpen, setIsPedidosOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const togglePedidosMenu = () => {
        setIsPedidosOpen(!isPedidosOpen);
    };

    return (
        <div className="floating-button">
            <button className="btn" onClick={toggleMenu}>
                <FaBars />
            </button>

            <div className={`floating-menu ${isOpen ? 'show' : ''}`}>
                <NavLink to="/" className="nav-link" onClick={toggleMenu}>Inicio</NavLink>
                <NavLink to="/menus" className="nav-link" onClick={toggleMenu}>Menús</NavLink>

                <div 
                    className={`nav-link pedidos-toggle ${isPedidosOpen ? 'open' : ''}`} 
                    onClick={togglePedidosMenu} 
                    style={{ cursor: 'pointer' }}
                >
                    Pedidos
                </div>
                {isPedidosOpen && (
                    <div className={`submenu ${isPedidosOpen ? 'submenu-open' : ''}`}>
                        <NavLink to="/realizar-pedido" className="nav-link submenu-item" onClick={toggleMenu}>Realizar Pedido</NavLink>
                        <NavLink to="/pedidos/pendientes" className="nav-link submenu-item" onClick={toggleMenu}>Pedidos Pendientes</NavLink>
                        <NavLink to="/pedidos/historial" className="nav-link submenu-item" onClick={toggleMenu}>Historial de Pedidos</NavLink>
                    </div>
                )}

                <NavLink to="/gestion-datos" className="nav-link" onClick={toggleMenu}>Gestión de Datos</NavLink>
            </div>
        </div>
    );
};

export default FloatingButton;
