// src/pages/Register.js

import React, { useState } from 'react';
import api from '../services/api'; // Asegúrate de que la ruta a 'api' es correcta

// Componente funcional Register
// Maneja el registro de nuevos usuarios
const Register = () => {
    const [username, setUsername] = useState(''); // Estado para almacenar el nombre de usuario
    const [email, setEmail] = useState(''); // Estado para almacenar el correo electrónico
    const [password, setPassword] = useState(''); // Estado para almacenar la contraseña
    const [error, setError] = useState(''); // Estado para manejar los errores

    // Función para manejar el registro de un nuevo usuario
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/register/', { username, email, password }); // Solicita la creación del usuario a la API
            console.log(response.data); // Imprime la respuesta en la consola
        } catch (error) {
            setError('Registration failed'); // Maneja el error
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
};

export default Register;
