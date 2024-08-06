import React, { useState, useEffect } from 'react';
import { Select, Button, Checkbox, Spin, Collapse, Modal } from 'antd';
import { getPacientes, getMenus, createPedido } from '../services/api';
import '../styles/RealizarPedido.scss';

const { Option } = Select;
const { Panel } = Collapse;

const RealizarPedido = () => {
  const [pacientes, setPacientes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pacientesResponse = await getPacientes();
        const menusResponse = await getMenus();
        setPacientes(pacientesResponse);
        setMenus(menusResponse);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePacienteChange = value => {
    setSelectedPaciente(value);
  };

  const handleMenuChange = value => {
    const menu = menus.find(menu => menu.id === value);
    setSelectedMenu(menu);
    setSelectedOptions({});
  };

  const handleOptionChange = (sectionName, optionType, optionId, checked) => {
    const sectionsValidation = {
      Adicional: { adicionales: { max: 1 } },
      Algo: { adicionales: { max: 1 }, bebidas: { max: 1 } },
      Onces: { adicionales: { max: 1 } },
      Desayuno: { adicionales: { max: 1 }, platos_principales: { max: 1 }, acompanantes: { exact: 2 }, bebidas: { max: 1 } },
      Almuerzo: { adicionales: { max: 1 }, platos_principales: { max: 1 }, acompanantes: { exact: 2 }, bebidas: { max: 1 } },
      Cena: { adicionales: { max: 1 }, platos_principales: { max: 1 }, acompanantes: { exact: 2 }, bebidas: { max: 1 } },
    };

    setSelectedOptions(prevOptions => {
      const newOptions = { ...prevOptions };

      if (!newOptions[sectionName]) {
        newOptions[sectionName] = {};
      }

      if (!newOptions[sectionName][optionType]) {
        newOptions[sectionName][optionType] = [];
      }

      if (checked) {
        const selectedCount = newOptions[sectionName][optionType].length;

        if (sectionsValidation[sectionName] && sectionsValidation[sectionName][optionType]) {
          const rule = sectionsValidation[sectionName][optionType];

          if (rule.max !== undefined && selectedCount >= rule.max) {
            return newOptions; // No permite seleccionar más de la cantidad máxima permitida
          }

          if (rule.exact !== undefined && selectedCount >= rule.exact) {
            return newOptions; // No permite seleccionar más de la cantidad exacta permitida
          }
        }

        newOptions[sectionName][optionType].push(optionId);
      } else {
        newOptions[sectionName][optionType] = newOptions[sectionName][optionType].filter(id => id !== optionId);
      }

      return newOptions;
    });
  };

  const validateSelections = () => {
    const errors = [];

    const sectionsValidation = {
      Adicional: { adicionales: { max: 1 } },
      Algo: { adicionales: { max: 1 }, bebidas: { max: 1 } },
      Onces: { adicionales: { max: 1 } },
      Desayuno: { adicionales: { max: 1 }, platos_principales: { max: 1 }, acompanantes: { exact: 2 }, bebidas: { max: 1 } },
      Almuerzo: { adicionales: { max: 1 }, platos_principales: { max: 1 }, acompanantes: { exact: 2 }, bebidas: { max: 1 } },
      Cena: { adicionales: { max: 1 }, platos_principales: { max: 1 }, acompanantes: { exact: 2 }, bebidas: { max: 1 } },
    };

    for (const [sectionName, rules] of Object.entries(sectionsValidation)) {
      const sectionOptions = selectedOptions[sectionName] || {};
      for (const [optionType, rule] of Object.entries(rules)) {
        const selectedCount = (sectionOptions[optionType] || []).length;
        if (rule.max !== undefined && selectedCount > rule.max) {
          errors.push(`${sectionName} - ${optionType}: Máximo ${rule.max} opciones`);
        }
        if (rule.exact !== undefined && selectedCount !== rule.exact) {
          errors.push(`${sectionName} - ${optionType}: Debe seleccionar exactamente ${rule.exact} opciones`);
        }
      }
    }

    return errors;
  };

  const showConfirmModal = () => {
    const validationErrors = validateSelections();
    if (validationErrors.length > 0) {
      Modal.error({
        title: 'Errores de Validación',
        content: (
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
      });
    } else {
      setConfirmVisible(true);
    }
  };

  const handleOk = async () => {
    setConfirmVisible(false);
    try {
      const pedido = {
        paciente: selectedPaciente,
        menu: selectedMenu.id,
        opciones: selectedOptions,
      };
      await createPedido(pedido);
      // handle success (e.g., show a message or redirect)
    } catch (error) {
      console.error('Error creating pedido', error);
    }
  };

  const handleCancel = () => {
    setConfirmVisible(false);
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="realizar-pedido">
      <h2>Realizar un Pedido</h2>
      <div className="form-item">
        <label>Paciente</label>
        <Select
          showSearch
          filterOption={(input, option) => 
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onChange={handlePacienteChange}
          style={{ width: '100%' }}
        >
          {pacientes.map(paciente => (
            <Option key={paciente.id} value={paciente.id}>
              {paciente.name} (Hab: {paciente.room.numero}, Serv: {paciente.room.servicio.nombre})
            </Option>
          ))}
        </Select>
      </div>
      <div className="form-item">
        <label>Menú</label>
        <Select onChange={handleMenuChange} style={{ width: '100%' }}>
          {menus.map(menu => (
            <Option key={menu.id} value={menu.id}>
              {menu.nombre}
            </Option>
          ))}
        </Select>
      </div>
      {selectedMenu && selectedMenu.sections.map(section => (
        <Collapse key={section.id} className="section-collapse">
          <Panel header={section.titulo}>
            {Object.keys(section).map(key => (
              key !== 'id' && key !== 'titulo' && section[key].length > 0 && (
                <div key={key} className="option-group">
                  <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                  {section[key].map(option => (
                    <Checkbox
                      key={option.id}
                      checked={selectedOptions[section.titulo]?.[key]?.includes(option.id)}
                      onChange={e => handleOptionChange(section.titulo, key, option.id, e.target.checked)}
                    >
                      {option.texto}
                    </Checkbox>
                  ))}
                </div>
              )
            ))}
          </Panel>
        </Collapse>
      ))}
      <Button onClick={showConfirmModal} type="primary" className="submit-button">
        Realizar Pedido
      </Button>
      <Modal
        title="Confirmación de Pedido"
        visible={confirmVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>
          Pacientes con restricción de azúcares o dieta hipoglúcida no deben consumir alimentos con mermelada, galletas dulces, ni harinas adicionales.
        </p>
        <p>
          Prima la dieta recomendada por el médico tratante con las restricciones.
        </p>
        <p>
          Asegúrese de los elementos seleccionados según las restricciones del paciente.
        </p>
      </Modal>
    </div>
  );
};

export default RealizarPedido;
