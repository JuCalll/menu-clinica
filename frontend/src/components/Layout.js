import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import '../styles/Layout.scss';

/**
 * Componente Layout que estructura la página con un encabezado, una barra lateral y un área de contenido.
 */
const Layout = () => {
    return (
        <div className="layout">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
