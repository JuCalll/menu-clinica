import React, { useState, useEffect } from "react";
import { Input, Select, Collapse, Typography, Card, Row, Col, Tabs } from "antd";
import api from "../services/api";
import "../styles/DataManagement.scss";
import GestionPanel from "../components/GestionPanel";

const { Option } = Select;
const { Panel } = Collapse;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DataManagement = () => {
  const [pacientes, setPacientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [dietas, setDietas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("todos");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [summary, setSummary] = useState({
    totalPacientesActivos: 0,
    habitacionesOcupadas: 0,
    camasDisponibles: 0,
  });
  const [filteredHabitaciones, setFilteredHabitaciones] = useState([]);
  const [filteredCamas, setFilteredCamas] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          pacientesResponse,
          serviciosResponse,
          habitacionesResponse,
          dietasResponse,
        ] = await Promise.all([
          api.get("/pacientes/"),
          api.get("/servicios/"),
          api.get("/habitaciones/"),
          api.get("/dietas/"),
        ]);

        setPacientes(pacientesResponse.data);
        setServicios(serviciosResponse.data);
        setHabitaciones(habitacionesResponse.data);
        setDietas(dietasResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const totalPacientesActivos = pacientes.filter((p) => p.activo).length;
    const habitacionesOcupadas = new Set(
      pacientes.filter((p) => p.activo).map((p) => p.cama.habitacion.nombre)
    ).size;
    const camasDisponibles = habitaciones
      .flatMap((h) => h.camas)
      .filter(
        (c) => c.activo && !pacientes.some((p) => p.cama.id === c.id)
      ).length;

    setSummary({
      totalPacientesActivos,
      habitacionesOcupadas,
      camasDisponibles,
    });
  }, [pacientes, habitaciones]);

  useEffect(() => {
    if (selectedService) {
      const habitacionesActivas = habitaciones.filter(
        h => h.servicio === selectedService.nombre && h.activo
      );
      console.log('Habitaciones filtradas:', habitacionesActivas);
      setFilteredHabitaciones(habitacionesActivas);
      setSelectedRoom(null);
      setSelectedBed(null);
    } else {
      setFilteredHabitaciones([]);
    }
  }, [selectedService, habitaciones]);

  useEffect(() => {
    if (selectedRoom) {
      const camasActivas = selectedRoom.camas.filter(c => c.activo);
      setFilteredCamas(camasActivas);
      setSelectedBed(null);
    } else {
      setFilteredCamas([]);
    }
  }, [selectedRoom]);

  useEffect(() => {
    const filtered = pacientes.filter((p) => p.activo).filter((p) => {
      if (selectedBed) return p.cama.id === selectedBed.id;
      if (selectedRoom) return p.cama.habitacion.id === selectedRoom.id;
      if (selectedService) return p.cama.habitacion.servicio.id === selectedService.id;
      if (searchTerm) {
        return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               p.cedula.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
    setFilteredPacientes(filtered);
  }, [pacientes, selectedBed, selectedRoom, selectedService, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilterLevelChange = (newLevel) => {
    setFilterLevel(newLevel);
    if (newLevel === "todos" || newLevel === "servicio") {
      setSelectedService(null);
      setSelectedRoom(null);
      setSelectedBed(null);
    } else if (newLevel === "habitacion") {
      setSelectedRoom(null);
      setSelectedBed(null);
    } else if (newLevel === "cama") {
      setSelectedBed(null);
    }
  };

  const handleServiceSelect = (serviceId) => {
    if (serviceId) {
      const service = servicios.find(s => s.id === serviceId);
      setSelectedService(service);
      setFilterLevel("habitacion");
      console.log('Servicio seleccionado:', service);
    } else {
      setSelectedService(null);
      setFilterLevel("servicio");
    }
    setSelectedRoom(null);
    setSelectedBed(null);
  };

  const handleRoomSelect = (roomId) => {
    const room = filteredHabitaciones.find(h => h.id === roomId);
    setSelectedRoom(room);
    setFilterLevel("cama");
  };

  const handleBedSelect = (bedId) => {
    const bed = filteredCamas.find(c => c.id === bedId);
    setSelectedBed(bed);
    setFilterLevel("paciente");
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [pacientesResponse, serviciosResponse, habitacionesResponse] =
        await Promise.all([
          api.get("/pacientes/"),
          api.get("/servicios/"),
          api.get("/habitaciones/"),
        ]);

      setPacientes(pacientesResponse.data);
      setServicios(serviciosResponse.data);
      setHabitaciones(habitacionesResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="dm-container">
      <div className="dm-content">
        <Title level={2} className="dm-title">Gestión de Pacientes, Servicios y Habitaciones</Title>

        <GestionPanel
          pacientes={filteredPacientes}
          servicios={servicios}
          habitaciones={habitaciones}
          dietas={dietas}
          refreshData={refreshData}
          selectedService={selectedService}
          selectedRoom={selectedRoom}
          selectedBed={selectedBed}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSelectedService={setSelectedService}
          setSelectedRoom={setSelectedRoom}
          setSelectedBed={setSelectedBed}
        />

        <div className="dm-active-data">
          <Card title="Pacientes Activos" className="dm-card">
            <div className="dm-summary">
              <Text>Total de Pacientes Activos: {summary.totalPacientesActivos}</Text>
              <Text>Habitaciones Ocupadas: {summary.habitacionesOcupadas}</Text>
              <Text>Camas Disponibles: {summary.camasDisponibles}</Text>
            </div>

            <div className="dm-filters">
              <Input
                placeholder="Buscar por nombre o cédula"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="dm-search-input"
              />
              {filterLevel !== "todos" && (
                <Select
                  value={selectedService?.id}
                  onChange={handleServiceSelect}
                  placeholder="Seleccionar servicio"
                  className="dm-filter-select"
                  allowClear
                >
                  {servicios.filter(s => s.activo).map((servicio) => (
                    <Option key={servicio.id} value={servicio.id}>
                      {servicio.nombre}
                    </Option>
                  ))}
                </Select>
              )}
              {selectedService && (
                <Select
                  value={selectedRoom?.id}
                  onChange={handleRoomSelect}
                  placeholder="Seleccionar habitación"
                  className="dm-filter-select"
                  allowClear
                >
                  {filteredHabitaciones.map((habitacion) => (
                    <Option key={habitacion.id} value={habitacion.id}>
                      {habitacion.nombre}
                    </Option>
                  ))}
                </Select>
              )}
              {filterLevel === "cama" && (
                <Select
                  value={selectedBed?.id}
                  onChange={handleBedSelect}
                  placeholder="Seleccionar cama"
                  className="dm-filter-select"
                  allowClear
                >
                  {filteredCamas.map((cama) => (
                    <Option key={cama.id} value={cama.id}>
                      {cama.nombre}
                    </Option>
                  ))}
                </Select>
              )}
            </div>

            <Tabs activeKey={filterLevel} onChange={handleFilterLevelChange}>
              <TabPane tab="Todos" key="todos" />
              <TabPane tab="Servicios" key="servicio" />
              {selectedService && <TabPane tab="Habitaciones" key="habitacion" />}
              {selectedRoom && <TabPane tab="Camas" key="cama" />}
            </Tabs>

            <Collapse className="dm-pacientes-collapse">
              {filteredPacientes.map((paciente) => (
                <Panel
                  header={`${paciente.name} - Habitación: ${paciente.cama.habitacion.nombre} - Servicio: ${paciente.cama.habitacion.servicio.nombre}`}
                  key={`paciente-${paciente.id}`}
                  className="dm-paciente-panel"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text strong>Cédula:</Text> {paciente.cedula}
                    </Col>
                    <Col span={12}>
                      <Text strong>Cama:</Text> {paciente.cama.nombre}
                    </Col>
                    <Col span={12}>
                      <Text strong>Habitación:</Text> {paciente.cama.habitacion.nombre}
                    </Col>
                    <Col span={12}>
                      <Text strong>Servicio:</Text> {paciente.cama.habitacion.servicio.nombre}
                    </Col>
                    <Col span={12}>
                      <Text strong>Dieta Recomendada:</Text> {paciente.recommended_diet}
                    </Col>
                    <Col span={12}>
                      <Text strong>Alergias:</Text> {paciente.alergias || "Ninguna"}
                    </Col>
                    <Col span={24}>
                      <Text strong>Registrado en:</Text> {paciente.created_at}
                    </Col>
                  </Row>
                </Panel>
              ))}
            </Collapse>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
