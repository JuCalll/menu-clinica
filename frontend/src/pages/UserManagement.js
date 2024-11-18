import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Form,
  Input,
  Modal,
  Select,
  Pagination,
  notification,
  Switch,
  Tooltip,
  App
} from "antd";
import { 
  InfoCircleOutlined, 
  SearchOutlined, 
  UserAddOutlined,
  EditOutlined 
} from "@ant-design/icons";
import { registerUser, getUsuarios, updateUser } from "../services/api";
import "../styles/UserManagament.scss";

const { Option } = Select;

// Componentes modales separados
const CreateUserModal = ({ visible, onCancel, onFinish, form, buttonLoading }) => (
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
        rules={[{ required: true, message: "Por favor ingrese el nombre del usuario" }]}
      >
        <Input id="name-create" />
      </Form.Item>
      <Form.Item
        name="cedula"
        label="Cédula"
        rules={[
          { required: true, message: "Por favor ingrese la cédula" },
          { pattern: /^[0-9]+$/, message: "La cédula solo debe contener números" }
        ]}
      >
        <Input id="cedula-create" />
      </Form.Item>
      <Form.Item
        name="username"
        label="Usuario"
        rules={[
          { required: true, message: "Por favor ingrese el nombre de usuario" },
          { min: 4, message: "El nombre de usuario debe tener al menos 4 caracteres" }
        ]}
      >
        <Input id="username-create" />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Por favor ingrese el email" },
          { type: 'email', message: "Por favor ingrese un email válido" }
        ]}
      >
        <Input id="email-create" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Contraseña"
        rules={[
          { required: true, message: "Por favor ingrese la contraseña" },
          { min: 8, message: "La contraseña debe tener al menos 8 caracteres" },
          {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            message: "La contraseña debe contener al menos una letra y un número"
          }
        ]}
        extra="La contraseña debe tener al menos 8 caracteres, una letra y un número"
      >
        <Input.Password 
          id="password-create"
          placeholder="Ingrese su contraseña"
          className="password-input"
          style={{ width: '100%' }}
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
  const [searchText, setSearchText] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await getUsuarios();
      setUsuarios(response);
    } catch (error) {
      notification.error({
        message: "Error al cargar usuarios",
        description: "No se pudieron cargar los usuarios. Por favor, intente nuevamente.",
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values) => {
    setButtonLoading(true);
    try {
      console.log('Payload a enviar:', values);
      
      const response = await registerUser(values);
      console.log('Respuesta del servidor:', response);

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
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Detalles del error:', error.response?.data);
      
      notification.error({
        message: "Error al crear usuario",
        description: error.response?.data?.detail || "Hubo un problema al intentar crear el usuario",
        placement: 'topRight',
      });
    } finally {
      setButtonLoading(false);
    }
  };

  const handleUpdateUser = async (values) => {
    if (editingUser.activo && !values.activo) {
      modal.confirm({
        title: '¿Estás seguro de desactivar este usuario?',
        content: 'Esta acción puede afectar el acceso del usuario al sistema.',
        okText: 'Sí, desactivar',
        cancelText: 'No, cancelar',
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

  const processUpdate = async (values) => {
    setButtonLoading(true);
    try {
      console.log('Payload de actualización:', values);
      console.log('Usuario siendo editado:', editingUser);
      
      await updateUser(editingUser.id, values);
      const response = await fetchUsuarios();
      console.log('Respuesta después de actualizar:', response);
      
      setIsEditModalVisible(false);
      notification.success({
        message: "Usuario actualizado",
        description: "El usuario ha sido actualizado correctamente",
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Detalles del error:', error.response?.data);
      
      notification.error({
        message: "Error al actualizar usuario",
        description: error.response?.data?.message || "Hubo un problema al actualizar el usuario",
        placement: 'topRight',
      });
    } finally {
      setButtonLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setEditingUser(user);
    setIsDetailsModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredUsers = usuarios.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsuarios = filteredUsers.slice(startIndex, startIndex + pageSize);

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    {
      title: "Usuario",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortOrder: sortedInfo.columnKey === 'username' && sortedInfo.order,
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      sorter: (a, b) => a.role.localeCompare(b.role),
      sortOrder: sortedInfo.columnKey === 'role' && sortedInfo.order,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text, record) => (
        <div className="action-buttons">
          <Tooltip title="Ver detalles">
            <Button type="link" onClick={() => handleViewDetails(record)}>
              <InfoCircleOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="Editar usuario">
            <Button type="link" onClick={() => handleEditUser(record)}>
              <EditOutlined />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleOpenCreateModal = () => {
    form.resetFields();
    setVisible(true);
  };

  return (
    <div className="user-management">
      <div className="user-management__container">
        <div className="user-management__controls">
          <Input
            placeholder="Buscar usuario..."
            prefix={<SearchOutlined />}
            onChange={e => setSearchText(e.target.value)}
            className="search-input"
          />
          <Button
            className="user-management__button"
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleOpenCreateModal}
          >
            Crear Usuario
          </Button>
        </div>

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
          />
        </div>

        <Pagination
          className="pagination"
          current={currentPage}
          pageSize={pageSize}
          total={filteredUsers.length}
          onChange={handlePageChange}
          showSizeChanger={false}
          hideOnSinglePage
        />

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
                ? (editingUser.ingreso_count === 1 
                    ? "Primera vez" 
                    : `${editingUser.ingreso_count}° ingreso`)
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
            >
              Editar
            </Button>
          </div>
        </Modal>

        <Modal
          title="Editar Usuario"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          className="user-management__modal"
        >
          <Form form={form} onFinish={handleUpdateUser} layout="vertical">
            <Form.Item name="name" label="Nombre">
              <Input />
            </Form.Item>
            <Form.Item name="cedula" label="Cédula">
              <Input />
            </Form.Item>
            <Form.Item name="username" label="Usuario">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>
            <Form.Item name="role" label="Rol">
              <Select>
                <Option value="admin">Administrador</Option>
                <Option value="coordinador">Coordinador</Option>
                <Option value="auxiliar">Auxiliar</Option>
                <Option value="jefe_enfermeria">Jefe de Enfermería</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                {
                  pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                  message: "La contraseña debe contener al menos una letra y un número",
                },
              ]}
            >
              <Input.Password placeholder="Dejar en blanco para mantener la actual" />
            </Form.Item>
            <Form.Item
              name="activo"
              label="Estado"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Activo"
                unCheckedChildren="Inactivo"
              />
            </Form.Item>
            <div className="modal-button-container">
              <Button
                className="custom-button"
                type="primary"
                htmlType="submit"
                loading={buttonLoading}
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
