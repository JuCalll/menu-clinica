import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, notification, Spin, Alert, List, Typography, Collapse, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { createMenu, getMenus, deleteMenu, updateMenu } from '../services/api';
import '../styles/Menus.scss';

const { Title } = Typography;
const { Panel } = Collapse;
const { confirm } = Modal;

const MenuPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [currentMenu, setCurrentMenu] = useState(null);
  const [options, setOptions] = useState({
    adicional: { adicionales: [] },
    algo: { adicionales: [], bebidas: [] },
    onces: { adicionales: [] },
    desayuno: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
    almuerzo: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
    cena: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
  });
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
    setCurrentMenu(null);
    setMenuName('');
    setOptions({
      adicional: { adicionales: [] },
      algo: { adicionales: [], bebidas: [] },
      onces: { adicionales: [] },
      desayuno: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
      almuerzo: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
      cena: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
    });
  };

  const showDetailModal = (menu) => {
    setCurrentMenu(menu);
    setIsDetailModalOpen(true);
  };

  const handleOk = async () => {
    if (!menuName) {
      notification.error({ message: 'Error', description: 'El nombre del menú es obligatorio' });
      return;
    }

    const payload = {
      nombre: menuName,
      sections: Object.keys(options).map(key => {
        if (key === 'adicional') {
          return {
            titulo: key.charAt(0).toUpperCase() + key.slice(1),
            adicionales: options[key].adicionales.map(({ id, ...rest }) => rest) || []
          };
        } else if (key === 'algo') {
          return {
            titulo: key.charAt(0).toUpperCase() + key.slice(1),
            adicionales: options[key].adicionales.map(({ id, ...rest }) => rest) || [],
            bebidas: options[key].bebidas.map(({ id, ...rest }) => rest) || []
          };
        } else if (key === 'onces') {
          return {
            titulo: key.charAt(0).toUpperCase() + key.slice(1),
            adicionales: options[key].adicionales.map(({ id, ...rest }) => rest) || []
          };
        } else {
          return {
            titulo: key.charAt(0).toUpperCase() + key.slice(1),
            adicionales: options[key].adicionales.map(({ id, ...rest }) => rest) || [],
            platos_principales: options[key].platos_principales.map(({ id, ...rest }) => rest) || [],
            acompanantes: options[key].acompanantes.map(({ id, ...rest }) => rest) || [],
            bebidas: options[key].bebidas.map(({ id, ...rest }) => rest) || [],
          };
        }
      })
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      let response;
      if (currentMenu) {
        response = await updateMenu(currentMenu.id, payload);
        notification.success({ message: 'Menú actualizado exitosamente' });
      } else {
        response = await createMenu(payload);
        notification.success({ message: 'Menú creado exitosamente' });
      }
      console.log('Response:', response);
      setIsModalOpen(false);
      fetchMenus();
    } catch (error) {
      console.error('Error:', error.response?.data?.message || error.message);
      notification.error({ message: 'Error al crear/actualizar el menú', description: error.response?.data?.message || error.message });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsDetailModalOpen(false);
    setCurrentMenu(null);
    setMenuName('');
    setOptions({
      adicional: { adicionales: [] },
      algo: { adicionales: [], bebidas: [] },
      onces: { adicionales: [] },
      desayuno: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
      almuerzo: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
      cena: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
    });
  };

  const addOption = (section, type) => {
    Modal.confirm({
      title: `Añadir ${type}`,
      content: (
        <Input
          placeholder={`Ingrese ${type}`}
          onChange={(e) => setOptions(prev => {
            const newOptions = { ...prev };
            if (!newOptions[section][type]) {
              newOptions[section][type] = [];
            }
            newOptions[section][type].push({ texto: e.target.value, tipo: type });
            return newOptions;
          })}
        />
      ),
      onOk() {
        console.log(`Option added to ${section} - ${type}:`, options[section][type]);
      }
    });
  };

  const removeOption = (section, type, id) => {
    setOptions(prev => {
      const newOptions = { ...prev };
      newOptions[section][type] = newOptions[section][type].filter(opt => opt.id !== id);
      console.log(`Option removed from ${section} - ${type}:`, newOptions[section][type]);
      return newOptions;
    });
  };

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenus();
      setMenus(data);
      console.log('Fetched menus:', data);
    } catch (error) {
      setError('Error fetching menus: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteMenu = (id) => {
    Modal.confirm({
      title: '¿Está seguro de que desea eliminar este menú?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteMenuConfirmed(id);
      }
    });
  };

  const deleteMenuConfirmed = async (id) => {
    try {
      await deleteMenu(id);
      notification.success({ message: 'Menú eliminado exitosamente' });
      fetchMenus();
    } catch (error) {
      notification.error({ message: 'Error al eliminar el menú', description: error.response?.data?.message || error.message });
    }
  };

  const handleEditMenu = (menu) => {
    setCurrentMenu(menu);
    setMenuName(menu.nombre);
    setOptions(menu.sections.reduce((acc, section) => {
      acc[section.titulo.toLowerCase()] = {
        adicionales: section.adicionales || [],
        platos_principales: section.platos_principales || [],
        acompanantes: section.acompanantes || [],
        bebidas: section.bebidas || []
      };
      return acc;
    }, {}));
    setIsModalOpen(true);
    console.log('Editing menu:', menu);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  return (
    <div className="menu-page">
      <Title level={2}>Menús</Title>
      <Button className="custom-button" type="primary" onClick={showModal} icon={<PlusOutlined />}>
        Crear Menú
      </Button>
      <Modal
        title={currentMenu ? "Editar Menú" : "Crear Menú"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={
          <div className="modal-footer">
            <Button key="back" className="custom-button save-button" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button key="submit" type="primary" className="custom-button save-button" onClick={handleOk}>
              {currentMenu ? "Actualizar Menú" : "Guardar Menú"}
            </Button>
          </div>
        }
      >
        <Form layout="vertical">
          <Form.Item label="Nombre del Menú">
            <Input value={menuName} onChange={e => setMenuName(e.target.value)} />
          </Form.Item>
          <Collapse>
            {['adicional', 'algo', 'onces'].map(section => (
              <Panel header={section.charAt(0).toUpperCase() + section.slice(1)} key={section}>
                <div className="button-group vertical-buttons">
                  <Button className="custom-button" onClick={() => addOption(section, 'adicionales')} icon={<PlusOutlined />}>
                    Agregar Adicional
                  </Button>
                  {section === 'algo' && (
                    <Button className="custom-button" onClick={() => addOption(section, 'bebidas')} icon={<PlusOutlined />}>
                      Agregar Bebida
                    </Button>
                  )}
                </div>
                <List
                  header={<div>Adicionales</div>}
                  bordered
                  dataSource={options[section]?.adicionales || []}
                  renderItem={opt => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={() => removeOption(section, 'adicionales', opt.id)}
                        />
                      ]}
                    >
                      {opt.texto}
                    </List.Item>
                  )}
                />
                {section === 'algo' && (
                  <List
                    header={<div>Bebidas</div>}
                    bordered
                    dataSource={options[section]?.bebidas || []}
                    renderItem={opt => (
                      <List.Item
                        actions={[
                          <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            onClick={() => removeOption(section, 'bebidas', opt.id)}
                          />
                        ]}
                      >
                        {opt.texto}
                      </List.Item>
                    )}
                  />
                )}
              </Panel>
            ))}
            {['desayuno', 'almuerzo', 'cena'].map(section => (
              <Panel header={section.charAt(0).toUpperCase() + section.slice(1)} key={section}>
                <div className="button-group vertical-buttons">
                  <Button className="custom-button" onClick={() => addOption(section, 'adicionales')} icon={<PlusOutlined />}>
                    Agregar Adicional
                  </Button>
                  <Button className="custom-button" onClick={() => addOption(section, 'platos_principales')} icon={<PlusOutlined />}>
                    Agregar Plato Principal
                  </Button>
                  <Button className="custom-button" onClick={() => addOption(section, 'acompanantes')} icon={<PlusOutlined />}>
                    Agregar Acompañante
                  </Button>
                  <Button className="custom-button" onClick={() => addOption(section, 'bebidas')} icon={<PlusOutlined />}>
                    Agregar Bebida
                  </Button>
                </div>
                <List
                  header={<div>Adicionales</div>}
                  bordered
                  dataSource={options[section]?.adicionales || []}
                  renderItem={opt => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={() => removeOption(section, 'adicionales', opt.id)}
                        />
                      ]}
                    >
                      {opt.texto}
                    </List.Item>
                  )}
                />
                <List
                  header={<div>Platos Principales</div>}
                  bordered
                  dataSource={options[section]?.platos_principales || []}
                  renderItem={opt => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={() => removeOption(section, 'platos_principales', opt.id)}
                        />
                      ]}
                    >
                      {opt.texto}
                    </List.Item>
                  )}
                />
                <List
                  header={<div>Acompañantes</div>}
                  bordered
                  dataSource={options[section]?.acompanantes || []}
                  renderItem={opt => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={() => removeOption(section, 'acompanantes', opt.id)}
                        />
                      ]}
                    >
                      {opt.texto}
                    </List.Item>
                  )}
                />
                <List
                  header={<div>Bebidas</div>}
                  bordered
                  dataSource={options[section]?.bebidas || []}
                  renderItem={opt => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={() => removeOption(section, 'bebidas', opt.id)}
                        />
                      ]}
                    >
                      {opt.texto}
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        </Form>
      </Modal>

      <Modal
        title="Detalles del Menú"
        open={isDetailModalOpen}
        onOk={() => setIsDetailModalOpen(false)}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="back" className="custom-button save-button" onClick={() => setIsDetailModalOpen(false)}>
            Cerrar
          </Button>,
        ]}
      >
        {currentMenu && (
          <div className="menu-details">
            <Title level={3}>{currentMenu.nombre}</Title>
            {currentMenu.sections.map(section => (
              <div key={section.id}>
                <Title level={4}>{section.titulo}</Title>
                {section.adicionales?.length > 0 && (
                  <>
                    <Title level={5}>Adicionales</Title>
                    <List
                      bordered
                      dataSource={section.adicionales}
                      renderItem={adicional => <List.Item>{adicional.texto}</List.Item>}
                    />
                  </>
                )}
                {section.platos_principales?.length > 0 && (
                  <>
                    <Title level={5}>Platos Principales</Title>
                    <List
                      bordered
                      dataSource={section.platos_principales}
                      renderItem={plato => <List.Item>{plato.texto}</List.Item>}
                    />
                  </>
                )}
                {section.acompanantes?.length > 0 && (
                  <>
                    <Title level={5}>Acompañantes</Title>
                    <List
                      bordered
                      dataSource={section.acompanantes}
                      renderItem={acompanante => <List.Item>{acompanante.texto}</List.Item>}
                    />
                  </>
                )}
                {section.bebidas?.length > 0 && (
                  <>
                    <Title level={5}>Bebidas</Title>
                    <List
                      bordered
                      dataSource={section.bebidas}
                      renderItem={bebida => <List.Item>{bebida.texto}</List.Item>}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <div className="menu-list">
        {loading ? (
          <div className="loading-container">
            <Spin tip="Cargando menús..." />
          </div>
        ) : error ? (
          <Alert message="Error" description={error} type="error" />
        ) : menus.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={menus}
            renderItem={menu => (
              <List.Item
                actions={[
                  <Button type="link" icon={<EyeOutlined />} onClick={() => showDetailModal(menu)} />,
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEditMenu(menu)} />,
                  <Button type="link" icon={<DeleteOutlined />} onClick={() => confirmDeleteMenu(menu.id)} />
                ]}
              >
                <List.Item.Meta
                  title={menu.nombre}
                  className="menu-title"
                />
              </List.Item>
            )}
          />
        ) : (
          <p>No hay menús disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
