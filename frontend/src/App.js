// Importamos React y los módulos necesarios para el enrutamiento
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importamos los estilos de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Importamos las páginas de la aplicación
import Home from './pages/Home';
import Login from './pages/Login';
import RealizarPedido from './pages/RealizarPedido';
import DataManagement from './pages/DataManagement'; // Nuevo componente unificado
import Register from './pages/Register';
import MenuPage from './pages/MenuPage';

// Importamos los componentes de la aplicación
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Importamos los estilos globales de la aplicación
import './styles/App.scss';

// Definimos la función principal de la aplicación
function App() {
  return (
    // Configuramos el enrutador para manejar las rutas de la aplicación
    <Router>
      <Routes>
        {/* Ruta para la página de inicio de sesión */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta para la página de registro */}
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas que requieren autenticación */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          {/* Ruta para la página de inicio */}
          <Route path="/" element={<Home />} />
          
          {/* Ruta para la página de menús */}
          <Route path="/menus" element={<MenuPage />} />
          
          {/* Ruta para la página de realización de pedidos */}
          <Route path="/realizar-pedido" element={<RealizarPedido />} />
          
          {/* Ruta para la página de gestión de servicios, habitaciones y pacientes */}
          <Route path="/gestion-datos" element={<DataManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

// Exportamos la función App como el componente principal de la aplicación
export default App;
