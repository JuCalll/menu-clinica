import React, { useState, useEffect } from 'react';
import { Button, Spin, Collapse } from 'antd';
import { getPedidos, updatePedido } from '../services/api';
import '../styles/PedidosPendientes.scss';
import api from '../axiosConfig';

const { Panel } = Collapse;

const PedidosPendientes = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Log para asegurarnos de que se está llamando correctamente a la API
    useEffect(() => {
        const fetchPedidos = async () => {
            console.log('Fetching pedidos...');
            try {
                const response = await getPedidos();
                console.log('Pedidos fetched:', response);
                setPedidos(response.filter(pedido => pedido.status !== 'completado'));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching pedidos', error);
                setLoading(false);
            }
        };

        fetchPedidos();
    }, []);

    const handleSectionStatusChange = async (pedidoId, sectionTitle) => {
        console.log(`Changing section status for pedido ID: ${pedidoId}, section: ${sectionTitle}`);
        try {
            const pedido = pedidos.find(p => p.id === pedidoId);
            const updatedSections = { ...pedido.sectionStatus, [sectionTitle]: 'completado' };

            const allSectionsCompleted = Object.values(updatedSections).length === pedido.menu.sections.length &&
                                         Object.values(updatedSections).every(status => status === 'completado');

            const updatedPedido = {
                ...pedido,
                status: allSectionsCompleted ? 'completado' : 'en_proceso',
                sectionStatus: updatedSections,
            };

            await updatePedido(pedidoId, updatedPedido);

            setPedidos(prevPedidos =>
                prevPedidos.map(p =>
                    p.id === pedidoId
                        ? { ...p, sectionStatus: updatedSections, status: updatedPedido.status }
                        : p
                ).filter(p => p.status !== 'completado')
            );

        } catch (error) {
            console.error('Error updating section status', error);
        }
    };

    const handlePrint = async (pedido) => {
        const url = `/pedidos/${pedido.id}/print/`;
        console.log("Imprimiendo pedido ID:", pedido.id);
        try {
            const response = await api.post(url);
            if (response.status === 200) {
                console.log("Pedido impreso con éxito.");
            } else {
                console.error("Error al intentar imprimir el pedido:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error al intentar imprimir el pedido:", error);
        }
    };

    const renderSelectedOptions = (section, optionsType, pedido) => {
        return section[optionsType]
            .filter(option => 
                pedido.opciones.some(o => o.menu_option.id === option.id && o.selected)
            )
            .map(option => (
                <div key={option.id}>
                    {option.texto}
                </div>
            ));
    };

    const renderSections = (pedido) => {
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
    
            return optionsToRender && optionsToRender.length > 0 ? (
                <div key={section.id} className='section'>
                    <h4>{section.titulo}</h4>
                    {optionsToRender.map(optionType => (
                        <div key={optionType}>
                            <h5>{optionType.charAt(0).toUpperCase() + optionType.slice(1)}</h5>
                            {renderSelectedOptions(section, optionType, pedido)}
                        </div>
                    ))}
                    <div className="buttons-container">
                        <Button
                            onClick={() => handleSectionStatusChange(pedido.id, section.titulo)}
                            disabled={pedido.sectionStatus?.[section.titulo] === 'completado'}
                            className='custom-button'
                        >
                            {pedido.sectionStatus?.[section.titulo] === 'completado' ? 'Completado' : 'Marcar como Completado'}
                        </Button>
                        <Button onClick={() => handlePrint(pedido)} className="custom-button">
                            Imprimir
                        </Button>
                    </div>
                </div>
            ) : null;
        });
    };    
                              
    if (loading) {
        return <Spin />;
    }

    return (
        <div className="pedidos-pendientes">
            <h2>Pedidos Pendientes</h2>
            <Collapse>
                {pedidos.length > 0 ? (
                    pedidos.map(pedido => (
                        <Panel header={`Pedido ${pedido.id} - ${pedido.paciente.name} (Hab: ${pedido.paciente.cama.habitacion.nombre}, Cama: ${pedido.paciente.cama.nombre})`}  key={pedido.id}>
                            {renderSections(pedido)}
                            <div className="additional-options">
                                <h4>Opciones Adicionales del Menú</h4>
                                <div>Leche: {pedido.adicionales.leche}</div>
                                <div>Bebida: {pedido.adicionales.bebida}</div>
                                <div>Azúcar/Panela: {pedido.adicionales.azucarPanela.join(', ')}</div>
                                <div>Vegetales: {pedido.adicionales.vegetales}</div>
                                <div>Golosina: {pedido.adicionales.golosina ? 'Sí' : 'No'}</div>
                            </div>
                        </Panel>
                    ))
                ) : (
                    <p>No hay pedidos pendientes.</p>
                )}
            </Collapse>
        </div>
    );
};

export default PedidosPendientes;
