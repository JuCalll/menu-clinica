/**
 * Página de Gestión de Datos
 * 
 * Proporciona una interfaz para visualizar y gestionar:
 * - Pacientes activos
 * - Servicios hospitalarios
 * - Habitaciones y camas
 * - Dietas y alergias
 * 
 * Incluye:
 * - Resumen estadístico
 * - Filtros multinivel
 * - Vista detallada de pacientes
 * 
 * @component
 */

import React, { useState, useEffect } from "react";
import { Input, Select, Collapse, Typography, Card, Tabs } from "antd";
import api from "../services/api";
import "../styles/DataManagement.scss";
import GestionPanel from "../components/GestionPanel";
import { 
  UserOutlined, 
  HomeOutlined, 
  MedicineBoxOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RestOutlined,
  TeamOutlined,
  BuildOutlined,
  KeyOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;
const { Title } = Typography;
const { TabPane } = Tabs;

const DataManagement = () => {
  // Estados principales
  const [pacientes, setPacientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [dietas, setDietas] = useState([]);
  const [alergias, setAlergias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("todos");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  // Estados derivados
  const [filteredHabitaciones, setFilteredHabitaciones] = useState([]);
  const [filteredCamas, setFilteredCamas] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [summary, setSummary] = useState({
    totalPacientesActivos: 0,
    habitacionesOcupadas: 0,
    camasDisponibles: 0,
  });

  /**
   * Carga inicial de datos desde la API
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          pacientesResponse,
          serviciosResponse,
          habitacionesResponse,
          dietasResponse,
          alergiasResponse,
        ] = await Promise.all([
          api.get("/pacientes/"),
          api.get("/servicios/"),
          api.get("/habitaciones/"),
          api.get("/dietas/dietas/"),
          api.get("/dietas/alergias/"),
        ]);

        setPacientes(pacientesResponse.data);
        setServicios(serviciosResponse.data);
        setHabitaciones(habitacionesResponse.data);
        setDietas(dietasResponse.data);
        setAlergias(alergiasResponse.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Actualiza el resumen estadístico cuando cambian los datos
   */
  useEffect(() => {
    const totalPacientesActivos = pacientes.filter((p) => p.activo).length;
    const habitacionesOcupadas = new Set(
      pacientes.filter((p) => p.activo).map((p) => p.cama.habitacion.nombre)
    ).size;
    const camasDisponibles = habitaciones
      .flatMap((h) => h.camas)
      .filter((c) => c.activo && !pacientes.some((p) => p.cama.id === c.id))
      .length;

    setSummary({
      totalPacientesActivos,
      habitacionesOcupadas,
      camasDisponibles,
    });
  }, [pacientes, habitaciones]);

  /**
   * Filtra las habitaciones cuando se selecciona un servicio
   */
  useEffect(() => {
    if (selectedService) {
      const habitacionesActivas = habitaciones.filter(
        h => h.servicio === selectedService.nombre && h.activo
      );
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

  /**
   * Maneja la búsqueda por texto
   * @param {string} value - Término de búsqueda
   */
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  /**
   * Maneja el cambio de nivel de filtrado
   * Resetea los filtros según el nivel seleccionado
   * @param {string} newLevel - Nuevo nivel de filtrado ('todos', 'servicio', 'habitacion', 'cama')
   */
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

  /**
   * Maneja la selección de un servicio
   * @param {number} serviceId - ID del servicio seleccionado
   */
  const handleServiceSelect = (serviceId) => {
    if (serviceId) {
      const service = servicios.find(s => s.id === serviceId);
      setSelectedService(service);
      setFilterLevel("habitacion");
    } else {
      setSelectedService(null);
      setFilterLevel("servicio");
    }
    setSelectedRoom(null);
    setSelectedBed(null);
  };

  /**
   * Maneja la selección de una habitación
   * @param {number} roomId - ID de la habitación seleccionada
   */
  const handleRoomSelect = (roomId) => {
    const room = filteredHabitaciones.find(h => h.id === roomId);
    setSelectedRoom(room);
    setFilterLevel("cama");
  };

  /**
   * Maneja la selección de una cama
   * @param {number} bedId - ID de la cama seleccionada
   */
  const handleBedSelect = (bedId) => {
    const bed = filteredCamas.find(c => c.id === bedId);
    setSelectedBed(bed);
    setFilterLevel("paciente");
  };

  /**
   * Actualiza los datos desde la API
   */
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
    } catch (error) {
      // Manejo silencioso del error
    } finally {
      setLoading(false);
    }
  };

  // Renderizado condicional para estado de carga
  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="dm-container">
      <div className="dm-content">
        {/* Cabecera con título y panel de gestión */}
        <div className="dm-header">
          <Title level={2} className="dm-title">
            Gestión de Pacientes, Servicios y Habitaciones
          </Title>
          <GestionPanel
            pacientes={pacientes}
            servicios={servicios}
            habitaciones={habitaciones}
            dietas={dietas}
            alergias={alergias}
            refreshData={refreshData}
          />
        </div>

        {/* Sección de datos activos */}
        <div className="dm-active-data">
          <Card title="Pacientes Activos" className="dm-card">
            {/* Resumen estadístico */}
            <div className="dm-summary">
              <div className="summary-item">
                <TeamOutlined className="summary-icon" />
                <div className="summary-content">
                  <span className="summary-label">Total Pacientes Activos</span>
                  <span className="summary-value">{summary.totalPacientesActivos}</span>
                </div>
              </div>
              <div className="summary-item">
                <BuildOutlined className="summary-icon" />
                <div className="summary-content">
                  <span className="summary-label">Habitaciones Ocupadas</span>
                  <span className="summary-value">{summary.habitacionesOcupadas}</span>
                </div>
              </div>
              <div className="summary-item">
                <KeyOutlined className="summary-icon" />
                <div className="summary-content">
                  <span className="summary-label">Camas Disponibles</span>
                  <span className="summary-value">{summary.camasDisponibles}</span>
                </div>
              </div>
            </div>

            {/* Filtros de búsqueda */}
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

            {/* Pestañas de niveles de filtrado */}
            <Tabs activeKey={filterLevel} onChange={handleFilterLevelChange}>
              <TabPane tab="Todos" key="todos" />
              <TabPane tab="Servicios" key="servicio" />
              {selectedService && <TabPane tab="Habitaciones" key="habitacion" />}
              {selectedRoom && <TabPane tab="Camas" key="cama" />}
            </Tabs>

            {/* Lista colapsable de pacientes */}
            <Collapse className="dm-pacientes-collapse">
              {filteredPacientes.map((paciente) => (
                <Panel
                  header={
                    <div className="panel-header">
                      <div className="panel-main-info">
                        <div className="panel-name">
                          <UserOutlined className="panel-icon" />
                          <span>{paciente.name}</span>
                        </div>
                        <div className="panel-badges">
                          <span className="panel-badge">
                            <HomeOutlined /> {paciente.cama.habitacion.nombre}
                          </span>
                          <span className="panel-badge">
                            <EnvironmentOutlined /> {paciente.cama.habitacion.servicio.nombre}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                  key={`paciente-${paciente.id}`}
                >
                  <div className="paciente-info-grid">
                    <div className="info-item">
                      <IdcardOutlined className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Cédula</div>
                        <div className="info-value">{paciente.cedula}</div>
                      </div>
                    </div>
                    <div className="info-item">
                      <RestOutlined className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Cama</div>
                        <div className="info-value">{paciente.cama.nombre}</div>
                      </div>
                    </div>
                    <div className="info-item">
                      <EnvironmentOutlined className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Ubicación</div>
                        <div className="info-value">
                          {paciente.cama.habitacion.nombre} - {paciente.cama.habitacion.servicio.nombre}
                        </div>
                      </div>
                    </div>
                    <div className="info-item">
                      <MedicineBoxOutlined className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Dietas Recomendadas</div>
                        <div className="info-value">
                          {paciente.dietas ? (
                            Array.isArray(paciente.dietas) ? 
                              paciente.dietas.map(d => typeof d === 'object' ? d.nombre : d).join(', ') :
                              typeof paciente.dietas === 'object' ? 
                                paciente.dietas.nombre || 'No especificada' : 
                                paciente.dietas || 'No especificada'
                          ) : 'Sin dietas asignadas'}
                        </div>
                      </div>
                    </div>
                    <div className="info-item">
                      <WarningOutlined className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Alergias</div>
                        <div className="info-value">
                          {paciente.alergias ? (
                            Array.isArray(paciente.alergias) ? 
                              paciente.alergias.map(a => typeof a === 'object' ? a.nombre : a).join(', ') :
                              typeof paciente.alergias === 'object' ? 
                                paciente.alergias.nombre || 'No especificada' : 
                                paciente.alergias || 'Sin alergias'
                          ) : 'Sin alergias'}
                        </div>
                      </div>
                    </div>
                    <div className="info-item">
                      <ClockCircleOutlined className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Registrado en</div>
                        <div className="info-value">{paciente.created_at}</div>
                      </div>
                    </div>
                  </div>
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
