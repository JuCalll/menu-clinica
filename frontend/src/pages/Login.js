import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Alert} from "antd";
import api from "../services/api";
import "../styles/Login.scss";
import logo from "../assets/logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login/", { username, password });
      const access = response.data.access;
      const refresh = response.data.refresh;
      const role = response.data.user.role;

      if (access && role) {
        localStorage.setItem("token", access);
        localStorage.setItem("refresh", refresh);
        localStorage.setItem("role", role);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        navigate("/home");
      } else {
        setError("Login failed: Invalid response from server.");
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Login failed");
      }
      console.error("Error logging in:", error);
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
          />
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
          <Button type="primary" htmlType="submit" className="login-button">
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
