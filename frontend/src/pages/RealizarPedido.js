// Importamos React y los hooks useState y useEffect para manejar estado y efectos
import React, { useState, useEffect } from 'react';
// Importamos componentes y funciones desde Ant Design y la API personalizada
import { Select, Button, Checkbox, Spin, Collapse, Modal } from 'antd';
import { getPacientes, getMenus, createPedido } from '../services/api';
// Importamos el archivo de estilos SCSS específico para este componente
import '../styles/RealizarPedido.scss';

// Desestructuramos algunos componentes para un acceso más limpio
const { Option } = Select;
const { Panel } = Collapse;

// Definimos el componente RealizarPedido
const RealizarPedido = () => {
    // Estado para manejar los pacientes, menús, opciones seleccionadas, etc.
    const [pacientes, setPacientes] = useState([]);
    const [menus, setMenus] = useState([]);
    const [selectedPaciente, setSelectedPaciente] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [additionalOptions, setAdditionalOptions] = useState({
        leche: '',
        bebida: '',
        azucarPanela: [],
        vegetales: '',
        golosina: false
    });
    const [loading, setLoading] = useState(true);
    const [confirmVisible, setConfirmVisible] = useState(false);

    // Efecto para obtener pacientes y menús al montar el componente
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
    }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar

    // Función para manejar el cambio de selección del paciente
    const handlePacienteChange = value => {
        setSelectedPaciente(value);
    };

    // Función para manejar el cambio de selección del menú
    const handleMenuChange = value => {
        const menu = menus.find(menu => menu.id === value);
        setSelectedMenu(menu);
        setSelectedOptions({});
    };

    // Función para manejar el cambio de selección de opciones
    const handleOptionChange = (sectionName, optionType, optionId, checked) => {
        setSelectedOptions(prevOptions => {
            const newOptions = { ...prevOptions };

            if (!newOptions[sectionName]) {
                newOptions[sectionName] = {};
            }

            if (!newOptions[sectionName][optionType]) {
                newOptions[sectionName][optionType] = [];
            }

            if (checked) {
                if (optionType === 'acompanantes') {
                    if (newOptions[sectionName][optionType].length < 2) {
                        newOptions[sectionName][optionType].push(optionId);
                    }
                } else {
                    newOptions[sectionName][optionType] = [optionId]; // Solo se permite una opción
                }
            } else {
                newOptions[sectionName][optionType] = newOptions[sectionName][optionType].filter(id => id !== optionId);
            }

            console.log('Updated options:', newOptions); // Log para verificar el estado actualizado
            return newOptions;
        });
    };

    // Función para validar las selecciones hechas por el usuario
    const validateSelections = () => {
        const errors = [];

        const sectionsValidation = {
            Adicional: { adicionales: { max: 1 } },
            Algo: { adicionales: { max: 1 }, bebidas: { max: 1 } },
            Onces: { adicionales: { max: 1 } },
            Desayuno: { adicionales: { max: 1 }, platos_principales: { max: 1 }, acompanantes: { max: 2 }, bebidas: { max: 1 } },
            Almuerzo: { adicionales: { max: 1 }, platos_principales: { max: 1 }, acompanantes: { max: 2 }, bebidas: { max: 1 } },
            Cena: { adicionales: { max: 1 }, platos_principales: { max: 1 }, acompanantes: { max: 2 }, bebidas: { max: 1 } },
        };

        for (const [sectionName, rules] of Object.entries(sectionsValidation)) {
            const sectionOptions = selectedOptions[sectionName] || {};
            for (const [optionType, rule] of Object.entries(rules)) {
                const selectedCount = (sectionOptions[optionType] || []).length;
                if (rule.max !== undefined && selectedCount > rule.max) {
                    errors.push(`${sectionName} - ${optionType}: Máximo ${rule.max} opciones`);
                }
            }
        }

        return errors;
    };

    // Función para mostrar el modal de confirmación
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

    // Función para manejar la confirmación y creación del pedido
    const handleOk = async () => {
        setConfirmVisible(false);
        try {
            const opciones = [];
            for (const section of selectedMenu.sections) {
                for (const key in section) {
                    if (section[key] instanceof Array) {
                        section[key].forEach(option => {
                            opciones.push({
                                id: option.id,
                                selected: selectedOptions[section.titulo]?.[key]?.includes(option.id) || false
                            });
                        });
                    }
                }
            }
            console.log('Datos a enviar al backend:', {
                paciente: selectedPaciente,
                menu: selectedMenu.id,
                opciones: opciones,
                adicionales: additionalOptions,
            });
            const pedido = {
                paciente: selectedPaciente,
                menu: selectedMenu.id,
                opciones: opciones,
                adicionales: additionalOptions,
            };
            await createPedido(pedido);
            resetForm();
        } catch (error) {
            console.error('Error creating pedido', error);
        }
    };

    // Función para resetear el formulario después de enviar el pedido
    const resetForm = () => {
        setSelectedPaciente(null);
        setSelectedMenu(null);
        setSelectedOptions({});
        setAdditionalOptions({
            leche: '',
            bebida: '',
            azucarPanela: [],
            vegetales: '',
            golosina: false
        });
    };

    // Función para cancelar el modal de confirmación
    const handleCancel = () => {
        setConfirmVisible(false);
    };

    // Función para filtrar las opciones de los select
    const filterOption = (input, option) => {
        return option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };

    // Mostrar un spinner de carga mientras se obtienen los datos
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
                    filterOption={filterOption}
                    value={selectedPaciente}
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
                <Select value={selectedMenu?.id} onChange={handleMenuChange} style={{ width: '100%' }}>
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
            <div className="additional-options">
                <h3>Opciones Adicionales</h3>
                <div className="form-item">
                    <label>Leche</label>
                    <Select
                        value={additionalOptions.leche}
                        onChange={value => setAdditionalOptions(prev => ({ ...prev, leche: value }))}
                        style={{ width: '100%' }}
                    >
                        <Option value="entera">Leche entera</Option>
                        <Option value="deslactosada">Leche deslactosada</Option>
                    </Select>
                </div>
                <div className="form-item">
                    <label>Bebida</label>
                    <Select
                        value={additionalOptions.bebida}
                        onChange={value => setAdditionalOptions(prev => ({ ...prev, bebida: value }))}
                        style={{ width: '100%' }}
                    >
                        <Option value="leche">Bebida en leche</Option>
                        <Option value="agua">Bebida en agua</Option>
                    </Select>
                </div>
                <div className="form-item">
                    <label>Azúcar y/o Panela</label>
                    <Checkbox.Group
                        value={additionalOptions.azucarPanela}
                        onChange={checkedValues => setAdditionalOptions(prev => ({ ...prev, azucarPanela: checkedValues }))}
                    >
                        <Checkbox value="azucar">Azúcar</Checkbox>
                        <Checkbox value="panela">Panela</Checkbox>
                    </Checkbox.Group>
                </div>
                <div className="form-item">
                    <label>Vegetales</label>
                    <Select
                        value={additionalOptions.vegetales}
                        onChange={value => setAdditionalOptions(prev => ({ ...prev, vegetales: value }))}
                        style={{ width: '100%' }}
                    >
                        <Option value="crudos">Vegetales Crudos</Option>
                        <Option value="calientes">Vegetales Calientes</Option>
                    </Select>
                </div>
                <div className="form-item">
                    <label>Golosina Opcional</label>
                    <Checkbox
                        checked={additionalOptions.golosina}
                        onChange={e => setAdditionalOptions(prev => ({ ...prev, golosina: e.target.checked }))}
                    >
                        Golosina
                    </Checkbox>
                </div>
            </div>
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
