/**
 * Página de Realización de Pedidos
 *
 * Permite crear nuevos pedidos con:
 * - Selección de paciente
 * - Selección de menú
 * - Opciones personalizadas por sección
 * - Preparaciones especiales para bebidas
 * - Observaciones adicionales
 *
 * @component
 */

import React, { useEffect, useState } from "react";
import {
  Select,
  Button,
  Checkbox,
  Spin,
  Collapse,
  Modal,
  message,
  Input,
  Alert,
} from "antd";
import { getPacientes, getMenus, createPedido } from "../services/api";
import "../styles/RealizarPedido.scss";

const { Option } = Select;
const { Panel } = Collapse;

const RealizarPedido = () => {
  /**
   * Estados principales del componente
   */
  const [pacientes, setPacientes] = useState([]); // Lista de pacientes disponibles
  const [menus, setMenus] = useState([]); // Lista de menús disponibles
  const [selectedPaciente, setSelectedPaciente] = useState(null); // Paciente seleccionado
  const [selectedMenu, setSelectedMenu] = useState(null); // Menú seleccionado
  const [selectedOptions, setSelectedOptions] = useState({}); // Opciones seleccionadas por tipo
  const [additionalOptions, setAdditionalOptions] = useState({
    observaciones: "",
  }); // Opciones adicionales como observaciones
  const [errors, setErrors] = useState({}); // Errores de validación
  const [loading, setLoading] = useState(true); // Estado de carga
  const [confirmVisible, setConfirmVisible] = useState(false); // Visibilidad del modal de confirmación
  const [bebidasPreparacion, setBebidasPreparacion] = useState({}); // Preparaciones especiales para bebidas
  const [preparacionModal, setPreparacionModal] = useState({
    visible: false,
    bebidaId: null,
    bebidaNombre: "",
  }); // Estado del modal de preparación de bebidas
  const [activeKeys, setActiveKeys] = useState(["0"]); // Paneles activos del Collapse

  /**
   * Opciones de preparación para bebidas
   */
  const opcionesPreparado = [
    { value: "leche_entera", label: "Leche Entera" },
    { value: "leche_deslactosada", label: "Leche Deslactosada" },
    { value: "leche_almendras", label: "Leche de Almendras" },
    { value: "agua", label: "Agua" },
    { value: "unica_preparacion", label: "Única Preparación" },
  ];

  /**
   * Efecto para cargar datos iniciales
   * Obtiene la lista de pacientes y menús del servidor
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pacientesResponse, menusResponse] = await Promise.all([
          getPacientes(),
          getMenus(),
        ]);
        setPacientes(pacientesResponse || []);
        setMenus(menusResponse || []);
        setLoading(false);
      } catch (error) {
        message.error("Error al cargar los datos");
        setPacientes([]);
        setMenus([]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Maneja el cambio de paciente seleccionado
   * @param {number} value - ID del paciente seleccionado
   */
  const handlePacienteChange = (value) => {
    setSelectedPaciente(value);
    if (!value) {
      resetForm();
    }
    setErrors((prev) => ({ ...prev, paciente: null }));
  };

  /**
   * Maneja el cambio de menú seleccionado
   * @param {number} value - ID del menú seleccionado
   */
  const handleMenuChange = (value) => {
    const menu = menus.find((menu) => menu.id === value);
    setSelectedMenu(menu);
    setSelectedOptions({});
    setErrors((prev) => ({ ...prev, menu: null }));
  };

  /**
   * Maneja el cambio en las opciones seleccionadas
   * @param {string} optionType - Tipo de opción (bebidas, platos, etc.)
   * @param {number} optionId - ID de la opción seleccionada
   * @param {boolean} checked - Estado del checkbox
   * @param {string} opcionTexto - Texto de la opción
   * @param {string} seccionTitulo - Título de la sección
   */
  const handleOptionChange = (
    optionType,
    optionId,
    checked,
    opcionTexto,
    seccionTitulo
  ) => {
    // Determina si debe mostrar el modal de preparación
    const shouldShowModal =
      checked &&
      (optionType === "bebidas_calientes" ||
        (optionType === "bebidas" &&
          seccionTitulo?.toLowerCase() === "desayuno"));

    if (shouldShowModal) {
      setPreparacionModal({
        visible: true,
        bebidaId: optionId,
        bebidaNombre: opcionTexto,
      });
    } else if (!checked) {
      // Elimina la preparación si se deselecciona la bebida
      setBebidasPreparacion((prev) => {
        const newPreparaciones = { ...prev };
        delete newPreparaciones[optionId];
        return newPreparaciones;
      });
    }

    // Actualiza las opciones seleccionadas
    setSelectedOptions((prevOptions) => {
      const newOptions = { ...prevOptions };
      if (!newOptions[optionType]) {
        newOptions[optionType] = [];
      }
      if (checked) {
        newOptions[optionType].push(optionId);
      } else {
        newOptions[optionType] = newOptions[optionType].filter(
          (id) => id !== optionId
        );
      }
      return newOptions;
    });
  };

  /**
   * Valida el formulario antes de enviar
   * Verifica que se haya seleccionado un paciente y un menú
   * @returns {boolean} true si el formulario es válido, false en caso contrario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!selectedPaciente) {
      newErrors.paciente = "Debe seleccionar un paciente";
    }

    if (!selectedMenu) {
      newErrors.menu = "Debe seleccionar un menú";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja la confirmación y envío del pedido
   * Valida el formulario, prepara los datos y realiza la petición al servidor
   */
  const handleOk = async () => {
    // Validación inicial del formulario
    if (!validateForm()) return;

    // Verificación de opciones seleccionadas
    const hayOpcionesSeleccionadas = Object.values(selectedOptions).some(
      (opciones) => opciones && opciones.length > 0
    );

    if (!hayOpcionesSeleccionadas) {
      message.error(
        "Debe seleccionar al menos una opción para realizar el pedido"
      );
      return;
    }

    setConfirmVisible(false);

    // Preparación del array de opciones seleccionadas
    const opcionesArray = [];
    Object.entries(selectedOptions).forEach(([optionType, selectedIds]) => {
      selectedIds.forEach((optionId) => {
        opcionesArray.push({
          id: optionId,
          selected: true,
        });
      });
    });

    // Construcción del objeto de datos del pedido
    const pedidoData = {
      paciente_id: selectedPaciente,
      menu_id: selectedMenu.id,
      opciones: opcionesArray,
      adicionales: {
        ...additionalOptions,
        bebidasPreparacion,
      },
      status: "pendiente",
      sectionStatus: {},
      observaciones: additionalOptions.observaciones,
    };

    try {
      // Envío del pedido al servidor
      await createPedido(pedidoData);
      message.success("Pedido creado exitosamente");
      resetForm();
    } catch (error) {
      message.error("Error al crear el pedido");
    }
  };

  /**
   * Reinicia el formulario a su estado inicial
   * Limpia todas las selecciones y opciones
   */
  const resetForm = () => {
    setSelectedPaciente(null);
    setSelectedMenu(null);
    setSelectedOptions({});
    setBebidasPreparacion({});
    setAdditionalOptions({
      observaciones: "",
    });
  };

  /**
   * Maneja el cambio en los paneles expandidos del Collapse
   * @param {string[]} keys - Array con las keys de los paneles activos
   */
  const handleCollapseChange = (keys) => {
    setActiveKeys(keys);
  };

  /**
   * Renderiza las secciones del menú seleccionado
   * Muestra las opciones disponibles organizadas por sección y tipo
   * @returns {JSX.Element|null} Componentes Panel con las secciones del menú
   */
  const renderMenuSections = () => {
    if (!selectedMenu?.sections) return null;

    return selectedMenu.sections.map((section) => (
      <Panel header={formatSectionTitle(section.titulo)} key={section.id}>
        <div className="option-group" data-type={section.titulo.toLowerCase()}>
          {/* Iteración sobre tipos de opciones en cada sección */}
          {Object.entries(section.opciones).map(([tipo, opciones]) => {
            if (!Array.isArray(opciones) || opciones.length === 0) return null;

            return (
              <div
                key={tipo}
                className="option-group"
                data-type={tipo.toLowerCase()}
              >
                <h4>{formatTitle(tipo)}</h4>
                <div className="options-container">
                  {/* Checkboxes para cada opción */}
                  {opciones.map((opcion) => (
                    <div key={opcion.id} className="option-item">
                      <Checkbox
                        checked={selectedOptions[tipo]?.includes(opcion.id)}
                        onChange={(e) =>
                          handleOptionChange(
                            tipo,
                            opcion.id,
                            e.target.checked,
                            opcion.texto,
                            section.titulo
                          )
                        }
                      >
                        {opcion.texto}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Botón para cerrar la sección */}
          <div className="section-footer">
            <Button
              type="default"
              onClick={() => {
                setActiveKeys(
                  activeKeys.filter((key) => key !== section.id.toString())
                );
              }}
              className="close-section-button"
            >
              Cerrar sección
            </Button>
          </div>
        </div>
      </Panel>
    ));
  };

  /**
   * Formatea títulos para mostrar en la interfaz
   * Convierte identificadores en texto legible
   * @param {string} title - Título a formatear
   * @returns {string} Título formateado
   */
  const formatTitle = (title) => {
    // Mapeo de nombres formateados
    const formattedNames = {
      acompanante: "Acompañante",
      bebidas_calientes: "Bebidas Calientes",
      bebidas_frias: "Bebidas Frías",
      sopa_del_dia: "Sopa del Día",
      plato_principal: "Plato Principal",
      media_manana_fit: "Media Mañana Fit",
      media_manana_tradicional: "Media Mañana Tradicional",
      refrigerio_fit: "Refrigerio Fit",
      refrigerio_tradicional: "Refrigerio Tradicional",
      entrada: "Entrada",
      huevos: "Huevos",
      toppings: "Toppings",
      bebidas: "Bebidas",
      vegetariano: "Vegetariano",
      vegetales: "Vegetales",
      adicionales: "Adicionales",
      leche_entera: "Leche Entera",
      leche_deslactosada: "Leche Deslactosada",
      leche_almendras: "Leche de Almendras",
      agua: "Agua",
      unica_preparacion: "Única Preparación",
    };

    // Retorna traducción directa si existe
    if (formattedNames[title?.toLowerCase()]) {
      return formattedNames[title.toLowerCase()];
    }

    // Retorna string vacío si no hay título
    if (!title) return "";

    // Aplica formato general si no hay traducción directa
    return title
      .replace(/_/g, " ") // Reemplaza guiones bajos por espacios
      .toLowerCase()
      .split(" ")
      .map((word, index) => {
        // Mantiene en minúsculas palabras específicas si no son la primera
        if (index > 0 && ["del", "de", "la", "las", "los"].includes(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos
      .replace(/n~/g, "ñ")
      .replace(/Manana/g, "Mañana")
      .replace(/Frias/g, "Frías");
  };

  /**
   * Filtra opciones en los Select basado en el texto de búsqueda
   * @param {string} input - Texto de búsqueda
   * @param {Object} option - Opción del Select
   * @returns {boolean} true si la opción coincide con la búsqueda
   */
  const filterOption = (input, option) => {
    if (!input.trim()) return true;

    const searchText = option.label.toLowerCase();
    return searchText.includes(input.toLowerCase());
  };

  /**
   * Renderiza las opciones adicionales del pedido
   * Incluye preparaciones de bebidas y observaciones
   * @returns {JSX.Element|null} Componente con opciones adicionales
   */
  const renderAdditionalOptions = () => {
    if (!selectedPaciente || !selectedMenu) return null;

    const bebidasConPreparacion = Object.entries(bebidasPreparacion);

    return (
      <div className="additional-options">
        <h3>Opciones Adicionales</h3>

        {/* Resumen de preparaciones de bebidas */}
        {bebidasConPreparacion.length > 0 && (
          <div className="preparaciones-summary">
            <h4>Preparación de Bebidas:</h4>
            {bebidasConPreparacion.map(([bebidaId, preparacion]) => {
              // Búsqueda de la bebida y su sección en el menú
              let bebida, seccion;
              selectedMenu?.sections.forEach((s) => {
                Object.entries(s.opciones).forEach(([tipo, opciones]) => {
                  const encontrada = opciones.find(
                    (o) => o.id === parseInt(bebidaId)
                  );
                  if (encontrada) {
                    bebida = encontrada;
                    seccion = s.titulo;
                  }
                });
              });

              return (
                <div key={bebidaId} className="preparacion-item">
                  <div className="bebida-info">
                    <span className="bebida-nombre">{bebida?.texto}</span>
                    <span className="bebida-seccion">
                      {formatTitle(seccion)}
                    </span>
                  </div>
                  <span className="preparacion-info">
                    {
                      opcionesPreparado.find((o) => o.value === preparacion)
                        ?.label
                    }
                  </span>
                  <Button
                    type="link"
                    onClick={() =>
                      setPreparacionModal({
                        visible: true,
                        bebidaId,
                        bebidaNombre: bebida?.texto,
                      })
                    }
                  >
                    Cambiar
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Campo de observaciones */}
        <div className="form-item">
          <label>Observaciones:</label>
          <Input.TextArea
            value={additionalOptions.observaciones}
            onChange={(e) =>
              setAdditionalOptions((prev) => ({
                ...prev,
                observaciones: e.target.value,
              }))
            }
            placeholder="Agregue observaciones adicionales"
            rows={4}
          />
        </div>
      </div>
    );
  };

  /**
   * Componente Modal para seleccionar la preparación de bebidas
   * @returns {JSX.Element} Modal con opciones de preparación
   */
  const PreparacionModal = () => (
    <Modal
      title={`¿Cómo desea preparar ${preparacionModal.bebidaNombre}?`}
      open={preparacionModal.visible}
      closable={false}
      maskClosable={false}
      footer={null}
      className="preparacion-modal"
      width={500}
    >
      <div className="preparacion-options">
        {opcionesPreparado.map((opcion) => (
          <Button
            key={opcion.value}
            onClick={() => {
              setBebidasPreparacion((prev) => ({
                ...prev,
                [preparacionModal.bebidaId]: opcion.value,
              }));
              setPreparacionModal({
                visible: false,
                bebidaId: null,
                bebidaNombre: "",
              });
            }}
            className="preparacion-button"
            type="default"
          >
            {opcion.label}
          </Button>
        ))}
      </div>
    </Modal>
  );

  /**
   * Formatea títulos de secciones para mostrar en la interfaz
   * @param {string} title - Título de la sección a formatear
   * @returns {string} Título formateado
   */
  const formatSectionTitle = (title) => {
    const formattedNames = {
      media_manana: "Media Mañana",
      adicional_dia: "Adicional Día",
      desayuno: "Desayuno",
      almuerzo: "Almuerzo",
      refrigerio: "Refrigerio",
      cena: "Cena",
    };

    return (
      formattedNames[title.toLowerCase()] ||
      title
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/n~/g, "ñ")
    );
  };

  /**
   * Prepara el contenido para el modal de confirmación
   * Organiza las opciones seleccionadas por sección
   * @returns {Object} Objeto con opciones organizadas y conteo total
   */
  const renderConfirmationContent = () => {
    const paciente = pacientes.find((p) => p.id === selectedPaciente);
    const opcionesPorSeccion = {};
    let totalOpciones = 0;

    // Organiza las opciones seleccionadas por sección
    selectedMenu?.sections.forEach((section) => {
      const opcionesSeccion = [];
      Object.entries(section.opciones).forEach(([tipo, opciones]) => {
        const opcionesSeleccionadas = opciones.filter((opcion) =>
          selectedOptions[tipo]?.includes(opcion.id)
        );
        if (opcionesSeleccionadas.length > 0) {
          opcionesSeccion.push({
            tipo: formatTitle(tipo),
            opciones: opcionesSeleccionadas,
          });
          totalOpciones += opcionesSeleccionadas.length;
        }
      });
      if (opcionesSeccion.length > 0) {
        opcionesPorSeccion[section.titulo] = opcionesSeccion;
      }
    });

    /**
     * Renderiza el contenido del modal de confirmación
     * @returns {JSX.Element} Contenido estructurado del modal
     */
    return (
      <div className="confirm-content">
        <div className="paciente-info">
          <h3>Datos del Paciente</h3>
          <div className="info-row nombre">
            <span className="label">Nombre del Paciente:</span>
            <span className="value">{paciente?.name}</span>
          </div>
          <div className="info-row highlight">
            <span className="label">
              Dieta Recomendada por el Médico Tratante
            </span>
            <span className="value">
              {paciente?.recommended_diet || "No especificada"}
            </span>
          </div>
          <div className="info-row highlight">
            <span className="label">
              Alergias e Intolerancias
            </span>
            <span className={`value ${!paciente?.alergias ? 'no-alergias' : ''}`}>
              {paciente?.alergias || "Sin alergias registradas"}
            </span>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="pedido-resumen">
          <h3>Resumen del Pedido</h3>
          {totalOpciones === 0 ? (
            <div className="sin-opciones-alert">
              <Alert
                message="No hay opciones seleccionadas"
                description="Debe seleccionar al menos una opción para realizar el pedido"
                type="warning"
                showIcon
              />
            </div>
          ) : (
            // Listado de opciones seleccionadas por sección
            Object.entries(opcionesPorSeccion).map(([seccion, grupos]) => (
              <div key={seccion} className="seccion-resumen">
                <h4>{formatSectionTitle(seccion)}</h4>
                {grupos.map((grupo) => (
                  <div key={grupo.tipo} className="grupo-opciones">
                    <h5>{grupo.tipo}</h5>
                    <ul>
                      {grupo.opciones.map((opcion) => (
                        <li key={opcion.id}>
                          {opcion.texto}
                          {/* Muestra la preparación si existe */}
                          {bebidasPreparacion[opcion.id] && (
                            <span className="preparacion">
                              (
                              {
                                opcionesPreparado.find(
                                  (o) =>
                                    o.value === bebidasPreparacion[opcion.id]
                                )?.label
                              }
                              )
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="advertencia">
          <p>
            Prima la dieta recomendada por el médico tratante con las
            restricciones
          </p>
        </div>
      </div>
    );
  };

  // Renderizado condicional durante la carga
  if (loading) return <Spin size="large" />;

  /**
   * Renderizado principal del componente
   */
  return (
    <div className="realizar-pedido-container">
      <div className="realizar-pedido-content">
        <h2>Realizar Pedido</h2>

        {/* Selector de paciente */}
        <div className="form-item">
          <label>Paciente:</label>
          <Select
            showSearch
            value={selectedPaciente}
            onChange={handlePacienteChange}
            filterOption={filterOption}
            className="select-field"
            placeholder="Seleccione un paciente"
            optionFilterProp="label"
            allowClear
          >
            {Array.isArray(pacientes) &&
              pacientes.map((paciente) => (
                <Option
                  key={paciente.id}
                  value={paciente.id}
                  label={`${paciente.name} - ${paciente.cedula}`}
                >
                  {paciente.name} - {paciente.cedula}
                </Option>
              ))}
          </Select>
          {errors.paciente && <p className="error">{errors.paciente}</p>}
        </div>

        {/* Selector de menú */}
        <div className="form-item">
          <label>Menú:</label>
          <Select
            value={selectedMenu?.id}
            onChange={handleMenuChange}
            className="select-field"
            placeholder="Seleccione un menú"
          >
            {Array.isArray(menus) &&
              menus.map((menu) => (
                <Option key={menu.id} value={menu.id}>
                  {menu.nombre}
                </Option>
              ))}
          </Select>
          {errors.menu && <p className="error">{errors.menu}</p>}
        </div>

        {/* Secciones del menú */}
        {selectedMenu && (
          <Collapse
            activeKey={activeKeys}
            onChange={handleCollapseChange}
            expandIconPosition="end"
          >
            {renderMenuSections()}
          </Collapse>
        )}

        {/* Opciones adicionales */}
        {renderAdditionalOptions()}

        {/* Botones de acción */}
        <div className="form-actions">
          <Button
            type="primary"
            onClick={() => setConfirmVisible(true)}
            disabled={
              !selectedPaciente ||
              !selectedMenu ||
              !Object.values(selectedOptions).some(
                (opciones) => opciones && opciones.length > 0
              )
            }
          >
            Crear Pedido
          </Button>
        </div>

        {/* Modal de confirmación */}
        <Modal
          title="Confirmar Pedido"
          open={confirmVisible}
          onOk={handleOk}
          onCancel={() => setConfirmVisible(false)}
          okText="Confirmar"
          cancelText="Cancelar"
          className="confirm-pedido-modal"
          width={700}
        >
          {renderConfirmationContent()}
        </Modal>

        {/* Modal de preparación de bebidas */}
        <PreparacionModal />
      </div>
    </div>
  );
};

export default RealizarPedido;
