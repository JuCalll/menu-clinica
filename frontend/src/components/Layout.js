import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import '../styles/Layout.scss';

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
