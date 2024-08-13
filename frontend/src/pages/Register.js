// Importamos React y el hook useState para manejar el estado del componente
import React, { useState } from 'react';
// Importamos axios para realizar solicitudes HTTP al backend
import axios from 'axios';
// Importamos el archivo de estilos SCSS específico para este componente
import '../styles/Login.scss';

// Definimos el componente Register
const Register = () => {
    // Estados para manejar los valores de los campos de entrada y los errores
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Función para manejar el envío del formulario de registro
    const handleRegister = async (e) => {
        e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
        try {
            // Enviamos una solicitud POST al backend para registrar un nuevo usuario
            const response = await axios.post('http://127.0.0.1:8000/api/auth/register/', {
                username,
                email,
                password
            });
            // Si la solicitud es exitosa, mostramos un mensaje en la consola
            console.log('Usuario registrado con éxito', response.data);
        } catch (error) {
            // Si hay un error, mostramos un mensaje de error en la interfaz y en la consola
            setError('El registro falló');
            console.error('Error en el registro', error.response);
        }
    };

    // Renderizamos el formulario de registro
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
                {/* Mostrar mensaje de error si ocurre un fallo en el registro */}
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </form>
        </div>
    );
};

// Exportamos el componente Register para que pueda ser utilizado en otras partes de la aplicación
export default Register;
