/**
 * Página de Inicio de Sesión
 * 
 * Proporciona la interfaz de autenticación con:
 * - Formulario de login con validación
 * - Manejo de tokens JWT
 * - Redirección según rol de usuario
 * - Manejo de errores de autenticación
 * 
 * @component
 */

import React, { useState, useEffect } from "react";
import { Input, Button, Alert } from "antd";
import api from "../axiosConfig";
import { jwtDecode } from 'jwt-decode';
import "../styles/Login.scss";
import logo from "../assets/logo.png";

const Login = () => {
  // Estados del formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Efecto para agregar clase CSS al body
   * Mejora la presentación visual de la página de login
   */
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  /**
   * Valida la vigencia de un token JWT
   * @param {string} token - Token JWT a validar
   * @returns {boolean} true si el token es válido y no ha expirado
   */
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  /**
   * Maneja el proceso de inicio de sesión
   * - Valida campos requeridos
   * - Realiza petición de autenticación
   * - Almacena tokens y datos de usuario
   * - Maneja errores de autenticación
   * 
   * @param {Event} e - Evento del formulario
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validación de campos requeridos
    if (!username || !password) {
      setError("Por favor, ingrese su usuario y contraseña.");
      setLoading(false);
      return;
    }

    try {
      // Petición de autenticación
      const response = await api.post("/auth/login/", {
        username,
        password,
      });
      const { access, refresh, user } = response.data;
      const { role, name } = user;

      // Validación y almacenamiento de tokens
      if (access && refresh && role && name) {
        if (isTokenValid(access)) {
          localStorage.setItem("token", access);
          localStorage.setItem("refresh", refresh);
          localStorage.setItem("role", role);
          localStorage.setItem("name", name);
          window.location.href = "/#/home";
        } else {
          setError("El token recibido es inválido o ha expirado.");
        }
      } else {
        setError("Error al iniciar sesión: respuesta inválida del servidor.");
      }
    } catch (error) {
      // Manejo de errores específicos
      if (error.response?.status === 400) {
        setError("Credenciales incorrectas. Por favor, verifique e intente nuevamente.");
      } else if (error.response?.status === 500) {
        setError("Error del servidor. Por favor, inténtelo más tarde.");
      } else {
        setError("No se pudo conectar al servidor. Por favor, verifique su conexión.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        {/* Logo y título */}
        <img
          src={logo}
          alt="Clínica San Juan de Dios"
          className="login-logo"
        />
        <h2>Menú Preferencial - CSJDD</h2>

        {/* Formulario de login */}
        <form onSubmit={handleLogin}>
          <Input
            id="username-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            disabled={loading}
          />
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            disabled={loading}
          />
          <Button
            type="primary"
            htmlType="submit"
            className="login-button"
            loading={loading}
          >
            Login
          </Button>

          {/* Mensaje de error */}
          {error && (
            <Alert
              message={error}
              type="error"
              className="error-message"
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
