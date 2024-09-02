import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Input, Modal, Select, Pagination } from 'antd';
import { registerUser, getUsuarios } from '../services/api';
import '../styles/UserManagament.scss';

const { Option } = Select;

const UserManagement = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

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
            await registerUser(values);
            setVisible(false);
            form.resetFields();
            const updatedUsers = await getUsuarios();
            setUsuarios(updatedUsers);
        } catch (error) {
            console.error('Error creating user:', error);
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
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Rol', dataIndex: 'role', key: 'role' },
    ];

    return (
        <div className="user-management">
            <Button className="custom-button" type="primary" onClick={() => setVisible(true)}>
                Crear Usuario
            </Button>
            <div className="table-responsive">
                <Table
                    dataSource={paginatedUsuarios}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: '100%' }}  // Habilitamos el scroll horizontal
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
