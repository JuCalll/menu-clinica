// Login.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Alert } from "antd";
import api from "../axiosConfig";
import { jwtDecode } from 'jwt-decode';
import "../styles/Login.scss";
import logo from "../assets/logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username || !password) {
      setError("Por favor, ingrese su usuario y contraseña.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/login/", {
        username,
        password,
      });
      const { access, refresh, user } = response.data;
      const role = user.role;
      const name = user.name;

      if (access && refresh && role && name) {
        if (isTokenValid(access)) {
          localStorage.setItem("token", access);
          localStorage.setItem("refresh", refresh);
          localStorage.setItem("role", role);
          localStorage.setItem("name", name);
          navigate("/home");
        } else {
          setError("El token recibido es inválido o ha expirado.");
        }
      } else {
        setError("Error al iniciar sesión: respuesta inválida del servidor.");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400
      ) {
        setError(
          "Credenciales incorrectas. Por favor, verifique e intente nuevamente."
        );
      } else if (
        error.response &&
        error.response.status === 500
      ) {
        setError(
          "Error del servidor. Por favor, inténtelo más tarde."
        );
      } else {
        setError(
          "No se pudo conectar al servidor. Por favor, verifique su conexión."
        );
      }
      console.error("Error al iniciar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img
          src={logo}
          alt="Clínica San Juan de Dios"
          className="login-logo"
        />
        <h2>Login</h2>
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
            onChange={(e) =>
              setPassword(e.target.value)
            }
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
