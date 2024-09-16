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
} from "antd";
import { registerUser, getUsuarios, updateUser } from "../services/api";
import { InfoCircleOutlined } from "@ant-design/icons"; // Importar ícono
import "../styles/UserManagament.scss";

const { Option } = Select;

const UserManagement = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false); // Modal para detalles
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Modal para editar
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await getUsuarios();
        setUsuarios(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  // Manejo para crear usuario
  const handleCreateUser = async (values) => {
    try {
      const existingUsers = await getUsuarios();
      const emailExists = existingUsers.some(
        (user) => user.email === values.email
      );
      const usernameExists = existingUsers.some(
        (user) => user.username === values.username
      );
      const cedulaExists = existingUsers.some(
        (user) => user.cedula === values.cedula
      );

      if (emailExists || usernameExists || cedulaExists) {
        notification.error({
          message: "Error al crear usuario",
          description: "El email, nombre de usuario o cédula ya está en uso",
        });
        return;
      }

      await registerUser(values);
      setVisible(false);
      form.resetFields();
      const updatedUsers = await getUsuarios();
      setUsuarios(updatedUsers);
      notification.success({
        message: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      notification.error({
        message: "Error al crear usuario",
        description: "Hubo un problema al intentar crear el usuario",
      });
    }
  };

  // Manejar la visualización de detalles del usuario
  const handleViewDetails = (user) => {
    setEditingUser(user);
    setIsDetailsModalVisible(true);
  };

  // Función para editar el usuario
  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  const handleUpdateUser = async (values) => {
    console.log("Datos enviados al actualizar:", values); // Log de los datos enviados
    try {
      await updateUser(editingUser.id, values); // Actualizar en la base de datos
      const updatedUsers = await getUsuarios();
      setUsuarios(updatedUsers);
      notification.success({
        message: "Usuario actualizado",
        description: "El usuario ha sido actualizado correctamente",
      });
      setIsEditModalVisible(false); // Cerrar el modal después de la actualización
    } catch (error) {
      console.error(
        "Error actualizando el usuario:",
        error.response ? error.response.data : error.message
      ); // Log más detallado
      notification.error({
        message: "Error al actualizar el usuario",
        description: "Hubo un problema al intentar actualizar el usuario",
      });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsuarios = usuarios.slice(startIndex, startIndex + pageSize);

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "Usuario", dataIndex: "username", key: "username" },
    { title: "Rol", dataIndex: "role", key: "role" },
    {
      title: "",
      key: "actions",
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewDetails(record)}>
          <InfoCircleOutlined /> {/* Ícono para abrir los detalles */}
        </Button>
      ),
    },
  ];

  return (
    <div className="user-management">
      <Button
        className="custom-button"
        type="primary"
        onClick={() => setVisible(true)}
      >
        Crear Usuario
      </Button>
      <div className="table-responsive">
        <Table
          dataSource={paginatedUsuarios.filter((user) => user.activo)}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={false}
          scroll={{ x: "100%" }}
        />
      </div>

      <Pagination
        className="pagination"
        current={currentPage}
        pageSize={pageSize}
        total={usuarios.length}
        onChange={handlePageChange}
        showSizeChanger={false}
        hideOnSinglePage
      />

      <Modal
        title="Crear Usuario"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateUser} layout="vertical">
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
            <Input />
          </Form.Item>
          <Form.Item
            name="cedula"
            label="Cédula"
            rules={[{ required: true, message: "Por favor ingrese la cédula" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Usuario"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el nombre de usuario",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Por favor ingrese el email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: "Por favor ingrese la contraseña" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: "Por favor seleccione un rol" }]}
          >
            <Select placeholder="Selecciona un rol">
              <Option value="admin">Administrador</Option>
              <Option value="coordinador">Coordinadora de Alimentos</Option>
              <Option value="auxiliar">Auxiliar de Cocina</Option>
              <Option value="jefe_enfermeria">Jefe de Enfermería</Option>
            </Select>
          </Form.Item>
          <Button className="custom-button" type="primary" htmlType="submit">
            Crear
          </Button>
        </Form>
      </Modal>

      {/* Modal para ver los detalles del usuario */}
      <Modal
        title="Detalles del Usuario"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
      >
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
          {editingUser?.ingreso_count > 1 ? "Nuevo ingreso" : "Primera vez"}
        </p>
        <p>
          <strong>Rol:</strong> {editingUser?.role}
        </p>
        <Button type="primary" onClick={() => handleEditUser(editingUser)}>
          Editar
        </Button>
      </Modal>

      {/* Modal para editar el usuario */}
      <Modal
        title="Editar Usuario"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
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
            rules={[{ required: false }]}
          >
            <Input.Password placeholder="Dejar en blanco para mantener la actual" />
          </Form.Item>
          <Form.Item name="activo" label="Estado" valuePropName="checked">
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
          </Form.Item>
          <Button className="custom-button" type="primary" htmlType="submit">
            Actualizar
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
