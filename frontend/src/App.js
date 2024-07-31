// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Home from './pages/Home';
import Login from './pages/Login';
import Pedidos from './pages/Pedidos';
import Pacientes from './pages/Pacientes';
import Register from './pages/Register';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import ServiciosHabitaciones from './pages/ServiciosHabitaciones';
import MenuPage from './pages/MenuPage'; // Importación correcta
import './styles/App.scss';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route path="/" element={<Home />} />
                    <Route path="/menus" element={<MenuPage />} /> {/* Ruta corregida */}
                    <Route path="/pedidos" element={<Pedidos />} />
                    <Route path="/pacientes" element={<Pacientes />} />
                    <Route path="/servicios-habitaciones" element={<ServiciosHabitaciones />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
