import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Alert } from "antd";
import api from "../services/api";
import { jwtDecode } from 'jwt-decode'; // Para decodificar el token JWT
import "../styles/Login.scss";
import logo from "../assets/logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Indicador de carga

  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const isTokenValid = (token) => {
    if (!token) return false;
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Tiempo actual en segundos
    return decodedToken.exp > currentTime; // Compara la expiración del token con el tiempo actual
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login/", { username, password });
      const { access, refresh, user } = response.data;
      const role = user.role;
      const name = user.name; // Obtenemos el nombre completo del usuario

      if (access && refresh && role && name) {
        // Verificamos si el token es válido
        if (isTokenValid(access)) {
          localStorage.setItem("token", access);
          localStorage.setItem("refresh", refresh);
          localStorage.setItem("role", role);
          localStorage.setItem("name", name); // Guardamos el nombre del usuario

          api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
          navigate("/home");
        } else {
          setError("El token recibido es inválido o ha expirado.");
        }
      } else {
        setError("Login failed: Invalid response from server.");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Error al iniciar sesión. Por favor, inténtelo de nuevo.");
      }
      console.error("Error logging in:", error);
    } finally {
      setLoading(false); // Finalizamos el indicador de carga
    }
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
            disabled={loading} // Deshabilitamos el campo durante el login
          />
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            disabled={loading} // Deshabilitamos el campo durante el login
          />
          <Button
            type="primary"
            htmlType="submit"
            className="login-button"
            loading={loading} // Indicador de carga en el botón
          >
            Login
          </Button>
          {error && (
            <Alert message={error} type="error" className="error-message" />
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
