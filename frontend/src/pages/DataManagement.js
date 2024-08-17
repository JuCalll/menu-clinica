import React, { useState, useEffect } from 'react';
import { Button, Drawer, Tabs, Table, Switch } from 'antd';
import api from '../services/api';
import '../styles/DataManagement.scss';

const { TabPane } = Tabs;

const DataManagement = () => {
    const [pacientes, setPacientes] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [habitaciones, setHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pacientesResponse, serviciosResponse, habitacionesResponse] = await Promise.all([
                    api.get('/pacientes/'),
                    api.get('/servicios/'),
                    api.get('/habitaciones/')
                ]);

                console.log("Pacientes desde el backend:", pacientesResponse.data);
                console.log("Servicios desde el backend:", serviciosResponse.data);
                console.log("Habitaciones desde el backend:", habitacionesResponse.data);

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

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    const toggleActivo = async (item, type) => {
        try {
            const updatedItem = { ...item, activo: !item.activo };
            await api.put(`/${type}/${item.id}/`, updatedItem);
            refreshData();
        } catch (error) {
            console.error('Error toggling activo:', error);
        }
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            const [pacientesResponse, serviciosResponse, habitacionesResponse] = await Promise.all([
                api.get('/pacientes/'),
                api.get('/servicios/'),
                api.get('/habitaciones/')
            ]);

            console.log("Pacientes actualizados:", pacientesResponse.data);
            console.log("Servicios actualizados:", serviciosResponse.data);
            console.log("Habitaciones actualizadas:", habitacionesResponse.data);

            setPacientes(pacientesResponse.data);
            setServicios(serviciosResponse.data);
            setHabitaciones(habitacionesResponse.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    console.log("Servicios que se están pasando al Table:", servicios);
    console.log("Habitaciones que se están pasando al Table:", habitaciones);
    console.log("Pacientes que se están pasando al Table:", pacientes);

    return (
        <div className="data-management container mt-5">
            <h2>Gestión de Pacientes, Servicios y Habitaciones</h2>

            <Button type="primary" onClick={openDrawer}>
                Panel de Gestión
            </Button>

            <div className="active-data mt-4">
                <h3>Servicios Activos</h3>
                <ul className="list-group mb-4">
                    {servicios.filter(s => s.activo).map(servicio => (
                        <li key={servicio.id} className="list-group-item">
                            {servicio.nombre}
                        </li>
                    ))}
                </ul>

                <h3>Habitaciones Activas</h3>
                <ul className="list-group mb-4">
                    {habitaciones.filter(h => h.activo).map(habitacion => (
                        <li key={habitacion.id} className="list-group-item">
                            {habitacion.nombre} - {habitacion.servicio}
                            <ul>
                                {habitacion.camas.map(cama => (
                                    cama.activo && (
                                        <li key={cama.id}>
                                            {cama.nombre}
                                        </li>
                                    )
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>

                <h3>Pacientes Activos</h3>
                <ul className="list-group">
                    {pacientes.filter(p => p.activo).map(paciente => (
                        <li key={paciente.id} className="list-group-item">
                            {paciente.name} - Habitación: {paciente.cama.habitacion.nombre} - Servicio: {paciente.cama.habitacion.servicio.nombre}
                        </li>
                    ))}
                </ul>
            </div>

            <Drawer
                title="Gestión de Datos"
                placement="right"
                onClose={closeDrawer}
                open={isDrawerOpen}
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
                                    key: 'activo',
                                    render: (_, record) => (
                                        <Switch
                                            checked={record.activo}
                                            onChange={() => toggleActivo(record, 'servicios')}
                                        />
                                    ),
                                }
                            ]}
                            rowKey="id"
                        />
                    </TabPane>
                    <TabPane tab="Habitaciones" key="2">
                        <Table
                            dataSource={habitaciones}
                            columns={[
                                { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
                                { title: 'Servicio', dataIndex: 'servicio', key: 'servicio' },
                                {
                                    title: 'Camas',
                                    key: 'camas',
                                    render: (_, habitacion) => (
                                        <ul>
                                            {habitacion.camas.map(cama => (
                                                <li key={cama.id}>
                                                    {cama.nombre}
                                                    <Switch
                                                        checked={cama.activo}
                                                        onChange={() => toggleActivo(cama, 'camas')}
                                                        style={{ marginLeft: 8 }}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                },
                                {
                                    title: 'Activo',
                                    key: 'activo',
                                    render: (_, record) => (
                                        <Switch
                                            checked={record.activo}
                                            onChange={() => toggleActivo(record, 'habitaciones')}
                                        />
                                    ),
                                }
                            ]}
                            rowKey="id"
                        />
                    </TabPane>
                    <TabPane tab="Pacientes" key="3">
                        <Table
                            dataSource={pacientes}
                            columns={[
                                { title: 'Nombre', dataIndex: 'name', key: 'name' },
                                { title: 'Cama', dataIndex: ['cama', 'nombre'], key: 'cama' },
                                { title: 'Habitación', dataIndex: ['cama', 'habitacion', 'nombre'], key: 'habitacion' },
                                {
                                    title: 'Activo',
                                    key: 'activo',
                                    render: (_, record) => (
                                        <Switch
                                            checked={record.activo}
                                            onChange={() => toggleActivo(record, 'pacientes')}
                                        />
                                    ),
                                }
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
