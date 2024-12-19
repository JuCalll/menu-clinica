/**
 * Componente principal del panel de gestión.
 *
 * Proporciona una interfaz para gestionar:
 * - Servicios hospitalarios
 * - Habitaciones
 * - Camas
 * - Pacientes
 * - Dietas
 * - Alergias
 *
 * Incluye funcionalidades para:
 * - Crear, editar y eliminar elementos
 * - Activar/desactivar elementos
 * - Filtrar y ordenar datos
 * - Paginación de resultados
 */

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
  message,
  Tag,
} from "antd";
import {
  createServicio,
  createHabitacion,
  createCama,
  createPaciente,
} from "../services/api";
import { getAlergias } from "../services/api";
import DietaManagementModal from "./DietaManagementModal";
import AlergiaManagementModal from "./AlergiaManagementModal";
import api from "../services/api";
import "../styles/GestionPanel.scss";
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  CoffeeOutlined,
  AlertOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;
const { Option } = Select;

/**
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Array<Object>} props.pacientes - Lista de pacientes del sistema
 * @param {Array<Object>} props.servicios - Lista de servicios hospitalarios
 * @param {Array<Object>} props.habitaciones - Lista de habitaciones
 * @param {Array<Object>} props.dietas - Lista de dietas disponibles
 * @param {Array<Object>} props.alergias - Lista de alergias registradas
 * @param {Function} props.refreshData - Función para actualizar los datos
 */
const GestionPanel = ({
  pacientes,
  servicios,
  habitaciones,
  dietas,
  alergias,
  refreshData,
}) => {
  // Estados para control de modales
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHabitacionModalOpen, setIsHabitacionModalOpen] = useState(false);
  const [isCamaModalOpen, setIsCamaModalOpen] = useState(false);
  const [isPacienteModalOpen, setIsPacienteModalOpen] = useState(false);
  const [isDietaModalOpen, setIsDietaModalOpen] = useState(false);
  const [isAlergiaModalOpen, setIsAlergiaModalOpen] = useState(false);

  // Estados para formularios
  const [newHabitacionName, setNewHabitacionName] = useState("");
  const [newCamaName, setNewCamaName] = useState("");
  const [newPacienteID, setNewPacienteID] = useState("");
  const [newPacienteName, setNewPacienteName] = useState("");
  const [newRecommendedDiet, setNewRecommendedDiet] = useState([]);
  const [newAllergies, setNewAllergies] = useState([]);

  // Estados para selecciones
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedHabitacion, setSelectedHabitacion] = useState(null);
  const [selectedCama, setSelectedCama] = useState(null);
  const [habitacionesFiltradas, setHabitacionesFiltradas] = useState([]);

  // Estados para edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isEditHabitacionModalOpen, setIsEditHabitacionModalOpen] =
    useState(false);
  const [editingHabitacion, setEditingHabitacion] = useState(null);
  const [isEditCamaModalOpen, setIsEditCamaModalOpen] = useState(false);
  const [editingCama, setEditingCama] = useState(null);
  const [isEditPacienteModalOpen, setIsEditPacienteModalOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Obtener rol del usuario
  const userRole = localStorage.getItem("role");

  // Instancia del formulario
  const [form] = Form.useForm();

  /**
   * Pagina un array de elementos para la tabla
   * @param {Array} items - Array de elementos a paginar
   * @returns {Array} Subconjunto de elementos para la página actual
   */
  const paginate = (items) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  /**
   * Maneja el cambio de página en la tabla
   * @param {number} page - Número de página seleccionado
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Ordena las habitaciones alfanuméricamente
   * Ejemplo: A1 < A2 < B1 < B2
   * @param {Array} habitaciones - Array de habitaciones a ordenar
   * @returns {Array} Habitaciones ordenadas
   */
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

  /**
   * Alterna el estado activo/inactivo de un elemento
   * @param {Object} item - Elemento a modificar
   * @param {string} type - Tipo de elemento ('servicios', 'habitaciones', etc.)
   */
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

  /**
   * Genera los mensajes de confirmación para activar/desactivar elementos
   * @param {boolean} isActivating - True si se está activando, false si se está desactivando
   * @param {string} type - Tipo de elemento ('servicios', 'habitaciones', 'camas', etc.)
   * @returns {Object} Objeto con título y contenido del mensaje de confirmación
   */
  const getConfirmationMessages = (isActivating, type) => {
    /**
     * Convierte el tipo de elemento a su versión en español
     * @param {string} type - Tipo de elemento en plural
     * @returns {string} Tipo de elemento en singular y en español
     */
    const getTypeInSpanish = (type) => {
      const types = {
        servicios: "servicio",
        habitaciones: "habitación",
        camas: "cama",
        pacientes: "paciente",
        dietas: "dieta",
        alergias: "alergia",
      };
      return types[type] || "elemento";
    };

    const typeInSpanish = getTypeInSpanish(type);
    const action = isActivating ? "activar" : "desactivar";

    /**
     * Genera el título del mensaje de confirmación
     * @returns {JSX.Element} Título formateado
     */
    const getTitle = () => (
      <div style={{ fontSize: "16px", fontWeight: 600, color: "#262626" }}>
        ¿Estás seguro de que deseas {action}{" "}
        {typeInSpanish === "paciente" ? "a este" : "este"} {typeInSpanish}?
      </div>
    );

    /**
     * Genera el contenido del mensaje de confirmación
     * @returns {JSX.Element} Contenido detallado con los efectos de la acción
     */
    const getContent = () => {
      // Mensajes para activación de elementos
      if (isActivating) {
        const activationMessages = {
          servicios:
            "Esta acción activará el servicio y habilitará la posibilidad de activar las habitaciones y camas relacionadas.",
          habitaciones:
            "Esta acción activará la habitación y permitirá la activación de las camas asociadas a ella.",
          camas:
            "Esta acción habilitará la cama para poder ser asignada a pacientes.",
          pacientes:
            "Esta acción activará al paciente y asignará automáticamente su cama asociada.",
          dietas:
            "Esta acción activará la dieta y permitirá asignarla a nuevos pacientes.",
          alergias:
            "Esta acción activará la alergia y permitirá asignarla a nuevos pacientes.",
        };
        return (
          <div style={{ fontSize: "14px", color: "#595959" }}>
            {activationMessages[type] ||
              "Esta acción cambiará el estado del elemento a activo."}
          </div>
        );
      }

      // Mensajes para desactivación de elementos
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
              <li>
                La habitación permanecerá en la base de datos como inactiva
              </li>
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
              <li>
                Los pacientes que ya la tienen asignada mantendrán el registro
              </li>
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
              <li>
                Los pacientes que ya la tienen asignada mantendrán el registro
              </li>
              <li>La alergia permanecerá en la base de datos como inactiva</li>
            </ul>
          </div>
        ),
      };
      return deactivationMessages[type];
    };

    return {
      title: getTitle(),
      content: getContent(),
    };
  };

  /**
   * Actualiza un elemento del sistema (servicio, habitación, cama o paciente)
   * @param {Object} item - Elemento a actualizar
   * @param {string} type - Tipo de elemento ('servicios', 'habitaciones', 'camas', 'pacientes')
   * @param {boolean} isActivating - True si se está activando, false si se está desactivando
   * @returns {Promise<Object>} Elemento actualizado con sus nuevas propiedades
   */
  const updateItem = async (item, type, isActivating) => {
    // Copia el elemento y actualiza su estado activo
    const updatedItem = { ...item, activo: isActivating };

    // Actualización específica para habitaciones
    if (type === "habitaciones") {
      let servicioId = item.servicio_id;
      // Busca el ID del servicio si solo se tiene el nombre
      if (!servicioId) {
        const servicio = servicios.find((s) => s.nombre === item.servicio);
        if (servicio) {
          servicioId = servicio.id;
        }
      }
      updatedItem.servicio_id = servicioId;
    }

    // Actualización específica para camas
    if (type === "camas") {
      const habitacion = habitaciones.find((h) => h.id === item.habitacion);
      // Verifica que la habitación esté activa
      if (!habitacion || !habitacion.activo) {
        alert(
          "No se puede activar la cama porque la habitación no está activa."
        );
        return;
      }
      updatedItem.habitacion_id = habitacion.id;
    }

    // Actualización específica para pacientes
    if (type === "pacientes") {
      // Si solo estamos cambiando el estado activo, enviamos solo ese campo
      if (Object.keys(updatedItem).length === 2 && 'activo' in updatedItem) {
        return { activo: updatedItem.activo };
      }

      const cama = item.cama ? item.cama : null;
      if (!cama) return;

      const habitacion = cama.habitacion ? cama.habitacion : null;
      if (!habitacion) return;

      const servicio = habitacion.servicio ? habitacion.servicio : null;
      if (!servicio) return;

      // Verifica que toda la jerarquía esté activa
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

      // Actualiza IDs de relaciones
      updatedItem.cama_id = cama.id;

      // Maneja alergias
      if (item.alergias_ids && Array.isArray(item.alergias_ids)) {
        updatedItem.alergias_ids = item.alergias_ids;
      } else if (item.alergias && Array.isArray(item.alergias)) {
        updatedItem.alergias_ids = item.alergias.map((alergia) =>
          typeof alergia === "object" ? alergia.id : alergia
        );
      } else {
        updatedItem.alergias_ids = [];
      }

      // Maneja dietas
      if (item.dietas_ids && Array.isArray(item.dietas_ids)) {
        updatedItem.dietas_ids = item.dietas_ids;
      } else if (item.dietas && Array.isArray(item.dietas)) {
        updatedItem.dietas_ids = item.dietas.map((dieta) =>
          typeof dieta === "object" ? dieta.id : dieta
        );
      } else {
        updatedItem.dietas_ids = [];
      }
    }

    return updatedItem;
  };

  /**
   * Maneja los errores mostrando una notificación
   * @param {Error} error - Error capturado
   */
  const handleError = (error) => {
    const errorMessage = error.response?.data?.detail || "Ha ocurrido un error";
    showNotification(
      "error",
      "Error",
      errorMessage
    );
  };

  /**
   * Reinicia el formulario de paciente a sus valores iniciales
   */
  const resetPacienteForm = () => {
    setNewPacienteID("");
    setNewPacienteName("");
    setSelectedCama(null);
    setNewRecommendedDiet([]);
    setNewAllergies([]);
    form.resetFields();
  };

  /**
   * Factory function para crear funciones de cierre de modales
   * @param {string} modalType - Tipo de modal ('servicio', 'habitacion', 'cama', etc.)
   * @returns {Function} Función que cierra el modal y limpia su estado
   */
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

  // Funciones de cierre para cada tipo de modal
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

  /**
   * Maneja la creación de un nuevo servicio
   * Valida y envía los datos del formulario al servidor
   */
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

  /**
   * Maneja la creación de una nueva habitación
   * Valida los campos requeridos y la asociación con un servicio
   */
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

  /**
   * Maneja la creación de una nueva cama
   * Valida los campos requeridos y la asociación con una habitación
   */
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

  /**
   * Maneja la creación de un nuevo paciente
   * Valida los campos obligatorios y opcionales antes de crear el registro
   */
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
        dietas_ids: newRecommendedDiet || [],
        alergias_ids: newAllergies || [],
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

  /**
   * Funciones para abrir los modales de creación
   */
  const openCreateServicioModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };
  const openCreateHabitacionModal = () => setIsHabitacionModalOpen(true);
  const openCreateCamaModal = () => setIsCamaModalOpen(true);
  const openCreatePacienteModal = () => {
    resetPacienteForm();
    setIsPacienteModalOpen(true);
  };
  const openDietaManagementModal = () => setIsDietaModalOpen(true);
  const openAlergiaManagementModal = () => setIsAlergiaModalOpen(true);

  /**
   * Maneja el cambio entre pestañas del panel
   * @param {string} activeKey - Identificador de la pestaña seleccionada
   */
  const handleTabChange = (activeKey) => {
    if (activeKey === "2" || activeKey === "3") {
      setSelectedServicio(null);
      setCurrentPage(1);
    }
  };

  /**
   * Inicia la edición de un servicio
   * @param {Object} service - Servicio a editar
   */
  const handleEditService = (service) => {
    setEditingService(service);
    form.setFieldsValue({ servicioName: service.nombre });
    setIsEditModalOpen(true);
  };

  /**
   * Actualiza un servicio existente
   * Valida y envía los datos actualizados al servidor
   */
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

  /**
   * Inicia la edición de una habitación
   * @param {Object} habitacion - Habitación a editar
   */
  const handleEditHabitacion = (habitacion) => {
    setEditingHabitacion(habitacion);
    const servicioId = habitacion.servicio?.id || habitacion.servicio_id;
    form.setFieldsValue({
      habitacionName: habitacion.nombre,
      servicioId: servicioId,
    });
    setIsEditHabitacionModalOpen(true);
  };

  /**
   * Actualiza una habitación existente
   * Valida y envía los datos actualizados al servidor
   */
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

  /**
   * Inicia la edición de una cama
   * @param {Object} cama - Cama a editar
   */
  const handleEditCama = (cama) => {
    setEditingCama(cama);
    form.setFieldsValue({ camaName: cama.nombre });
    setIsEditCamaModalOpen(true);
  };

  /**
   * Actualiza una cama existente
   * Valida y envía los datos actualizados al servidor
   */
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

  /**
   * Elimina una cama del sistema
   * Verifica que no tenga pacientes activos antes de eliminar
   * @param {Object} cama - Cama a eliminar
   */
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

  /**
   * Inicia la edición de un paciente
   * Verifica el estado de las dietas y alergias asociadas
   * @param {Object} paciente - Paciente a editar
   */
  const handleEditPaciente = (paciente) => {
    setEditingPaciente(paciente);

    // Verificaciones de estado para dietas y alergias
    if (paciente.dietas?.id) {
      const dietaActual = dietas.find(
        (d) => d.id === paciente.dietas.id
      );
      if (dietaActual && !dietaActual.activo) {
        message.warning(`La dieta "${dietaActual.nombre}" está inactiva`);
      }
    }

    if (paciente.alergias?.id) {
      const alergiaActual = alergias.find((a) => a.id === paciente.alergias.id);
      if (alergiaActual && !alergiaActual.activo) {
        message.warning(`La alergia "${alergiaActual.nombre}" está inactiva`);
      }
    }

    form.setFieldsValue({
      pacienteCedula: paciente.cedula,
      pacienteName: paciente.name,
      camaId: paciente.cama.id,
      recommendedDietId: paciente.dietas?.id,
      alergiasId: paciente.alergias?.id,
    });

    setIsEditPacienteModalOpen(true);
  };

  /**
   * Actualiza un paciente existente
   * Valida y envía los datos actualizados al servidor
   */
  const handleUpdatePaciente = async () => {
    try {
      const values = await form.validateFields();
      const updatedPaciente = {
        ...editingPaciente,
        cedula: values.pacienteCedula,
        name: values.pacienteName,
        cama_id: values.camaId,
        dietas_ids: values.recommendedDietId || [],
        alergias_ids: values.alergiasId || [],
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

  /**
   * Configuración de columnas para la tabla de servicios
   * @type {Array<Object>}
   */
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

  /**
   * Estados y efectos para el filtrado local de pacientes
   */
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

  /**
   * Manejadores de eventos para filtrado y búsqueda
   */
  const handleLocalSearch = (e) => setLocalSearchTerm(e.target.value);

  const handleLocalServiceSelect = (value) => {
    if (value) {
      const servicioSeleccionado = servicios.find((s) => s.id === value);
      setLocalSelectedService(servicioSeleccionado);
    } else {
      setLocalSelectedService(null);
    }
  };

  /**
   * Muestra una notificación en la interfaz
   * @param {string} type - Tipo de notificación ('success', 'error', 'warning', 'info')
   * @param {string} message - Título de la notificación
   * @param {string} description - Descripción detallada
   */
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
      message.error("Error al actualizar las alergias");
    }
  };

  /**
   * Componente principal del panel de gestión.
   * Renderiza un botón que abre un drawer con pestañas para gestionar diferentes elementos del sistema.
   */
  return (
    <div className="gestion-panel__container">
      {/* Botón principal para abrir el panel */}
      <Button
        className="gestion-panel__main-button"
        onClick={() => setIsDrawerOpen(true)}
        icon={<SettingOutlined />}
      >
        Panel de Gestión
      </Button>
      {/* Panel lateral con pestañas de gestión */}
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
          {/* Pestaña de Servicios - Solo visible para roles diferentes a jefe_enfermeria */}
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
          {/* Pestaña de Habitaciones - Gestiona la visualización y 
              manipulación de habitaciones y sus camas asociadas */}
          <TabPane tab="Habitaciones" key="2">
            {/* Contenedor de acciones principales */}
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

              {/* Filtro de habitaciones por servicio */}
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

            {/* Tabla de habitaciones con camas anidadas */}
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
                {
                  title: "Nombre",
                  dataIndex: "nombre",
                  key: "nombre",
                },
                {
                  title: "Servicio",
                  dataIndex: "servicio",
                  key: "servicio",
                  render: (servicio) =>
                    typeof servicio === "object" ? servicio.nombre : servicio,
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

            {/* Modal para crear nueva habitación */}
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

            {/* Modal para crear nueva cama */}
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
          {/* Pestaña de Pacientes - Gestiona la visualización y manipulación 
              de pacientes, dietas y alergias */}
          <TabPane tab="Pacientes" key="3">
            {/* Panel de acciones y filtros */}
            <div className="gestion-panel__actions-container">
              {/* Grupo de botones principales */}
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

              {/* Grupo de filtros */}
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
                    .filter((servicio) => servicio.activo)
                    .map((servicio) => (
                      <Option key={servicio.id} value={servicio.id}>
                        {servicio.nombre}
                      </Option>
                    ))}
                </Select>
              </div>
            </div>

            {/* Tabla de pacientes */}
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
                  dataIndex: "dietas",
                  key: "dietas",
                  width: 450,
                  render: (dietas) => {
                    if (!dietas || dietas.length === 0) return null;
                    return (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {Array.isArray(dietas) ? dietas.map((dieta, index) => (
                          <Tag color="blue" key={index}>
                            {typeof dieta === 'string' ? dieta : dieta.nombre}
                          </Tag>
                        )) : (
                          <Tag color="blue">{dietas}</Tag>
                        )}
                      </div>
                    );
                  }
                },
                {
                  title: "Alergias",
                  dataIndex: "alergias",
                  key: "alergias",
                  width: 400,
                  render: (alergias) => {
                    if (!alergias || alergias.length === 0) return null;
                    return (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {Array.isArray(alergias) ? alergias.map((alergia, index) => (
                          <Tag color="red" key={index}>
                            {typeof alergia === 'string' ? alergia : alergia.nombre}
                          </Tag>
                        )) : (
                          <Tag color="red">{alergias}</Tag>
                        )}
                      </div>
                    );
                  }
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
                {/* Campos de información básica */}
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

                {/* Asignación de cama */}
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

                {/* Asignación de dieta */}
                <Form.Item label="Dietas">
                  <Select
                    mode="multiple"
                    value={newRecommendedDiet}
                    onChange={(value) => setNewRecommendedDiet(value)}
                    placeholder="Seleccione las dietas"
                    style={{ width: "100%" }}
                  >
                    {dietas
                      .filter((dieta) => dieta.activo)
                      .map((dieta) => (
                        <Option key={`dieta-${dieta.id}`} value={dieta.id}>
                          {dieta.nombre}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item name="alergias_ids" label="Alergias">
                  <Select
                    mode="multiple"
                    value={newAllergies}
                    onChange={(value) => setNewAllergies(value)}
                    placeholder="Seleccione las alergias"
                    style={{ width: "100%" }}
                    allowClear
                    className="gestion-panel__select-multiple"
                  >
                    {/* Muestra solo alergias activas */}
                    {alergias
                      .filter((alergia) => alergia.activo)
                      .map((alergia) => (
                        <Option
                          key={`alergia-${alergia.id}`}
                          value={alergia.id}
                        >
                          {alergia.nombre}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modales de gestión de dietas y alergias */}
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

            {/* Modal para crear un nuevo paciente */}
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
                {/* Información básica del paciente */}
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

                {/* Asignación de cama */}
                <Form.Item label="Cama">
                  <Select
                    value={selectedCama}
                    onChange={(value) => setSelectedCama(value)}
                    placeholder="Seleccione una cama"
                  >
                    {/* Filtra y muestra solo camas activas y no ocupadas */}
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

                {/* Asignación de dieta */}
                <Form.Item label="Dieta Recomendada">
                  <Select
                    mode="multiple"
                    value={newRecommendedDiet}
                    onChange={(value) => setNewRecommendedDiet(value)}
                    placeholder="Seleccione las dietas"
                    style={{ width: "100%" }}
                    className="gestion-panel__select-multiple"
                  >
                    {/* Muestra solo dietas activas */}
                    {dietas
                      .filter((dieta) => dieta.activo)
                      .map((dieta) => (
                        <Option key={`dieta-${dieta.id}`} value={dieta.id}>
                          {dieta.nombre}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                {/* Asignación de alergias */}
                <Form.Item label="Alergias">
                  <Select
                    mode="multiple"
                    value={newAllergies}
                    onChange={(value) => setNewAllergies(value)}
                    placeholder="Seleccione las alergias"
                    style={{ width: "100%" }}
                    allowClear
                    className="gestion-panel__select-multiple"
                  >
                    {/* Muestra solo alergias activas */}
                    {alergias
                      .filter((alergia) => alergia.activo)
                      .map((alergia) => (
                        <Option
                          key={`alergia-${alergia.id}`}
                          value={alergia.id}
                        >
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
      {/* Modal para crear un nuevo servicio hospitalario */}
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
      {/* Modal para editar un servicio existente */}
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
      {/* Modal para editar una habitación - Permite modificar el nombre y reasignar el servicio */}
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
              { required: true, message: "Por favor seleccione un servicio" },
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
      {/* Modal para editar una cama - Permite modificar el nombre de la cama */}
      <Modal
        className="gestion-panel__modal gestion-panel__fade-in"
        title="Editar Cama"
        open={isEditCamaModalOpen}
        onOk={handleUpdateCama}
        onCancel={closeEditCamaModal}
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
