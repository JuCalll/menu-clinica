import React, { useState } from "react";
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

const { TabPane } = Tabs;
const { Option } = Select;

const GestionPanel = ({ pacientes, servicios, habitaciones, dietas, refreshData }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHabitacionModalOpen, setIsHabitacionModalOpen] = useState(false);
  const [isCamaModalOpen, setIsCamaModalOpen] = useState(false);
  const [isPacienteModalOpen, setIsPacienteModalOpen] = useState(false);
  const [isDietaModalOpen, setIsDietaModalOpen] = useState(false);
  const [newServicioName, setNewServicioName] = useState("");
  const [newHabitacionName, setNewHabitacionName] = useState("");
  const [newCamaName, setNewCamaName] = useState("");
  const [newPacienteID, setNewPacienteID] = useState("");
  const [newPacienteName, setNewPacienteName] = useState("");
  const [newRecommendedDiet, setNewRecommendedDiet] = useState("");
  const [newAllergies, setNewAllergies] = useState("");
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedHabitacion, setSelectedHabitacion] = useState(null);
  const [selectedCama, setSelectedCama] = useState(null);

  const userRole = localStorage.getItem("role");

  const toggleActivo = async (item, type) => {
    const showConfirm = (isActivating) => {
      let title = "";
      let content = "";

      if (isActivating) {
        switch (type) {
          case "servicios":
            title = "¿Estás seguro de que deseas activar este servicio?";
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

      Modal.confirm({
        title: title,
        content: content,
        onOk: async () => {
          try {
            console.log("Datos antes de actualizar:", item);

            const updatedItem = { ...item, activo: !item.activo };

            if (type === "habitaciones") {
              let servicioId = item.servicio_id;
              if (!servicioId) {
                const servicio = servicios.find(
                  (s) => s.nombre === item.servicio
                );
                if (servicio) {
                  servicioId = servicio.id;
                }
              }
              updatedItem.servicio_id = servicioId;
              console.log("Servicio ID extraído:", updatedItem.servicio_id);
            }

            if (type === "camas") {
              const habitacion = habitaciones.find(
                (h) => h.id === item.habitacion
              );
              console.log("Habitación encontrada:", habitacion);
              if (!habitacion || !habitacion.activo) {
                alert(
                  "No se puede activar la cama porque la habitación no está activa."
                );
                return;
              }

              updatedItem.habitacion_id = habitacion.id;
              console.log("Habitación ID extraído:", updatedItem.habitacion_id);
            }

            if (type === "pacientes") {
              const cama = item.cama ? item.cama : null;
              console.log("Cama obtenida:", cama);

              if (!cama) {
                console.error(
                  "Error: No se encontró la cama asociada al paciente."
                );
                return;
              }

              const habitacion = cama.habitacion ? cama.habitacion : null;
              console.log("Habitación obtenida desde cama:", habitacion);

              if (!habitacion) {
                console.error(
                  "Error: No se encontró la habitación asociada a la cama."
                );
                return;
              }

              const servicio = habitacion.servicio ? habitacion.servicio : null;
              console.log("Servicio obtenido desde habitación:", servicio);

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
                habitacion.activo !== undefined
                  ? habitacion.activo
                  : "no definido";
              const servicioActivo =
                servicio.activo !== undefined ? servicio.activo : "no definido";

              console.log("Estado de cama:", camaActiva);
              console.log("Estado de habitación:", habitacionActiva);
              console.log("Estado de servicio:", servicioActivo);

              if (!camaActiva || !habitacionActiva || !servicioActivo) {
                alert(
                  "No se puede activar el paciente porque la cama, habitación o servicio no están activos."
                );
                return;
              }

              updatedItem.cama_id = cama.id;
              console.log("Cama ID extraído:", updatedItem.cama_id);

              // Verificación y extracción correcta del ID de la dieta recomendada
              if (item.recommended_diet && item.recommended_diet.id) {
                updatedItem.recommended_diet_id = item.recommended_diet.id;
              } else if (
                item.recommended_diet &&
                typeof item.recommended_diet === "string"
              ) {
                const dieta = dietas.find(
                  (d) => d.nombre === item.recommended_diet
                );
                updatedItem.recommended_diet_id = dieta ? dieta.id : null;
              } else {
                updatedItem.recommended_diet_id = null;
              }

              console.log(
                "Recommended Diet ID extraído:",
                updatedItem.recommended_diet_id
              );
            }

            const response = await api.put(`/${type}/${item.id}/`, updatedItem);
            console.log("Respuesta del backend:", response.data);
            refreshData();
          } catch (error) {
            if (error.response && error.response.status === 400) {
              const errorMessage =
                error.response.data.detail ||
                "No se puede activar el paciente debido a restricciones en la lógica de activación.";
              alert(`Error: ${errorMessage}`);
            } else {
              console.error(
                "Error toggling activo:",
                error.response ? error.response.data : error
              );
            }
          }
        },
        onCancel() {
          console.log("Acción cancelada por el usuario");
        },
      });
    };

    if (item.activo) {
      showConfirm(false);
    } else {
      showConfirm(true);
    }
  };

  const handleCreateServicio = async () => {
    if (!newServicioName) {
      notification.error({
        message: "Error",
        description: "El nombre del servicio es obligatorio",
      });
      return;
    }

    try {
      await createServicio({ nombre: newServicioName });
      notification.success({ message: "Servicio creado exitosamente" });
      setIsModalOpen(false);
      setNewServicioName("");
      refreshData();
    } catch (error) {
      notification.error({
        message: "Error al crear el servicio",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleCreateHabitacion = async () => {
    if (!newHabitacionName || !selectedServicio) {
      notification.error({
        message: "Error",
        description:
          "El nombre de la habitación y la selección de un servicio son obligatorios",
      });
      return;
    }

    try {
      const payload = {
        nombre: newHabitacionName,
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
    if (!newCamaName || !selectedHabitacion) {
      notification.error({
        message: "Error",
        description:
          "El nombre de la cama y la selección de una habitación son obligatorios",
      });
      return;
    }

    try {
      const payload = {
        nombre: newCamaName,
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

  const openCreateServicioModal = () => setIsModalOpen(true);
  const closeCreateServicioModal = () => setIsModalOpen(false);
  const openCreateHabitacionModal = () => setIsHabitacionModalOpen(true);
  const closeCreateHabitacionModal = () => setIsHabitacionModalOpen(false);
  const openCreateCamaModal = () => setIsCamaModalOpen(true);
  const closeCreateCamaModal = () => setIsCamaModalOpen(false);
  const openCreatePacienteModal = () => setIsPacienteModalOpen(true);
  const closeCreatePacienteModal = () => setIsPacienteModalOpen(false);
  const openDietaManagementModal = () => setIsDietaModalOpen(true);
  const closeDietaManagementModal = () => setIsDietaModalOpen(false);

  return (
    <>
      <Button className="custom-button" onClick={() => setIsDrawerOpen(true)}>
        Panel de Gestión
      </Button>

      <Drawer
        title="Gestión de Datos"
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={600}
      >
        <Tabs defaultActiveKey="1">
          {userRole !== "jefe_enfermeria" && (
            <TabPane tab="Servicios" key="1">
              <Button
                className="custom-button"
                onClick={openCreateServicioModal}
                style={{ marginBottom: "20px" }}
              >
                Crear Servicio
              </Button>
              <Table
                dataSource={servicios}
                columns={[
                  { title: "Nombre", dataIndex: "nombre", key: "nombre" },
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
                ]}
                rowKey="id"
                scroll={{ x: 10 }}
              />

              <Modal
                title="Crear Nuevo Servicio"
                open={isModalOpen}
                onOk={handleCreateServicio}
                onCancel={closeCreateServicioModal}
                okText="Crear"
                cancelText="Cancelar"
              >
                <Form layout="vertical">
                  <Form.Item label="Nombre del Servicio">
                    <Input
                      value={newServicioName}
                      onChange={(e) => setNewServicioName(e.target.value)}
                      placeholder="Ingrese el nombre del servicio"
                    />
                  </Form.Item>
                </Form>
              </Modal>
            </TabPane>
          )}

          {userRole !== "jefe_enfermeria" && (
            <TabPane tab="Habitaciones" key="2">
              <Button
                className="custom-button"
                onClick={openCreateHabitacionModal}
                style={{ marginBottom: "20px" }}
              >
                Crear Habitación
              </Button>
              <Button
                className="custom-button"
                onClick={openCreateCamaModal}
                style={{ marginBottom: "20px" }}
              >
                Crear Cama
              </Button>
              <Table
                dataSource={habitaciones}
                columns={[
                  { title: "Nombre", dataIndex: "nombre", key: "nombre" },
                  {
                    title: "Servicio",
                    dataIndex: "servicio",
                    key: "servicio",
                  },
                  {
                    title: "Camas",
                    key: "camas",
                    render: (_, habitacion) => (
                      <ul>
                        {habitacion.camas.map((cama) => (
                          <li key={cama.id}>
                            {cama.nombre}
                            <Switch
                              checked={cama.activo}
                              onChange={() => toggleActivo(cama, "camas")}
                              style={{ marginLeft: 8 }}
                            />
                          </li>
                        ))}
                      </ul>
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
                rowKey="id"
                scroll={{ x: 10 }}
              />

              <Modal
                title="Crear Nueva Habitación"
                open={isHabitacionModalOpen}
                onOk={handleCreateHabitacion}
                onCancel={closeCreateHabitacionModal}
                okText="Crear"
                cancelText="Cancelar"
              >
                <Form layout="vertical">
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
                title="Crear Nueva Cama"
                open={isCamaModalOpen}
                onOk={handleCreateCama}
                onCancel={closeCreateCamaModal}
                okText="Crear"
                cancelText="Cancelar"
              >
                <Form layout="vertical">
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
          )}

          <TabPane tab="Pacientes" key="3">
            <Button
              className="custom-button"
              onClick={openCreatePacienteModal}
              style={{ marginBottom: "20px" }}
            >
              Crear Paciente
            </Button>

            <Button
              className="custom-button"
              onClick={openDietaManagementModal}
              style={{ marginBottom: "20px" }}
            >
              Gestionar Dietas
            </Button>
            <DietaManagementModal
              visible={isDietaModalOpen}
              onClose={closeDietaManagementModal}
              dietas={dietas}
              refreshData={refreshData}
            />

            <Table
              dataSource={pacientes}
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
                {
                  title: "Alergias",
                  dataIndex: "alergias",
                  key: "alergias",
                },
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
              rowKey="id"
              scroll={{ x: 10 }}
            />

            <Modal
              title="Crear Nuevo Paciente"
              open={isPacienteModalOpen}
              onOk={handleCreatePaciente}
              onCancel={closeCreatePacienteModal}
              okText="Crear"
              cancelText="Cancelar"
            >
              <Form layout="vertical">
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
                        <Option key={cama.id} value={cama.id}>
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
                      <Option key={dieta.id} value={dieta.id}>
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
    </>
  );
};

export default GestionPanel;
