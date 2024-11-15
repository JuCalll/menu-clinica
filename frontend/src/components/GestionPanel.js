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
import AlergiaManagementModal from "./AlergiaManagementModal";
import api from "../services/api";
import "../styles/GestionPanel.scss";
import { EditOutlined, DeleteOutlined, UserAddOutlined, CoffeeOutlined, AlertOutlined, SearchOutlined, SettingOutlined } from "@ant-design/icons";
import { getAlergias } from '../services/api';
import { message } from 'antd';

const { TabPane } = Tabs;
const { Option } = Select;

const GestionPanel = ({
  pacientes,
  servicios,
  habitaciones,
  dietas,
  alergias,
  refreshData,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHabitacionModalOpen, setIsHabitacionModalOpen] = useState(false);
  const [isCamaModalOpen, setIsCamaModalOpen] = useState(false);
  const [isPacienteModalOpen, setIsPacienteModalOpen] = useState(false);
  const [isDietaModalOpen, setIsDietaModalOpen] = useState(false);
  const [isAlergiaModalOpen, setIsAlergiaModalOpen] = useState(false);
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [isEditHabitacionModalOpen, setIsEditHabitacionModalOpen] =
    useState(false);
  const [editingHabitacion, setEditingHabitacion] = useState(null);

  const [isEditCamaModalOpen, setIsEditCamaModalOpen] = useState(false);
  const [editingCama, setEditingCama] = useState(null);

  const [isEditPacienteModalOpen, setIsEditPacienteModalOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);

  const paginate = (items) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

      setHabitacionesFiltradas(ordenarHabitaciones(filtradas));
    } else {
      setHabitacionesFiltradas(ordenarHabitaciones(habitaciones));
    }
  }, [habitaciones, selectedServicio]);

  const toggleActivo = async (item, type) => {
    const showConfirm = (isActivating) => {
      const { title, content } = getConfirmationMessages(isActivating, type);

      Modal.confirm({
        title,
        content,
        okText: "Sí",
        cancelText: "No",
        onOk: async () => {
          try {
            const updatedItem = await updateItem(item, type, isActivating);
            await api.put(`/${type}/${item.id}/`, updatedItem);
            showNotification(
              "success",
              isActivating ? "Elemento activado" : "Elemento desactivado",
              `El ${type.slice(0, -1)} se ha ${
                isActivating ? "activado" : "desactivado"
              } correctamente`
            );
            refreshData();
          } catch (error) {
            handleError(error);
          }
        },
      });
    };

    showConfirm(!item.activo);
  };

  const getConfirmationMessages = (isActivating, type) => {
    const getTypeInSpanish = (type) => {
      const types = {
        servicios: "servicio",
        habitaciones: "habitación",
        camas: "cama",
        pacientes: "paciente",
        dietas: "dieta",
        alergias: "alergia"
      };
      return types[type] || "elemento";
    };

    const typeInSpanish = getTypeInSpanish(type);
    const action = isActivating ? "activar" : "desactivar";

    const getTitle = () => {
      return (
        <div style={{ fontSize: "16px", fontWeight: 600, color: "#262626" }}>
          ¿Estás seguro de que deseas {action}{" "}
          {typeInSpanish === "paciente" ? "a este" : "este"} {typeInSpanish}?
        </div>
      );
    };

    const getContent = () => {
      if (isActivating) {
        const activationMessages = {
          servicios: "Esta acción activará el servicio y habilitará la posibilidad de activar las habitaciones y camas relacionadas.",
          habitaciones: "Esta acción activará la habitación y permitirá la activación de las camas asociadas a ella.",
          camas: "Esta acción habilitará la cama para poder ser asignada a pacientes.",
          pacientes: "Esta acción activará al paciente y asignará automáticamente su cama asociada.",
          dietas: "Esta acción activará la dieta y permitirá asignarla a nuevos pacientes.",
          alergias: "Esta acción activará la alergia y permitirá asignarla a nuevos pacientes."
        };
        return (
          <div style={{ fontSize: "14px", color: "#595959" }}>
            {activationMessages[type] || "Esta acción cambiará el estado del elemento a activo."}
          </div>
        );
      } else {
        const deactivationMessages = {
          servicios: (
            <div style={{ fontSize: "14px", color: "#595959" }}>
              <p>Esta acción tendrá los siguientes efectos:</p>
              <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                <li>El servicio quedará desactivado</li>
                <li>Todas las habitaciones asociadas serán desactivadas</li>
                <li>Todas las camas del servicio quedarán desactivadas</li>
                <li>El servicio permanecerá en la base de datos como inactivo</li>
              </ul>
            </div>
          ),
          habitaciones: (
            <div style={{ fontSize: "14px", color: "#595959" }}>
              <p>Esta acción tendrá los siguientes efectos:</p>
              <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                <li>La habitación quedará desactivada</li>
                <li>Todas las camas de la habitación serán desactivadas</li>
                <li>La habitación permanecerá en la base de datos como inactiva</li>
              </ul>
            </div>
          ),
          camas: (
            <div style={{ fontSize: "14px", color: "#595959" }}>
              <p>Esta acción tendrá los siguientes efectos:</p>
              <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                <li>La cama quedará desactivada</li>
                <li>No podrá ser asignada a nuevos pacientes</li>
                <li>La cama permanecerá en la base de datos como inactiva</li>
              </ul>
            </div>
          ),
          pacientes: (
            <div style={{ fontSize: "14px", color: "#595959" }}>
              <p>Esta acción tendrá los siguientes efectos:</p>
              <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                <li>El paciente quedará desactivado</li>
                <li>La cama asignada quedará libre</li>
                <li>El paciente permanecerá en la base de datos como inactivo</li>
              </ul>
            </div>
          ),
          dietas: (
            <div style={{ fontSize: "14px", color: "#595959" }}>
              <p>Esta acción tendrá los siguientes efectos:</p>
              <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                <li>La dieta quedará desactivada</li>
                <li>No se podrá asignar a nuevos pacientes</li>
                <li>Los pacientes que ya la tienen asignada mantendrán el registro</li>
                <li>La dieta permanecerá en la base de datos como inactiva</li>
              </ul>
            </div>
          ),
          alergias: (
            <div style={{ fontSize: "14px", color: "#595959" }}>
              <p>Esta acción tendrá los siguientes efectos:</p>
              <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                <li>La alergia quedará desactivada</li>
                <li>No se podrá asignar a nuevos pacientes</li>
                <li>Los pacientes que ya la tienen asignada mantendrán el registro</li>
                <li>La alergia permanecerá en la base de datos como inactiva</li>
              </ul>
            </div>
          )
        };
        return deactivationMessages[type];
      }
    };

    return {
      title: getTitle(),
      content: getContent(),
    };
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
        return;
      }

      const habitacion = cama.habitacion ? cama.habitacion : null;

      if (!habitacion) {
        return;
      }

      const servicio = habitacion.servicio ? habitacion.servicio : null;

      if (!servicio) {
        return;
      }

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

      if (item.alergias && item.alergias.id) {
        updatedItem.alergias_id = item.alergias.id;
      } else if (item.alergias && typeof item.alergias === "string") {
        const alergia = alergias.find((a) => a.nombre === item.alergias);
        updatedItem.alergias_id = alergia ? alergia.id : null;
      } else {
        updatedItem.alergias_id = null;
      }

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
    const errorMessage = error.response?.data?.detail || "Ha ocurrido un error";
    showNotification("error", "Error", errorMessage);
  };
  
  const resetPacienteForm = () => {
    setNewPacienteID("");
    setNewPacienteName("");
    setSelectedCama(null);
    setNewRecommendedDiet(null);
    setNewAllergies(null);
  };

  const closeModal = (modalType) => {
    const modalSetters = {
      servicio: {
        setModal: setIsModalOpen,
        setEditing: null,
        resetState: () => {},
      },
      editServicio: {
        setModal: setIsEditModalOpen,
        setEditing: setEditingService,
        resetState: () => {},
      },
      habitacion: {
        setModal: setIsHabitacionModalOpen,
        setEditing: null,
        resetState: () => setNewHabitacionName(""),
      },
      editHabitacion: {
        setModal: setIsEditHabitacionModalOpen,
        setEditing: setEditingHabitacion,
        resetState: () => {},
      },
      cama: {
        setModal: setIsCamaModalOpen,
        setEditing: null,
        resetState: () => {
          setNewCamaName("");
          setSelectedHabitacion(null);
        },
      },
      editCama: {
        setModal: setIsEditCamaModalOpen,
        setEditing: setEditingCama,
        resetState: () => {},
      },
      paciente: {
        setModal: setIsPacienteModalOpen,
        setEditing: null,
        resetState: resetPacienteForm,
      },
      editPaciente: {
        setModal: setIsEditPacienteModalOpen,
        setEditing: setEditingPaciente,
        resetState: () => {},
      },
      dieta: {
        setModal: setIsDietaModalOpen,
        setEditing: null,
        resetState: () => {},
      },
      alergia: {
        setModal: setIsAlergiaModalOpen,
        setEditing: null,
        resetState: () => {},
      },
    };

    return () => {
      modalSetters[modalType].setModal(false);
      form.resetFields();
      if (modalSetters[modalType].setEditing) {
        modalSetters[modalType].setEditing(null);
      }
      modalSetters[modalType].resetState();
    };
  };

  const closeCreateServicioModal = closeModal("servicio");
  const closeEditModal = closeModal("editServicio");
  const closeCreateHabitacionModal = closeModal("habitacion");
  const closeEditHabitacionModal = closeModal("editHabitacion");
  const closeCreateCamaModal = closeModal("cama");
  const closeEditCamaModal = closeModal("editCama");
  const closeCreatePacienteModal = closeModal("paciente");
  const closeEditPacienteModal = closeModal("editPaciente");
  const closeDietaManagementModal = closeModal("dieta");
  const closeAlergiaManagementModal = closeModal("alergia");

  const handleCreateServicio = async () => {
    try {
      const values = await form.validateFields();
      await createServicio({ nombre: values.servicioName });
      showNotification(
        "success",
        "Servicio creado",
        "El servicio se ha creado correctamente"
      );
      setIsModalOpen(false);
      form.resetFields();
      refreshData();
    } catch (error) {
      if (error.errorFields) {
        showNotification(
          "error",
          "Error de validación",
          "Por favor, complete todos los campos requeridos"
        );
      } else {
        handleError(error);
      }
    }
  };

  const handleCreateHabitacion = async () => {
    if (!newHabitacionName.trim() || !selectedServicio) {
      showNotification(
        "error",
        "Error de validación",
        "Por favor complete todos los campos requeridos"
      );
      return;
    }

    try {
      await createHabitacion({
        nombre: newHabitacionName,
        servicio_id: selectedServicio,
      });
      showNotification(
        "success",
        "Habitación creada",
        "La habitación se ha creado correctamente"
      );
      setIsHabitacionModalOpen(false);
      setNewHabitacionName("");
      setSelectedServicio(null);
      refreshData();
    } catch (error) {
      handleError(error);
    }
  };

  const handleCreateCama = async () => {
    try {
      if (!newCamaName.trim() || !selectedHabitacion) {
        showNotification(
          "error",
          "Error de validación",
          "Por favor complete todos los campos requeridos"
        );
        return;
      }

      await createCama({
        nombre: newCamaName,
        habitacion: selectedHabitacion,
      });

      showNotification(
        "success",
        "Cama creada",
        "La cama se ha creado correctamente"
      );
      setIsCamaModalOpen(false);
      setNewCamaName("");
      setSelectedHabitacion(null);
      refreshData();
    } catch (error) {
      handleError(error);
    }
  };

  const handleCreatePaciente = async () => {
    if (!newPacienteID.trim() || !newPacienteName.trim() || !selectedCama) {
      showNotification(
        "error",
        "Error de validación",
        "Por favor complete los campos obligatorios (Cédula, Nombre y Cama)"
      );
      return;
    }

    try {
      await createPaciente({
        cedula: newPacienteID,
        name: newPacienteName,
        cama_id: selectedCama,
        recommended_diet_id: newRecommendedDiet || null,
        alergias_id: newAllergies || null,
      });
      showNotification(
        "success",
        "Paciente creado",
        "El paciente se ha creado correctamente"
      );
      setIsPacienteModalOpen(false);
      resetPacienteForm();
      refreshData();
    } catch (error) {
      if (error.response?.status === 400) {
        showNotification(
          "error",
          "Error de validación",
          error.response.data.detail || "La cédula ingresada ya existe"
        );
      } else {
        handleError(error);
      }
    }
  };

  const openCreateServicioModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };
  const openCreateHabitacionModal = () => setIsHabitacionModalOpen(true);
  const openCreateCamaModal = () => setIsCamaModalOpen(true);
  const openCreatePacienteModal = () => setIsPacienteModalOpen(true);
  const openDietaManagementModal = () => setIsDietaModalOpen(true);
  const openAlergiaManagementModal = () => setIsAlergiaModalOpen(true);

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
      await api.put(`/servicios/${editingService.id}/`, {
        ...editingService,
        nombre: values.servicioName,
      });
      showNotification(
        "success",
        "Servicio actualizado",
        "El servicio se ha actualizado correctamente"
      );
      setIsEditModalOpen(false);
      form.resetFields();
      refreshData();
    } catch (error) {
      handleError(error);
    }
  };

  const handleEditHabitacion = (habitacion) => {
    setEditingHabitacion(habitacion);
    const servicioId = habitacion.servicio?.id || habitacion.servicio_id;

    form.setFieldsValue({
      habitacionName: habitacion.nombre,
      servicioId: servicioId,
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
      showNotification(
        "success",
        "Habitación actualizada",
        "La habitación se ha actualizado correctamente"
      );
      setIsEditHabitacionModalOpen(false);
      form.resetFields();
      refreshData();
    } catch (error) {
      handleError(error);
    }
  };

  const handleEditCama = (cama) => {
    setEditingCama(cama);
    form.setFieldsValue({
      camaName: cama.nombre,
    });
    setIsEditCamaModalOpen(true);
  };

  const handleUpdateCama = async () => {
    try {
      const values = await form.validateFields();
      const updatedCama = {
        ...editingCama,
        nombre: values.camaName,
      };

      await api.put(`/camas/${editingCama.id}/`, updatedCama);
      showNotification(
        "success",
        "Cama actualizada",
        "La cama se ha actualizado correctamente"
      );
      setIsEditCamaModalOpen(false);
      form.resetFields();
      refreshData();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteCama = async (cama) => {
    const tienePacienteActivo = pacientes.some(
      (paciente) => paciente.cama?.id === cama.id && paciente.activo
    );

    if (tienePacienteActivo) {
      showNotification(
        "error",
        "No se puede eliminar la cama",
        "La cama tiene un paciente activo asignado. Debe dar de alta al paciente antes de eliminar la cama."
      );
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
          showNotification(
            "success",
            "Cama eliminada",
            "La cama se ha eliminado correctamente"
          );
          refreshData();
        } catch (error) {
          handleError(error);
        }
      },
    });
  };
  const handleEditPaciente = (paciente) => {
    setEditingPaciente(paciente);
    
    // Verificar si la dieta existe y está inactiva
    if (paciente.recommended_diet?.id) {
      const dietaActual = dietas.find(d => d.id === paciente.recommended_diet.id);
      if (dietaActual && !dietaActual.activo) {
        message.warning(`La dieta "${dietaActual.nombre}" está inactiva`);
      }
    }
    
    // Verificar si la alergia existe y está inactiva
    if (paciente.alergias?.id) {
      const alergiaActual = alergias.find(a => a.id === paciente.alergias.id);
      if (alergiaActual && !alergiaActual.activo) {
        message.warning(`La alergia "${alergiaActual.nombre}" está inactiva`);
      }
    }

    form.setFieldsValue({
      pacienteCedula: paciente.cedula,
      pacienteName: paciente.name,
      camaId: paciente.cama.id,
      recommendedDietId: paciente.recommended_diet?.id,
      alergiasId: paciente.alergias?.id,
    });
    
    setIsEditPacienteModalOpen(true);
  };

  const handleUpdatePaciente = async () => {
    try {
      const values = await form.validateFields();
      const updatedPaciente = {
        ...editingPaciente,
        cedula: values.pacienteCedula,
        name: values.pacienteName,
        cama_id: values.camaId,
        recommended_diet_id: values.recommendedDietId,
        alergias_id: values.alergiasId,
      };

      await api.put(`/pacientes/${editingPaciente.id}/`, updatedPaciente);
      showNotification(
        "success",
        "Paciente actualizado",
        "El paciente se ha actualizado correctamente"
      );
      setIsEditPacienteModalOpen(false);
      form.resetFields();
      refreshData();
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    {
      title: "Editar",
      key: "edit",
      width: 80,
      align: "center",
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
      const matchesSearch = localSearchTerm
        ? p.name?.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
          p.cedula?.toLowerCase().includes(localSearchTerm.toLowerCase())
        : true;

      const matchesService = localSelectedService
        ? p.cama?.habitacion?.servicio?.id === localSelectedService.id
        : true;

      return matchesSearch && matchesService;
    });

    setLocalFilteredPacientes(filtered);
  }, [pacientes, localSearchTerm, localSelectedService]);

  const handleLocalSearch = (e) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleLocalServiceSelect = (value) => {
    if (value) {
      const servicioSeleccionado = servicios.find(s => s.id === value);
      setLocalSelectedService(servicioSeleccionado);
    } else {
      setLocalSelectedService(null);
    }
  };

  const showNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
      duration: 3,
    });
  };

  const handleModalClose = () => {
    form.resetFields();
  };

  const updateAlergias = async () => {
    try {
      await getAlergias();
      refreshData(); // Actualizar datos en el componente padre
    } catch (error) {
      message.error('Error al actualizar las alergias');
    }
  };

  return (
    <div className="gestion-panel__container">
      <Button
        className="gestion-panel__main-button"
        onClick={() => setIsDrawerOpen(true)}
        icon={<SettingOutlined />}
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
              onCancel={() => {
                closeCreateHabitacionModal();
                handleModalClose();
              }}
              okText="Crear"
              cancelText="Cancelar"
            >
              <Form 
                form={form} 
                layout="vertical" 
                className="gestion-panel__form"
              >
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
              onCancel={() => {
                closeCreateCamaModal();
                handleModalClose();
              }}
              okText="Crear"
              cancelText="Cancelar"
            >
              <Form 
                form={form} 
                layout="vertical" 
                className="gestion-panel__form"
              >
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
              <div className="buttons-group">
                <Button
                  className="gestion-panel__button"
                  onClick={openCreatePacienteModal}
                  icon={<UserAddOutlined />}
                >
                  Crear Paciente
                </Button>
                <Button
                  className="gestion-panel__button"
                  onClick={openDietaManagementModal}
                  icon={<CoffeeOutlined />}
                >
                  Gestionar Dietas
                </Button>
                <Button
                  className="gestion-panel__button"
                  onClick={openAlergiaManagementModal}
                  icon={<AlertOutlined />}
                >
                  Gestionar Alergias
                </Button>
              </div>
              
              <div className="filters-group">
                <Input
                  className="gestion-panel__search"
                  placeholder="Buscar por nombre o cédula"
                  value={localSearchTerm}
                  onChange={handleLocalSearch}
                  allowClear
                  prefix={<SearchOutlined />}
                />
                <Select
                  className="gestion-panel__select"
                  placeholder="Filtrar por servicio"
                  onChange={handleLocalServiceSelect}
                  value={localSelectedService?.id}
                  allowClear
                >
                  {servicios
                    .filter(servicio => servicio.activo)
                    .map((servicio) => (
                      <Option key={servicio.id} value={servicio.id}>
                        {servicio.nombre}
                      </Option>
                    ))}
                </Select>
              </div>
            </div>

            <Table
              className="gestion-panel__table gestion-panel__fade-in"
              dataSource={
                localFilteredPacientes.length > 10
                  ? paginate(localFilteredPacientes)
                  : localFilteredPacientes
              }
              rowKey={(record) => `paciente-${record.id}`}
              scroll={{ x: 1300 }}
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
                {
                  title: "Cédula",
                  dataIndex: "cedula",
                  key: "cedula",
                  width: 120,
                },
                {
                  title: "Nombre",
                  dataIndex: "name",
                  key: "name",
                  width: 250,
                },
                {
                  title: "Cama",
                  dataIndex: ["cama", "nombre"],
                  key: "cama",
                  width: 150,
                },
                {
                  title: "Habitación",
                  dataIndex: ["cama", "habitacion", "nombre"],
                  key: "habitacion",
                  width: 120,
                },
                {
                  title: "Servicio",
                  dataIndex: ["cama", "habitacion", "servicio", "nombre"],
                  key: "servicio",
                  width: 150,
                },
                {
                  title: "Dieta Recomendada",
                  dataIndex: "recommended_diet",
                  key: "recommended_diet",
                  width: 450,
                },
                {
                  title: "Alergias",
                  dataIndex: "alergias",
                  key: "alergias",
                  width: 400,
                },
                {
                  title: "Activo",
                  key: "activo",
                  align: "center",
                  width: 100,
                  fixed: "right",
                  render: (_, record) => (
                    <Switch
                      checked={record.activo}
                      onChange={() => toggleActivo(record, "pacientes")}
                    />
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
                      onClick={() => handleEditPaciente(record)}
                      className="gestion-panel__edit-button"
                    >
                      <EditOutlined />
                    </Button>
                  ),
                },
              ]}
            />
            <Modal
              className="gestion-panel__modal gestion-panel__fade-in"
              title="Editar Paciente"
              open={isEditPacienteModalOpen}
              onOk={handleUpdatePaciente}
              onCancel={() => {
                closeEditPacienteModal();
                handleModalClose();
              }}
              okText="Guardar"
              cancelText="Cancelar"
            >
              <Form 
                form={form} 
                layout="vertical" 
                className="gestion-panel__form"
              >
                <Form.Item
                  name="pacienteCedula"
                  label="Cédula"
                  rules={[
                    {
                      required: true,
                      message: "Por favor ingrese la cédula del paciente",
                    },
                  ]}
                >
                  <Input placeholder="Ingrese la cédula del paciente" />
                </Form.Item>
                <Form.Item
                  name="pacienteName"
                  label="Nombre"
                  rules={[
                    {
                      required: true,
                      message: "Por favor ingrese el nombre del paciente",
                    },
                  ]}
                >
                  <Input placeholder="Ingrese el nombre del paciente" />
                </Form.Item>
                <Form.Item
                  name="camaId"
                  label="Cama"
                  rules={[
                    {
                      required: true,
                      message: "Por favor seleccione una cama",
                    },
                  ]}
                >
                  <Select placeholder="Seleccione una cama">
                    {habitaciones
                      .flatMap((h) =>
                        h.camas.filter(
                          (c) =>
                            c.activo &&
                            (!pacientes.some((p) => p.cama.id === c.id) ||
                              c.id === editingPaciente?.cama.id)
                        )
                      )
                      .map((cama) => (
                        <Option key={`cama-${cama.id}`} value={cama.id}>
                          {cama.nombre}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
                <Form.Item name="recommendedDietId" label="Dieta Recomendada">
                  <Select placeholder="Seleccione una dieta" allowClear>
                    {dietas.map((dieta) => (
                      <Option key={`dieta-${dieta.id}`} value={dieta.id}>
                        {dieta.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="alergiasId" label="Alergias">
                  <Select placeholder="Seleccione una alergia" allowClear>
                    {alergias.map((alergia) => (
                      <Option key={`alergia-${alergia.id}`} value={alergia.id}>
                        {alergia.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Modal>

            <DietaManagementModal
              visible={isDietaModalOpen}
              onClose={closeDietaManagementModal}
              dietas={dietas}
              refreshData={refreshData}
            />
            <AlergiaManagementModal
              visible={isAlergiaModalOpen}
              onClose={closeAlergiaManagementModal}
              refreshData={updateAlergias}
            />

            <Modal
              className="gestion-panel__modal gestion-panel__fade-in"
              title="Crear Nuevo Paciente"
              open={isPacienteModalOpen}
              onOk={handleCreatePaciente}
              onCancel={() => {
                closeCreatePacienteModal();
                handleModalClose();
              }}
              okText="Crear"
              cancelText="Cancelar"
            >
              <Form 
                form={form} 
                layout="vertical" 
                className="gestion-panel__form"
              >
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
                    placeholder="Seleccione una dieta"
                    allowClear
                  >
                    {dietas
                      .filter(dieta => dieta.activo)
                      .map((dieta) => (
                        <Option key={`dieta-${dieta.id}`} value={dieta.id}>
                          {dieta.nombre}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Alergias">
                  <Select
                    value={newAllergies}
                    onChange={(value) => setNewAllergies(value)}
                    placeholder="Seleccione una alergia"
                    allowClear
                  >
                    {alergias
                      .filter(alergia => alergia.activo)
                      .map((alergia) => (
                        <Option key={`alergia-${alergia.id}`} value={alergia.id}>
                          {alergia.nombre}
                        </Option>
                      ))}
                  </Select>
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
        onCancel={() => {
          closeCreateServicioModal();
          handleModalClose();
        }}
        okText="Crear"
        cancelText="Cancelar"
      >
        <Form 
          form={form} 
          layout="vertical" 
          className="gestion-panel__form"
        >
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
        <Form 
          form={form} 
          layout="vertical" 
          className="gestion-panel__form"
        >
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
        <Form 
          form={form} 
          layout="vertical" 
          className="gestion-panel__form"
        >
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
        onCancel={closeEditCamaModal}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form 
          form={form} 
          layout="vertical" 
          className="gestion-panel__form"
        >
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
