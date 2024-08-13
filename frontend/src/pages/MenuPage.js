// Importamos React y los hooks useState y useEffect para manejar el estado y efectos
import React, { useState, useEffect } from 'react';
// Importamos varios componentes y utilidades desde Ant Design
import { Button, Modal, Form, Input, notification, Spin, Alert, List, Typography, Collapse } from 'antd';
// Importamos varios íconos desde Ant Design
import { PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
// Importamos funciones API para manejar las operaciones CRUD de menús
import { createMenu, getMenus, deleteMenu, updateMenu } from '../services/api';
// Importamos los estilos SCSS para este componente
import '../styles/Menus.scss';

// Desestructuramos componentes desde Ant Design para un acceso más limpio
const { Title } = Typography;
const { Panel } = Collapse;
const { confirm } = Modal;

// Definimos el componente MenuPage
const MenuPage = () => {
    // Estados para manejar la visibilidad de modales, el nombre del menú, el menú actual, y las opciones del menú
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
    const [newOptionText, setNewOptionText] = useState('');
    const [currentOptionType, setCurrentOptionType] = useState({});
    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para mostrar el modal de creación/edición de menús
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

    // Función para mostrar el modal de detalles del menú
    const showDetailModal = (menu) => {
        setCurrentMenu(menu);
        setIsDetailModalOpen(true);
    };

    // Función para manejar la creación o actualización de un menú
    const handleOk = async () => {
        if (!menuName) {
            notification.error({ message: 'Error', description: 'El nombre del menú es obligatorio' });
            return;
        }

        const sections = Object.keys(options).map(key => {
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
        });

        // Verificación de al menos dos opciones por sección
        for (let section of sections) {
            if (section.adicionales && section.adicionales.length < 2) {
                notification.error({ message: 'Error', description: `La sección ${section.titulo} debe tener al menos dos opciones en Adicionales` });
                return;
            }
            if (section.platos_principales && section.platos_principales.length < 2) {
                notification.error({ message: 'Error', description: `La sección ${section.titulo} debe tener al menos dos opciones en Platos Principales` });
                return;
            }
            if (section.acompanantes && section.acompanantes.length < 2) {
                notification.error({ message: 'Error', description: `La sección ${section.titulo} debe tener al menos dos opciones en Acompañantes` });
                return;
            }
            if (section.bebidas && section.bebidas.length < 2) {
                notification.error({ message: 'Error', description: `La sección ${section.titulo} debe tener al menos dos opciones en Bebidas` });
                return;
            }
        }

        const payload = {
            nombre: menuName,
            sections
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

    // Función para cancelar el modal y limpiar los estados
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

    // Función para abrir el modal de opciones para una sección específica
    const openOptionModal = (section, type) => {
        setCurrentOptionType({ section, type });
        setNewOptionText('');
        setIsOptionModalOpen(true);
    };

    // Función para agregar una nueva opción a una sección
    const handleAddOption = () => {
        if (!newOptionText) {
            notification.error({ message: 'Error', description: 'Debe ingresar un texto para la opción' });
            return;
        }

        setOptions(prev => {
            const newOptions = { ...prev };
            newOptions[currentOptionType.section][currentOptionType.type].push({ texto: newOptionText, tipo: currentOptionType.type });
            return newOptions;
        });

        setIsOptionModalOpen(false);
    };

    // Función para eliminar una opción de una sección específica
    const removeOption = (section, type, index) => {
        setOptions(prev => {
            const newOptions = { ...prev };
            newOptions[section][type].splice(index, 1);
            return newOptions;
        });
    };

    // Función para obtener los menús desde el servidor
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

    // Función para manejar la eliminación de un menú
    const handleDeleteMenu = async (id) => {
        confirm({
            title: '¿Está seguro de que desea eliminar este menú?',
            icon: <ExclamationCircleOutlined />,
            content: 'Esta acción no se puede deshacer',
            okText: 'Sí',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteMenu(id);
                    notification.success({ message: 'Menú eliminado exitosamente' });
                    fetchMenus();
                } catch (error) {
                    notification.error({ message: 'Error al eliminar el menú', description: error.response?.data?.message || error.message });
                }
            },
        });
    };

    // Función para manejar la edición de un menú existente
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

    // Efecto para obtener los menús al cargar el componente
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
                                    <Button className="custom-button" onClick={() => openOptionModal(section, 'adicionales')} icon={<PlusOutlined />}>
                                        Agregar Adicional
                                    </Button>
                                    {section === 'algo' && (
                                        <Button className="custom-button" onClick={() => openOptionModal(section, 'bebidas')} icon={<PlusOutlined />}>
                                            Agregar Bebida
                                        </Button>
                                    )}
                                </div>
                                <List
                                    header={<div>Adicionales</div>}
                                    bordered
                                    dataSource={options[section]?.adicionales || []}
                                    renderItem={(opt, index) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="link"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeOption(section, 'adicionales', index)}
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
                                        renderItem={(opt, index) => (
                                            <List.Item
                                                actions={[
                                                    <Button
                                                        type="link"
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => removeOption(section, 'bebidas', index)}
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
                                    <Button className="custom-button" onClick={() => openOptionModal(section, 'adicionales')} icon={<PlusOutlined />}>
                                        Agregar Adicional
                                    </Button>
                                    <Button className="custom-button" onClick={() => openOptionModal(section, 'platos_principales')} icon={<PlusOutlined />}>
                                        Agregar Plato Principal
                                    </Button>
                                    <Button className="custom-button" onClick={() => openOptionModal(section, 'acompanantes')} icon={<PlusOutlined />}>
                                        Agregar Acompañante
                                    </Button>
                                    <Button className="custom-button" onClick={() => openOptionModal(section, 'bebidas')} icon={<PlusOutlined />}>
                                        Agregar Bebida
                                    </Button>
                                </div>
                                <List
                                    header={<div>Adicionales</div>}
                                    bordered
                                    dataSource={options[section]?.adicionales || []}
                                    renderItem={(opt, index) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="link"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeOption(section, 'adicionales', index)}
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
                                    renderItem={(opt, index) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="link"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeOption(section, 'platos_principales', index)}
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
                                    renderItem={(opt, index) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="link"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeOption(section, 'acompanantes', index)}
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
                                    renderItem={(opt, index) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="link"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeOption(section, 'bebidas', index)}
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
                title="Añadir opción"
                open={isOptionModalOpen}
                onOk={handleAddOption}
                onCancel={() => setIsOptionModalOpen(false)}
                footer={
                    <div className="modal-footer">
                        <Button key="back" className="custom-button save-button" onClick={() => setIsOptionModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button key="submit" type="primary" className="custom-button save-button" onClick={handleAddOption}>
                            OK
                        </Button>
                    </div>
                }
            >
                <Form layout="vertical">
                    <Form.Item label={`Añadir ${currentOptionType.type}`}>
                        <Input value={newOptionText} onChange={e => setNewOptionText(e.target.value)} />
                    </Form.Item>
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
                                    <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteMenu(menu.id)} />
                                ]}
                            >
                                <List.Item.Meta
                                    title={<span className="menu-title">{menu.nombre}</span>}
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
