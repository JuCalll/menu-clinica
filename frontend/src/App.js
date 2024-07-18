import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Menus from './pages/Menus';
import Pedidos from './pages/Pedidos';
import Pacientes from './pages/Pacientes';
import Register from './pages/Register';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import './styles/App.scss';

// Componente principal de la aplicación
function App() {
    return (
        <Router>
            <Routes>
                {/* Ruta para la página de inicio de sesión */}
                <Route path="/login" element={<Login />} />
                {/* Ruta para la página de registro */}
                <Route path="/register" element={<Register />} />
                {/* Ruta para las páginas privadas que requieren autenticación */}
                <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route path="/" element={<Home />} />
                    <Route path="/menus" element={<Menus />} />
                    <Route path="/pedidos" element={<Pedidos />} />
                    <Route path="/pacientes" element={<Pacientes />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
