import React, { useState, useEffect } from "react";
import {
  Button,
  Spin,
  Collapse,
  Card,
  Tag,
  message,
  Input,
  Select,
  DatePicker,
  Pagination,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { getPedidosCompletados } from "../services/api";
import "../styles/HistorialPedidos.scss";
import api from "../axiosConfig";

const { Panel } = Collapse;
const { RangePicker } = DatePicker;

const HistorialPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeKey, setActiveKey] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [pacienteStatus, setPacienteStatus] = useState("all");
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const titleMappings = {
    desayuno: "Desayuno",
    media_manana: "Media Mañana",
    adicional_dia: "Adicional Día",
    acompanante: "Acompañante",
    bebidas_calientes: "Bebidas Calientes",
    bebidas_frias: "Bebidas Frías",
    sopa_del_dia: "Sopa del Día",
    plato_principal: "Plato Principal",
    media_manana_fit: "Media Mañana Fit",
    media_manana_tradicional: "Media Mañana Tradicional",
    refrigerio_fit: "Refrigerio Fit",
    refrigerio_tradicional: "Refrigerio Tradicional",
    entrada: "Entrada",
    huevos: "Huevos",
    toppings: "Toppings",
    bebidas: "Bebidas",
    vegetariano: "Vegetariano",
    vegetales: "Vegetales",
    adicionales: "Adicionales",
    leche_entera: "Leche Entera",
    leche_deslactosada: "Leche Deslactosada",
    leche_almendras: "Leche de Almendras",
    agua: "Agua",
    unica_preparacion: "Única Preparación"
  };

  const formatTitle = (title) => {
    if (!title) return '';
    
    if (titleMappings[title.toLowerCase()]) {
      return titleMappings[title.toLowerCase()];
    }

    return title
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const fetchData = async (showMessage = false) => {
    try {
      setRefreshing(true);
      const [pedidosResponse, serviciosResponse] = await Promise.all([
        getPedidosCompletados(),
        api.get("/servicios/"),
      ]);
      setPedidos(pedidosResponse);
      setServicios(serviciosResponse.data);
      if (showMessage) {
        message.success("Datos actualizados correctamente");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Error al cargar los datos");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  useEffect(() => {
    const filtered = pedidos
      .filter((pedido) => {
        const matchesSearch =
          searchTerm === "" ||
          [
            pedido.paciente.name,
            pedido.paciente.cedula,
            pedido.paciente.cama?.habitacion?.servicio?.nombre,
            pedido.paciente.cama?.habitacion?.nombre,
            pedido.paciente.cama?.nombre,
          ].some(
            (field) =>
              field && field.toLowerCase().includes(searchTerm.toLowerCase())
          );

        const matchesServicio =
          !selectedServicio ||
          pedido.paciente.cama?.habitacion?.servicio?.id === selectedServicio;

        const matchesDate =
          !dateRange ||
          (new Date(pedido.fecha_pedido) >= dateRange[0].startOf("day") &&
            new Date(pedido.fecha_pedido) <= dateRange[1].endOf("day"));

        const matchesStatus =
          pacienteStatus === "all" ||
          (pacienteStatus === "active" && pedido.paciente.activo) ||
          (pacienteStatus === "inactive" && !pedido.paciente.activo);

        return matchesSearch && matchesServicio && matchesDate && matchesStatus;
      })
      .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido));

    setFilteredPedidos(filtered);
  }, [pedidos, searchTerm, selectedServicio, dateRange, pacienteStatus]);

  const renderOptions = (section, pedido) => {
    if (!section?.opciones || !pedido?.opciones) {
      return (
        <div className="section-options">
          <div className="no-options">
            No hay opciones seleccionadas para esta sección
          </div>
        </div>
      );
    }

    return (
      <div className="section-options">
        {Object.entries(section.opciones).map(([tipo, opciones]) => {
          if (!Array.isArray(opciones)) {
            return null;
          }

          const opcionesSeleccionadas = opciones.filter((opcion) =>
            pedido.opciones.some(
              (o) => o?.menu_option?.id === opcion?.id && o?.selected
            )
          );

          if (opcionesSeleccionadas.length === 0) {
            return null;
          }

          return (
            <div key={tipo} className="option-group">
              <h5>{formatTitle(tipo)}</h5>
              {opcionesSeleccionadas.map((opcion) => (
                <div key={opcion.id} className="option-item">
                  <span className="option-text">{opcion.texto}</span>
                  {pedido.adicionales?.bebidasPreparacion?.[opcion.id] && (
                    <Tag color="blue" className="preparacion-tag">
                      {formatTitle(pedido.adicionales.bebidasPreparacion[opcion.id])}
                    </Tag>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const handleShowDetails = (pedidoId, sectionId) => {
    if (selectedSection === `${pedidoId}-${sectionId}`) {
      setSelectedSection(null);
    } else {
      setSelectedSection(`${pedidoId}-${sectionId}`);
    }
  };

  const paginatedPedidos = filteredPedidos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="historial-pedidos">
      <h2>Historial de Pedidos Completados</h2>

      <div className="filters-container">
        <Input
          placeholder="Buscar por paciente, cédula, habitación o cama"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          allowClear
        />

        <Select
          placeholder="Estado del paciente"
          value={pacienteStatus}
          onChange={setPacienteStatus}
          className="status-select"
        >
          <Select.Option value="all">Todos los pacientes</Select.Option>
          <Select.Option value="active">Pacientes activos</Select.Option>
          <Select.Option value="inactive">
            Pacientes dados de alta
          </Select.Option>
        </Select>

        <Select
          placeholder="Filtrar por servicio"
          value={selectedServicio}
          onChange={setSelectedServicio}
          className="service-select"
          allowClear
        >
          {servicios.map((servicio) => (
            <Select.Option key={servicio.id} value={servicio.id}>
              {servicio.nombre}
            </Select.Option>
          ))}
        </Select>

        <RangePicker
          onChange={setDateRange}
          className="date-picker"
          format="DD/MM/YYYY"
        />

        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={() => fetchData(true)}
          className="refresh-button"
        />
      </div>

      {filteredPedidos.length === 0 ? (
        <div className="no-pedidos">
          No hay pedidos completados que coincidan con los filtros
        </div>
      ) : (
        <>
          <Collapse activeKey={activeKey} onChange={setActiveKey}>
            {paginatedPedidos.map((pedido) => (
              <Panel
                key={pedido.id}
                header={
                  <div className="panel-header">
                    <div className="panel-header-left">
                      <div className="patient-details">
                        <div className="patient-main-info">
                          <span className="pedido-info">
                            Pedido #{pedido.id} - {pedido.paciente.name}
                            {!pedido.paciente.activo && (
                              <Tag color="red">Dado de alta</Tag>
                            )}
                          </span>
                          <span className="fecha-pedido">
                            {new Date(pedido.fecha_pedido).toLocaleString()}
                          </span>
                        </div>
                        <div className="ubicacion-info">
                          <span className="info-item">
                            Servicio:{" "}
                            {pedido.paciente.cama?.habitacion?.servicio?.nombre}
                          </span>
                          <span className="separator">•</span>
                          <span className="info-item">
                            Habitación: {pedido.paciente.cama?.habitacion?.nombre}
                          </span>
                          <span className="separator">•</span>
                          <span className="info-item">
                            Cama: {pedido.paciente.cama?.nombre}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              >
                <Card className="pedido-card">
                  {pedido.menu.sections.map((section) => (
                    <div key={section.id} className="section">
                      <div className="section-header">
                        <h4>{formatTitle(section.titulo)}</h4>
                        <div className="section-actions">
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => handleShowDetails(pedido.id, section.id)}
                            className={`details-button ${
                              selectedSection === `${pedido.id}-${section.id}` ? 'active' : ''
                            }`}
                            aria-expanded={selectedSection === `${pedido.id}-${section.id}`}
                            aria-label={`${selectedSection === `${pedido.id}-${section.id}` ? 'Ocultar' : 'Ver'} detalles de ${formatTitle(section.titulo)}`}
                          >
                            {selectedSection === `${pedido.id}-${section.id}` ? 'Ocultar detalles' : 'Ver detalles'}
                          </Button>
                        </div>
                      </div>
                      {selectedSection === `${pedido.id}-${section.id}` && (
                        renderOptions(section, pedido)
                      )}
                    </div>
                  ))}

                  {pedido.observaciones && (
                    <div className="observaciones">
                      <h4>Observaciones</h4>
                      <p>{pedido.observaciones}</p>
                    </div>
                  )}
                </Card>
              </Panel>
            ))}
          </Collapse>
          
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              total={filteredPedidos.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default HistorialPedidos;
