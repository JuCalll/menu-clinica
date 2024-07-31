import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, notification, Spin, Alert, List, Typography, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { createMenu, getMenus, deleteMenu, updateMenu } from '../services/api';
import '../styles/Menus.scss';

const { Title } = Typography;
const { Panel } = Collapse;

const MenuPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [currentMenu, setCurrentMenu] = useState(null);
  const [options, setOptions] = useState({
    adicional: { opciones: [] },
    algo: { opciones: [] },
    onces: { opciones: [] },
    desayuno: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
    almuerzo: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
    cena: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
  });
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
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
      sections: Object.keys(options).map(key => ({
        titulo: key.charAt(0).toUpperCase() + key.slice(1),
        adicionales: options[key].adicionales || [],
        platos_principales: options[key].platos_principales || [],
        acompanantes: options[key].acompanantes || [],
        bebidas: options[key].bebidas || [],
      }))
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      if (currentMenu) {
        await updateMenu(currentMenu.id, payload);
        notification.success({ message: 'Menú actualizado exitosamente' });
      } else {
        await createMenu(payload);
        notification.success({ message: 'Menú creado exitosamente' });
      }
      setIsModalOpen(false);
      fetchMenus();
    } catch (error) {
      notification.error({ message: 'Error al crear/actualizar el menú', description: error.response?.data?.message || error.message });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsDetailModalOpen(false);
    setCurrentMenu(null);
    setMenuName('');
    setOptions({
      adicional: { opciones: [] },
      algo: { opciones: [] },
      onces: { opciones: [] },
      desayuno: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
      almuerzo: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
      cena: { adicionales: [], platos_principales: [], acompanantes: [], bebidas: [] },
    });
  };

  const addOption = (section, type) => {
    const option = prompt("Ingrese la opción:");
    if (option) {
      setOptions(prev => {
        const newOptions = { ...prev };
        if (!newOptions[section][type]) {
          newOptions[section][type] = [];
        }
        newOptions[section][type].push({ id: Date.now(), texto: option, tipo: type });
        return newOptions;
      });
    }
  };

  const removeOption = (section, type, id) => {
    setOptions(prev => {
      const newOptions = { ...prev };
      newOptions[section][type] = newOptions[section][type].filter(opt => opt.id !== id);
      return newOptions;
    });
  };

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenus();
      setMenus(data);
    } catch (error) {
      setError('Error fetching menus: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenu = async (id) => {
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
        footer={[
          <Button key="back" className="custom-button" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" className="custom-button" onClick={handleOk}>
            {currentMenu ? "Actualizar Menú" : "Guardar Menú"}
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Nombre del Menú">
            <Input value={menuName} onChange={e => setMenuName(e.target.value)} />
          </Form.Item>
          <Collapse>
            {['adicional', 'algo', 'onces'].map(section => (
              <Panel header={section.charAt(0).toUpperCase() + section.slice(1)} key={section}>
                <div className="button-group vertical-buttons">
                  <Button className="custom-button" onClick={() => addOption(section, 'opciones')} icon={<PlusOutlined />}>
                    Agregar Opción
                  </Button>
                </div>
                <List
                  bordered
                  dataSource={options[section]?.opciones || []}
                  renderItem={opt => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={() => removeOption(section, 'opciones', opt.id)}
                        />
                      ]}
                    >
                      {opt.texto}
                    </List.Item>
                  )}
                />
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
          <Button key="back" className="custom-button" onClick={() => setIsDetailModalOpen(false)}>
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
                  <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteMenu(menu.id)} />
                ]}
              >
                <List.Item.Meta
                  title={menu.nombre}
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
