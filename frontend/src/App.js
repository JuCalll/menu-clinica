import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Modal } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import inactivityTime from "./utils/inactivityHandler";
import { jwtDecode } from "jwt-decode";
import api from "./axiosConfig";
import { App as AntApp } from 'antd';

import Home from "./pages/Home";
import Login from "./pages/Login";
import RealizarPedido from "./pages/RealizarPedido";
import DataManagement from "./pages/DataManagement";
import MenuPage from "./pages/MenuPage";
import PedidosPendientes from "./pages/PedidosPendientes";
import HistorialPedidos from "./pages/HistorialPedidos";
import UserManagement from "./pages/UserManagement";

import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";


function App() {
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  useEffect(() => {
    let cleanupInactivity;
    let tokenCheckInterval;

    const token = localStorage.getItem("token");
    if (!token) return;

    const handleTokenExpired = () => {
      handleWarningCancel();
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    const isTokenExpired = (token) => {
      if (!token) return true;
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decodedToken.exp < currentTime;
      } catch (error) {
        return true;
      }
    };

    tokenCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken && isTokenExpired(currentToken)) {
        handleWarningCancel();
      }
    }, 10000);

    const handleActivity = async () => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken || window.isRefreshing) return;

      try {
        const decodedToken = jwtDecode(currentToken);
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = decodedToken.exp - currentTime;
        
        if (timeUntilExpiry < 1800) {
          window.isRefreshing = true;
          await refreshToken();
          window.isRefreshing = false;
        }
      } catch (error) {
        console.error("Error checking/refreshing token:", error);
        if (error.response?.status === 400 || error.response?.data?.detail?.includes('blacklisted')) {
          handleWarningCancel();
        }
      }
    };

    cleanupInactivity = inactivityTime(setIsWarningVisible, handleActivity);

    return () => {
      if (cleanupInactivity) cleanupInactivity();
      window.removeEventListener('tokenExpired', handleTokenExpired);
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("No hay token de refresco disponible.");

    try {
      const response = await api.post("/auth/token/refresh/", { refresh });

      if (response.data && response.data.access) {
        localStorage.setItem("token", response.data.access);
        api.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;

        if (response.data.refresh) {
          localStorage.setItem("refresh", response.data.refresh);
        }
      } else {
        throw new Error("No se pudo refrescar el token.");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleWarningOk = async () => {
    try {
      await refreshToken();
      setIsWarningVisible(false);
    } catch (error) {
      handleWarningCancel();
    }
  };

  const handleWarningCancel = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      const token = localStorage.getItem("token");
      
      if (refresh && token) {
        try {
          // Intentar refrescar el token una última vez para el logout
          const refreshResponse = await api.post("/auth/token/refresh/", { refresh });
          
          if (refreshResponse.data && refreshResponse.data.access) {
            const newToken = refreshResponse.data.access;
            const newRefresh = refreshResponse.data.refresh || refresh; // Usar el nuevo refresh si existe
            
            // Actualizar el token en localStorage y en los headers
            localStorage.setItem("token", newToken);
            
            // Hacer el logout usando el nuevo token y el refresh token original
            await api.post(
              "/auth/logout/", 
              { refresh: newRefresh },
              { 
                headers: { 
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
          }
        } catch (refreshError) {
          console.error("Error al refrescar token:", refreshError);
        }
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // Limpiar localStorage y redirigir independientemente del resultado
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <AntApp>
      <Router>
        <Modal
          title="Advertencia de Inactividad"
          open={isWarningVisible}
          onOk={handleWarningOk}
          onCancel={handleWarningCancel}
          okText="Estoy aquí"
          cancelText="Cerrar sesión"
          className="inactivity-warning-modal"
        >
          <p>Ha pasado un tiempo desde su última actividad. Por favor, confirme que sigue aquí.</p>
        </Modal>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/menus"
              element={
                <PrivateRoute requiredRoles={["admin", "coordinador"]}>
                  <MenuPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/realizar-pedido"
              element={
                <PrivateRoute requiredRoles={["admin", "jefe_enfermeria", "coordinador"]}>
                  <RealizarPedido />
                </PrivateRoute>
              }
            />
            <Route
              path="/pedidos/pendientes"
              element={
                <PrivateRoute requiredRoles={["admin", "coordinador", "auxiliar"]}>
                  <PedidosPendientes />
                </PrivateRoute>
              }
            />
            <Route
              path="/pedidos/historial"
              element={
                <PrivateRoute requiredRoles={["admin", "coordinador", "auxiliar"]}>
                  <HistorialPedidos />
                </PrivateRoute>
              }
            />
            <Route
              path="/gestion-datos"
              element={
                <PrivateRoute requiredRoles={["admin", "jefe_enfermeria"]}>
                  <DataManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/gestion-usuarios"
              element={
                <PrivateRoute requiredRoles={["admin"]}>
                  <UserManagement />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AntApp>
  );
}

export default App;
