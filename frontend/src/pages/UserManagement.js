import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Input, Modal, Select, Pagination } from 'antd';
import { registerUser, getUsuarios } from '../services/api';  // Asegúrate de tener estas funciones en tu API
import '../styles/UserManagament.scss'

const { Option } = Select;

const UserManagement = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);  // Número de registros por página

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await getUsuarios();
                setUsuarios(response);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    const handleCreateUser = async (values) => {
        try {
            console.log("Datos enviados:", values);  // Verifica los datos que se envían
            const response = await registerUser(values);
            console.log("Respuesta del servidor:", response);  // Muestra la respuesta del servidor si la creación fue exitosa
            setVisible(false);
            form.resetFields();
            const updatedUsers = await getUsuarios();
            setUsuarios(updatedUsers);
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.response) {
                console.error('Datos del error:', error.response.data);
                console.error('Estado del error:', error.response.status);
                console.error('Cabeceras del error:', error.response.headers);
            } else if (error.request) {
                console.error('Solicitud realizada pero sin respuesta:', error.request);
            } else {
                console.error('Error en la configuración de la solicitud:', error.message);
            }
        }
    };    

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsuarios = usuarios.slice(startIndex, startIndex + pageSize);

    const columns = [
        { title: 'Nombre', dataIndex: 'name', key: 'name' },
        { title: 'Cédula', dataIndex: 'cedula', key: 'cedula' },
        { title: 'Usuario', dataIndex: 'username', key: 'username' },
        { title: 'Email', dataIndex: 'email', key: 'email' },  // Asegúrate de que el email esté siendo capturado
        { title: 'Rol', dataIndex: 'role', key: 'role' },
    ];

    return (
        <div className="user-management">
            <Button className="custom-button" type="primary" onClick={() => setVisible(true)}>
                Crear Usuario
            </Button>
            <Table dataSource={paginatedUsuarios} columns={columns} loading={loading} rowKey="id" pagination={false} />

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
                visible={visible}
                onCancel={() => setVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleCreateUser} layout="vertical">
                    <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Por favor ingrese el nombre del usuario' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="cedula" label="Cédula" rules={[{ required: true, message: 'Por favor ingrese la cédula' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="username" label="Usuario" rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Por favor ingrese el email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Contraseña" rules={[{ required: true, message: 'Por favor ingrese la contraseña' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="role" label="Rol" rules={[{ required: true, message: 'Por favor seleccione un rol' }]}>
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
        </div>
    );
};

export default UserManagement;
