/**
 * Página de Inicio
 *
 * Dashboard principal que muestra:
 * - Estadísticas en tiempo real
 * - Accesos rápidos según el rol del usuario
 * - Logo e información institucional
 *
 * Las estadísticas incluyen:
 * - Pedidos pendientes
 * - Pedidos completados hoy
 * - Pacientes activos
 *
 * @component
 */

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Empty } from "antd";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RestOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "../styles/Home.scss";
import sanjuan from "../assets/sanjuan.png";
import api from "../services/api";

const Home = () => {
  // Estados principales
  const [stats, setStats] = useState({
    pedidosPendientes: 0,
    completadosHoy: 0,
    pacientesActivos: 0,
  });
  const userRole = localStorage.getItem("role");

  /**
   * Obtiene las estadísticas actualizadas del sistema
   * - Cuenta pedidos pendientes
   * - Cuenta pedidos completados hoy
   * - Cuenta pacientes activos
   */
  const fetchStats = async () => {
    try {
      const [pedidosResponse, pacientesResponse] = await Promise.all([
        api.get("/pedidos/"),
        api.get("/pacientes/"),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Cálculo de estadísticas
      const pendientes = pedidosResponse.data.filter(
        (pedido) => pedido.status !== "completado"
      ).length;

      const completadosHoy = pedidosResponse.data.filter((pedido) => {
        const pedidoDate = new Date(pedido.fecha_pedido);
        pedidoDate.setHours(0, 0, 0, 0);
        return (
          pedido.status === "completado" &&
          pedidoDate.getTime() === today.getTime()
        );
      }).length;

      const pacientesActivos = pacientesResponse.data.filter(
        (paciente) => paciente.activo
      ).length;

      setStats({
        pedidosPendientes: pendientes,
        completadosHoy,
        pacientesActivos,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  /**
   * Configuración de tarjetas de acceso rápido por rol
   * Define las acciones disponibles para cada tipo de usuario
   */
  const defaultCards = {
    admin: [
      {
        title: "Realizar Pedido",
        icon: <ShoppingCartOutlined />,
        path: "/realizar-pedido",
        color: "#1890ff",
      },
      {
        title: "Gestionar Menús",
        icon: <RestOutlined />,
        path: "/menus",
        color: "#52c41a",
      },
      {
        title: "Pedidos Pendientes",
        icon: <ClockCircleOutlined />,
        path: "/pedidos/pendientes",
        color: "#faad14",
      },
      {
        title: "Historial de Pedidos",
        icon: <HistoryOutlined />,
        path: "/pedidos/historial",
        color: "#722ed1",
      },
      {
        title: "Gestión de Datos",
        icon: <DatabaseOutlined />,
        path: "/gestion-datos",
        color: "#eb2f96",
      },
      {
        title: "Gestión de Usuarios",
        icon: <TeamOutlined />,
        path: "/gestion-usuarios",
        color: "#13c2c2",
      },
    ],
    jefe_enfermeria: [
      {
        title: "Realizar Pedido",
        icon: <ShoppingCartOutlined />,
        path: "/realizar-pedido",
        color: "#1890ff",
      },
      {
        title: "Gestión de Datos",
        icon: <DatabaseOutlined />,
        path: "/gestion-datos",
        color: "#eb2f96",
      },
    ],
    coordinador: [
      {
        title: "Realizar Pedido",
        icon: <ShoppingCartOutlined />,
        path: "/realizar-pedido",
        color: "#1890ff",
      },
      {
        title: "Gestionar Menús",
        icon: <RestOutlined />,
        path: "/menus",
        color: "#52c41a",
      },
      {
        title: "Pedidos Pendientes",
        icon: <ClockCircleOutlined />,
        path: "/pedidos/pendientes",
        color: "#faad14",
      },
      {
        title: "Historial de Pedidos",
        icon: <HistoryOutlined />,
        path: "/pedidos/historial",
        color: "#722ed1",
      },
    ],
    auxiliar: [
      {
        title: "Pedidos Pendientes",
        icon: <ClockCircleOutlined />,
        path: "/pedidos/pendientes",
        color: "#faad14",
      },
      {
        title: "Historial de Pedidos",
        icon: <HistoryOutlined />,
        path: "/pedidos/historial",
        color: "#722ed1",
      },
    ],
  };

  /**
   * Obtiene las tarjetas de acceso rápido según el rol del usuario
   * @returns {Array} Lista de tarjetas disponibles para el rol actual
   */
  const getQuickAccessCards = () => {
    return defaultCards[userRole] || [];
  };

  // Efecto para actualizar estadísticas
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Actualiza cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home">
      {/* Cabecera con logo institucional */}
      <div className="home-header">
        <h1>Menú Preferencial - Clínica San Juan de Dios</h1>
        <img src={sanjuan} alt="San Juan de Dios" className="home-logo" />
      </div>

      {/* Sección de estadísticas (visible solo para roles específicos) */}
      {["admin", "coordinador", "auxiliar"].includes(userRole) && (
        <div className="stats-section">
          <Row gutter={[16, 16]}>
            {/* Tarjetas de estadísticas */}
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Pedidos Pendientes"
                  value={stats.pedidosPendientes}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Completados Hoy"
                  value={stats.completadosHoy}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Pacientes Activos"
                  value={stats.pacientesActivos}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Sección de acceso rápido */}
      <div className="quick-access-section">
        <h2>Acceso Rápido</h2>
        {getQuickAccessCards().length > 0 ? (
          <Row gutter={[16, 16]}>
            {getQuickAccessCards().map((card, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Link to={card.path}>
                  <Card
                    className="quick-access-card"
                    style={{ borderColor: card.color }}
                  >
                    {card.icon}
                    <h3>{card.title}</h3>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No hay accesos rápidos disponibles" />
        )}
      </div>
    </div>
  );
};

export default Home;
