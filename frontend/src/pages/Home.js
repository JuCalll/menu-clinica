import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Empty, message } from "antd";
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
    pendingOrders: 0,
    completedToday: 0,
    activePatients: 0
  });
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        const [pendingOrders, completedOrders, patients] = await Promise.all([
          api.get("/pedidos/", {
            params: {
              status: "pendiente"
            }
          }),
          api.get("/pedidos/", {
            params: {
              status: "completado",
              fecha_inicio: startOfDay.toISOString().split('T')[0],
              fecha_fin: endOfDay.toISOString().split('T')[0]
            }
          }),
          api.get("/pacientes/", {
            params: {
              activo: true
            }
          })
        ]);

        if (isMounted) {
          const pendingCount = pendingOrders.data
            .filter(pedido => pedido.status !== "completado")
            .length;

          setStats({
            pendingOrders: pendingCount,
            completedToday: completedOrders.data.length,
            activePatients: patients.data.length
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error al cargar estadísticas:", error);
          message.error("Error al cargar las estadísticas");
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
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
                  value={stats.pendingOrders}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic 
                  title="Completados Hoy"
                  value={stats.completedToday}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic 
                  title="Pacientes Activos"
                  value={stats.activePatients}
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
