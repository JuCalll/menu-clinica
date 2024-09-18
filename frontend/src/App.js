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

import "./styles/App.scss";

function App() {
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  useEffect(() => {
    let cleanupInactivity;
    let tokenRefreshTimeout;

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

    const initializeApp = async (location) => {
      const currentPath = location.hash ? location.hash.substring(1) : location.pathname; 

      if (currentPath === "/login") {
        return;
      }

      let token = localStorage.getItem("token");
      let refresh = localStorage.getItem("refresh");

      if (token && !isTokenExpired(token)) {
        cleanupInactivity = inactivityTime(setIsWarningVisible);
        scheduleTokenRefresh();
      } else if (refresh && !isTokenExpired(refresh)) {
        try {
          await refreshToken();
          cleanupInactivity = inactivityTime(setIsWarningVisible);
          scheduleTokenRefresh();
        } catch (error) {
          handleWarningCancel();
        }
      } else {
        handleWarningCancel();
      }
    };

    const scheduleTokenRefresh = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        handleWarningCancel();
        return;
      }
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decodedToken.exp - currentTime;

      const refreshTime = (timeUntilExpiry - 300) * 1000;

      if (refreshTime > 0) {
        tokenRefreshTimeout = setTimeout(async () => {
          try {
            await refreshToken();
            scheduleTokenRefresh();
          } catch (error) {
            handleWarningCancel();
          }
        }, refreshTime);
      } else {
        handleWarningCancel();
      }
    };

    const location = window.location;
    initializeApp(location);

    return () => {
      if (cleanupInactivity) cleanupInactivity();
      if (tokenRefreshTimeout) clearTimeout(tokenRefreshTimeout);
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

  const handleWarningCancel = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    window.location.href = "/login";
  };

  return (
    <Router>
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
  );
}

export default App;
