// Importamos React para crear componentes
import React from 'react';
// Importamos los componentes Header, Sidebar y FloatingButton
import Header from './Header';
import Sidebar from './Sidebar';
import FloatingButton from './FloatingButton'; 
// Importamos Outlet desde react-router-dom para renderizar sub-rutas dentro del componente principal
import { Outlet } from 'react-router-dom';
// Importamos el archivo de estilos SCSS para este componente
import '../styles/Layout.scss';

// Definimos el componente Layout que organiza la estructura de la aplicación
const Layout = () => {
    return (
        <div className="layout d-flex flex-column">
            {/* Componente Header en la parte superior */}
            <Header />
            
            {/* Contenedor principal que incluye la barra lateral y el contenido principal */}
            <div className="main-content d-flex flex-grow-1">
                {/* Componente Sidebar en el lado izquierdo */}
                <Sidebar />
                
                {/* Contenedor para el contenido principal de la página */}
                <div className="content flex-grow-1 p-3">
                    {/* Outlet se usa para renderizar las rutas secundarias que cambian según la navegación */}
                    <Outlet />
                </div>
            </div>
            
            {/* Botón flotante para navegación rápida */}
            <FloatingButton /> 
        </div>
    );
};

// Exportamos el componente Layout para que pueda ser utilizado en otras partes de la aplicación
export default Layout;
