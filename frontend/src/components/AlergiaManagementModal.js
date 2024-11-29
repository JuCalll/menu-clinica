/**
 * Componente modal para la gestión de alergias.
 * 
 * Proporciona una interfaz para:
 * - Listar todas las alergias existentes
 * - Crear nuevas alergias
 * - Editar alergias existentes
 * - Eliminar alergias
 * - Activar/desactivar alergias
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Form, Popconfirm, message, Switch } from 'antd';
import { getAlergias, createAlergia, updateAlergia, deleteAlergia } from '../services/api'; 
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.visible - Controla la visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.refreshData - Función para actualizar los datos externos
 */
const AlergiaManagementModal = ({ visible, onClose, refreshData }) => {
  // Estados para gestionar las alergias y el modo de edición
  const [alergias, setAlergias] = useState([]); // Lista de alergias
  const [isEditing, setIsEditing] = useState(false); // Modo edición activo/inactivo
  const [editingAlergia, setEditingAlergia] = useState(null); // Alergia en edición
  const [form] = Form.useForm(); // Formulario de Ant Design

  // Cargar alergias cuando el modal se hace visible
  useEffect(() => {
    if (visible) {
      fetchAlergias();
    }
  }, [visible]);

  /**
   * Obtiene la lista de alergias del servidor
   * @async
   */
  const fetchAlergias = async () => {
    try {
      const data = await getAlergias();
      setAlergias(data);
    } catch (error) {
      message.error('Error al cargar las alergias');
    }
  };

  /**
   * Prepara el formulario para añadir una nueva alergia
   */
  const handleAdd = () => {
    setIsEditing(true);
    setEditingAlergia(null);
    form.resetFields();
  };

  /**
   * Prepara el formulario para editar una alergia existente
   * @param {Object} alergia - Alergia a editar
   */
  const handleEdit = (alergia) => {
    setIsEditing(true);
    setEditingAlergia(alergia);
    form.setFieldsValue(alergia);
  };

  /**
   * Elimina una alergia
   * @async
   * @param {number} id - ID de la alergia a eliminar
   */
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

  /**
   * Guarda una nueva alergia o actualiza una existente
   * @async
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Verificar si ya existe una alergia con el mismo nombre
      const nombreExiste = alergias.some(
        a => a.nombre.toLowerCase() === values.nombre.toLowerCase() && 
            (!editingAlergia || a.id !== editingAlergia.id)
      );
      
      if (nombreExiste) {
        message.error('Ya existe una alergia con ese nombre');
        return;
      }

      if (editingAlergia) {
        // Actualizar alergia existente
        await updateAlergia(editingAlergia.id, {
          ...values,
          activo: editingAlergia.activo
        });
        message.success('Alergia actualizada');
      } else {
        // Crear nueva alergia
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

  /**
   * Cambia el estado activo/inactivo de una alergia
   * @async
   * @param {Object} alergia - Alergia a modificar
   */
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

  /**
   * Definición de columnas para la tabla de alergias
   * @constant
   */
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

  /**
   * Renderiza el modal de gestión de alergias
   * @returns {JSX.Element} Modal con tabla de alergias o formulario de edición
   */
  return (
    <Modal
      open={visible}
      title={isEditing ? (editingAlergia ? 'Editar Alergia' : 'Crear Alergia') : 'Gestión de Alergias'}
      onCancel={isEditing ? () => setIsEditing(false) : onClose}
      onOk={isEditing ? handleSave : null}
      footer={!isEditing ? null : undefined}
      width={600}
      className="gestion-panel__modal gestion-panel__fade-in"
      style={{ top: 20 }}
      styles={{ maxHeight: 'calc(90vh - 200px)', overflow: 'auto' }}
    >
      {!isEditing ? (
        // Vista de lista de alergias
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
        // Formulario de edición/creación
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

// Exportación del componente
export default AlergiaManagementModal;