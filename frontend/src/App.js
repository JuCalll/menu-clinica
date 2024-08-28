import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Importación de las páginas
import Home from './pages/Home';
import Login from './pages/Login';
import RealizarPedido from './pages/RealizarPedido';
import DataManagement from './pages/DataManagement';
import Register from './pages/Register';
import MenuPage from './pages/MenuPage'
import PedidosPendientes from './pages/PedidosPendientes';
import HistorialPedidos from './pages/HistorialPedidos';
import UserManagement from './pages/UserManagement';

// Importación de componentes
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Importación de estilos
import './styles/App.scss';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/" element={<Home />} />
          <Route 
            path="/menus" 
            element={<PrivateRoute requiredRoles={["admin", "coordinador"]}><MenuPage /></PrivateRoute>} />
          <Route 
            path="/realizar-pedido" 
            element={<PrivateRoute requiredRoles={["admin", "jefe_enfermeria", "coordinador"]}><RealizarPedido /></PrivateRoute>} />
          <Route 
            path="/pedidos/pendientes" 
            element={<PrivateRoute requiredRoles={["admin", "coordinador", "auxiliar"]}><PedidosPendientes /></PrivateRoute>} />
          <Route 
            path="/pedidos/historial" 
            element={<PrivateRoute requiredRoles={["admin", "coordinador", "auxiliar"]}><HistorialPedidos /></PrivateRoute>} />
          <Route 
            path="/gestion-datos" 
            element={<PrivateRoute requiredRoles={["admin", "jefe_enfermeria"]}><DataManagement /></PrivateRoute>} />
          <Route 
            path="/gestion-usuarios" 
            element={<PrivateRoute requiredRoles={["admin"]}><UserManagement /></PrivateRoute>} 
          />  {/* Nueva ruta para la gestión de usuarios protegida por rol */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
