/**
 * Página de Gestión de Usuarios
 *
 * Permite administrar usuarios del sistema:
 * - Listado de usuarios con paginación
 * - Creación de nuevos usuarios
 * - Edición de usuarios existentes
 * - Activación/desactivación de usuarios
 * - Filtrado y búsqueda
 *
 * @component
 */

import React, { useState, useEffect } from "react";
import {
  Button, // Botones de acción
  Table, // Tabla de usuarios
  Form, // Formularios
  Input, // Campos de entrada
  Modal, // Ventanas modales
  Select, // Selectores
  Pagination, // Paginación
  notification, // Notificaciones
  Switch, // Interruptor de estado
  Tooltip, // Tooltips informativos
  App, // Contenedor principal de Ant Design
} from "antd";
import {
  InfoCircleOutlined, // Icono de información
  SearchOutlined, // Icono de búsqueda
  UserAddOutlined, // Icono de añadir usuario
  EditOutlined, // Icono de edición
} from "@ant-design/icons";
import { registerUser, getUsuarios, updateUser } from "../services/api";
import "../styles/UserManagament.scss";

// Desestructuración de componentes
const { Option } = Select;

/**
 * Modal para crear nuevos usuarios
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.visible - Controla la visibilidad del modal
 * @param {Function} props.onCancel - Función para cerrar el modal
 * @param {Function} props.onFinish - Función que maneja el envío del formulario
 * @param {Object} props.form - Instancia del formulario
 * @param {boolean} props.buttonLoading - Estado de carga del botón
 */
const CreateUserModal = ({
  visible,
  onCancel,
  onFinish,
  form,
  buttonLoading,
}) => (
  <Modal
    title="Crear Usuario"
    open={visible}
    onCancel={onCancel}
    footer={null}
    className="user-management__modal"
  >
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="name"
        label="Nombre"
        rules={[
          {
            required: true,
            message: "Por favor ingrese el nombre del usuario",
          },
        ]}
      >
        <Input id="name-create" />
      </Form.Item>
      <Form.Item
        name="cedula"
        label="Cédula"
        rules={[
          { required: true, message: "Por favor ingrese la cédula" },
          {
            pattern: /^[0-9]+$/,
            message: "La cédula solo debe contener números",
          },
        ]}
      >
        <Input id="cedula-create" />
      </Form.Item>
      <Form.Item
        name="username"
        label="Usuario"
        rules={[
          { required: true, message: "Por favor ingrese el nombre de usuario" },
          {
            min: 4,
            message: "El nombre de usuario debe tener al menos 4 caracteres",
          },
        ]}
      >
        <Input id="username-create" />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Por favor ingrese el email" },
          { type: "email", message: "Por favor ingrese un email válido" },
        ]}
      >
        <Input id="email-create" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Contraseña"
        rules={[
          { required: true, message: "Por favor ingrese la contraseña" },
        ]}
      >
        <Input.Password
          id="password-create"
          placeholder="Ingrese su contraseña"
          className="password-input"
          style={{ width: "100%" }}
        />
      </Form.Item>
      <Form.Item
        name="role"
        label="Rol"
        rules={[{ required: true, message: "Por favor seleccione un rol" }]}
      >
        <Select id="role-create" placeholder="Selecciona un rol">
          <Option value="admin">Administrador</Option>
          <Option value="coordinador">Coordinadora de Alimentos</Option>
          <Option value="auxiliar">Auxiliar de Cocina</Option>
          <Option value="jefe_enfermeria">Jefe de Enfermería</Option>
        </Select>
      </Form.Item>
      <div className="modal-button-container">
        <Button
          className="custom-button"
          type="primary"
          htmlType="submit"
          loading={buttonLoading}
        >
          Crear
        </Button>
      </div>
    </Form>
  </Modal>
);

/**
 * Componente principal de gestión de usuarios
 * @component
 */
const UserManagement = () => {
  const { modal } = App.useApp();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sortedInfo, setSortedInfo] = useState({});

  /**
   * Efecto para cargar usuarios al montar el componente
   */
  useEffect(() => {
    fetchUsuarios();
  }, []);

  /**
   * Obtiene la lista de usuarios del servidor
   */
  const fetchUsuarios = async () => {
    try {
      const response = await getUsuarios();
      setUsuarios(response);
    } catch (error) {
      notification.error({
        message: "Error al cargar usuarios",
        description:
          "No se pudieron cargar los usuarios. Por favor, intente nuevamente.",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la creación de un nuevo usuario
   * @param {Object} values - Datos del nuevo usuario
   */
  const handleCreateUser = async (values) => {
    setButtonLoading(true);
    try {
      const response = await registerUser(values);
      setVisible(false);
      form.resetFields();
      await fetchUsuarios();

      let description = "El usuario ha sido creado correctamente";
      if (response.is_reentry) {
        description = `El usuario ha sido registrado nuevamente como reingreso. 
                      Nombre de usuario asignado: ${response.username}`;
      }

      notification.success({
        message: "Usuario creado",
        description: description,
        placement: "topRight",
      });
    } catch (error) {
      notification.error({
        message: "Error al crear usuario",
        description:
          error.response?.data?.detail ||
          "Hubo un problema al intentar crear el usuario",
        placement: "topRight",
      });
    } finally {
      setButtonLoading(false);
    }
  };

  /**
   * Maneja la actualización de un usuario existente
   * @param {Object} values - Datos actualizados del usuario
   */
  const handleUpdateUser = async (values) => {
    if (editingUser.activo && !values.activo) {
      modal.confirm({
        title: "¿Estás seguro de desactivar este usuario?",
        content: "Esta acción puede afectar el acceso del usuario al sistema.",
        okText: "Sí, desactivar",
        cancelText: "No, cancelar",
        okButtonProps: {
          danger: true,
        },
        onOk: async () => {
          await processUpdate(values);
        },
      });
    } else {
      await processUpdate(values);
    }
  };

  /**
   * Procesa la actualización de un usuario
   * @param {Object} values - Datos actualizados del usuario
   */
  const processUpdate = async (values) => {
    setButtonLoading(true);
    try {
      await updateUser(editingUser.id, values);
      await fetchUsuarios();

      setIsEditModalVisible(false);
      notification.success({
        message: "Usuario actualizado",
        description: "El usuario ha sido actualizado correctamente",
        placement: "topRight",
      });
    } catch (error) {
      notification.error({
        message: "Error al actualizar usuario",
        description:
          error.response?.data?.message ||
          "Hubo un problema al actualizar el usuario",
        placement: "topRight",
      });
    } finally {
      setButtonLoading(false);
    }
  };

  /**
   * Muestra los detalles de un usuario
   * @param {Object} user - Usuario a mostrar
   */
  const handleViewDetails = (user) => {
    setEditingUser(user);
    setIsDetailsModalVisible(true);
  };

  /**
   * Inicia la edición de un usuario
   * @param {Object} user - Usuario a editar
   */
  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  /**
   * Maneja el cambio de página en la paginación
   * @param {number} page - Número de página
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Filtra usuarios basado en el texto de búsqueda
   * @type {Array}
   */
  const filteredUsers = usuarios.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  /**
   * Calcula los usuarios a mostrar en la página actual
   */
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsuarios = filteredUsers.slice(
    startIndex,
    startIndex + pageSize
  );

  /**
   * Configuración de columnas para la tabla de usuarios
   * @type {Array<Object>}
   */
  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      // Ordenamiento alfabético por nombre
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
    },
    {
      title: "Usuario",
      dataIndex: "username",
      key: "username",
      // Ordenamiento alfabético por nombre de usuario
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortOrder: sortedInfo.columnKey === "username" && sortedInfo.order,
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      // Ordenamiento alfabético por rol
      sorter: (a, b) => a.role.localeCompare(b.role),
      sortOrder: sortedInfo.columnKey === "role" && sortedInfo.order,
    },
    {
      title: "Acciones",
      key: "actions",
      /**
       * Renderiza los botones de acción para cada fila
       * @param {string} text - Texto de la celda (no usado)
       * @param {Object} record - Datos del usuario en la fila
       * @returns {JSX.Element} Botones de acción
       */
      render: (text, record) => (
        <div className="action-buttons">
          {/* Botón para ver detalles */}
          <Tooltip title="Ver detalles">
            <Button
              type="link"
              onClick={() => handleViewDetails(record)}
              aria-label="Ver detalles del usuario"
            >
              <InfoCircleOutlined />
            </Button>
          </Tooltip>

          {/* Botón para editar usuario */}
          <Tooltip title="Editar usuario">
            <Button
              type="link"
              onClick={() => handleEditUser(record)}
              aria-label="Editar usuario"
            >
              <EditOutlined />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  /**
   * Abre el modal de creación de usuario y resetea el formulario
   */
  const handleOpenCreateModal = () => {
    form.resetFields();
    setVisible(true);
  };

  /**
   * Renderizado principal del componente
   * @returns {JSX.Element} Interfaz de gestión de usuarios
   */
  return (
    <div className="user-management">
      <div className="user-management__container">
        {/* Controles superiores: búsqueda y botón de crear */}
        <div className="user-management__controls">
          <Input
            placeholder="Buscar usuario..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
            aria-label="Buscar usuario"
          />
          <Button
            className="user-management__button"
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleOpenCreateModal}
            aria-label="Crear nuevo usuario"
          >
            Crear Usuario
          </Button>
        </div>

        {/* Tabla de usuarios */}
        <div className="user-management__table">
          <Table
            dataSource={paginatedUsuarios.filter((user) => user.activo)}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={false}
            scroll={{ x: "100%" }}
            onChange={(pagination, filters, sorter) => {
              setSortedInfo(sorter);
            }}
            aria-label="Tabla de usuarios"
          />
        </div>

        {/* Paginación */}
        <Pagination
          className="pagination"
          current={currentPage}
          pageSize={pageSize}
          total={filteredUsers.length}
          onChange={handlePageChange}
          showSizeChanger={false}
          hideOnSinglePage
          aria-label="Paginación de usuarios"
        />

        {/* Modal de creación de usuario */}
        <CreateUserModal
          visible={visible}
          onCancel={() => {
            form.resetFields();
            setVisible(false);
          }}
          onFinish={handleCreateUser}
          form={form}
          buttonLoading={buttonLoading}
        />

        {/* Modal de detalles de usuario */}
        <Modal
          title="Detalles del Usuario"
          open={isDetailsModalVisible}
          onCancel={() => setIsDetailsModalVisible(false)}
          footer={null}
          className="user-management__modal"
        >
          <div className="user-details">
            <p>
              <strong>Nombre:</strong> {editingUser?.name}
            </p>
            <p>
              <strong>Cédula:</strong> {editingUser?.cedula}
            </p>
            <p>
              <strong>Usuario:</strong> {editingUser?.username}
            </p>
            <p>
              <strong>Email:</strong> {editingUser?.email}
            </p>
            <p>
              <strong>Ingresos:</strong>{" "}
              {editingUser?.ingreso_count
                ? editingUser.ingreso_count === 1
                  ? "Primera vez"
                  : `${editingUser.ingreso_count}° ingreso`
                : "No disponible"}
            </p>
            <p>
              <strong>Rol:</strong> {editingUser?.role}
            </p>
            <Button
              className="custom-button"
              type="primary"
              onClick={() => handleEditUser(editingUser)}
              icon={<EditOutlined />}
              aria-label="Editar usuario"
            >
              Editar
            </Button>
          </div>
        </Modal>

        {/* Modal de edición de usuario */}
        <Modal
          title="Editar Usuario"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          className="user-management__modal"
        >
          <Form
            form={form}
            onFinish={handleUpdateUser}
            layout="vertical"
            aria-label="Formulario de edición de usuario"
          >
            {/* Campos del formulario de edición */}
            <Form.Item name="name" label="Nombre">
              <Input aria-label="Nombre del usuario" />
            </Form.Item>
            <Form.Item name="cedula" label="Cédula">
              <Input aria-label="Cédula del usuario" />
            </Form.Item>
            <Form.Item name="username" label="Usuario">
              <Input aria-label="Nombre de usuario" />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input aria-label="Email del usuario" />
            </Form.Item>
            <Form.Item name="role" label="Rol">
              <Select aria-label="Rol del usuario">
                <Option value="admin">Administrador</Option>
                <Option value="coordinador">Coordinador</Option>
                <Option value="auxiliar">Auxiliar</Option>
                <Option value="jefe_enfermeria">Jefe de Enfermería</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="password"
              label="Contraseña"
            >
              <Input.Password
                placeholder="Dejar en blanco para mantener la actual"
                aria-label="Contraseña del usuario"
              />
            </Form.Item>
            <Form.Item name="activo" label="Estado" valuePropName="checked">
              <Switch
                checkedChildren="Activo"
                unCheckedChildren="Inactivo"
                aria-label="Estado del usuario"
              />
            </Form.Item>
            <div className="modal-button-container">
              <Button
                className="custom-button"
                type="primary"
                htmlType="submit"
                loading={buttonLoading}
                aria-label="Actualizar usuario"
              >
                Actualizar
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default UserManagement;