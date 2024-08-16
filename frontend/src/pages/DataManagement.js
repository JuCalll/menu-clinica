import React, { useEffect, useState } from 'react';
import { Button, Drawer, Tabs, Switch, Table } from 'antd';
import api from '../services/api';
import '../styles/DataManagement.scss';

const { TabPane } = Tabs;

const DataManagement = () => {
    const [pacientes, setPacientes] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [habitaciones, setHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pacientesResponse, serviciosResponse, habitacionesResponse] = await Promise.all([
                    api.get('/pacientes/'),
                    api.get('/servicios/'),
                    api.get('/habitaciones/')
                ]);

                setPacientes(pacientesResponse.data);
                setServicios(serviciosResponse.data);
                setHabitaciones(habitacionesResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const showDrawer = () => setIsDrawerVisible(true);
    const closeDrawer = () => setIsDrawerVisible(false);

    const toggleActivo = async (item, type) => {
        try {
            const updatedItem = { ...item, activo: !item.activo };
            if (type === 'servicio') {
                await api.put(`/servicios/${item.id}/`, updatedItem);
                setServicios(servicios.map(s => (s.id === item.id ? updatedItem : s)));
            } else if (type === 'habitacion') {
                await api.put(`/habitaciones/${item.id}/`, updatedItem);
                setHabitaciones(habitaciones.map(h => (h.id === item.id ? updatedItem : h)));
            } else if (type === 'paciente') {
                await api.put(`/pacientes/${item.id}/`, updatedItem);
                setPacientes(pacientes.map(p => (p.id === item.id ? updatedItem : p)));
            }
        } catch (error) {
            console.error('Error toggling activo:', error);
        }
    };

    const serviciosActivos = servicios.filter(servicio => servicio.activo);
    const habitacionesActivas = habitaciones.filter(habitacion => habitacion.activo);
    const pacientesActivos = pacientes.filter(paciente => paciente.activo);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="data-management container mt-5">
            <h2>Gestión de Pacientes, Servicios y Habitaciones</h2>

            <Button type="primary" onClick={showDrawer}>
                Panel de Gestión
            </Button>

            <div className="active-data mt-4">
                <h3>Servicios Activos</h3>
                <ul className="list-group mb-4">
                    {serviciosActivos.length > 0 ? (
                        serviciosActivos.map(servicio => (
                            <li key={servicio.id} className="list-group-item">
                                {servicio.nombre}
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item">No hay servicios activos</li>
                    )}
                </ul>

                <h3>Habitaciones Activas</h3>
                <ul className="list-group mb-4">
                    {habitacionesActivas.length > 0 ? (
                        habitacionesActivas.map(habitacion => (
                            <li key={habitacion.id} className="list-group-item">
                                {habitacion.numero} - {habitacion.servicio}
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item">No hay habitaciones activas</li>
                    )}
                </ul>

                <h3>Pacientes Activos</h3>
                <ul className="list-group">
                    {pacientesActivos.length > 0 ? (
                        pacientesActivos.map(paciente => (
                            <li key={paciente.id} className="list-group-item">
                                {paciente.name} - Habitación: {paciente.room.numero} - Servicio: {paciente.room.servicio.nombre}
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item">No hay pacientes activos</li>
                    )}
                </ul>
            </div>

            <Drawer
                title="Gestión de Datos"
                placement="right"
                onClose={closeDrawer}
                visible={isDrawerVisible}
                width={600}
            >
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Servicios" key="1">
                        <Table
                            dataSource={servicios}
                            columns={[
                                { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
                                {
                                    title: 'Activo',
                                    dataIndex: 'activo',
                                    key: 'activo',
                                    render: (_, servicio) => (
                                        <Switch
                                            checked={servicio.activo}
                                            onChange={() => toggleActivo(servicio, 'servicio')}
                                        />
                                    ),
                                },
                            ]}
                            rowKey="id"
                        />
                    </TabPane>
                    <TabPane tab="Habitaciones" key="2">
                        <Table
                            dataSource={habitaciones}
                            columns={[
                                { title: 'Número', dataIndex: 'numero', key: 'numero' },
                                { title: 'Servicio', dataIndex: 'servicio', key: 'servicio' },
                                {
                                    title: 'Activo',
                                    dataIndex: 'activo',
                                    key: 'activo',
                                    render: (_, habitacion) => (
                                        <Switch
                                            checked={habitacion.activo}
                                            onChange={() => toggleActivo(habitacion, 'habitacion')}
                                        />
                                    ),
                                },
                            ]}
                            rowKey="id"
                        />
                    </TabPane>
                    <TabPane tab="Pacientes" key="3">
                        <Table
                            dataSource={pacientes}
                            columns={[
                                { title: 'Nombre', dataIndex: 'name', key: 'name' },
                                { title: 'Habitación', dataIndex: ['room', 'numero'], key: 'habitacion' },
                                {
                                    title: 'Activo',
                                    dataIndex: 'activo',
                                    key: 'activo',
                                    render: (_, paciente) => (
                                        <Switch
                                            checked={paciente.activo}
                                            onChange={() => toggleActivo(paciente, 'paciente')}
                                        />
                                    ),
                                },
                            ]}
                            rowKey="id"
                        />
                    </TabPane>
                </Tabs>
            </Drawer>
        </div>
    );
};

export default DataManagement;
