import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Form, Popconfirm, message, Switch } from 'antd';
import { getAlergias, createAlergia, updateAlergia, deleteAlergia } from '../services/api'; 
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const AlergiaManagementModal = ({ visible, onClose, refreshData }) => {
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
      await fetchAlergias();
      refreshData();
    } catch (error) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Error al eliminar la alergia');
      }
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const nombreExiste = alergias.some(
        a => a.nombre.toLowerCase() === values.nombre.toLowerCase() && 
            (!editingAlergia || a.id !== editingAlergia.id)
      );
      
      if (nombreExiste) {
        message.error('Ya existe una alergia con ese nombre');
        return;
      }
      if (editingAlergia) {
        await updateAlergia(editingAlergia.id, {
          ...values,
          activo: editingAlergia.activo
        });
        message.success('Alergia actualizada');
      } else {
        await createAlergia({
          ...values,
          activo: true
        });
        message.success('Alergia creada');
      }
      setIsEditing(false);
      form.resetFields();
      await fetchAlergias();
      refreshData();
    } catch (error) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Error al guardar la alergia');
      }
    }
  };

  const toggleActivo = async (alergia) => {
    try {
      const payload = {
        nombre: alergia.nombre,
        descripcion: alergia.descripcion,
        activo: !alergia.activo
      };
      await updateAlergia(alergia.id, payload);
      message.success(`Alergia ${alergia.activo ? 'desactivada' : 'activada'}`);
      await fetchAlergias();
      refreshData();
    } catch (error) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Error al cambiar el estado de la alergia');
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
      title={isEditing ? (editingAlergia ? 'Editar Alergia' : 'Crear Alergia') : 'Gestión de Alergias'}
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
              Añadir Alergia
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={alergias}
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
            label="Nombre de la Alergia"
            rules={[{ required: true, message: 'Por favor, introduce el nombre de la alergia' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="descripcion"
            label="Descripción de la Alergia"
            rules={[{ required: false }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default AlergiaManagementModal;