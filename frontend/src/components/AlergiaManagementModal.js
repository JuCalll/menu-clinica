import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Form, Popconfirm, message } from 'antd';
import { getAlergias, createAlergia, updateAlergia, deleteAlergia } from '../services/api'; 
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const AlergiaManagementModal = ({ visible, onClose }) => {
  const [alergias, setAlergias] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAlergia, setEditingAlergia] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      fetchAlergias();
    }
  }, [visible]);

  const fetchAlergias = async () => {
    try {
      const data = await getAlergias();
      setAlergias(data);
    } catch (error) {
      message.error('Error al cargar las alergias');
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingAlergia(null);
    form.resetFields();
  };

  const handleEdit = (alergia) => {
    setIsEditing(true);
    setEditingAlergia(alergia);
    form.setFieldsValue(alergia);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlergia(id);
      message.success('Alergia eliminada');
      fetchAlergias();
    } catch (error) {
      message.error('Error al eliminar la alergia');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingAlergia) {
        await updateAlergia(editingAlergia.id, values);
        message.success('Alergia actualizada');
      } else {
        await createAlergia(values);
        message.success('Alergia creada');
      }
      setIsEditing(false);
      fetchAlergias();
    } catch (error) {
      message.error('Error al guardar la alergia');
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
            title="¿Seguro que deseas eliminar esta alergia?"
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
      title="Gestión de Alergias"
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
          Añadir Alergia
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={alergias}
        rowKey="id"
        pagination={false}
      />
      <Modal
        open={isEditing}
        title={editingAlergia ? 'Editar Alergia' : 'Crear Alergia'}
        onCancel={() => setIsEditing(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre de la Alergia"
            rules={[{ required: true, message: 'Por favor, introduce el nombre de la alergia' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="descripcion"
            label="Descripción de la Alergia"
            rules={[{ required: false, message: 'Por favor, introduce la descripción de la alergia' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default AlergiaManagementModal;