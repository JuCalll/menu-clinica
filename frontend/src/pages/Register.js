import React, { useState } from 'react';
import api from '../services/api';
import '../styles/Login.scss';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register/', { username, email, password });
            console.log('User registered successfully');
        } catch (error) {
            setError('Registration failed');
        }
    };

    return (
        <div className="register-container container mt-5">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
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
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <button type="submit" className="btn btn-primary btn-block">Register</button>
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default Register;
