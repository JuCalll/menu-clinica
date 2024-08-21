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
            console.log("Datos antes de actualizar:", item);
    
            const updatedItem = { ...item, activo: !item.activo };
    
            if (type === 'habitaciones') {
                let servicioId = item.servicio_id;
                if (!servicioId) {
                    const servicio = servicios.find(s => s.nombre === item.servicio);
                    if (servicio) {
                        servicioId = servicio.id;
                    }
                }
                updatedItem.servicio_id = servicioId;
                console.log("Servicio ID extraído:", updatedItem.servicio_id);
            }
    
            if (type === 'camas') {
                const habitacion = habitaciones.find(h => h.id === item.habitacion);
                console.log("Habitación encontrada:", habitacion);
                if (!habitacion || !habitacion.activo) {
                    alert("No se puede activar la cama porque la habitación no está activa.");
                    return;
                }
    
                updatedItem.habitacion_id = habitacion.id;
                console.log("Habitación ID extraído:", updatedItem.habitacion_id);
            }
    
            if (type === 'pacientes') {
                const cama = item.cama ? item.cama : null;
                console.log("Cama obtenida:", cama);
    
                if (!cama) {
                    console.error("Error: No se encontró la cama asociada al paciente.");
                    return;
                }
    
                const habitacion = cama.habitacion ? cama.habitacion : null;
                console.log("Habitación obtenida desde cama:", habitacion);
    
                if (!habitacion) {
                    console.error("Error: No se encontró la habitación asociada a la cama.");
                    return;
                }
    
                const servicio = habitacion.servicio ? habitacion.servicio : null;
                console.log("Servicio obtenido desde habitación:", servicio);
    
                if (!servicio) {
                    console.error("Error: No se encontró el servicio asociado a la habitación.");
                    return;
                }
    
                // Verificación de estados
                const camaActiva = cama.activo !== undefined ? cama.activo : "no definido";
                const habitacionActiva = habitacion.activo !== undefined ? habitacion.activo : "no definido";
                const servicioActivo = servicio.activo !== undefined ? servicio.activo : "no definido";
    
                console.log("Estado de cama:", camaActiva);
                console.log("Estado de habitación:", habitacionActiva);
                console.log("Estado de servicio:", servicioActivo);
    
                if (camaActiva === null || habitacionActiva === null || servicioActivo === null) {
                    console.error("Error: Estado indefinido para cama, habitación o servicio.");
                    return;
                }
    
                if (!camaActiva || !habitacionActiva || !servicioActivo) {
                    alert("No se puede activar el paciente porque la cama, habitación o servicio no están activos.");
                    return;
                }
    
                updatedItem.cama_id = cama.id;
                console.log("Cama ID extraído:", updatedItem.cama_id);
            }
    
            console.log(`Datos enviados al backend para actualizar ${type}:`, updatedItem);
            const response = await api.put(`/${type}/${item.id}/`, updatedItem);
            console.log("Respuesta del backend:", response.data);
            refreshData();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errorMessage = error.response.data.detail || "No se puede activar el paciente debido a restricciones en la lógica de activación.";
                alert(`Error: ${errorMessage}`);
            } else {
                console.error('Error toggling activo:', error.response ? error.response.data : error);
            }
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
