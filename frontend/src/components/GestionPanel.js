import React, { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  Tabs,
  Table,
  Switch,
  Modal,
  Form,
  Input,
  notification,
  Select,
} from "antd";
import {
  createServicio,
  createHabitacion,
  createCama,
  createPaciente,
} from "../services/api";
import DietaManagementModal from "./DietaManagementModal";
import api from "../services/api";
import "../styles/GestionPanel.scss";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;
const { Option } = Select;

const GestionPanel = ({
  pacientes,
  servicios,
  habitaciones,
  dietas,
  refreshData,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHabitacionModalOpen, setIsHabitacionModalOpen] = useState(false);
  const [isCamaModalOpen, setIsCamaModalOpen] = useState(false);
  const [isPacienteModalOpen, setIsPacienteModalOpen] = useState(false);
  const [isDietaModalOpen, setIsDietaModalOpen] = useState(false);
  const [newHabitacionName, setNewHabitacionName] = useState("");
  const [newCamaName, setNewCamaName] = useState("");
  const [newPacienteID, setNewPacienteID] = useState("");
  const [newPacienteName, setNewPacienteName] = useState("");
  const [newRecommendedDiet, setNewRecommendedDiet] = useState("");
  const [newAllergies, setNewAllergies] = useState("");
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedHabitacion, setSelectedHabitacion] = useState(null);
  const [selectedCama, setSelectedCama] = useState(null);
  const [habitacionesFiltradas, setHabitacionesFiltradas] = useState([]);

  const userRole = localStorage.getItem("role");

  const [form] = Form.useForm();

  // Agregar estos estados al inicio del componente
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Agregar estos estados al inicio del componente
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Agregar estos estados al inicio del componente
  const [isEditHabitacionModalOpen, setIsEditHabitacionModalOpen] =
    useState(false);
  const [editingHabitacion, setEditingHabitacion] = useState(null);

  // Agregar estos estados al inicio del componente
  const [isEditCamaModalOpen, setIsEditCamaModalOpen] = useState(false);
  const [editingCama, setEditingCama] = useState(null);

  // Agregar estas funciones de paginación
  const paginate = (items) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Función para manejar el cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Función de ordenamiento para habitaciones
  const ordenarHabitaciones = (habitaciones) => {
    return [...habitaciones].sort((a, b) => {
      const aMatch = a.nombre.match(/^([A-Za-z]+).*?(\d+)/);
      const bMatch = b.nombre.match(/^([A-Za-z]+).*?(\d+)/);

      if (!aMatch || !bMatch) {
        return a.nombre.localeCompare(b.nombre);
      }

      const [, aLetter, aNumber] = aMatch;
      const [, bLetter, bNumber] = bMatch;

      if (aLetter !== bLetter) {
        return aLetter.localeCompare(bLetter);
      }
      return parseInt(aNumber, 10) - parseInt(bNumber, 10);
    });
  };

  // Modificar el useEffect para usar la función de ordenamiento
  useEffect(() => {
    if (selectedServicio) {
      const filtradas = habitaciones.filter((h) => {
        const habitacionServicio = h.servicio;
        return (
          habitacionServicio === selectedServicio ||
          habitacionServicio.id === selectedServicio ||
          habitacionServicio === selectedServicio.nombre
        );
      });

      // Aplicar el ordenamiento a las habitaciones filtradas
      setHabitacionesFiltradas(ordenarHabitaciones(filtradas));
    } else {
      // Aplicar el ordenamiento a todas las habitaciones
      setHabitacionesFiltradas(ordenarHabitaciones(habitaciones));
    }
  }, [habitaciones, selectedServicio]);

  const toggleActivo = async (item, type) => {
    const showConfirm = (isActivating) => {
      const { title, content } = getConfirmationMessages(isActivating, type);

      Modal.confirm({
        title,
        content,
        onOk: async () => {
          try {
            const updatedItem = await updateItem(item, type, isActivating);
            await api.put(`/${type}/${item.id}/`, updatedItem);
            refreshData();
          } catch (error) {
            handleError(error);
          }
        },
        onCancel() {
          console.log("Acción cancelada por el usuario");
        },
      });
    };

    showConfirm(!item.activo);
  };

  const getConfirmationMessages = (isActivating, type) => {
    let title = "";
    let content = "";

    if (isActivating) {
      switch (type) {
        case "servicios":
          title = "¿Ests seguro de que deseas activar este servicio?";
          content =
            "Esta acción activará el servicio y permitirá activar habitaciones y camas relacionadas a él.";
          break;
        case "habitaciones":
          title = "¿Estás seguro de que deseas activar esta habitación?";
          content =
            "Esta acción activará la habitación y permitirá activar las camas relacionadas a ella.";
          break;
        case "camas":
          title = "¿Estás seguro de que deseas activar esta cama?";
          content =
            "Esta acción activará la cama para ser asignada a un paciente.";
          break;
        case "pacientes":
          title = "¿Estás seguro de que deseas activar a este paciente?";
          content =
            "Esta acción activará al paciente y asignará su cama asociada.";
          break;
        default:
          title = "¿Estás seguro de que deseas continuar?";
          content =
            "Esta acción cambiará el estado del elemento seleccionado a activo.";
          break;
      }
    } else {
      switch (type) {
        case "servicios":
          title = "¿Estás seguro de que deseas desactivar este servicio?";
          content =
            "Esta acción desactivará el servicio y todas las habitaciones y camas asociadas a él. El servicio permanecerá en la base de datos como inactivo.";
          break;
        case "habitaciones":
          title = "¿Estás seguro de que deseas desactivar esta habitación?";
          content =
            "Esta acción desactivará la habitación y todas las camas asociadas a ella. La habitación permanecerá en la base de datos como inactiva.";
          break;
        case "camas":
          title = "¿Estás seguro de que deseas desactivar esta cama?";
          content =
            "Esta acción desactivará la cama y quedará disponible para ser asignada a un nuevo paciente. La cama permanecerá en la base de datos como inactiva.";
          break;
        case "pacientes":
          title = "¿Estás seguro de que deseas desactivar a este paciente?";
          content =
            "Esta acción desactivará al paciente y liberará su cama asociada. El paciente permanecerá en la base de datos como inactivo.";
          break;
        default:
          title = "¿Estás seguro de que deseas continuar?";
          content =
            "Esta acción cambiará el estado del elemento seleccionado a inactivo.";
          break;
      }
    }

    return { title, content };
  };

  const updateItem = async (item, type, isActivating) => {
    const updatedItem = { ...item, activo: isActivating };

    if (type === "habitaciones") {
      let servicioId = item.servicio_id;
      if (!servicioId) {
        const servicio = servicios.find((s) => s.nombre === item.servicio);
        if (servicio) {
          servicioId = servicio.id;
        }
      }
      updatedItem.servicio_id = servicioId;
    }

    if (type === "camas") {
      const habitacion = habitaciones.find((h) => h.id === item.habitacion);
      if (!habitacion || !habitacion.activo) {
        alert(
          "No se puede activar la cama porque la habitación no está activa."
        );
        return;
      }

      updatedItem.habitacion_id = habitacion.id;
    }

    if (type === "pacientes") {
      const cama = item.cama ? item.cama : null;

      if (!cama) {
        console.error("Error: No se encontró la cama asociada al paciente.");
        return;
      }

      const habitacion = cama.habitacion ? cama.habitacion : null;

      if (!habitacion) {
        console.error(
          "Error: No se encontró la habitación asociada a la cama."
        );
        return;
      }

      const servicio = habitacion.servicio ? habitacion.servicio : null;

      if (!servicio) {
        console.error(
          "Error: No se encontró el servicio asociado a la habitación."
        );
        return;
      }

      // Verificación de estados
      const camaActiva =
        cama.activo !== undefined ? cama.activo : "no definido";
      const habitacionActiva =
        habitacion.activo !== undefined ? habitacion.activo : "no definido";
      const servicioActivo =
        servicio.activo !== undefined ? servicio.activo : "no definido";

      if (!camaActiva || !habitacionActiva || !servicioActivo) {
        alert(
          "No se puede activar el paciente porque la cama, habitación o servicio no están activos."
        );
        return;
      }

      updatedItem.cama_id = cama.id;

      // Verificación y extracción correcta del ID de la dieta recomendada
      if (item.recommended_diet && item.recommended_diet.id) {
        updatedItem.recommended_diet_id = item.recommended_diet.id;
      } else if (
        item.recommended_diet &&
        typeof item.recommended_diet === "string"
      ) {
        const dieta = dietas.find((d) => d.nombre === item.recommended_diet);
        updatedItem.recommended_diet_id = dieta ? dieta.id : null;
      } else {
        updatedItem.recommended_diet_id = null;
      }
    }

    return updatedItem;
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 400) {
      const errorMessage =
        error.response.data.detail || "Error en la operación.";
      notification.error({
        message: "Error",
        description: errorMessage,
      });
    } else {
      console.error("Error:", error.response ? error.response.data : error);
      notification.error({
        message: "Error",
        description: "Ha ocurrido un error inesperado.",
      });
    }
  };

  const closeCreateServicioModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCreateServicio = async () => {
    try {
      const values = await form.validateFields();
      const normalizedNewName = values.servicioName.trim().replace(/\s+/g, " ");

      if (
        servicios.some(
          (s) =>
            s.nombre.trim().replace(/\s+/g, " ").toLowerCase() ===
            normalizedNewName.toLowerCase()
        )
      ) {
        notification.error({
          message: "Error",
          description:
            "Ya existe un servicio con este nombre o uno muy similar.",
        });
        return;
      }

      await createServicio({ nombre: normalizedNewName });
      notification.success({ message: "Servicio creado exitosamente" });
      closeCreateServicioModal();
      refreshData();
    } catch (error) {
      if (error.errorFields) {
        form.scrollToField(error.errorFields[0].name);
      } else {
        notification.error({
          message: "Error al crear el servicio",
          description: error.response?.data?.message || error.message,
        });
      }
    }
  };

  const handleCreateHabitacion = async () => {
    // Eliminar espacios al inicio y al final, y reemplazar múltiples espacios por uno solo
    const normalizedNewName = newHabitacionName.trim().replace(/\s+/g, " ");

    if (!/^[A-Za-z]+.*?\d+$/.test(normalizedNewName)) {
      notification.error({
        message: "Error",
        description:
          "El nombre de la habitación debe comenzar con una letra y contener al menos un número.",
      });
      return;
    }

    // Comparar nombres normalizados
    if (
      habitaciones.some(
        (h) =>
          h.nombre.trim().replace(/\s+/g, " ").toLowerCase() ===
          normalizedNewName.toLowerCase()
      )
    ) {
      notification.error({
        message: "Error",
        description:
          "Ya existe una habitación con este nombre o uno muy similar.",
      });
      return;
    }

    if (!normalizedNewName || !selectedServicio) {
      notification.error({
        message: "Error",
        description:
          "El nombre de la habitación y la selección de un servicio son obligatorios",
      });
      return;
    }

    try {
      const payload = {
        nombre: normalizedNewName,
        servicio_id: selectedServicio,
        activo: false,
        camas: [],
      };

      await createHabitacion(payload);
      notification.success({ message: "Habitación creada exitosamente" });
      setIsHabitacionModalOpen(false);
      setNewHabitacionName("");
      setSelectedServicio(null);
      refreshData();
    } catch (error) {
      notification.error({
        message: "Error al crear la habitación",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleCreateCama = async () => {
    const normalizedNewName = newCamaName.trim().replace(/\s+/g, " ");

    if (!normalizedNewName || !selectedHabitacion) {
      notification.error({
        message: "Error",
        description:
          "El nombre de la cama y la selección de una habitación son obligatorios",
      });
      return;
    }

    if (
      habitaciones
        .flatMap((h) => h.camas)
        .some(
          (c) =>
            c.nombre.trim().replace(/\s+/g, " ").toLowerCase() ===
            normalizedNewName.toLowerCase()
        )
    ) {
      notification.error({
        message: "Error",
        description: "Ya existe una cama con este nombre o uno muy similar.",
      });
      return;
    }

    try {
      const payload = {
        nombre: normalizedNewName,
        habitacion: selectedHabitacion,
        activo: false,
      };

      await createCama(payload);
      notification.success({ message: "Cama creada exitosamente" });
      setIsCamaModalOpen(false);
      setNewCamaName("");
      setSelectedHabitacion(null);
      refreshData();
    } catch (error) {
      notification.error({
        message: "Error al crear la cama",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleCreatePaciente = async () => {
    if (
      !newPacienteID ||
      !newPacienteName ||
      !selectedCama ||
      !newRecommendedDiet
    ) {
      notification.error({
        message: "Error",
        description: "Todos los campos son obligatorios para crear un paciente",
      });
      return;
    }
    try {
      const payload = {
        cedula: newPacienteID,
        name: newPacienteName,
        cama_id: selectedCama,
        recommended_diet_id: newRecommendedDiet,
        alergias: newAllergies,
        activo: true,
      };
      console.log("Payload que se enviará:", payload);
      await createPaciente(payload);
      notification.success({ message: "Paciente creado exitosamente" });
      setIsPacienteModalOpen(false);
      setNewPacienteID("");
      setNewPacienteName("");
      setNewRecommendedDiet(null);
      setNewAllergies("");
      setSelectedCama(null);
      refreshData();
    } catch (error) {
      console.error("Error al crear paciente:", error);
      notification.error({
        message: "Error al crear el paciente",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const openCreateServicioModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };
  const openCreateHabitacionModal = () => setIsHabitacionModalOpen(true);
  const closeCreateHabitacionModal = () => setIsHabitacionModalOpen(false);
  const openCreateCamaModal = () => setIsCamaModalOpen(true);
  const closeCreateCamaModal = () => setIsCamaModalOpen(false);
  const openCreatePacienteModal = () => setIsPacienteModalOpen(true);
  const closeCreatePacienteModal = () => setIsPacienteModalOpen(false);
  const openDietaManagementModal = () => setIsDietaModalOpen(true);
  const closeDietaManagementModal = () => setIsDietaModalOpen(false);


  useEffect(() => {
    console.log("habitacionesFiltradas:", habitacionesFiltradas);
  }, [habitacionesFiltradas]);

  useEffect(() => {
    console.log("Habitaciones iniciales:", habitaciones);
    // Verifica que cada habitación tenga un campo servicio con un id
    const habitacionesValidas = habitaciones.every(
      (h) => h.servicio && h.servicio.id
    );
    console.log(
      "Todas las habitaciones tienen servicio válido:",
      habitacionesValidas
    );
  }, [habitaciones]);

  // Manejar el cambio de pestañas
  const handleTabChange = (activeKey) => {
    if (activeKey === "2" || activeKey === "3") {
      setSelectedServicio(null);
      setCurrentPage(1);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    form.setFieldsValue({ servicioName: service.nombre });
    setIsEditModalOpen(true);
  };

  const handleUpdateService = async () => {
    try {
      const values = await form.validateFields();
      const updatedService = {
        ...editingService,
        nombre: values.servicioName,
      };

      await api.put(`/servicios/${editingService.id}/`, updatedService);
      notification.success({
        message: "Servicio actualizado",
        description: "El servicio se ha actualizado correctamente",
      });
      setIsEditModalOpen(false);
      refreshData();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudo actualizar el servicio",
      });
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    form.resetFields();
    setEditingService(null);
  };

  const handleEditHabitacion = (habitacion) => {
    setEditingHabitacion(habitacion);
    // Asegurarnos de obtener el ID del servicio correctamente
    const servicioId = habitacion.servicio?.id || habitacion.servicio_id;
    
    form.setFieldsValue({
      habitacionName: habitacion.nombre,
      servicioId: servicioId
    });
    setIsEditHabitacionModalOpen(true);
  };

  const handleUpdateHabitacion = async () => {
    try {
      const values = await form.validateFields();
      const updatedHabitacion = {
        ...editingHabitacion,
        nombre: values.habitacionName,
        servicio_id: values.servicioId,
      };

      await api.put(
        `/habitaciones/${editingHabitacion.id}/`,
        updatedHabitacion
      );
      notification.success({
        message: "Habitación actualizada",
        description: "La habitación se ha actualizado correctamente",
      });
      setIsEditHabitacionModalOpen(false);
      form.resetFields();
      refreshData();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudo actualizar la habitación",
      });
    }
  };

  const closeEditHabitacionModal = () => {
    setIsEditHabitacionModalOpen(false);
    form.resetFields();
    setEditingHabitacion(null);
  };

  const handleEditCama = (cama) => {
    setEditingCama(cama);
    form.setFieldsValue({
      camaName: cama.nombre
    });
    setIsEditCamaModalOpen(true);
  };

  const handleUpdateCama = async () => {
    try {
      const values = await form.validateFields();
      const updatedCama = {
        ...editingCama,
        nombre: values.camaName
      };

      await api.put(`/camas/${editingCama.id}/`, updatedCama);
      notification.success({
        message: "Cama actualizada",
        description: "La cama se ha actualizado correctamente",
      });
      setIsEditCamaModalOpen(false);
      form.resetFields();
      refreshData();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudo actualizar la cama",
      });
    }
  };

  const handleDeleteCama = async (cama) => {
    // Verificar si la cama tiene un paciente activo
    const tienePacienteActivo = pacientes.some(
      (paciente) => paciente.cama?.id === cama.id && paciente.activo
    );

    if (tienePacienteActivo) {
      notification.error({
        message: "No se puede eliminar la cama",
        description: "La cama tiene un paciente activo asignado. Debe dar de alta al paciente antes de eliminar la cama.",
      });
      return;
    }

    Modal.confirm({
      title: "¿Estás seguro de eliminar esta cama?",
      content: "Esta acción no se puede deshacer",
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await api.delete(`/camas/${cama.id}/`);
          notification.success({
            message: "Cama eliminada",
            description: "La cama se ha eliminado correctamente",
          });
          refreshData();
        } catch (error) {
          notification.error({
            message: "Error",
            description: "No se pudo eliminar la cama",
          });
        }
      },
    });
  };

  const columns = [
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    {
      title: "Editar",
      key: "edit",
      width: 80, // Ancho fijo para la columna
      align: "center", // Alinear contenido al centro
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleEditService(record)}
          className="gestion-panel__edit-button"
        >
          <EditOutlined />
        </Button>
      ),
    },
    {
      title: "Activo",
      key: "activo",
      render: (_, record) => (
        <Switch
          checked={record.activo}
          onChange={() => toggleActivo(record, "servicios")}
        />
      ),
    },
  ];

  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localSelectedService, setLocalSelectedService] = useState(null);
  const [localFilteredPacientes, setLocalFilteredPacientes] = useState([]);

  useEffect(() => {
    const filtered = pacientes.filter((p) => {
      const matchesSearch = localSearchTerm ? 
        p.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        p.cedula.toLowerCase().includes(localSearchTerm.toLowerCase())
        : true;

      const matchesService = localSelectedService ?
        p.cama.habitacion.servicio.id === localSelectedService.id
        : true;

      return matchesSearch && matchesService;
    });
    
    setLocalFilteredPacientes(filtered);
  }, [pacientes, localSearchTerm, localSelectedService]);

  const handleLocalSearch = (e) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleLocalServiceSelect = (value) => {
    const servicio = servicios.find((s) => s.nombre === value);
    setLocalSelectedService(servicio);
  };

  return (
    <div className="gestion-panel__container">
      <Button
        className="gestion-panel__button gestion-panel__fade-in"
        onClick={() => setIsDrawerOpen(true)}
      >
        Panel de Gestión
      </Button>

      <Drawer
        className="gestion-panel__drawer"
        title="Gestión de Datos"
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={800}
      >
        <Tabs
          defaultActiveKey="1"
          className="gestion-panel__tabs"
          onChange={handleTabChange}
        >
          {userRole !== "jefe_enfermeria" && (
            <TabPane tab="Servicios" key="1">
              <Button
                className="gestion-panel__button"
                onClick={openCreateServicioModal}
                style={{ marginBottom: "20px" }}
              >
                Crear Servicio
              </Button>
              <Table
                className="gestion-panel__table gestion-panel__fade-in"
                dataSource={
                  servicios.length > 10 ? paginate(servicios) : servicios
                }
                rowKey={(record) => `servicio-${record.id}`}
                pagination={
                  servicios.length > 10
                    ? {
                        current: currentPage,
                        pageSize: itemsPerPage,
                        total: servicios.length,
                        onChange: handlePageChange,
                        showSizeChanger: false,
                        showQuickJumper: false,
                        position: ["bottom", "center"],
                      }
                    : false
                }
                columns={columns}
              />
            </TabPane>
          )}

          <TabPane tab="Habitaciones" key="2">
            <div className="gestion-panel__actions-container">
              <Button
                className="gestion-panel__button"
                onClick={openCreateHabitacionModal}
              >
                Crear Habitación
              </Button>
              <Button
                className="gestion-panel__button"
                onClick={openCreateCamaModal}
              >
                Crear Cama
              </Button>
              <Select
                className="gestion-panel__select"
                placeholder="Filtrar por servicio"
                onChange={(value) => {
                  const servicio = servicios.find((s) => s.nombre === value);
                  setSelectedServicio(servicio);
                }}
                value={selectedServicio ? selectedServicio.nombre : undefined}
                allowClear
              >
                {servicios.map((servicio) => (
                  <Option key={servicio.id} value={servicio.nombre}>
                    {servicio.nombre}
                  </Option>
                ))}
              </Select>
            </div>
            <Table
              className="gestion-panel__table gestion-panel__fade-in"
              dataSource={
                habitacionesFiltradas.length > 10
                  ? paginate(habitacionesFiltradas)
                  : habitacionesFiltradas
              }
              rowKey={(record) => `habitacion-${record.id}`}
              pagination={
                habitacionesFiltradas.length > 10
                  ? {
                      current: currentPage,
                      pageSize: itemsPerPage,
                      total: habitacionesFiltradas.length,
                      onChange: handlePageChange,
                      showSizeChanger: false,
                      showQuickJumper: false,
                      position: ["bottom", "center"],
                    }
                  : false
              }
              columns={[
                { title: "Nombre", dataIndex: "nombre", key: "nombre" },
                {
                  title: "Servicio",
                  dataIndex: "servicio",
                  key: "servicio",
                  render: (servicio) => {
                    // Manejar tanto objetos servicio como strings
                    return typeof servicio === "object"
                      ? servicio.nombre
                      : servicio;
                  },
                },
                {
                  title: "Camas",
                  key: "camas",
                  render: (_, habitacion) => (
                    <ul className="gestion-panel__camas-list">
                      {habitacion.camas.length === 0 ? (
                        <li className="gestion-panel__cama-item gestion-panel__cama-empty">
                          No hay camas disponibles
                        </li>
                      ) : (
                        habitacion.camas.map((cama) => (
                          <li
                            key={`cama-${habitacion.id}-${cama.id}`}
                            className="gestion-panel__cama-item"
                          >
                            <span className="cama-nombre">{cama.nombre}</span>
                            <div className="gestion-panel__cama-actions">
                              <Button
                                type="link"
                                onClick={() => handleEditCama(cama)}
                                className="gestion-panel__edit-button"
                              >
                                <EditOutlined />
                              </Button>
                              <Button
                                type="link"
                                onClick={() => handleDeleteCama(cama)}
                                className="gestion-panel__delete-button"
                              >
                                <DeleteOutlined />
                              </Button>
                              <Switch
                                checked={cama.activo}
                                onChange={() => toggleActivo(cama, "camas")}
                              />
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  ),
                },
                {
                  title: "Editar",
                  key: "edit",
                  width: 80,
                  align: "center",
                  render: (_, record) => (
                    <Button
                      type="link"
                      onClick={() => handleEditHabitacion(record)}
                      className="gestion-panel__edit-button"
                    >
                      <EditOutlined />
                    </Button>
                  ),
                },
                {
                  title: "Activo",
                  key: "activo",
                  render: (_, record) => (
                    <Switch
                      checked={record.activo}
                      onChange={() => toggleActivo(record, "habitaciones")}
                    />
                  ),
                },
              ]}
            />

            <Modal
              className="gestion-panel__modal gestion-panel__fade-in"
              title="Crear Nueva Habitación"
              open={isHabitacionModalOpen}
              onOk={handleCreateHabitacion}
              onCancel={closeCreateHabitacionModal}
              okText="Crear"
              cancelText="Cancelar"
            >
              <Form layout="vertical" className="gestion-panel__form">
                <Form.Item label="Nombre de la Habitación">
                  <Input
                    value={newHabitacionName}
                    onChange={(e) => setNewHabitacionName(e.target.value)}
                    placeholder="Ingrese el nombre de la habitación"
                  />
                </Form.Item>
                <Form.Item label="Servicio">
                  <Select
                    value={selectedServicio}
                    onChange={(value) => setSelectedServicio(value)}
                    placeholder="Seleccione un servicio"
                  >
                    {servicios
                      .filter((s) => s.activo)
                      .map((servicio) => (
                        <Option key={servicio.id} value={servicio.id}>
                          {servicio.nombre}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              className="gestion-panel__modal gestion-panel__fade-in"
              title="Crear Nueva Cama"
              open={isCamaModalOpen}
              onOk={handleCreateCama}
              onCancel={closeCreateCamaModal}
              okText="Crear"
              cancelText="Cancelar"
            >
              <Form layout="vertical" className="gestion-panel__form">
                <Form.Item label="Nombre de la Cama">
                  <Input
                    value={newCamaName}
                    onChange={(e) => setNewCamaName(e.target.value)}
                    placeholder="Ingrese el nombre de la cama"
                  />
                </Form.Item>
                <Form.Item label="Habitación">
                  <Select
                    value={selectedHabitacion}
                    onChange={(value) => setSelectedHabitacion(value)}
                    placeholder="Seleccione una habitación"
                  >
                    {habitaciones
                      .filter((h) => h.activo)
                      .map((habitacion) => (
                        <Option key={habitacion.id} value={habitacion.id}>
                          {habitacion.nombre}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Form>
            </Modal>
          </TabPane>

          <TabPane tab="Pacientes" key="3">
            <div className="gestion-panel__actions-container">
              <Button
                className="gestion-panel__button"
                onClick={openCreatePacienteModal}
              >
                Crear Paciente
              </Button>
              <Button
                className="gestion-panel__button"
                onClick={openDietaManagementModal}
              >
                Gestionar Dietas
              </Button>
              <Input
                className="gestion-panel__search"
                placeholder="Buscar por nombre o cédula"
                value={localSearchTerm}
                onChange={handleLocalSearch}
                allowClear
              />
              <Select
                className="gestion-panel__select"
                placeholder="Filtrar por servicio"
                onChange={handleLocalServiceSelect}
                value={localSelectedService ? localSelectedService.nombre : undefined}
                allowClear
              >
                {servicios.map((servicio) => (
                  <Option key={servicio.id} value={servicio.nombre}>
                    {servicio.nombre}
                  </Option>
                ))}
              </Select>
            </div>

            <Table
              className="gestion-panel__table gestion-panel__fade-in"
              dataSource={
                localFilteredPacientes.length > 10
                  ? paginate(localFilteredPacientes)
                  : localFilteredPacientes
              }
              rowKey={(record) => `paciente-${record.id}`}
              pagination={
                localFilteredPacientes.length > 10
                  ? {
                      current: currentPage,
                      pageSize: itemsPerPage,
                      total: localFilteredPacientes.length,
                      onChange: handlePageChange,
                      showSizeChanger: false,
                      showQuickJumper: false,
                      position: ["bottom", "center"],
                    }
                  : false
              }
              columns={[
                { title: "Cédula", dataIndex: "cedula", key: "cedula" },
                { title: "Nombre", dataIndex: "name", key: "name" },
                { title: "Cama", dataIndex: ["cama", "nombre"], key: "cama" },
                {
                  title: "Habitación",
                  dataIndex: ["cama", "habitacion", "nombre"],
                  key: "habitacion",
                },
                {
                  title: "Servicio",
                  dataIndex: ["cama", "habitacion", "servicio", "nombre"],
                  key: "servicio",
                },
                {
                  title: "Dieta Recomendada",
                  dataIndex: "recommended_diet",
                  key: "recommended_diet",
                },
                { title: "Alergias", dataIndex: "alergias", key: "alergias" },
                {
                  title: "Activo",
                  key: "activo",
                  align: "center",
                  render: (_, record) => (
                    <Switch
                      checked={record.activo}
                      onChange={() => toggleActivo(record, "pacientes")}
                    />
                  ),
                },
              ]}
            />

            <DietaManagementModal
              visible={isDietaModalOpen}
              onClose={closeDietaManagementModal}
              dietas={dietas}
              refreshData={refreshData}
            />

            <Modal
              className="gestion-panel__modal gestion-panel__fade-in"
              title="Crear Nuevo Paciente"
              open={isPacienteModalOpen}
              onOk={handleCreatePaciente}
              onCancel={closeCreatePacienteModal}
              okText="Crear"
              cancelText="Cancelar"
            >
              <Form layout="vertical" className="gestion-panel__form">
                <Form.Item label="Cédula">
                  <Input
                    value={newPacienteID}
                    onChange={(e) => setNewPacienteID(e.target.value)}
                    placeholder="Ingrese la cédula del paciente"
                  />
                </Form.Item>
                <Form.Item label="Nombre">
                  <Input
                    value={newPacienteName}
                    onChange={(e) => setNewPacienteName(e.target.value)}
                    placeholder="Ingrese el nombre del paciente"
                  />
                </Form.Item>
                <Form.Item label="Cama">
                  <Select
                    value={selectedCama}
                    onChange={(value) => setSelectedCama(value)}
                    placeholder="Seleccione una cama"
                  >
                    {habitaciones
                      .flatMap((h) =>
                        h.camas.filter(
                          (c) =>
                            c.activo &&
                            !pacientes.some((p) => p.cama.id === c.id)
                        )
                      )
                      .map((cama) => (
                        <Option key={`cama-${cama.id}`} value={cama.id}>
                          {cama.nombre}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Dieta Recomendada">
                  <Select
                    value={newRecommendedDiet}
                    onChange={(value) => setNewRecommendedDiet(value)}
                    placeholder="Seleccione la dieta recomendada"
                  >
                    {dietas.map((dieta) => (
                      <Option key={`dieta-${dieta.id}`} value={dieta.id}>
                        {dieta.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Alergias">
                  <Input
                    value={newAllergies}
                    onChange={(e) => setNewAllergies(e.target.value)}
                    placeholder="Ingrese las alergias del paciente"
                  />
                </Form.Item>
              </Form>
            </Modal>
          </TabPane>
        </Tabs>
      </Drawer>

      <Modal
        className="gestion-panel__modal gestion-panel__fade-in"
        title="Crear Nuevo Servicio"
        open={isModalOpen}
        onOk={handleCreateServicio}
        onCancel={closeCreateServicioModal}
        okText="Crear"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" className="gestion-panel__form">
          <Form.Item
            name="servicioName"
            label="Nombre del Servicio"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el nombre del servicio",
              },
            ]}
          >
            <Input placeholder="Ingrese el nombre del servicio" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        className="gestion-panel__modal gestion-panel__fade-in"
        title="Editar Servicio"
        open={isEditModalOpen}
        onOk={handleUpdateService}
        onCancel={closeEditModal}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" className="gestion-panel__form">
          <Form.Item
            name="servicioName"
            label="Nombre del Servicio"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el nombre del servicio",
              },
            ]}
          >
            <Input placeholder="Ingrese el nombre del servicio" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        className="gestion-panel__modal gestion-panel__fade-in"
        title="Editar Habitación"
        open={isEditHabitacionModalOpen}
        onOk={handleUpdateHabitacion}
        onCancel={closeEditHabitacionModal}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" className="gestion-panel__form">
          <Form.Item
            name="habitacionName"
            label="Nombre de la Habitación"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el nombre de la habitación",
              },
            ]}
          >
            <Input placeholder="Ingrese el nombre de la habitación" />
          </Form.Item>
          <Form.Item
            name="servicioId"
            label="Servicio"
            rules={[
              {
                required: true,
                message: "Por favor seleccione un servicio",
              },
            ]}
          >
            <Select placeholder="Seleccione un servicio">
              {servicios
                .filter((s) => s.activo)
                .map((servicio) => (
                  <Option key={servicio.id} value={servicio.id}>
                    {servicio.nombre}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        className="gestion-panel__modal gestion-panel__fade-in"
        title="Editar Cama"
        open={isEditCamaModalOpen}
        onOk={handleUpdateCama}
        onCancel={() => {
          setIsEditCamaModalOpen(false);
          form.resetFields();
          setEditingCama(null);
        }}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" className="gestion-panel__form">
          <Form.Item
            name="camaName"
            label="Nombre de la Cama"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el nombre de la cama",
              },
            ]}
          >
            <Input placeholder="Ingrese el nombre de la cama" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionPanel;
