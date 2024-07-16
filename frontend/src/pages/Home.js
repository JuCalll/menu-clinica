// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div>
            <h1>Clínica San Juan de Dios - Menú Preferencial</h1>
            <nav>
                <ul>
                    <li><Link to="/menus">Menus</Link></li>
                    <li><Link to="/pedidos">Pedidos</Link></li>
                    <li><Link to="/pacientes">Pacientes</Link></li>
                </ul>
            </nav>
        </div>
    );
}

export default Home;
