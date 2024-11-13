import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Form, Popconfirm, message, Switch } from 'antd';
import { getDietas, createDieta, updateDieta, deleteDieta } from '../services/api'; 
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const DietaManagementModal = ({ visible, onClose, refreshData }) => {
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
      await fetchDietas();
      refreshData();
    } catch (error) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Error al eliminar la dieta');
      }
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const nombreExiste = dietas.some(
        d => d.nombre.toLowerCase() === values.nombre.toLowerCase() && 
            (!editingDieta || d.id !== editingDieta.id)
      );
      
      if (nombreExiste) {
        message.error('Ya existe una dieta con ese nombre');
        return;
      }
      if (editingDieta) {
        await updateDieta(editingDieta.id, {
          ...values,
          activo: editingDieta.activo
        });
        message.success('Dieta actualizada');
      } else {
        await createDieta({
          ...values,
          activo: true
        });
        message.success('Dieta creada');
      }
      setIsEditing(false);
      form.resetFields();
      await fetchDietas();
      refreshData();
    } catch (error) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Error al guardar la dieta');
      }
    }
  };

  const toggleActivo = async (dieta) => {
    try {
      const payload = {
        nombre: dieta.nombre,
        descripcion: dieta.descripcion,
        activo: !dieta.activo
      };
      await updateDieta(dieta.id, payload);
      message.success(`Dieta ${dieta.activo ? 'desactivada' : 'activada'}`);
      await fetchDietas();
      refreshData();
    } catch (error) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Error al cambiar el estado de la dieta');
      }
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Activo',
      dataIndex: 'activo',
      key: 'activo',
      render: (text, record) => (
        <Switch 
          checked={record.activo} 
          onChange={() => toggleActivo(record)}
        />
      ),
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
      title={isEditing ? (editingDieta ? 'Editar Dieta' : 'Crear Dieta') : 'Gestión de Dietas'}
      onCancel={isEditing ? () => setIsEditing(false) : onClose}
      onOk={isEditing ? handleSave : null}
      footer={!isEditing ? null : undefined}
      width={600}
      className="gestion-panel__modal gestion-panel__fade-in"
    >
      {!isEditing ? (
        <>
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
            sortDirections={['ascend', 'descend']}
            defaultSortOrder="ascend"
            defaultSortField="nombre"
          />
        </>
      ) : (
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
            rules={[{ required: false }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default DietaManagementModal;
