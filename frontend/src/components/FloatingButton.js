import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../styles/FloatingButton.scss';

const FloatingButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPedidosOpen, setIsPedidosOpen] = useState(false);
    const userRole = localStorage.getItem('role');  // Obtener el rol del usuario

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

                {/* Menús visible solo para admin y coordinador */}
                {(userRole === 'admin' || userRole === 'coordinador') && (
                    <NavLink to="/menus" className="nav-link" onClick={toggleMenu}>Menús</NavLink>
                )}

                {(userRole === 'admin' || userRole === 'coordinador' || userRole === 'auxiliar' || userRole === 'jefe_enfermeria') && (
                    <>
                        <div 
                            className={`nav-link pedidos-toggle ${isPedidosOpen ? 'open' : ''}`} 
                            onClick={togglePedidosMenu} 
                            style={{ cursor: 'pointer' }}
                        >
                            Pedidos
                        </div>
                        {isPedidosOpen && (
                            <div className={`submenu ${isPedidosOpen ? 'submenu-open' : ''}`}>
                                {/* Realizar Pedido visible para admin, jefe de enfermería y coordinador */}
                                {(userRole === 'admin' || userRole === 'jefe_enfermeria' || userRole === 'coordinador') && (
                                    <NavLink to="/realizar-pedido" className="nav-link submenu-item" onClick={toggleMenu}>Realizar Pedido</NavLink>
                                )}
                                {/* Pedidos Pendientes e Historial visible para admin, coordinador y auxiliar */}
                                {(userRole === 'admin' || userRole === 'coordinador' || userRole === 'auxiliar') && (
                                    <>
                                        <NavLink to="/pedidos/pendientes" className="nav-link submenu-item" onClick={toggleMenu}>Pedidos Pendientes</NavLink>
                                        <NavLink to="/pedidos/historial" className="nav-link submenu-item" onClick={toggleMenu}>Historial de Pedidos</NavLink>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                {(userRole === 'admin' || userRole === 'jefe_enfermeria') && (
                    <NavLink to="/gestion-datos" className="nav-link" onClick={toggleMenu}>Gestión de Datos</NavLink>
                )}

                {userRole === 'admin' && (
                    <NavLink to="/gestion-usuarios" className="nav-link" onClick={toggleMenu}>Gestión de Usuarios</NavLink>
                )}
            </div>
        </div>
    );
};

export default FloatingButton;
