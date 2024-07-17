import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.scss';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <NavLink to="/" exact activeClassName="active">Home</NavLink>
            <NavLink to="/menus" activeClassName="active">Menus</NavLink>
            <NavLink to="/pedidos" activeClassName="active">Pedidos</NavLink>
            <NavLink to="/pacientes" activeClassName="active">Pacientes</NavLink>
        </div>
    );
};

export default Sidebar;
