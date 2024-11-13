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
  Alert 
} from "antd";
import { getPacientes, getMenus, createPedido } from "../services/api";
import "../styles/RealizarPedido.scss";

const { Option } = Select;
const { Panel } = Collapse;

const RealizarPedido = () => {
  const [pacientes, setPacientes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [additionalOptions, setAdditionalOptions] = useState({
    observaciones: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [bebidasPreparacion, setBebidasPreparacion] = useState({});
  const [preparacionModal, setPreparacionModal] = useState({
    visible: false,
    bebidaId: null,
    bebidaNombre: ''
  });
  const [activeKeys, setActiveKeys] = useState(['0']);

  // Definimos las opciones de preparación
  const opcionesPreparado = [
    { value: 'leche_entera', label: 'Leche Entera' },
    { value: 'leche_deslactosada', label: 'Leche Deslactosada' },
    { value: 'leche_almendras', label: 'Leche de Almendras' },
    { value: 'agua', label: 'Agua' },
    { value: 'unica_preparacion', label: 'Única Preparación' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pacientesResponse, menusResponse] = await Promise.all([
          getPacientes(),
          getMenus()
        ]);
        setPacientes(pacientesResponse || []);
        setMenus(menusResponse || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        message.error("Error al cargar los datos");
        setPacientes([]);
        setMenus([]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePacienteChange = (value) => {
    setSelectedPaciente(value);
    if (!value) {
      resetForm();
    }
    setErrors((prev) => ({ ...prev, paciente: null }));
  };

  const handleMenuChange = (value) => {
    const menu = menus.find((menu) => menu.id === value);
    setSelectedMenu(menu);
    setSelectedOptions({});
    setErrors((prev) => ({ ...prev, menu: null }));
  };

  const handleOptionChange = (optionType, optionId, checked, opcionTexto, seccionTitulo) => {
    // Verificamos si es una bebida caliente o una bebida del desayuno
    const shouldShowModal = checked && (
      optionType === "bebidas_calientes" || 
      (optionType === "bebidas" && seccionTitulo?.toLowerCase() === "desayuno")
    );

    if (shouldShowModal) {
      setPreparacionModal({
        visible: true,
        bebidaId: optionId,
        bebidaNombre: opcionTexto
      });
    } else if (!checked) {
      setBebidasPreparacion(prev => {
        const newPreparaciones = { ...prev };
        delete newPreparaciones[optionId];
        return newPreparaciones;
      });
    }

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

  const handleOk = async () => {
    if (!validateForm()) return;

    // Verificar si hay opciones seleccionadas
    const hayOpcionesSeleccionadas = Object.values(selectedOptions).some(
      opciones => opciones && opciones.length > 0
    );

    if (!hayOpcionesSeleccionadas) {
      message.error('Debe seleccionar al menos una opción para realizar el pedido');
      return;
    }

    setConfirmVisible(false);
    
    const opcionesArray = [];
    Object.entries(selectedOptions).forEach(([optionType, selectedIds]) => {
      selectedIds.forEach(optionId => {
        opcionesArray.push({
          id: optionId,
          selected: true
        });
      });
    });

    const pedidoData = {
      paciente_id: selectedPaciente,
      menu_id: selectedMenu.id,
      opciones: opcionesArray,
      adicionales: {
        ...additionalOptions,
        bebidasPreparacion
      },
      status: 'pendiente',
      sectionStatus: {},
      observaciones: additionalOptions.observaciones
    };

    try {
      await createPedido(pedidoData);
      message.success('Pedido creado exitosamente');
      resetForm();
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      message.error('Error al crear el pedido');
    }
  };

  const resetForm = () => {
    setSelectedPaciente(null);
    setSelectedMenu(null);
    setSelectedOptions({});
    setBebidasPreparacion({});
    setAdditionalOptions({
      observaciones: ""
    });
  };

  const handleCollapseChange = (keys) => {
    setActiveKeys(keys);
  };

  const renderMenuSections = () => {
    if (!selectedMenu?.sections) return null;

    return selectedMenu.sections.map((section) => (
      <Panel header={formatSectionTitle(section.titulo)} key={section.id}>
        <div className="option-group" data-type={section.titulo.toLowerCase()}>
          {Object.entries(section.opciones).map(([tipo, opciones]) => {
            if (!Array.isArray(opciones) || opciones.length === 0) return null;

            return (
              <div key={tipo} className="option-group" data-type={tipo.toLowerCase()}>
                <h4>{formatTitle(tipo)}</h4>
                <div className="options-container">
                  {opciones.map((opcion) => (
                    <div key={opcion.id} className="option-item">
                      <Checkbox
                        checked={selectedOptions[tipo]?.includes(opcion.id)}
                        onChange={(e) => handleOptionChange(
                          tipo, 
                          opcion.id, 
                          e.target.checked, 
                          opcion.texto,
                          section.titulo
                        )}
                      >
                        {opcion.texto}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="section-footer">
            <Button 
              type="default"
              onClick={() => {
                setActiveKeys(activeKeys.filter(key => key !== section.id.toString()));
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

  const formatTitle = (title) => {
    const formattedNames = {
      "acompanante": "Acompañante",
      "bebidas_calientes": "Bebidas Calientes",
      "bebidas_frias": "Bebidas Frías",
      "sopa_del_dia": "Sopa del Día",
      "plato_principal": "Plato Principal",
      "media_manana_fit": "Media Mañana Fit",
      "media_manana_tradicional": "Media Mañana Tradicional",
      "refrigerio_fit": "Refrigerio Fit",
      "refrigerio_tradicional": "Refrigerio Tradicional",
      "entrada": "Entrada",
      "huevos": "Huevos",
      "toppings": "Toppings",
      "bebidas": "Bebidas",
      "vegetariano": "Vegetariano",
      "vegetales": "Vegetales",
      "adicionales": "Adicionales",
      "leche_entera": "Leche Entera",
      "leche_deslactosada": "Leche Deslactosada",
      "leche_almendras": "Leche de Almendras",
      "agua": "Agua",
      "unica_preparacion": "Única Preparación"
    };

    // Si existe una traducción directa, la usamos
    if (formattedNames[title?.toLowerCase()]) {
      return formattedNames[title.toLowerCase()];
    }

    // Si no hay título o es undefined, retornamos un string vacío
    if (!title) return '';

    // Si no, aplicamos el formato general
    return title
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index > 0 && ['del', 'de', 'la', 'las', 'los'].includes(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  const filterOption = (input, option) => {
    if (!input.trim()) return true;
    
    const searchText = option.label.toLowerCase();
    return searchText.includes(input.toLowerCase());
  };

  const renderAdditionalOptions = () => {
    if (!selectedPaciente || !selectedMenu) return null;

    const bebidasConPreparacion = Object.entries(bebidasPreparacion);
    
    return (
      <div className="additional-options">
        <h3>Opciones Adicionales</h3>
        
        {bebidasConPreparacion.length > 0 && (
          <div className="preparaciones-summary">
            <h4>Preparación de Bebidas:</h4>
            {bebidasConPreparacion.map(([bebidaId, preparacion]) => {
              // Buscamos la sección y la bebida
              let bebida, seccion;
              selectedMenu?.sections.forEach(s => {
                Object.entries(s.opciones).forEach(([tipo, opciones]) => {
                  const encontrada = opciones.find(o => o.id === parseInt(bebidaId));
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
                    <span className="bebida-seccion">{formatTitle(seccion)}</span>
                  </div>
                  <span className="preparacion-info">
                    {opcionesPreparado.find(o => o.value === preparacion)?.label}
                  </span>
                  <Button 
                    type="link" 
                    onClick={() => setPreparacionModal({
                      visible: true,
                      bebidaId,
                      bebidaNombre: bebida?.texto
                    })}
                  >
                    Cambiar
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="form-item">
          <label>Observaciones:</label>
          <Input.TextArea
            value={additionalOptions.observaciones}
            onChange={e => setAdditionalOptions(prev => ({
              ...prev,
              observaciones: e.target.value
            }))}
            placeholder="Agregue observaciones adicionales"
            rows={4}
          />
        </div>
      </div>
    );
  };

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
        {opcionesPreparado.map(opcion => (
          <Button
            key={opcion.value}
            onClick={() => {
              setBebidasPreparacion(prev => ({
                ...prev,
                [preparacionModal.bebidaId]: opcion.value
              }));
              setPreparacionModal({ visible: false, bebidaId: null, bebidaNombre: '' });
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

  const formatSectionTitle = (title) => {
    const formattedNames = {
      "media_manana": "Media Mañana",
      "adicional_dia": "Adicional Día",
      "desayuno": "Desayuno",
      "almuerzo": "Almuerzo",
      "refrigerio": "Refrigerio",
      "cena": "Cena"
    };

    return formattedNames[title.toLowerCase()] || 
      title.replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase())
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/n~/g, 'ñ');
  };

  const renderConfirmationContent = () => {
    const paciente = pacientes.find(p => p.id === selectedPaciente);
    const opcionesPorSeccion = {};
    let totalOpciones = 0;

    selectedMenu?.sections.forEach(section => {
      const opcionesSeccion = [];
      Object.entries(section.opciones).forEach(([tipo, opciones]) => {
        const opcionesSeleccionadas = opciones.filter(
          opcion => selectedOptions[tipo]?.includes(opcion.id)
        );
        if (opcionesSeleccionadas.length > 0) {
          opcionesSeccion.push({
            tipo: formatTitle(tipo),
            opciones: opcionesSeleccionadas
          });
          totalOpciones += opcionesSeleccionadas.length;
        }
      });
      if (opcionesSeccion.length > 0) {
        opcionesPorSeccion[section.titulo] = opcionesSeccion;
      }
    });

    return (
      <div className="confirm-content">
        <div className="paciente-info">
          <h3>Datos del Paciente</h3>
          <div className="info-row">
            <span className="label">Nombre:</span>
            <span className="value">{paciente?.name}</span>
          </div>
          <div className="info-row highlight">
            <span className="label">Dieta Recomendada:</span>
            <span className="value">{paciente?.recommended_diet || 'No especificada'}</span>
          </div>
          <div className="info-row highlight">
            <span className="label">Alergias:</span>
            <span className="value">{paciente?.alergias || 'Ninguna registrada'}</span>
          </div>
        </div>

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
            Object.entries(opcionesPorSeccion).map(([seccion, grupos]) => (
              <div key={seccion} className="seccion-resumen">
                <h4>{formatSectionTitle(seccion)}</h4>
                {grupos.map(grupo => (
                  <div key={grupo.tipo} className="grupo-opciones">
                    <h5>{grupo.tipo}</h5>
                    <ul>
                      {grupo.opciones.map(opcion => (
                        <li key={opcion.id}>
                          {opcion.texto}
                          {bebidasPreparacion[opcion.id] && (
                            <span className="preparacion">
                              ({opcionesPreparado.find(o => o.value === bebidasPreparacion[opcion.id])?.label})
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
          <p>Prima la dieta recomendada por el médico tratante con las restricciones</p>
        </div>
      </div>
    );
  };

  if (loading) return <Spin size="large" />;

  return (
    <div className="realizar-pedido-container">
      <div className="realizar-pedido-content">
        <h2>Realizar Pedido</h2>
        
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
            {Array.isArray(pacientes) && pacientes.map((paciente) => (
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

        <div className="form-item">
          <label>Menú:</label>
          <Select
            value={selectedMenu?.id}
            onChange={handleMenuChange}
            className="select-field"
            placeholder="Seleccione un menú"
          >
            {Array.isArray(menus) && menus.map((menu) => (
              <Option key={menu.id} value={menu.id}>
                {menu.nombre}
              </Option>
            ))}
          </Select>
          {errors.menu && <p className="error">{errors.menu}</p>}
        </div>

        {selectedMenu && (
          <Collapse 
            activeKey={activeKeys} 
            onChange={handleCollapseChange}
            expandIconPosition="end"
          >
            {renderMenuSections()}
          </Collapse>
        )}

        {renderAdditionalOptions()}

        <div className="form-actions">
          <Button 
            type="primary" 
            onClick={() => setConfirmVisible(true)}
            disabled={
              !selectedPaciente || 
              !selectedMenu || 
              !Object.values(selectedOptions).some(opciones => opciones && opciones.length > 0)
            }
          >
            Crear Pedido
          </Button>
        </div>

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

        <PreparacionModal />
      </div>
    </div>
  );
};

export default RealizarPedido;
