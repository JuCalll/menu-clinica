// Importamos React y el hook useState para manejar el estado del componente
import React, { useState } from 'react';
// Importamos NavLink de react-router-dom para manejar la navegación entre páginas
import { NavLink } from 'react-router-dom';
// Importamos el ícono FaBars desde react-icons/fa para usarlo en el botón flotante
import { FaBars } from 'react-icons/fa';
// Importamos el archivo de estilos SCSS para este componente
import '../styles/FloatingButton.scss';

// Definimos el componente FloatingButton
const FloatingButton = () => {
    // Utilizamos el hook useState para manejar si el menú flotante está abierto o cerrado
    const [isOpen, setIsOpen] = useState(false);

    // Función para alternar el estado del menú flotante (abierto/cerrado)
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Renderizamos el botón flotante y el menú
    return (
        <div className="floating-button">
            {/* Botón para abrir/cerrar el menú */}
            <button onClick={toggleMenu} className="btn btn-primary">
                <FaBars /> {/* Ícono de barras para el menú */}
            </button>

            {/* Menú flotante, que solo se muestra si isOpen es true */}
            {isOpen && (
                <div className={`floating-menu ${isOpen ? 'show' : ''}`}>
                    <nav className="nav flex-column">
                        {/* Cada NavLink es un enlace a una ruta diferente en la aplicación */}
                        {/* Al hacer clic en cualquier enlace, el menú se cierra */}
                        <NavLink to="/" className="nav-link" onClick={toggleMenu}>Home</NavLink>
                        <NavLink to="/menus" className="nav-link" onClick={toggleMenu}>Menús</NavLink>
                        <NavLink to="/realizar-pedido" className="nav-link" onClick={toggleMenu}>Realizar Pedido</NavLink>
                        <NavLink to="/pedidos" className="nav-link" onClick={toggleMenu}>Pedidos</NavLink>
                        <NavLink to="/gestion-datos" className="nav-link" onClick={toggleMenu}>Gestión de Datos</NavLink> {/* Nueva ruta */}
                    </nav>
                </div>
            )}
        </div>
    );
};

// Exportamos el componente FloatingButton para que pueda ser utilizado en otras partes de la aplicación
export default FloatingButton;
