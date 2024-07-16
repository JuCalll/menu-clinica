// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Menus from './pages/Menus';
import Pedidos from './pages/Pedidos';
import Pacientes from './pages/Pacientes';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import './styles/App.scss';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/menus" element={<PrivateRoute><Menus /></PrivateRoute>} />
                <Route path="/pedidos" element={<PrivateRoute><Pedidos /></PrivateRoute>} />
                <Route path="/pacientes" element={<PrivateRoute><Pacientes /></PrivateRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
