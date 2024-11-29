/**
 * Página de Historial de Pedidos
 * 
 * Muestra un listado completo de los pedidos completados con:
 * - Filtros avanzados de búsqueda (texto, servicio, fecha, estado del paciente)
 * - Detalles de cada pedido organizados por secciones
 * - Estado de los pacientes (activo/dado de alta)
 * - Paginación de resultados
 * 
 * Estructura del componente:
 * - Barra de filtros superior
 * - Lista colapsable de pedidos
 *   - Cabecera con información básica
 *   - Detalles expandibles por sección
 * - Paginación inferior
 * 
 * @component
 */

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
  // Estados principales para datos y carga
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [pacienteStatus, setPacienteStatus] = useState("all");
  
  // Estados para UI y paginación
  const [servicios, setServicios] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [activeKey, setActiveKey] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  /**
   * Mapeo de títulos para formato legible
   * Convierte claves del backend en títulos presentables
   */
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

  /**
   * Formatea un título a formato legible
   * @param {string} title - Título a formatear
   * @returns {string} Título formateado
   */
  const formatTitle = (title) => {
    if (!title) return '';
    return titleMappings[title.toLowerCase()] || 
           title.replace(/_/g, " ")
               .toLowerCase()
               .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /**
   * Carga los datos iniciales y actualiza el estado
   * @param {boolean} showMessage - Indica si se debe mostrar mensaje de éxito
   */
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
      message.error("Error al cargar los datos");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  /**
   * Renderiza las opciones seleccionadas de una sección del menú
   * @param {Object} section - Sección del menú con sus opciones
   * @param {Object} pedido - Pedido completo con selecciones
   * @returns {JSX.Element} Componente con las opciones seleccionadas
   */
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

  /**
   * Maneja la visualización de detalles de una sección
   */
  const handleShowDetails = (pedidoId, sectionId) => {
    const newKey = `${pedidoId}-${sectionId}`;
    setSelectedSection(selectedSection === newKey ? null : newKey);
  };

  // Efectos
  useEffect(() => {
    fetchData(false);
  }, []);

  useEffect(() => {
    // Efecto para filtrar pedidos según criterios
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

  /**
   * Calcula los pedidos a mostrar en la página actual
   * @type {Array} Lista de pedidos paginados
   */
  const paginatedPedidos = filteredPedidos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Renderizado condicional para estado de carga
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  /**
   * Renderizado principal del componente
   * Estructura:
   * 1. Título
   * 2. Barra de filtros
   *    - Búsqueda por texto (paciente, cédula, ubicación)
   *    - Filtro por estado del paciente (activo/inactivo)
   *    - Filtro por servicio hospitalario
   *    - Selector de rango de fechas
   *    - Botón de actualización
   * 3. Lista de pedidos o mensaje de no resultados
   *    - Panel colapsable por pedido
   *      - Cabecera con información básica
   *      - Detalles del pedido por secciones
   *      - Observaciones adicionales
   * 4. Paginación
   */
  return (
    <div className="historial-pedidos">
      <h2>Historial de Pedidos Completados</h2>

      {/* Barra de filtros con controles de búsqueda y filtrado */}
      <div className="filters-container">
        {/* Input de búsqueda por texto con autocompletado */}
        <Input
          placeholder="Buscar por paciente, cédula, habitación o cama"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          allowClear
        />

        {/* Selector de estado del paciente */}
        <Select
          placeholder="Estado del paciente"
          value={pacienteStatus}
          onChange={setPacienteStatus}
          className="status-select"
        >
          <Select.Option value="all">Todos los pacientes</Select.Option>
          <Select.Option value="active">Pacientes activos</Select.Option>
          <Select.Option value="inactive">Pacientes dados de alta</Select.Option>
        </Select>

        {/* Selector de servicio hospitalario */}
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

        {/* Selector de rango de fechas */}
        <RangePicker
          onChange={setDateRange}
          className="date-picker"
          format="DD/MM/YYYY"
        />

        {/* Botón de actualización de datos */}
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={() => fetchData(true)}
          className="refresh-button"
        />
      </div>

      {/* Contenido principal: Lista de pedidos o mensaje de no resultados */}
      {filteredPedidos.length === 0 ? (
        <div className="no-pedidos">
          No hay pedidos completados que coincidan con los filtros
        </div>
      ) : (
        <>
          {/* Lista colapsable de pedidos */}
          <Collapse activeKey={activeKey} onChange={setActiveKey}>
            {paginatedPedidos.map((pedido) => (
              <Panel
                key={pedido.id}
                header={
                  /* Cabecera del panel con información básica del pedido */
                  <div className="panel-header">
                    <div className="panel-header-left">
                      <div className="patient-details">
                        {/* Información principal del paciente y pedido */}
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
                        {/* Información de ubicación del paciente */}
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
                {/* Contenido del panel: Detalles del pedido */}
                <Card className="pedido-card">
                  {/* Secciones del menú con opciones seleccionadas */}
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

                  {/* Observaciones adicionales del pedido */}
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
          
          {/* Control de paginación */}
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
