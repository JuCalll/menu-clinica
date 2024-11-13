import React, { useState, useEffect } from "react";
import { Button, Spin, Collapse, Card, Modal, Tag, message, Popover } from "antd";
import { PrinterOutlined, CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { getPedidos, updatePedido } from "../services/api";
import "../styles/PedidosPendientes.scss";
import api from "../axiosConfig";

const { Panel } = Collapse;

const PedidosPendientes = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await getPedidos();
        setPedidos(response.filter((pedido) => pedido.status !== "completado"));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pedidos", error);
        message.error("Error al cargar los pedidos");
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const handlePrint = async (pedido, section) => {
    try {
      const response = await api.post(`/pedidos/${pedido.id}/print/`, {
        section_title: section.titulo
      });
      if (response.status === 200) {
        message.success(`Imprimiendo ${formatTitle(section.titulo)}`);
      }
    } catch (error) {
      console.error("Error al imprimir la sección:", error);
      message.error(`Error al imprimir ${formatTitle(section.titulo)}`);
    }
  };

  const handleSectionStatusChange = async (pedidoId, sectionTitle) => {
    try {
      const pedido = pedidos.find((p) => p.id === pedidoId);
      const updatedSections = {
        ...pedido.sectionStatus,
        [sectionTitle]: "completado",
      };

      const allSectionsCompleted = pedido.menu.sections.every(
        (section) => updatedSections[section.titulo] === "completado"
      );

      const updatedData = {
        status: allSectionsCompleted ? "completado" : "en_proceso",
        sectionStatus: updatedSections,
        paciente_id: pedido.paciente?.id,
        menu_id: pedido.menu?.id,
        adicionales: pedido.adicionales || {},
        observaciones: pedido.observaciones || ""
      };

      if (allSectionsCompleted) {
        Modal.confirm({
          title: "Pedido Completado",
          content: "Todas las secciones han sido completadas. ¿Desea marcar el pedido como completado?",
          okText: "Sí, completar",
          cancelText: "No, mantener",
          className: "pedido-completado-modal",
          width: 400,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          okButtonProps: {
            style: {
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
            }
          },
          onOk: async () => {
            await updatePedido(pedidoId, updatedData);
            setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
            message.success("Pedido marcado como completado exitosamente");
          },
        });
      } else {
        await updatePedido(pedidoId, updatedData);
        setPedidos((prev) =>
          prev.map((p) => p.id === pedidoId ? {...p, ...updatedData} : p)
        );
        message.success("Sección marcada como completada");
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      message.error("Error al actualizar el estado del pedido");
    }
  };

  const formatTitle = (title) => {
    const formattedNames = {
      "acompanante": "Acompañante",
      "bebidas_calientes": "Bebidas Calientes",
      "bebidas_frias": "Bebidas Frías",
      "sopa_del_dia": "Sopa del Día",
      "plato_principal": "Plato Principal",
      "media_manana_fit": "Media Mañana Fit",
      "media_manana_tradicional": "Media Mañana Tradicional",
      "refrigerio_fit": "Refrigerio Fit",
      "refrigerio_tradicional": "Refrigerio Tradicional",
      "entrada": "Entrada",
      "huevos": "Huevos",
      "toppings": "Toppings",
      "bebidas": "Bebidas",
      "vegetariano": "Vegetariano",
      "vegetales": "Vegetales",
      "adicionales": "Adicionales",
      "leche_entera": "Leche Entera",
      "leche_deslactosada": "Leche Deslactosada",
      "leche_almendras": "Leche de Almendras",
      "agua": "Agua",
      "unica_preparacion": "Única Preparación"
    };

    if (formattedNames[title.toLowerCase()]) {
      return formattedNames[title.toLowerCase()];
    }

    return title
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index > 0 && ['del', 'de', 'la', 'las', 'los'].includes(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/n~/g, 'ñ')
      .replace(/Manana/g, 'Mañana')
      .replace(/Frias/g, 'Frías');
  };

  const renderOptions = (section, pedido) => {
    if (!section?.opciones || !pedido?.opciones) {
      return null;
    }

    return Object.entries(section.opciones).map(([tipo, opciones]) => {
      if (!Array.isArray(opciones)) {
        return null;
      }

      const opcionesSeleccionadas = opciones.filter((opcion) =>
        pedido.opciones.some((o) => 
          o?.menu_option?.id === opcion?.id && o?.selected
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
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pedidos-pendientes">
      <h2>Pedidos Pendientes</h2>
      {pedidos.length === 0 ? (
        <div className="no-pedidos">No hay pedidos pendientes</div>
      ) : (
        <Collapse>
          {pedidos.map((pedido) => (
            <Panel
              key={pedido.id}
              header={
                <div className="panel-header">
                  <div className="panel-header-left">
                    <div className="section-counter">
                      <span className="counter-text">
                        {Object.values(pedido.sectionStatus || {}).filter(status => status === "completado").length}
                        /{pedido.menu.sections.length} secciones completadas
                      </span>
                      <Popover
                        content={
                          <div className="sections-status-detail">
                            {pedido.menu.sections.map(section => (
                              <div key={section.id} className="section-status-item">
                                <span className="section-name">{formatTitle(section.titulo)}</span>
                                <Tag 
                                  color={pedido.sectionStatus?.[section.titulo] === "completado" ? "success" : "warning"}
                                  className="status-tag"
                                >
                                  {pedido.sectionStatus?.[section.titulo] === "completado" ? "Completado" : "Pendiente"}
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
                          onClick={e => e.stopPropagation()}
                        />
                      </Popover>
                    </div>
                    <div className="patient-details">
                      <div className="patient-main-info">
                        <span className="pedido-info">
                          Pedido {pedido.id} - {pedido.paciente.name}
                        </span>
                        <span className="ubicacion-info">
                          <span className="info-item">Servicio: {pedido.paciente.cama.habitacion.servicio.nombre}</span>
                          <span className="separator">•</span>
                          <span className="info-item">Hab: {pedido.paciente.cama.habitacion.nombre}</span>
                          <span className="separator">•</span>
                          <span className="info-item">Cama: {pedido.paciente.cama.nombre}</span>
                        </span>
                      </div>
                      <div className="patient-medical-info">
                        <Tag color="blue">Dieta: {pedido.paciente.recommended_diet || 'No especificada'}</Tag>
                        {pedido.paciente.alergias && (
                          <Tag color="red">Alergias: {pedido.paciente.alergias}</Tag>
                        )}
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
                      <Tag
                        color={
                          pedido.sectionStatus?.[section.titulo] === "completado"
                            ? "success"
                            : "warning"
                        }
                      >
                        {pedido.sectionStatus?.[section.titulo] === "completado"
                          ? "Completado"
                          : "Pendiente"}
                      </Tag>
                    </div>

                    {renderOptions(section, pedido)}

                    <div className="buttons-container">
                      <Button
                        type="primary"
                        onClick={() =>
                          handleSectionStatusChange(pedido.id, section.titulo)
                        }
                        disabled={
                          pedido.sectionStatus?.[section.titulo] === "completado"
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
      )}
    </div>
  );
};

export default PedidosPendientes;
