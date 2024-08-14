import React, { useState, useEffect } from 'react';
import { Button, Spin, Collapse } from 'antd';
import { getPedidos, updatePedido } from '../services/api';
import '../styles/PedidosPendientes.scss';

const { Panel } = Collapse;

const PedidosPendientes = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await getPedidos();
                console.log('Fetched Pedidos:', response);
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
        try {
            const pedido = pedidos.find(p => p.id === pedidoId);
            console.log('SectionStatus antes de la actualización:', pedido.sectionStatus);

            // Actualizar el estado de la sección específica a 'completado'
            const updatedSections = { ...pedido.sectionStatus, [sectionTitle]: 'completado' };
            console.log('Updated Sections:', updatedSections);

            // Verificar si todas las secciones están completadas
            const allSectionsCompleted = Object.values(updatedSections).length === Object.keys(pedido.menu.sections).length &&
                                         Object.values(updatedSections).every(status => status === 'completado');

            // Actualizar el estado del pedido solo si todas las secciones están completadas
            const updatedPedido = {
                ...pedido,
                status: allSectionsCompleted ? 'completado' : 'en_proceso', // Asegurar que el estado solo cambie si todo está completado
                sectionStatus: updatedSections,
            };

            console.log('Pedido a enviar al backend:', updatedPedido);

            await updatePedido(pedidoId, updatedPedido);

            // Actualizar el estado local de los pedidos
            setPedidos(prevPedidos =>
                prevPedidos.map(p =>
                    p.id === pedidoId
                        ? { ...p, sectionStatus: updatedSections, status: updatedPedido.status }
                        : p
                ).filter(p => p.status !== 'completado') // Filtrar el pedido si se completó
            );

        } catch (error) {
            console.error('Error updating section status', error);
        }
    };

    if (loading) {
        return <Spin />;
    }

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
            console.log('Rendering section:', section.titulo, 'Options to render:', optionsToRender);

            return optionsToRender && optionsToRender.length > 0 ? (
                <div key={section.id}>
                    <h4>{section.titulo}</h4>
                    {optionsToRender.map(optionType => (
                        <div key={optionType}>
                            <h5>{optionType.charAt(0).toUpperCase() + optionType.slice(1)}</h5>
                            {renderSelectedOptions(section, optionType, pedido)}
                        </div>
                    ))}
                    <Button
                        onClick={() => handleSectionStatusChange(pedido.id, section.titulo)}
                        disabled={pedido.sectionStatus?.[section.titulo] === 'completado'}
                    >
                        {pedido.sectionStatus?.[section.titulo] === 'completado' ? 'Completado' : 'Marcar como Completado'}
                    </Button>
                </div>
            ) : null;
        });
    };

    return (
        <div className="pedidos-pendientes">
            <h2>Pedidos Pendientes</h2>
            <Collapse>
                {pedidos.length > 0 ? (
                    pedidos.map(pedido => (
                        <Panel header={`Pedido ${pedido.id} - ${pedido.paciente.name}`} key={pedido.id}>
                            {renderSections(pedido)}
                            <div>
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
