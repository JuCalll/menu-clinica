// Importamos React para crear componentes
import React from 'react';
// Importamos NavLink desde react-router-dom para manejar la navegación entre páginas
import { NavLink } from 'react-router-dom';
// Importamos el archivo de estilos SCSS para este componente
import '../styles/Sidebar.scss';

// Definimos el componente Sidebar que representa la barra lateral de navegación
const Sidebar = () => {
  return (
    // Contenedor principal de la barra lateral, que ocupa toda la altura de la ventana
    <div className="sidebar vh-100">
      {/* Navegación vertical con enlaces a diferentes secciones de la aplicación */}
      <nav className="nav flex-column">
        {/* Cada NavLink crea un enlace de navegación que cambia de ruta */}
        <NavLink to="/" className="nav-link">Inicio</NavLink>
        <NavLink to="/menus" className="nav-link">Menús</NavLink>
        <NavLink to="/realizar-pedido" className="nav-link">Realizar Pedido</NavLink>
        <NavLink to="/pacientes" className="nav-link">Pacientes</NavLink>
        <NavLink to="/servicios-habitaciones" className="nav-link">Servicios y Habitaciones</NavLink>
      </nav>
    </div>
  );
};

// Exportamos el componente Sidebar para que pueda ser utilizado en otras partes de la aplicación
export default Sidebar;
