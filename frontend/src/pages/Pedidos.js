import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Pedidos.scss';

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [historicalPedidos, setHistoricalPedidos] = useState([]);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await api.get('/pedidos/');
                setPedidos(response.data.filter(pedido => pedido.status === 'Pending'));
                setHistoricalPedidos(response.data.filter(pedido => pedido.status === 'Completed'));
            } catch (error) {
                console.error('Error fetching pedidos:', error);
            }
        };
        fetchPedidos();
    }, []);

    const handleStatusUpdate = async (id) => {
        try {
            await api.patch(`/pedidos/${id}/status/`, { status: 'Completed' });
            const response = await api.get('/pedidos/');
            setPedidos(response.data.filter(pedido => pedido.status === 'Pending'));
            setHistoricalPedidos(response.data.filter(pedido => pedido.status === 'Completed'));
        } catch (error) {
            console.error('Error updating pedido status:', error);
        }
    };

    return (
        <div className="pedidos container mt-5">
            <h2>Pedidos</h2>
            <ul className="list-group mb-4">
                {pedidos.map((pedido) => (
                    <li key={pedido.id} className="list-group-item d-flex justify-content-between align-items-center">
                        {pedido.status} - {pedido.menu.name} - {pedido.patient.name}
                        <button className="btn btn-success" onClick={() => handleStatusUpdate(pedido.id)}>Marcar como Completado</button>
                    </li>
                ))}
            </ul>
            <h2>Historial de Pedidos Completados</h2>
            <ul className="list-group">
                {historicalPedidos.map((pedido) => (
                    <li key={pedido.id} className="list-group-item">
                        {pedido.status} - {pedido.menu.name} - {pedido.patient.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Pedidos;
