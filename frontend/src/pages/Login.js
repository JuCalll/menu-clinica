// Importamos React y el hook useState para manejar el estado del componente
import React, { useState } from 'react';
// Importamos useNavigate desde react-router-dom para manejar la navegación
import { useNavigate } from 'react-router-dom';
// Importamos el servicio API para realizar peticiones al backend
import api from '../services/api';
// Importamos el archivo de estilos SCSS específico para este componente
import '../styles/Login.scss';

// Definimos el componente Login
const Login = () => {
    // Estado para manejar el nombre de usuario, contraseña y errores
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Inicializamos el hook useNavigate para la redirección después del login
    const navigate = useNavigate();

    // Función para manejar el envío del formulario de login
    const handleLogin = async (e) => {
        e.preventDefault();  // Prevenimos el comportamiento por defecto del formulario
        try {
            // Enviamos una petición POST al backend con el nombre de usuario y la contraseña
            const response = await api.post('/auth/login/', { username, password });
            // Guardamos el token de acceso en localStorage
            localStorage.setItem('token', response.data.access);
            // Redirigimos al usuario a la página de inicio después de un login exitoso
            navigate('/');
        } catch (error) {
            // Si hay un error, actualizamos el estado para mostrar un mensaje de error
            setError('Login failed');
        }
    };

    // Renderizamos el formulario de login
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
                {/* Mostrar mensaje de error si ocurre un fallo en el login */}
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </form>
        </div>
    );
};

// Exportamos el componente Login para que pueda ser utilizado en otras partes de la aplicación
export default Login;
