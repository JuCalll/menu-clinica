import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  notification,
  Spin,
  Alert,
  Typography,
  Collapse,
  Row,
  Col,
  Card,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  CoffeeOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { createMenu, getMenus, deleteMenu, updateMenu } from "../services/api";
import "../styles/MenuPage.scss";

const { Panel } = Collapse;
const { confirm } = Modal;

function MenuPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuName, setMenuName] = useState("");
  const [currentMenu, setCurrentMenu] = useState(null);
  const [options, setOptions] = useState({
    desayuno: {
      entrada: [],
      huevos: [],
      acompanante: [],
      toppings: [],
      bebidas: [],
    },
    media_manana: {
      media_manana_fit: [],
      media_manana_tradicional: [],
      bebidas_calientes: [],
      bebidas_frias: [],
    },
    almuerzo: {
      sopa_del_dia: [],
      plato_principal: [],
      vegetariano: [],
      acompanante: [],
      vegetales: [],
      toppings: [],
      bebidas: [],
      postre: [],
    },
    refrigerio: {
      refrigerio_fit: [],
      refrigerio_tradicional: [],
      bebidas_calientes: [],
      bebidas_frias: [],
    },
    cena: {
      plato_principal: [],
      vegetariano: [],
      acompanante: [],
      vegetales: [],
      toppings: [],
      bebidas: [],
    },
    adicional_dia: {
      adicionales: [],
    },
  });
  const [newOptionText, setNewOptionText] = useState("");
  const [currentOptionType, setCurrentOptionType] = useState({});
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewMenu, setViewMenu] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
    setCurrentMenu(null);
    setMenuName("");
    setOptions({
      desayuno: {
        entrada: [],
        huevos: [],
        acompanante: [],
        toppings: [],
        bebidas: [],
      },
      media_manana: {
        media_manana_fit: [],
        media_manana_tradicional: [],
        bebidas_calientes: [],
        bebidas_frias: [],
      },
      almuerzo: {
        sopa_del_dia: [],
        plato_principal: [],
        vegetariano: [],
        acompanante: [],
        vegetales: [],
        toppings: [],
        bebidas: [],
        postre: [],
      },
      refrigerio: {
        refrigerio_fit: [],
        refrigerio_tradicional: [],
        bebidas_calientes: [],
        bebidas_frias: [],
      },
      cena: {
        plato_principal: [],
        vegetariano: [],
        acompanante: [],
        vegetales: [],
        toppings: [],
        bebidas: [],
      },
      adicional_dia: {
        adicionales: [],
      },
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsOptionModalOpen(false);
    setCurrentMenu(null);
    setMenuName("");
    setOptions({
      desayuno: {
        entrada: [],
        huevos: [],
        acompanante: [],
        toppings: [],
        bebidas: [],
      },
      media_manana: {
        media_manana_fit: [],
        media_manana_tradicional: [],
        bebidas_calientes: [],
        bebidas_frias: [],
      },
      almuerzo: {
        sopa_del_dia: [],
        plato_principal: [],
        vegetariano: [],
        acompanante: [],
        vegetales: [],
        toppings: [],
        bebidas: [],
        postre: [],
      },
      refrigerio: {
        refrigerio_fit: [],
        refrigerio_tradicional: [],
        bebidas_calientes: [],
        bebidas_frias: [],
      },
      cena: {
        plato_principal: [],
        vegetariano: [],
        acompanante: [],
        vegetales: [],
        toppings: [],
        bebidas: [],
      },
      adicional_dia: {
        adicionales: [],
      },
    });
  };

  const openOptionModal = (section, type) => {
    setCurrentOptionType({ section, type });
    setNewOptionText("");
    setIsOptionModalOpen(true);
  };

  const handleAddOption = () => {
    if (!newOptionText) {
      notification.error({
        message: "Error",
        description: "Debe ingresar un texto para la opción",
      });
      return;
    }

    setOptions((prev) => {
      const newOptions = { ...prev };
      newOptions[currentOptionType.section][currentOptionType.type].push({
        texto: newOptionText,
        tipo: currentOptionType.type,
      });
      return newOptions;
    });

    setIsOptionModalOpen(false);
  };

  const handleDeleteOption = (section, type, index) => {
    setOptions((prev) => {
      const newOptions = { ...prev };
      newOptions[section][type] = newOptions[section][type].filter((_, i) => i !== index);
      return newOptions;
    });
  };

  const handleCreateOrUpdateMenu = async () => {
    if (!menuName) {
      notification.error({
        message: "Error",
        description: "El nombre del menú es obligatorio",
      });
      return;
    }

    const sections = Object.keys(options).map((key) => {
      return {
        titulo: key.charAt(0).toUpperCase() + key.slice(1),
        opciones: Object.keys(options[key]).reduce((acc, tipo) => {
          acc[tipo] = options[key][tipo].map(({ id, ...rest }) => rest);
          return acc;
        }, {}),
      };
    });

    const payload = {
      nombre: menuName,
      sections,
    };

    console.log("Payload enviado a la API:", JSON.stringify(payload, null, 2));

    try {
      let response;
      if (currentMenu) {
        response = await updateMenu(currentMenu.id, payload);
        notification.success({ message: "Menú actualizado exitosamente" });
      } else {
        response = await createMenu(payload);
        notification.success({ message: "Menú creado exitosamente" });
      }
      console.log("Response:", response);
      setIsModalOpen(false);
      fetchMenus();
    } catch (error) {
      console.error(
        "Error al crear/actualizar el menú:",
        error.response?.data || error.message
      );
      notification.error({
        message: "Error al crear/actualizar el menú",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleEditMenu = (menu) => {
    setCurrentMenu(menu);
    setMenuName(menu.nombre);

    const transformedOptions = menu.sections.reduce((acc, section) => {
      const sectionKey = section.titulo.toLowerCase().replace(" ", "_");
      acc[sectionKey] = Object.keys(section.opciones).reduce((optAcc, tipo) => {
        optAcc[tipo] = section.opciones[tipo];
        return optAcc;
      }, {});
      return acc;
    }, {});

    setOptions(transformedOptions);
    setIsModalOpen(true);
  };

  const handleViewMenu = (menu) => {
    setViewMenu(menu);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewMenu(null);
  };

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const data = await getMenus();
      setMenus(data);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudo cargar los menús",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const formatName = (name) => {
    if (!name) return ''; 
    
    const normalizedName = name.toLowerCase().replace(/_/g, ' ');
    
    const formattedNames = {
      "desayuno": "Desayuno",
      "entrada": "Entrada",
      "huevos": "Huevos",
      "acompanante": "Acompañante",
      "toppings": "Toppings",
      "bebidas": "Bebidas",
      "media manana": "Media Mañana",
      "media manana fit": "Media Mañana Fit",
      "media manana tradicional": "Media Mañana Tradicional",
      "bebidas calientes": "Bebidas Calientes",
      "bebidas frias": "Bebidas Frías",
      "almuerzo": "Almuerzo",
      "sopa del dia": "Sopa del Día",
      "plato principal": "Plato Principal",
      "vegetariano": "Vegetariano",
      "vegetales": "Vegetales",
      "postre": "Postre",
      "refrigerio": "Refrigerio",
      "refrigerio fit": "Refrigerio Fit",
      "refrigerio tradicional": "Refrigerio Tradicional",
      "cena": "Cena",
      "adicional dia": "Adicional Día",
      "adicionales": "Adicionales"
    };

    if (formattedNames.hasOwnProperty(normalizedName)) {
      return formattedNames[normalizedName];
    }

    return normalizedName.replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="menu-page">
      <div className="menu-page-header">
        <h1 className="page-title">Menús</h1>
        <Button
          type="primary"
          onClick={showModal}
          className="custom-button create-menu-button"
        >
          <CoffeeOutlined /> Crear Menú
        </Button>
      </div>
      <Modal
        title={currentMenu ? "Editar Menú" : "Crear Menú"}
        open={isModalOpen}
        onOk={handleCreateOrUpdateMenu}
        onCancel={handleCancel}
        footer={
          <div className="modal-footer">
            <Button
              key="back"
              className="custom-button save-button"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              key="submit"
              type="primary"
              className="custom-button save-button"
              onClick={handleCreateOrUpdateMenu}
            >
              {currentMenu ? "Actualizar Menú" : "Guardar Menú"}
            </Button>
          </div>
        }
      >
        <Form layout="vertical">
          <Form.Item label="Nombre del Menú">
            <Input
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
            />
          </Form.Item>
          <Collapse>
            {[
              "desayuno",
              "media_manana",
              "almuerzo",
              "refrigerio",
              "cena",
              "adicional_dia",
            ].map((section) => (
              <Panel header={formatName(section)} key={section}>
                <div className="section-content">
                  {Object.keys(options[section]).map((type) => (
                    <div className="subsection-container" key={type}>
                      <Button
                        className="option-button"
                        onClick={() => openOptionModal(section, type)}
                      >
                        <PlusOutlined />
                        <span className="button-text">{formatName(type)}</span>
                      </Button>
                      {options[section][type].length > 0 && (
                        <div className="menu-option-list">
                          <ul>
                            {options[section][type].map((option, index) => (
                              <li key={index}>
                                {option.texto}
                                <DeleteOutlined
                                  onClick={() => handleDeleteOption(section, type, index)}
                                  style={{ color: '#1890ff', cursor: 'pointer' }}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
            <Button
              key="back"
              className="custom-button cancel-button"
              onClick={() => setIsOptionModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              key="submit"
              type="primary"
              className="custom-button save-button"
              onClick={handleAddOption}
            >
              OK
            </Button>
          </div>
        }
      >
        <Form layout="vertical">
          <Form.Item label={`Añadir ${formatName(currentOptionType.type)}`}>
            <Input
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
      <div className="menu-list">
        {loading ? (
          <div className="loading-container">
            <Spin tip="Cargando menús..." size="large" />
          </div>
        ) : menus.length > 0 ? (
          <Row gutter={[16, 16]}>
            {menus.map((menu) => (
              <Col xs={24} sm={12} md={8} lg={6} key={menu.id}>
                <Card
                  className="menu-item"
                  title={<span className="menu-item-title">{menu.nombre}</span>}
                >
                  <div className="menu-item-actions">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewMenu(menu)}
                      className="action-button view-button"
                      aria-label="Ver menú"
                    >
                      Ver
                    </Button>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditMenu(menu)}
                      className="action-button edit-button"
                      aria-label="Editar menú"
                    >
                      Editar
                    </Button>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        confirm({
                          title: "¿Estás seguro de que quieres eliminar este menú?",
                          icon: <ExclamationCircleOutlined />,
                          onOk() {
                            deleteMenu(menu.id)
                              .then(() => {
                                notification.success({
                                  message: "Éxito",
                                  description: "Menú eliminado exitosamente",
                                });
                                fetchMenus();
                              })
                              .catch(() => {
                                notification.error({
                                  message: "Error",
                                  description: "No se pudo eliminar el menú",
                                });
                              });
                          },
                        });
                      }}
                      className="action-button delete-button"
                      aria-label="Eliminar menú"
                    >
                      Eliminar
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert 
            message="No hay menús disponibles" 
            type="info" 
            showIcon 
            className="no-menus-alert"
          />
        )}
      </div>

      <Modal
        title={viewMenu ? `${viewMenu.nombre}` : ""}
        open={isViewModalOpen}
        className="view-menu-modal"
        onCancel={handleCloseViewModal}
        footer={
          <Button onClick={handleCloseViewModal} type="primary">
            <CloseOutlined /> Cerrar
          </Button>
        }
      >
        {viewMenu && (
          <div>
            {viewMenu.sections.map((section, index) => (
              <div key={index}>
                <Typography.Title level={4} className="menu-header">
                  {formatName(section.titulo)}
                </Typography.Title>
                <ul>
                  {Object.keys(section.opciones).map((tipo) => (
                    <li key={tipo}>
                      <Typography.Text strong>
                        {formatName(tipo)}:
                      </Typography.Text>
                      <ul>
                        {section.opciones[tipo].map((opcion, idx) => (
                          <li key={idx}>{opcion.texto}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MenuPage;
