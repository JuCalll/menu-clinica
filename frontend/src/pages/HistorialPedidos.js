import React, { useState, useEffect } from "react";
import { Collapse, Spin, Select, Card } from "antd";
import { getPacientes, getPedidosCompletados } from "../services/api";
import "../styles/HistorialPedidos.scss";

const { Panel } = Collapse;
const { Option } = Select;

const HistorialPedidos = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pedidosCompletados, setPedidosCompletados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await getPacientes();
        setPacientes(response);
      } catch (error) {
        console.error("Error fetching patients", error);
      }
    };

    fetchPacientes();
  }, []);

  useEffect(() => {
    const fetchPedidosCompletados = async () => {
      if (!selectedPaciente) {
        setPedidosCompletados([]);
        return;
      }

      setLoading(true);
      try {
        const response = await getPedidosCompletados(selectedPaciente);
        setPedidosCompletados(response);
      } catch (error) {
        console.error("Error fetching completed orders", error);
      }
      setLoading(false);
    };

    fetchPedidosCompletados();
  }, [selectedPaciente]);

  const handlePacienteChange = (value) => {
    setSelectedPaciente(value);
  };

  const filterOption = (input, option) => {
    return (
      option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >=
      0
    );
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
        </div>
      ) : null;
    });
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="historial-pedidos">
      <h2>Historial de Pedidos Completados</h2>
      <Select
        showSearch
        placeholder="Seleccionar Paciente"
        value={selectedPaciente}
        onChange={handlePacienteChange}
        style={{ width: 300, marginBottom: 20 }}
        filterOption={filterOption}
      >
        {pacientes.map((paciente) => (
          <Option key={paciente.id} value={paciente.id}>
            {paciente.name} (Cama: {paciente.cama.nombre}, Hab:{" "}
            {paciente.cama.habitacion.nombre}, Serv:{" "}
            {paciente.cama.habitacion.servicio.nombre})
          </Option>
        ))}
      </Select>

      {pedidosCompletados.length > 0 ? (
        <Collapse>
          {pedidosCompletados.map((pedido) => (
            <Panel
              header={`Pedido ${pedido.id} - ${pedido.paciente.name}`}
              key={pedido.id}
              className="pedido-panel"
            >
              <Card className="pedido-card">
                <h4>
                  Fecha del Pedido:{" "}
                  {new Date(pedido.fecha_pedido).toLocaleString()}
                </h4>
                {renderSections(pedido)}
                <div className="adicionales">
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
          ))}
        </Collapse>
      ) : (
        <p>No hay pedidos completados para este paciente.</p>
      )}
    </div>
  );
};

export default HistorialPedidos;
