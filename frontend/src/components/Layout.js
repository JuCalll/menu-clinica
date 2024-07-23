import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import FloatingButton from './FloatingButton'; 
import { Outlet } from 'react-router-dom';
import '../styles/Layout.scss';

const Layout = () => {
    return (
        <div className="layout d-flex flex-column">
            <Header />
            <div className="main-content d-flex flex-grow-1">
                <Sidebar />
                <div className="content flex-grow-1 p-3">
                    <Outlet />
                </div>
            </div>
            <FloatingButton /> 
        </div>
    );
};

export default Layout;
