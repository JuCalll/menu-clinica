// frontend/src/pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Login.scss';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/register/', {
                username,
                email,
                password
            });
            console.log('Usuario registrado con éxito', response.data);
        } catch (error) {
            setError('El registro falló');
            console.error('Error en el registro', error.response);
        }
    };

    return (
        <div className="register-container container mt-5">
            <h2>Registro</h2>
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control"
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Registrar</button>
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default Register;
