import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Form, Popconfirm, message } from 'antd';
import { getDietas, createDieta, updateDieta, deleteDieta } from '../services/api'; 
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const DietaManagementModal = ({ visible, onClose }) => {
  const [dietas, setDietas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDieta, setEditingDieta] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      fetchDietas();
    }
  }, [visible]);

  const fetchDietas = async () => {
    try {
      const data = await getDietas();
      setDietas(data);
    } catch (error) {
      message.error('Error al cargar las dietas');
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingDieta(null);
    form.resetFields();
  };

  const handleEdit = (dieta) => {
    setIsEditing(true);
    setEditingDieta(dieta);
    form.setFieldsValue(dieta);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDieta(id);
      message.success('Dieta eliminada');
      fetchDietas();
    } catch (error) {
      message.error('Error al eliminar la dieta');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingDieta) {
        await updateDieta(editingDieta.id, values);
        message.success('Dieta actualizada');
      } else {
        await createDieta(values);
        message.success('Dieta creada');
      }
      setIsEditing(false);
      fetchDietas();
    } catch (error) {
      message.error('Error al guardar la dieta');
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="gestion-panel__cama-actions">
          <Button
            type="link"
            onClick={() => handleEdit(record)}
            className="gestion-panel__edit-button"
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            title="¿Seguro que deseas eliminar esta dieta?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="link"
              className="gestion-panel__delete-button"
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      title="Gestión de Dietas"
      onCancel={onClose}
      footer={null}
      width={600}
      className="gestion-panel__modal gestion-panel__fade-in"
    >
      <div className="gestion-panel__actions-container">
        <Button 
          className="gestion-panel__button"
          onClick={handleAdd} 
          style={{ width: '100%' }}
        >
          Añadir Dieta
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dietas}
        rowKey="id"
        pagination={false}
      />
      <Modal
        open={isEditing}
        title={editingDieta ? 'Editar Dieta' : 'Crear Dieta'}
        onCancel={() => setIsEditing(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre de la Dieta"
            rules={[{ required: true, message: 'Por favor, introduce el nombre de la dieta' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="descripcion"
            label="Descripción de la Dieta"
            rules={[{ required: false, message: 'Por favor, introduce la descripción de la dieta' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default DietaManagementModal;
