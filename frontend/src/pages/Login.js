import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Login.scss';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Realiza la petición al backend
            const response = await api.post('/auth/login/', { username, password });

            // Log para verificar la respuesta completa
            console.log('Response completa:', response);

            // Extrae el token de acceso y el rol del usuario de la respuesta
            const token = response.data.access;
            const role = response.data.user.role; // Suponiendo que el rol viene dentro de `user` en la respuesta

            if (token && role) {
                // Guarda el token y el rol en localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);

                // Redirige al usuario a la página de inicio
                navigate('/');
            } else {
                // Si no se encuentra el token o el rol en la respuesta, muestra un error
                setError('Login failed: Invalid response from server.');
            }
        } catch (error) {
            // Log para verificar el error
            console.error('Error al intentar iniciar sesión:', error);

            // Muestra un mensaje de error
            setError('Login failed');
        }
    };

    return (
        <div className="login-container container mt-5">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control"
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Login</button>
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default Login;
