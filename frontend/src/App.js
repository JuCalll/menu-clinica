import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Modal } from "antd"; // Importamos Modal para la advertencia de inactividad
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import inactivityTime from "./utils/inactivityHandler";

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
    inactivityTime(setIsWarningVisible);
  }, []);

  const handleWarningOk = () => {
    setIsWarningVisible(false); 
  };

  const handleWarningCancel = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
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
        <p>
          Ha pasado un tiempo desde su última actividad. Por favor, confirme que
          sigue aquí.
        </p>
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
              <PrivateRoute
                requiredRoles={["admin", "jefe_enfermeria", "coordinador"]}
              >
                <RealizarPedido />
              </PrivateRoute>
            }
          />
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

        <Route path="/home" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
