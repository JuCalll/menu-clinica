/**
 * Página de Pedidos Pendientes
 *
 * Muestra y gestiona los pedidos que aún no han sido completados:
 * - Lista filtrable de pedidos pendientes
 * - Impresión de secciones específicas
 * - Actualización automática de datos
 * - Filtros por servicio y búsqueda
 *
 * @component
 */

import React, { useState, useEffect } from "react";
import {
  Button,
  Spin,
  Collapse,
  Card,
  Modal,
  Tag,
  message,
  Popover,
  Input,
  Select,
} from "antd";
import {
  PrinterOutlined, // Icono para impresión
  CheckCircleOutlined, // Icono de completado
  InfoCircleOutlined, // Icono de información
  ReloadOutlined, // Icono de recarga
  UpOutlined, // Icono de flecha arriba
} from "@ant-design/icons";
import { getPedidos, updatePedido } from "../services/api";
import "../styles/PedidosPendientes.scss";
import api from "../axiosConfig";

const { Panel } = Collapse;

const PedidosPendientes = () => {
  // Estados principales
  const [pedidos, setPedidos] = useState([]); // Lista completa de pedidos
  const [loading, setLoading] = useState(true); // Estado de carga
  const [refreshing, setRefreshing] = useState(false); // Estado de actualización
  const [activeKey, setActiveKey] = useState([]); // Paneles activos del Collapse

  // Estados para filtrado
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [selectedServicio, setSelectedServicio] = useState(null); // Servicio seleccionado
  const [servicios, setServicios] = useState([]); // Lista de servicios disponibles
  const [filteredPedidos, setFilteredPedidos] = useState([]); // Pedidos filtrados

  /**
   * Obtiene los datos de pedidos y servicios del servidor
   * @param {boolean} showMessage - Indica si se debe mostrar mensaje de éxito
   */
  const fetchData = async (showMessage = false) => {
    try {
      setRefreshing(true);
      const [pedidosResponse, serviciosResponse] = await Promise.all([
        getPedidos(),
        api.get("/servicios/"),
      ]);

      // Filtra pedidos no completados
      setPedidos(
        pedidosResponse.filter((pedido) => pedido.status !== "completado")
      );

      // Filtra servicios activos
      setServicios(serviciosResponse.data.filter((s) => s.activo));

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
   * Efecto para actualización automática cada 30 segundos
   */
  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Efecto para filtrar pedidos según criterios de búsqueda
   */
  useEffect(() => {
    const filtered = pedidos
      .filter((pedido) => {
        // Filtro por término de búsqueda
        const matchesSearch =
          searchTerm === "" ||
          [
            pedido.paciente.name,
            pedido.paciente.cedula,
            pedido.paciente.cama.habitacion.servicio.nombre,
            pedido.paciente.cama.habitacion.nombre,
            pedido.paciente.cama.nombre,
          ].some((field) =>
            normalizeText(field || "").includes(normalizeText(searchTerm))
          );

        // Filtro por servicio
        const matchesServicio =
          !selectedServicio ||
          pedido.paciente.cama.habitacion.servicio.id === selectedServicio;

        return matchesSearch && matchesServicio;
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    setFilteredPedidos(filtered);
  }, [pedidos, searchTerm, selectedServicio]);

  /**
   * Maneja la impresión de una sección específica de un pedido
   * @param {Object} pedido - Pedido a imprimir
   * @param {Object} section - Sección específica a imprimir
   */
  const handlePrint = async (pedido, section) => {
    const key = `print-${pedido.id}-${section.titulo}`;

    try {
      message.loading({
        content: "Conectando con la impresora...",
        key,
        duration: 0,
      });

      const response = await api.post(`/pedidos/${pedido.id}/print/`, {
        section_title: section.titulo,
      });

      if (response.status === 200) {
        message.success({
          content: `Imprimiendo ${formatTitle(section.titulo)}`,
          key,
          duration: 3,
        });
      }
    } catch (error) {
      // Manejo específico de error de conexión con impresora
      if (error.response?.data?.type === "printer_connection_error") {
        message.warning({
          content: (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div>
                <InfoCircleOutlined
                  style={{ color: "#faad14", marginRight: "8px" }}
                />
                Impresora no disponible
              </div>
              <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}>
                {error.response.data.message}
              </div>
            </div>
          ),
          key,
          duration: 5,
        });
      } else {
        message.error({
          content: `Error al imprimir ${formatTitle(section.titulo)}`,
          key,
          duration: 3,
        });
      }
    }
  };

  /**
   * Maneja el cambio de estado de una sección de pedido
   * @param {string} pedidoId - ID del pedido a actualizar
   * @param {string} sectionTitle - Título de la sección a marcar como completada
   */
  const handleSectionStatusChange = async (pedidoId, sectionTitle) => {
    try {
      const pedido = pedidos.find((p) => p.id === pedidoId);
      const updatedSections = {
        ...pedido.sectionStatus,
        [sectionTitle]: "completado",
      };

      // Verifica si todas las secciones están completadas
      const allSectionsCompleted = pedido.menu.sections.every(
        (section) => updatedSections[section.titulo] === "completado"
      );

      // Prepara datos actualizados del pedido
      const updatedData = {
        status: allSectionsCompleted ? "completado" : "en_proceso",
        sectionStatus: updatedSections,
        menu_id: pedido.menu?.id,
        adicionales: pedido.adicionales || {},
        observaciones: pedido.observaciones || "",
      };

      // Incluye ID del paciente solo si está activo
      if (pedido.paciente?.activo) {
        updatedData.paciente_id = pedido.paciente.id;
      }

      if (allSectionsCompleted) {
        // Validación de fecha del pedido
        const pedidoDate = new Date(pedido.fecha_pedido);
        const today = new Date();
        pedidoDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Contenido del modal según condiciones
        let modalContent =
          "Todas las secciones han sido completadas. ¿Desea marcar el pedido como completado?";

        // Advertencia para pedidos de días anteriores
        if (pedidoDate.getTime() < today.getTime()) {
          modalContent = (
            <div>
              <p style={{ color: "#faad14", marginBottom: "16px" }}>
                ⚠️ Este pedido corresponde a un día anterior (
                {new Date(pedido.fecha_pedido).toLocaleDateString()})
              </p>
              <p>{modalContent}</p>
            </div>
          );
        }

        // Advertencia para pacientes dados de alta
        if (!pedido.paciente.activo) {
          modalContent = (
            <div>
              <p style={{ color: "#ff4d4f", marginBottom: "16px" }}>
                ⚠️ Este pedido corresponde a un paciente que ha sido dado de
                alta. Se completará el pedido sin actualizar la información del
                paciente.
              </p>
              <p>{modalContent}</p>
            </div>
          );
        }

        // Modal de confirmación
        Modal.confirm({
          title: "Pedido Completado",
          content: modalContent,
          okText: "Sí, completar",
          cancelText: "No, mantener",
          className: "pedido-completado-modal",
          width: 400,
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
          okButtonProps: {
            style: {
              backgroundColor: "#1890ff",
              borderColor: "#1890ff",
            },
          },
          onOk: async () => {
            await updatePedido(pedidoId, updatedData);
            setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
            message.success("Pedido marcado como completado exitosamente");
            window.dispatchEvent(new CustomEvent("pedidoCompletado"));
          },
        });
      } else {
        // Actualización parcial del pedido
        await updatePedido(pedidoId, updatedData);
        setPedidos((prev) =>
          prev.map((p) => (p.id === pedidoId ? { ...p, ...updatedData } : p))
        );
        message.success("Sección marcada como completada");
      }
    } catch (error) {
      message.error("Error al actualizar el estado del pedido");
    }
  };

  /**
   * Formatea títulos para mostrar en la interfaz
   * @param {string} title - Título a formatear
   * @returns {string} Título formateado
   */
  const formatTitle = (title) => {
    const formattedNames = {
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
      unica_preparacion: "Única Preparación",
    };

    if (formattedNames[title.toLowerCase()]) {
      return formattedNames[title.toLowerCase()];
    }

    return title
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word, index) => {
        if (index > 0 && ["del", "de", "la", "las", "los"].includes(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/n~/g, "ñ")
      .replace(/Manana/g, "Mañana")
      .replace(/Frias/g, "Frías");
  };

  /**
   * Renderiza las opciones seleccionadas de una sección
   * @param {Object} section - Sección del menú
   * @param {Object} pedido - Pedido completo
   * @returns {JSX.Element|null} Componente con las opciones o null
   */
  const renderOptions = (section, pedido) => {
    if (!section?.opciones || !pedido?.opciones) {
      return null;
    }

    return Object.entries(section.opciones).map(([tipo, opciones]) => {
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
                  {formatTitle(
                    pedido.adicionales.bebidasPreparacion[opcion.id]
                  )}
                </Tag>
              )}
            </div>
          ))}
        </div>
      );
    });
  };

  /**
   * Normaliza texto para búsquedas insensibles a acentos
   * @param {string} text - Texto a normalizar
   * @returns {string} Texto normalizado
   */
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Renderizado condicional para estado de carga
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }
  // Renderizado principal del componente
  // Estructura:
  // 1. Cabecera con contador de pedidos
  // 2. Controles de filtrado y búsqueda
  // 3. Lista colapsable de pedidos
  // 4. Detalles de cada pedido
  return (
    <div className="pedidos-pendientes">
      {/* Cabecera con contador */}
      <h2>
        Pedidos Pendientes
        <span className="pedidos-count">({filteredPedidos.length})</span>
      </h2>

      {/* Contenedor de controles */}
      <div className="controls-container">
        <div className="filters-container">
          {/* Barra de búsqueda */}
          <Input
            placeholder="Buscar por paciente, cédula, habitación o cama"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            allowClear
          />

          {/* Selector de servicio */}
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

          {/* Botón de actualización */}
          <Button
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={() => fetchData(true)}
            className="refresh-button"
            loading={refreshing}
          />
        </div>
      </div>

      {/* Lista de pedidos o mensaje de no resultados */}
      {filteredPedidos.length === 0 ? (
        <div className="no-pedidos">No hay pedidos pendientes</div>
      ) : (
        <Collapse activeKey={activeKey} onChange={setActiveKey}>
          {filteredPedidos.map((pedido) => (
            <Panel
              key={pedido.id}
              header={
                <div className="panel-header">
                  <div className="panel-header-left">
                    {/* Contador de secciones completadas */}
                    <div className="section-counter">
                      <span className="counter-text">
                        {
                          Object.values(pedido.sectionStatus || {}).filter(
                            (status) => status === "completado"
                          ).length
                        }
                        /{pedido.menu.sections.length} secciones completadas
                      </span>

                      {/* Barra de progreso */}
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${
                              (Object.values(pedido.sectionStatus || {}).filter(
                                (status) => status === "completado"
                              ).length /
                                pedido.menu.sections.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>

                      {/* Popover con detalles de estado */}
                      <Popover
                        content={
                          <div className="sections-status-detail">
                            {pedido.menu.sections.map((section) => (
                              <div
                                key={section.id}
                                className="section-status-item"
                              >
                                <span className="section-name">
                                  {formatTitle(section.titulo)}
                                </span>
                                <Tag
                                  color={
                                    pedido.sectionStatus?.[section.titulo] ===
                                    "completado"
                                      ? "success"
                                      : "warning"
                                  }
                                  className="status-tag"
                                >
                                  {pedido.sectionStatus?.[section.titulo] ===
                                  "completado"
                                    ? "Completado"
                                    : "Pendiente"}
                                </Tag>
                              </div>
                            ))}
                          </div>
                        }
                        title="Estado de las secciones"
                        trigger="click"
                        placement="right"
                      >
                        <Button
                          type="text"
                          icon={<InfoCircleOutlined />}
                          className="info-button"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popover>
                    </div>

                    {/* Detalles del paciente */}
                    <div className="patient-details">
                      <div className="patient-main-info">
                        <span className="pedido-info">
                          Pedido {pedido.id} - {pedido.paciente.name}
                          {!pedido.paciente.activo && (
                            <Tag color="red">Paciente dado de alta</Tag>
                          )}
                        </span>
                        <div className="ubicacion-info">
                          <span className="info-item" data-label="Servicio:">
                            {pedido.paciente.cama.habitacion.servicio.nombre}
                          </span>
                          <span className="info-item" data-label="Habitación:">
                            {pedido.paciente.cama.habitacion.nombre}
                          </span>
                          <span className="info-item" data-label="Cama:">
                            {pedido.paciente.cama.nombre}
                          </span>
                        </div>
                      </div>

                      {/* Información médica */}
                      <div className="patient-medical-info">
                        <Tag color="blue">
                          Dieta:{" "}
                          {pedido.paciente.recommended_diet ||
                            "No especificada"}
                        </Tag>
                        {pedido.paciente.alergias && (
                          <Tag color="red">
                            Alergias: {pedido.paciente.alergias}
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              }
            >
              {/* Contenido del pedido */}
              <Card
                className={`pedido-card ${
                  !pedido.paciente.activo ? "inactive-patient" : ""
                }`}
              >
                {/* Secciones del menú */}
                {pedido.menu.sections.map((section) => (
                  <div key={section.id} className="section">
                    <div className="section-header">
                      <h4>{formatTitle(section.titulo)}</h4>
                      <Tag
                        color={
                          pedido.sectionStatus?.[section.titulo] ===
                          "completado"
                            ? "success"
                            : "warning"
                        }
                      >
                        {pedido.sectionStatus?.[section.titulo] === "completado"
                          ? "Completado"
                          : "Pendiente"}
                      </Tag>
                    </div>

                    {/* Opciones seleccionadas */}
                    {renderOptions(section, pedido)}

                    {/* Botones de acción */}
                    <div className="buttons-container">
                      <Button
                        type="primary"
                        onClick={() =>
                          handleSectionStatusChange(pedido.id, section.titulo)
                        }
                        disabled={
                          pedido.sectionStatus?.[section.titulo] ===
                          "completado"
                        }
                        icon={<CheckCircleOutlined />}
                      >
                        Marcar como Completado
                      </Button>
                      <Button
                        type="default"
                        icon={<PrinterOutlined />}
                        onClick={() => handlePrint(pedido, section)}
                      />
                    </div>
                  </div>
                ))}

                {/* Observaciones */}
                {pedido.observaciones && (
                  <div className="observaciones">
                    <h4>Observaciones</h4>
                    <p>{pedido.observaciones}</p>
                  </div>
                )}

                {/* Botón para cerrar el panel */}
                <div className="collapse-button-container">
                  <Button
                    onClick={() => setActiveKey([])}
                    icon={<UpOutlined />}
                  >
                    Cerrar
                  </Button>
                </div>
              </Card>
            </Panel>
          ))}
        </Collapse>
      )}
    </div>
  );
};

export default PedidosPendientes;
