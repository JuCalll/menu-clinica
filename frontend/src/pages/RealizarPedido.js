import React, { useEffect, useState } from "react";
import { 
  Select, 
  Button, 
  Checkbox, 
  Spin, 
  Collapse, 
  Modal, 
  message, 
  Input 
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

  // Definimos las opciones de preparación
  const opcionesPreparado = [
    { value: 'leche_entera', label: 'En leche entera' },
    { value: 'leche_deslactosada', label: 'En leche deslactosada' },
    { value: 'leche_almendras', label: 'En leche de almendras' },
    { value: 'agua', label: 'En agua' },
    { value: 'unica_preparacion', label: 'Única preparación' }
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

  const handleOptionChange = (optionType, optionId, checked, opcionTexto) => {
    if (checked && 
        (optionType === "bebidas" || 
         optionType === "bebidas_calientes" || 
         (optionType === "platos_principales" && selectedMenu?.sections.some(s => s.titulo === "Desayuno")))) {
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
    setConfirmVisible(false);
    if (!validateForm()) return;

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

  const renderMenuSections = () => {
    if (!selectedMenu?.sections) return null;

    return selectedMenu.sections.map((section) => (
      <Panel header={section.titulo} key={section.id}>
        {Object.entries(section.opciones).map(([tipo, opciones]) => {
          if (!Array.isArray(opciones) || opciones.length === 0) return null;

          return (
            <div key={tipo} className="option-group">
              <h4>{formatTitle(tipo)}</h4>
              <div className="options-container">
                {opciones.map((opcion) => (
                  <div key={opcion.id} className="option-item">
                    <Checkbox
                      checked={selectedOptions[tipo]?.includes(opcion.id)}
                      onChange={(e) => handleOptionChange(tipo, opcion.id, e.target.checked, opcion.texto)}
                    >
                      {opcion.texto}
                    </Checkbox>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </Panel>
    ));
  };

  const formatTitle = (title) => {
    return title
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
                  <span>{bebida?.texto} ({seccion})</span>
                  <span>{opcionesPreparado.find(o => o.value === preparacion)?.label}</span>
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
          >
            {opcion.label}
          </Button>
        ))}
      </div>
    </Modal>
  );

  if (loading) return <Spin size="large" />;

  return (
    <div className="realizar-pedido-container">
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
        <Collapse defaultActiveKey={['0']} expandIconPosition="end">
          {renderMenuSections()}
        </Collapse>
      )}

      {renderAdditionalOptions()}

      <div className="form-actions">
        <Button 
          type="primary" 
          onClick={() => setConfirmVisible(true)}
          disabled={!selectedPaciente || !selectedMenu}
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
      >
        <p>¿Está seguro que desea crear este pedido?</p>
      </Modal>

      <PreparacionModal />
    </div>
  );
};

export default RealizarPedido;
