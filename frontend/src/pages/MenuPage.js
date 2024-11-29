/**
 * Página de Gestión de Menús
 *
 * Proporciona una interfaz para:
 * - Crear nuevos menús
 * - Editar menús existentes
 * - Eliminar menús
 * - Visualizar detalles de menús
 *
 * Características:
 * - Formularios modales para creación/edición
 * - Confirmación para eliminación
 * - Visualización organizada por secciones
 * - Notificaciones de acciones
 *
 * @component
 */

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
  PlusOutlined, // Icono para agregar
  DeleteOutlined, // Icono para eliminar
  EyeOutlined, // Icono para visualizar
  EditOutlined, // Icono para editar
  ExclamationCircleOutlined, // Icono para alertas
  CoffeeOutlined, // Icono para menús
  CloseOutlined, // Icono para cerrar
} from "@ant-design/icons";
import {
  createMenu, // Crear nuevo menú
  getMenus, // Obtener lista de menús
  deleteMenu, // Eliminar menú
  updateMenu, // Actualizar menú existente
} from "../services/api";
import "../styles/MenuPage.scss";

// Componentes de Ant Design
const { Panel } = Collapse;
const { confirm } = Modal;

function MenuPage() {
  /**
   * Estados para control de modales y formularios
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  /**
   * Estados para datos del menú
   */
  const [menuName, setMenuName] = useState("");
  const [currentMenu, setCurrentMenu] = useState(null);
  const [menus, setMenus] = useState([]);
  const [viewMenu, setViewMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Estados para gestión de opciones
   */
  const [newOptionText, setNewOptionText] = useState("");
  const [currentOptionType, setCurrentOptionType] = useState({});

  /**
   * Estructura base de opciones del menú
   * Organizada por tiempos de comida y sus subcategorías
   */
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

  /**
   * Muestra el modal de creación/edición de menú
   * Reinicia los estados a sus valores iniciales
   */
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

  /**
   * Cierra los modales y reinicia los estados
   * Se usa tanto para cancelar como para finalizar operaciones
   */
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

  /**
   * Abre el modal para agregar una nueva opción a una sección del menú
   * @param {string} section - Sección del menú (desayuno, almuerzo, etc.)
   * @param {string} type - Tipo de opción dentro de la sección
   */
  const openOptionModal = (section, type) => {
    setCurrentOptionType({ section, type });
    setNewOptionText("");
    setIsOptionModalOpen(true);
  };

  /**
   * Agrega una nueva opción al menú en la sección y tipo especificados
   * Valida que el texto de la opción no esté vacío
   */
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

  /**
   * Elimina una opción específica del menú
   * @param {string} section - Sección del menú
   * @param {string} type - Tipo de opción
   * @param {number} index - Índice de la opción a eliminar
   */
  const handleDeleteOption = (section, type, index) => {
    setOptions((prev) => {
      const newOptions = { ...prev };
      newOptions[section][type] = newOptions[section][type].filter(
        (_, i) => i !== index
      );
      return newOptions;
    });
  };

  /**
   * Crea o actualiza un menú completo
   * - Valida el nombre del menú
   * - Transforma las opciones al formato requerido por la API
   * - Maneja la respuesta y muestra notificaciones
   */
  const handleCreateOrUpdateMenu = async () => {
    if (!menuName) {
      notification.error({
        message: "Error",
        description: "El nombre del menú es obligatorio",
      });
      return;
    }

    const sections = Object.keys(options).map((key) => ({
      titulo: key.charAt(0).toUpperCase() + key.slice(1),
      opciones: Object.keys(options[key]).reduce((acc, tipo) => {
        acc[tipo] = options[key][tipo].map(({ id, ...rest }) => rest);
        return acc;
      }, {}),
    }));

    const payload = { nombre: menuName, sections };

    try {
      if (currentMenu) {
        await updateMenu(currentMenu.id, payload);
        notification.success({ message: "Menú actualizado exitosamente" });
      } else {
        await createMenu(payload);
        notification.success({ message: "Menú creado exitosamente" });
      }
      setIsModalOpen(false);
      fetchMenus();
    } catch (error) {
      notification.error({
        message: "Error al crear/actualizar el menú",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  /**
   * Prepara el formulario para editar un menú existente
   * @param {Object} menu - Menú a editar
   */
  const handleEditMenu = (menu) => {
    setCurrentMenu(menu);
    setMenuName(menu.nombre);

    // Transforma las secciones del menú al formato interno
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

  /**
   * Funciones para el modal de visualización
   */
  const handleViewMenu = (menu) => {
    setViewMenu(menu);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewMenu(null);
  };

  /**
   * Obtiene la lista de menús del servidor
   */
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

  /**
   * Formatea nombres de secciones y tipos para mostrar
   * @param {string} name - Nombre a formatear
   * @returns {string} Nombre formateado
   */
  const formatName = (name) => {
    if (!name) return "";
    const normalizedName = name.toLowerCase().replace(/_/g, " ");

    const formattedNames = {
      desayuno: "Desayuno",
      entrada: "Entrada",
      huevos: "Huevos",
      acompanante: "Acompañante",
      toppings: "Toppings",
      bebidas: "Bebidas",
      "media manana": "Media Mañana",
      "media manana fit": "Media Mañana Fit",
      "media manana tradicional": "Media Mañana Tradicional",
      "bebidas calientes": "Bebidas Calientes",
      "bebidas frias": "Bebidas Frías",
      almuerzo: "Almuerzo",
      "sopa del dia": "Sopa del Día",
      "plato principal": "Plato Principal",
      vegetariano: "Vegetariano",
      vegetales: "Vegetales",
      postre: "Postre",
      refrigerio: "Refrigerio",
      "refrigerio fit": "Refrigerio Fit",
      "refrigerio tradicional": "Refrigerio Tradicional",
      cena: "Cena",
      "adicional dia": "Adicional Día",
      adicionales: "Adicionales",
    };

    return (
      formattedNames[normalizedName] ||
      normalizedName.replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  /**
   * Renderizado del componente
   * Estructura:
   * 1. Cabecera con título y botón de creación
   * 2. Modal principal para crear/editar menús
   *    - Formulario con nombre del menú
   *    - Secciones colapsables por tiempo de comida
   *    - Opciones dentro de cada sección
   */
  return (
    <div className="menu-page">
      {/* Cabecera de la página */}
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

      {/* Modal principal para crear/editar menús */}
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
        {/* Formulario del menú */}
        <Form layout="vertical">
          {/* Campo para el nombre del menú */}
          <Form.Item label="Nombre del Menú">
            <Input
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
            />
          </Form.Item>

          {/* Secciones colapsables del menú */}
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
                  {/* Opciones de cada sección */}
                  {Object.keys(options[section]).map((type) => (
                    <div className="subsection-container" key={type}>
                      {/* Botón para agregar nueva opción */}
                      <Button
                        className="option-button"
                        onClick={() => openOptionModal(section, type)}
                      >
                        <PlusOutlined />
                        <span className="button-text">{formatName(type)}</span>
                      </Button>

                      {/* Lista de opciones existentes */}
                      {options[section][type].length > 0 && (
                        <div className="menu-option-list">
                          <ul>
                            {options[section][type].map((option, index) => (
                              <li key={index}>
                                {option.texto}
                                {/* Botón para eliminar opción */}
                                <DeleteOutlined
                                  onClick={() =>
                                    handleDeleteOption(section, type, index)
                                  }
                                  style={{
                                    color: "#1890ff",
                                    cursor: "pointer",
                                  }}
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
      {/* Modal para añadir nuevas opciones a una sección */}
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

      {/* Lista de menús existentes */}
      <div className="menu-list">
        {/* Estado de carga */}
        {loading ? (
          <div className="loading-container">
            <Spin tip="Cargando menús..." size="large" />
          </div>
        ) : menus.length > 0 ? (
          // Grid de tarjetas de menús
          <Row gutter={[16, 16]}>
            {menus.map((menu) => (
              <Col xs={24} sm={12} md={8} lg={6} key={menu.id}>
                <Card
                  className="menu-item"
                  title={<span className="menu-item-title">{menu.nombre}</span>}
                >
                  {/* Botones de acción para cada menú */}
                  <div className="menu-item-actions">
                    {/* Botón Ver */}
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewMenu(menu)}
                      className="action-button view-button"
                      aria-label="Ver menú"
                    >
                      Ver
                    </Button>
                    {/* Botón Editar */}
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditMenu(menu)}
                      className="action-button edit-button"
                      aria-label="Editar menú"
                    >
                      Editar
                    </Button>
                    {/* Botón Eliminar con confirmación */}
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        confirm({
                          title:
                            "¿Estás seguro de que quieres eliminar este menú?",
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
          // Mensaje cuando no hay menús
          <Alert
            message="No hay menús disponibles"
            type="info"
            showIcon
            className="no-menus-alert"
          />
        )}
      </div>

      {/* Modal para visualizar detalles del menú */}
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
            {/* Secciones del menú */}
            {viewMenu.sections.map((section, index) => (
              <div key={index}>
                <Typography.Title level={4} className="menu-header">
                  {formatName(section.titulo)}
                </Typography.Title>
                <ul>
                  {/* Opciones por tipo dentro de cada sección */}
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
