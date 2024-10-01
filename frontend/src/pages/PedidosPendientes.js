import React, { useState, useEffect } from "react";
import { Button, Spin, Collapse, Card, Modal } from "antd";
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
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const handleSectionStatusChange = async (pedidoId, sectionTitle) => {
    try {
      const pedido = pedidos.find((p) => p.id === pedidoId);
      const updatedSections = {
        ...pedido.sectionStatus,
        [sectionTitle]: "completado",
      };

      const allSectionsCompleted =
        Object.values(updatedSections).length === pedido.menu.sections.length &&
        Object.values(updatedSections).every(
          (status) => status === "completado"
        );

      const updatedPedido = {
        ...pedido,
        status: allSectionsCompleted ? "completado" : "en_proceso",
        sectionStatus: updatedSections,
      };

      if (allSectionsCompleted) {
        Modal.confirm({
          title: "Pedido Completado",
          content:
            "Has completado todas las secciones del pedido. El pedido será marcado como 'Completado'. ¿Estás seguro de que deseas continuar?",
          onOk: async () => {
            await updatePedido(pedidoId, updatedPedido);

            setPedidos((prevPedidos) =>
              prevPedidos
                .map((p) =>
                  p.id === pedidoId
                    ? {
                        ...p,
                        sectionStatus: updatedSections,
                        status: updatedPedido.status,
                      }
                    : p
                )
                .filter((p) => p.status !== "completado")
            );
          },
        });
      } else {
        await updatePedido(pedidoId, updatedPedido);
        setPedidos((prevPedidos) =>
          prevPedidos.map((p) =>
            p.id === pedidoId
              ? {
                  ...p,
                  sectionStatus: updatedSections,
                  status: updatedPedido.status,
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error updating section status", error);
    }
  };

  const handlePrint = async (pedido) => {
    const url = `/pedidos/${pedido.id}/print/`;
    try {
      const response = await api.post(url);
      if (response.status === 200) {
        console.log("Pedido impreso con éxito.");
      } else {
        console.error(
          "Error al intentar imprimir el pedido:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error al intentar imprimir el pedido:", error);
    }
  };

  const formatTitle = (title) => {
    return title
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderSelectedOptions = (section, optionsType, pedido) => {
    return section[optionsType]
      .filter((option) =>
        pedido.opciones.some(
          (o) => o.menu_option.id === option.id && o.selected
        )
      )
      .map((option) => <div key={option.id}>{option.texto}</div>);
  };

  const renderSections = (pedido) => {
    const sectionsToShow = {
      Adicional: ["adicionales"],
      Algo: ["adicionales", "bebidas"],
      Onces: ["adicionales"],
      Desayuno: [
        "adicionales",
        "platos_principales",
        "acompanantes",
        "bebidas",
      ],
      Almuerzo: [
        "adicionales",
        "platos_principales",
        "acompanantes",
        "bebidas",
      ],
      Cena: ["adicionales", "platos_principales", "acompanantes", "bebidas"],
    };

    return pedido.menu.sections.map((section) => {
      const optionsToRender = sectionsToShow[section.titulo];

      return optionsToRender && optionsToRender.length > 0 ? (
        <div key={section.id} className="section">
          <h4>{formatTitle(section.titulo)}</h4>
          {optionsToRender.map((optionType) => (
            <div key={optionType}>
              <h5>{formatTitle(optionType)}</h5>
              {renderSelectedOptions(section, optionType, pedido)}
            </div>
          ))}
          <div className="buttons-container">
            <Button
              onClick={() =>
                handleSectionStatusChange(pedido.id, section.titulo)
              }
              disabled={pedido.sectionStatus?.[section.titulo] === "completado"}
              className="custom-button"
            >
              {pedido.sectionStatus?.[section.titulo] === "completado"
                ? "Completado"
                : "Marcar como Completado"}
            </Button>
            <Button
              onClick={() => handlePrint(pedido)}
              className="custom-button"
            >
              Imprimir
            </Button>
          </div>
        </div>
      ) : null;
    });
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="pedidos-pendientes">
      <h2>Pedidos Pendientes</h2>
      <Collapse>
        {pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <Panel
              header={`Pedido ${pedido.id} - ${pedido.paciente.name} (Hab: ${pedido.paciente.cama.habitacion.nombre}, Cama: ${pedido.paciente.cama.nombre})`}
              key={pedido.id}
              className="pedido-panel"
            >
              <Card className="pedido-card">
                {renderSections(pedido)}
                <div className="additional-options">
                  <h4>Opciones Adicionales del Menú</h4>
                  <div>Leche: {pedido.adicionales.leche}</div>
                  <div>Bebida: {pedido.adicionales.bebida}</div>
                  <div>
                    Azúcar/Panela: {pedido.adicionales.azucarPanela.join(", ")}
                  </div>
                  <div>Vegetales: {pedido.adicionales.vegetales}</div>
                  <div>
                    Golosina: {pedido.adicionales.golosina ? "Sí" : "No"}
                  </div>
                  <div>
                    Observaciones:{" "}
                    {pedido.adicionales.observaciones || "Sin observaciones"}
                  </div>
                </div>
              </Card>
            </Panel>
          ))
        ) : (
          <p>No hay pedidos pendientes.</p>
        )}
      </Collapse>
    </div>
  );
};

export default PedidosPendientes;
