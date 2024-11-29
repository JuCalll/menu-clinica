/**
 * Componente principal de la aplicación
 * Maneja el enrutamiento, autenticación y control de inactividad
 */

// Importaciones de React y Router
import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

// Importaciones de componentes y utilidades
import { Modal } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import inactivityTime from "./utils/inactivityHandler";
import { jwtDecode } from "jwt-decode";
import api from "./axiosConfig";
import { App as AntApp } from "antd";

// Importaciones de páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import RealizarPedido from "./pages/RealizarPedido";
import DataManagement from "./pages/DataManagement";
import MenuPage from "./pages/MenuPage";
import PedidosPendientes from "./pages/PedidosPendientes";
import HistorialPedidos from "./pages/HistorialPedidos";
import UserManagement from "./pages/UserManagement";

// Importaciones de componentes de layout
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  // Estado para controlar la visibilidad del modal de advertencia
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  useEffect(() => {
    let cleanupInactivity;
    let tokenCheckInterval;

    // Obtener token actual
    const token = localStorage.getItem("token");
    if (!token) return;

    /**
     * Manejador del evento de token expirado
     */
    const handleTokenExpired = () => {
      handleWarningCancel();
    };

    // Agregar listener para el evento de token expirado
    window.addEventListener("tokenExpired", handleTokenExpired);

    /**
     * Verifica si un token JWT ha expirado
     * @param {string} token - Token JWT a verificar
     * @returns {boolean} - true si el token ha expirado, false en caso contrario
     */
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

    // Intervalo para verificar la expiración del token
    tokenCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken && isTokenExpired(currentToken)) {
        handleWarningCancel();
      }
    }, 10000); // Verificar cada 10 segundos

    /**
     * Manejador de actividad del usuario
     * Refresca el token si está próximo a expirar
     */
    const handleActivity = async () => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken || window.isRefreshing) return;

      try {
        const decodedToken = jwtDecode(currentToken);
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = decodedToken.exp - currentTime;

        // Refrescar token si expira en menos de 30 minutos
        if (timeUntilExpiry < 1800) {
          window.isRefreshing = true;
          await refreshToken();
          window.isRefreshing = false;
        }
      } catch (error) {
        // Remover console.error y manejar el error silenciosamente
        if (
          error.response?.status === 400 ||
          error.response?.data?.detail?.includes("blacklisted")
        ) {
          handleWarningCancel();
        }
      }
    };

    // Inicializar manejador de inactividad
    cleanupInactivity = inactivityTime(setIsWarningVisible, handleActivity);

    // Limpieza al desmontar
    return () => {
      if (cleanupInactivity) cleanupInactivity();
      window.removeEventListener("tokenExpired", handleTokenExpired);
      clearInterval(tokenCheckInterval);
    };
  }, []);

  /**
   * Refresca el token de acceso usando el refresh token
   * @throws {Error} Si no hay refresh token o si falla el refresco
   */
  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("No hay token de refresco disponible.");

    try {
      const response = await api.post("/auth/token/refresh/", { refresh });

      if (response.data && response.data.access) {
        // Actualizar token de acceso
        localStorage.setItem("token", response.data.access);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.access}`;

        // Actualizar refresh token si se proporciona uno nuevo
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

  /**
   * Manejador para cuando el usuario confirma que sigue activo
   */
  const handleWarningOk = async () => {
    try {
      await refreshToken();
      setIsWarningVisible(false);
    } catch (error) {
      handleWarningCancel();
    }
  };

  /**
   * Manejador para cerrar sesión
   * Intenta hacer un logout limpio antes de redireccionar
   */
  const handleWarningCancel = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      const token = localStorage.getItem("token");

      if (refresh && token) {
        try {
          // Intentar refrescar el token una última vez para el logout
          const refreshResponse = await api.post("/auth/token/refresh/", {
            refresh,
          });

          if (refreshResponse.data && refreshResponse.data.access) {
            const newToken = refreshResponse.data.access;
            const newRefresh = refreshResponse.data.refresh || refresh;

            localStorage.setItem("token", newToken);

            // Logout con el nuevo token
            await api.post(
              "/auth/logout/",
              { refresh: newRefresh },
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
          }
        } catch (refreshError) {
          // Remover console.error y manejar silenciosamente
        }
      }
    } catch (error) {
      // Remover console.error y manejar silenciosamente
    } finally {
      // Limpiar sesión y redireccionar
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <AntApp>
      <Router>
        {/* Modal de advertencia de inactividad */}
        <Modal
          title="Advertencia de Inactividad"
          open={isWarningVisible}
          onOk={handleWarningOk}
          onCancel={handleWarningCancel}
          okText="Estoy aquí"
          cancelText="Cerrar sesión"
          className="inactivity-warning-modal"
        >
          <p>
            Ha pasado un tiempo desde su última actividad. Por favor, confirme
            que sigue aquí.
          </p>
        </Modal>

        {/* Definición de rutas */}
        <Routes>
          {/* Redirección inicial a login */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas dentro del Layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Ruta Home */}
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />

            {/* Ruta Menús - Solo admin y coordinador */}
            <Route
              path="/menus"
              element={
                <PrivateRoute requiredRoles={["admin", "coordinador"]}>
                  <MenuPage />
                </PrivateRoute>
              }
            />

            {/* Ruta Realizar Pedido - Admin, jefe enfermería y coordinador */}
            <Route
              path="/realizar-pedido"
              element={
                <PrivateRoute
                  requiredRoles={["admin", "jefe_enfermeria", "coordinador"]}
                >
                  <RealizarPedido />
                </PrivateRoute>
              }
            />

            {/* Ruta Pedidos Pendientes - Admin, coordinador y auxiliar */}
            <Route
              path="/pedidos/pendientes"
              element={
                <PrivateRoute
                  requiredRoles={["admin", "coordinador", "auxiliar"]}
                >
                  <PedidosPendientes />
                </PrivateRoute>
              }
            />

            {/* Ruta Historial Pedidos - Admin, coordinador y auxiliar */}
            <Route
              path="/pedidos/historial"
              element={
                <PrivateRoute
                  requiredRoles={["admin", "coordinador", "auxiliar"]}
                >
                  <HistorialPedidos />
                </PrivateRoute>
              }
            />

            {/* Ruta Gestión Datos - Admin y jefe enfermería */}
            <Route
              path="/gestion-datos"
              element={
                <PrivateRoute requiredRoles={["admin", "jefe_enfermeria"]}>
                  <DataManagement />
                </PrivateRoute>
              }
            />

            {/* Ruta Gestión Usuarios - Solo admin */}
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
