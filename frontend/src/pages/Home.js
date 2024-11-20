import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Empty} from "antd";
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  RestOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import "../styles/Home.scss";
import sanjuan from "../assets/sanjuan.png";
import api from "../services/api";

const Home = () => {
  const [stats, setStats] = useState({
    pedidosPendientes: 0,
    completadosHoy: 0,
    pacientesActivos: 0
  });
  const userRole = localStorage.getItem("role");

  const fetchStats = async () => {
    try {
      const [pedidosResponse, pacientesResponse] = await Promise.all([
        api.get('/pedidos/'),
        api.get('/pacientes/')
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Cuenta pedidos pendientes
      const pendientes = pedidosResponse.data.filter(pedido => 
        pedido.status !== 'completado'
      ).length;
      
      // Cuenta pedidos completados hoy
      const completadosHoy = pedidosResponse.data.filter(pedido => {
        const pedidoDate = new Date(pedido.fecha_pedido);
        pedidoDate.setHours(0, 0, 0, 0);
        return pedido.status === 'completado' && 
               pedidoDate.getTime() === today.getTime();
      }).length;

      // Cuenta pacientes activos
      const pacientesActivos = pacientesResponse.data.filter(paciente => 
        paciente.activo
      ).length;

      setStats({
        pedidosPendientes: pendientes,
        completadosHoy: completadosHoy,
        pacientesActivos: pacientesActivos
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Actualiza cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const defaultCards = {
    admin: [
      {
        title: "Realizar Pedido",
        icon: <ShoppingCartOutlined />,
        path: "/realizar-pedido",
        color: "#1890ff"
      },
      {
        title: "Gestionar Menús",
        icon: <RestOutlined />,
        path: "/menus",
        color: "#52c41a"
      },
      {
        title: "Pedidos Pendientes",
        icon: <ClockCircleOutlined />,
        path: "/pedidos/pendientes",
        color: "#faad14"
      },
      {
        title: "Historial de Pedidos",
        icon: <HistoryOutlined />,
        path: "/pedidos/historial",
        color: "#722ed1"
      },
      {
        title: "Gestión de Datos",
        icon: <DatabaseOutlined />,
        path: "/gestion-datos",
        color: "#eb2f96"
      },
      {
        title: "Gestión de Usuarios",
        icon: <TeamOutlined />,
        path: "/gestion-usuarios",
        color: "#13c2c2"
      }
    ],
    jefe_enfermeria: [
      {
        title: "Realizar Pedido",
        icon: <ShoppingCartOutlined />,
        path: "/realizar-pedido",
        color: "#1890ff"
      },
      {
        title: "Gestión de Datos",
        icon: <DatabaseOutlined />,
        path: "/gestion-datos",
        color: "#eb2f96"
      }
    ],
    coordinador: [
      {
        title: "Realizar Pedido",
        icon: <ShoppingCartOutlined />,
        path: "/realizar-pedido",
        color: "#1890ff"
      },
      {
        title: "Gestionar Menús",
        icon: <RestOutlined />,
        path: "/menus",
        color: "#52c41a"
      },
      {
        title: "Pedidos Pendientes",
        icon: <ClockCircleOutlined />,
        path: "/pedidos/pendientes",
        color: "#faad14"
      },
      {
        title: "Historial de Pedidos",
        icon: <HistoryOutlined />,
        path: "/pedidos/historial",
        color: "#722ed1"
      }
    ],
    auxiliar: [
      {
        title: "Pedidos Pendientes",
        icon: <ClockCircleOutlined />,
        path: "/pedidos/pendientes",
        color: "#faad14"
      },
      {
        title: "Historial de Pedidos",
        icon: <HistoryOutlined />,
        path: "/pedidos/historial",
        color: "#722ed1"
      }
    ]
  };

  const getQuickAccessCards = () => {
    return defaultCards[userRole] || [];
  };

  return (
    <div className="home">
      <div className="home-header">
        <h1>Menú Preferencial - Clínica San Juan de Dios</h1>
        <img src={sanjuan} alt="San Juan de Dios" className="home-logo" />
      </div>

      {["admin", "coordinador", "auxiliar"].includes(userRole) && (
        <div className="stats-section">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic 
                  title="Pedidos Pendientes"
                  value={stats.pedidosPendientes}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic 
                  title="Completados Hoy"
                  value={stats.completadosHoy}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic 
                  title="Pacientes Activos"
                  value={stats.pacientesActivos}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

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
