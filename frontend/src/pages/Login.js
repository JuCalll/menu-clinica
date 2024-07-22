// src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Login.scss';

// Componente funcional Login
// Maneja el estado del formulario de inicio de sesión y las interacciones del usuario
const Login = () => {
    const [username, setUsername] = useState(''); // Estado para el nombre de usuario
    const [password, setPassword] = useState(''); // Estado para la contraseña
    const [error, setError] = useState(''); // Estado para los mensajes de error
    const navigate = useNavigate(); // Hook para navegar entre rutas

    // Función para manejar el envío del formulario de inicio de sesión
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login/', { username, password }); // Envía una solicitud de inicio de sesión a la API
            localStorage.setItem('token', response.data.access); // Guarda el token en el almacenamiento local
            navigate('/'); // Navega a la página de inicio
        } catch (error) {
            setError('Login failed'); // Establece un mensaje de error en caso de fallo
        }
    };

    return (
        <div className="login-container">
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleLogin}>
                <label htmlFor="username">Usuario</label>
                <input
                    type="text"
                    id="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="password">Contraseña</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
};

export default Login;
