import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Alert, Modal } from 'antd';
import api from '../services/api';
import '../styles/Login.scss';
import logo from '../assets/logo.png';
import inactivityTime from '../utils/inactivityHandler';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isWarningVisible, setIsWarningVisible] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('login-page');
        return () => {
            document.body.classList.remove('login-page');
        };
    }, []);

    useEffect(() => {
        console.log("Starting inactivity timer.");  // Log para depuración
        inactivityTime(setIsWarningVisible);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login/', { username, password });
            const access = response.data.access;
            const refresh = response.data.refresh;
            const role = response.data.user.role;

            if (access && role) {
                localStorage.setItem('token', access);
                localStorage.setItem('refresh', refresh);  // Guardar el refresh token
                localStorage.setItem('role', role);
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                navigate('/home');
            } else {
                setError('Login failed: Invalid response from server.');
            }
        } catch (error) {
            if (error.response && error.response.data.error) {
                setError(error.response.data.error);  // Mostrar el mensaje de error específico
            } else {
                setError('Login failed');
            }
            console.error('Error logging in:', error);
        }
    };

    const handleWarningOk = () => {
        console.log("User confirmed presence.");  // Log para depuración
        setIsWarningVisible(false);
    };

    const handleWarningCancel = () => {
        console.log("User chose to log out.");  // Log para depuración
        // Cerrar sesión y redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <img src={logo} alt="Clínica San Juan de Dios" className="login-logo" />
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field"
                    />
                    <Input.Password
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />
                    <Button type="primary" htmlType="submit" className="login-button">Login</Button>
                    {error && <Alert message={error} type="error" className="error-message" />}
                </form>
            </div>

            <Modal
                title="Advertencia de Inactividad"
                open={isWarningVisible}
                onOk={handleWarningOk}
                onCancel={handleWarningCancel}
                okText="Estoy aquí"
                cancelText="Cerrar sesión"
            >
                <p>Ha pasado un tiempo desde su última actividad. Por favor, confirme que sigue aquí.</p>
            </Modal>
        </div>
    );
};

export default Login;
