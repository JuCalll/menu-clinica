/**
 * Componente modal para la gestión de dietas hospitalarias.
 * 
 * Proporciona una interfaz para:
 * - Listar todas las dietas existentes
 * - Crear nuevas dietas
 * - Editar dietas existentes
 * - Eliminar dietas
 * - Activar/desactivar dietas
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Form, Popconfirm, message, Switch } from 'antd';
import { getDietas, createDieta, updateDieta, deleteDieta } from '../services/api'; 
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.visible - Controla la visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.refreshData - Función para actualizar los datos externos
 */
const DietaManagementModal = ({ visible, onClose, refreshData }) => {
  // Estados para gestionar las dietas y el modo de edición
  const [dietas, setDietas] = useState([]); // Lista de dietas
  const [isEditing, setIsEditing] = useState(false); // Modo edición activo/inactivo
  const [editingDieta, setEditingDieta] = useState(null); // Dieta en edición
  const [form] = Form.useForm(); // Formulario de Ant Design

  // Cargar dietas cuando el modal se hace visible
  useEffect(() => {
    if (visible) {
      fetchDietas();
    }
  }, [visible]);

  /**
   * Obtiene la lista de dietas del servidor
   * @async
   */
  const fetchDietas = async () => {
    try {
      const data = await getDietas();
      setDietas(data);
    } catch (error) {
      message.error('Error al cargar las dietas');
    }
  };

  /**
   * Prepara el formulario para añadir una nueva dieta
   */
  const handleAdd = () => {
    setIsEditing(true);
    setEditingDieta(null);
    form.resetFields();
  };

  /**
   * Prepara el formulario para editar una dieta existente
   * @param {Object} dieta - Dieta a editar
   */
  const handleEdit = (dieta) => {
    setIsEditing(true);
    setEditingDieta(dieta);
    form.setFieldsValue(dieta);
  };

  /**
   * Elimina una dieta del sistema
   * @async
   * @param {number} id - ID de la dieta a eliminar
   */
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

  /**
   * Guarda una nueva dieta o actualiza una existente
   * @async
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Verificar si ya existe una dieta con el mismo nombre
      const nombreExiste = dietas.some(
        d => d.nombre.toLowerCase() === values.nombre.toLowerCase() && 
            (!editingDieta || d.id !== editingDieta.id)
      );
      
      if (nombreExiste) {
        message.error('Ya existe una dieta con ese nombre');
        return;
      }

      if (editingDieta) {
        // Actualizar dieta existente
        await updateDieta(editingDieta.id, {
          ...values,
          activo: editingDieta.activo
        });
        message.success('Dieta actualizada');
      } else {
        // Crear nueva dieta
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

  /**
   * Cambia el estado activo/inactivo de una dieta
   * @async
   * @param {Object} dieta - Dieta a modificar
   */
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

  /**
   * Definición de columnas para la tabla de dietas
   * @constant
   * @type {Array<Object>}
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

  /**
   * Renderiza el modal de gestión de dietas
   * @returns {JSX.Element} Modal con tabla de dietas o formulario de edición
   */
  return (
    <Modal
      open={visible}
      title={isEditing ? (editingDieta ? 'Editar Dieta' : 'Crear Dieta') : 'Gestión de Dietas'}
      onCancel={isEditing ? () => setIsEditing(false) : onClose}
      onOk={isEditing ? handleSave : null}
      footer={!isEditing ? null : undefined}
      width={600}
      className="gestion-panel__modal gestion-panel__fade-in"
      style={{ top: 20 }}
      styles={{ maxHeight: 'calc(90vh - 200px)', overflow: 'auto' }}
    >
      {!isEditing ? (
        // Vista de lista de dietas
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
        // Formulario de edición/creación
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

// Exportación del componente
export default DietaManagementModal;
