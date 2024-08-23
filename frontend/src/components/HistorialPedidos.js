import React, { useState, useEffect } from 'react';
import { Collapse, Spin, Select } from 'antd';
import { getPacientes, getPedidosCompletados } from '../services/api';
import '../styles/HistorialPedidos.scss';

const { Panel } = Collapse;
const { Option } = Select;

const HistorialPedidos = () => {
    const [pacientes, setPacientes] = useState([]);
    const [pedidosCompletados, setPedidosCompletados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPaciente, setSelectedPaciente] = useState(null);

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await getPacientes();
                console.log('Pacientes:', response); // Log para ver los pacientes obtenidos
                setPacientes(response);
            } catch (error) {
                console.error('Error fetching patients', error);
            }
        };

        fetchPacientes();
    }, []);

    useEffect(() => {
        const fetchPedidosCompletados = async () => {
            if (!selectedPaciente) {
                setPedidosCompletados([]);
                return;
            }

            setLoading(true);
            try {
                console.log('Fetching pedidos completados for paciente ID:', selectedPaciente); // Log para ver la solicitud de pedidos completados
                const response = await getPedidosCompletados(selectedPaciente);
                console.log('Pedidos Completados:', response); // Log para ver los pedidos completados
                setPedidosCompletados(response);
            } catch (error) {
                console.error('Error fetching completed orders', error);
            }
            setLoading(false);
        };

        fetchPedidosCompletados();
    }, [selectedPaciente]);

    const handlePacienteChange = (value) => {
        console.log('Paciente seleccionado:', value); // Log para ver el paciente seleccionado
        setSelectedPaciente(value);
    };

    const filterOption = (input, option) => {
        return option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };

    if (loading) {
        return <Spin />;
    }

    const renderSections = (pedido) => {
        console.log('Rendering sections for pedido:', pedido); // Log para ver el pedido y sus secciones
        const sectionsToShow = {
            'Adicional': ['adicionales'],
            'Algo': ['adicionales', 'bebidas'],
            'Onces': ['adicionales'],
            'Desayuno': ['adicionales', 'platos_principales', 'acompanantes', 'bebidas'],
            'Almuerzo': ['adicionales', 'platos_principales', 'acompanantes', 'bebidas'],
            'Cena': ['adicionales', 'platos_principales', 'acompanantes', 'bebidas']
        };

        return pedido.menu.sections.map(section => {
            const optionsToRender = sectionsToShow[section.titulo];
            console.log('Section:', section, 'Options to render:', optionsToRender); // Log para ver cada sección y sus opciones
            return optionsToRender && optionsToRender.length > 0 ? (
                <div key={section.id}>
                    <h4>{section.titulo}</h4>
                    {optionsToRender.map(optionType => (
                        <div key={optionType}>
                            <h5>{optionType.charAt(0).toUpperCase() + optionType.slice(1)}</h5>
                            {section[optionType].map(option => (
                                <div key={option.id}>
                                    {option.texto}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : null;
        });
    };

    return (
        <div className="historial-pedidos">
            <h2>Historial de Pedidos Completados</h2>
            <Select
                showSearch
                placeholder="Seleccionar Paciente"
                value={selectedPaciente}
                onChange={handlePacienteChange}
                style={{ width: 300, marginBottom: 20 }}
                filterOption={filterOption}
            >
                {pacientes.map(paciente => (
                    <Option key={paciente.id} value={paciente.id}>
                        {paciente.name} (Cama: {paciente.cama.nombre}, Hab: {paciente.cama.habitacion.nombre}, Serv: {paciente.cama.habitacion.servicio.nombre})
                    </Option>
                ))}
            </Select>

            {pedidosCompletados.length > 0 ? (
                <Collapse>
                    {pedidosCompletados.map(pedido => (
                        <Panel header={`Pedido ${pedido.id} - ${pedido.paciente.name}`} key={pedido.id}>
                            <h4>Fecha del Pedido: {new Date(pedido.fecha_pedido).toLocaleString()}</h4>
                            {renderSections(pedido)}
                            <div className="adicionales">
                                <h4>Opciones Adicionales del Menú</h4>
                                <div>Leche: {pedido.adicionales.leche}</div>
                                <div>Bebida: {pedido.adicionales.bebida}</div>
                                <div>Azúcar/Panela: {pedido.adicionales.azucarPanela.join(', ')}</div>
                                <div>Vegetales: {pedido.adicionales.vegetales}</div>
                                <div>Golosina: {pedido.adicionales.golosina ? 'Sí' : 'No'}</div>
                            </div>
                        </Panel>
                    ))}
                </Collapse>
            ) : (
                <p>No hay pedidos completados para este paciente.</p>
            )}
        </div>
    );
};

export default HistorialPedidos;
