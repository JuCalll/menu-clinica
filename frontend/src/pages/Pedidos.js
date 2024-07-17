import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/DataList.scss';

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await api.get('/pedidos/');
                setPedidos(response.data);
            } catch (error) {
                console.error('Error fetching pedidos:', error);
            }
        };
        fetchPedidos();
    }, []);

    return (
        <div className="data-list">
            <h2>Pedidos</h2>
            <ul>
                {pedidos.map((pedido) => (
                    <li key={pedido.id}>
                        <h3>Status: {pedido.status}</h3>
                        <p>Menu: {pedido.menu.name}</p>
                        <p>Patient: {pedido.patient.name}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Pedidos;
