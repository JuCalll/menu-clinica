import React, { useEffect, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import api from '../services/api';
import '../styles/MenuSelection.scss';

const MenuSelection = () => {
    const [pacientes, setPacientes] = useState([]);
    const [selectedPaciente, setSelectedPaciente] = useState('');
    const [menu, setMenu] = useState({
        adicional: '',
        algo: '',
        algoBebida: '',
        onces: '',
        leche: '',
        endulzante: '',
        desayuno: {
            jugoOFruta: '',
            proteina: '',
            energetico: [],
            bebida: '',
            bebidaPreparacion: ''
        },
        almuerzo: {
            sopa: '',
            proteina: '',
            energetico: [],
            vegetales: '',
            bebida: '',
            golosina: ''
        },
        cena: {
            sopa: '',
            proteina: '',
            energetico: [],
            vegetales: '',
            bebida: '',
        }
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await api.get('/pacientes/');
                setPacientes(response.data);
            } catch (error) {
                console.error('Error fetching pacientes:', error);
            }
        };
        fetchPacientes();
    }, []);

    const handleCheckboxChange = (event, mealType, category) => {
        const { value, checked } = event.target;
        const selectedItems = menu[mealType][category];

        if (checked && selectedItems.length < 2) {
            setMenu({
                ...menu,
                [mealType]: {
                    ...menu[mealType],
                    [category]: [...selectedItems, value]
                }
            });
        } else if (!checked) {
            setMenu({
                ...menu,
                [mealType]: {
                    ...menu[mealType],
                    [category]: selectedItems.filter(item => item !== value)
                }
            });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const pedidoData = {
            status: "pending",  // Asignar valor predeterminado
            patient_id: parseInt(selectedPaciente, 10),
            menu_personalizado: menu
        };
        console.log('Datos del pedido:', pedidoData);
        try {
            const response = await api.post('/pedidos/', pedidoData);
            setSuccessMessage('Pedido creado exitosamente.');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Error creando el pedido.');
            setSuccessMessage('');
            console.error('Error creating pedido:', error.response.data);
        }
    };

    return (
        <div className="menu-selection">
            <h1>Menú Preferencial</h1>
            <p>
                Estimado Paciente:
                El presente menú es ofrecido exclusivamente a los pacientes de Atención Preferencial Medicina Prepagada, con el fin de brindar una mejor atención, teniendo en cuenta los requerimientos nutricionales recomendados por el Médico tratante.
            </p>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formPaciente">
                    <Form.Label>Nombre del paciente</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedPaciente}
                        onChange={(e) => setSelectedPaciente(e.target.value)}
                        required
                    >
                        <option value="">Seleccione un paciente</option>
                        {pacientes.map(paciente => (
                            <option key={paciente.id} value={paciente.id}>
                                {paciente.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <h3>Adicional Opcional por Día</h3>
                <Form.Group controlId="formAdicional">
                    <Form.Control
                        as="select"
                        value={menu.adicional}
                        onChange={(e) => setMenu({ ...menu, adicional: e.target.value })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Jarra de jugo natural">Jarra de jugo natural</option>
                        <option value="Jarra de Clight">Jarra de Clight</option>
                        <option value="Jarra de agua">Jarra de agua</option>
                    </Form.Control>
                </Form.Group>

                <h2>Refrigerios</h2>
                <h3>ALGO (media mañana)</h3>
                <Form.Group controlId="formAlgo">
                    <Form.Label>Acompañante</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.algo}
                        onChange={(e) => setMenu({ ...menu, algo: e.target.value })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Cereal">Cereal</option>
                        <option value="Sanduche de queso">Sanduche de queso</option>
                        <option value="Tostada con mermelada">Tostada con mermelada</option>
                        <option value="Barrita de granola">Barrita de granola</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formAlgoBebida">
                    <Form.Label>Bebida</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.algoBebida}
                        onChange={(e) => setMenu({ ...menu, algoBebida: e.target.value })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Café en leche">Café en leche</option>
                        <option value="Leche">Leche</option>
                        <option value="Jugo en agua">Jugo en agua</option>
                        <option value="Aromática">Aromática</option>
                    </Form.Control>
                </Form.Group>

                <h3>ONCES (tarde)</h3>
                <Form.Group controlId="formOnces">
                    <Form.Control
                        as="select"
                        value={menu.onces}
                        onChange={(e) => setMenu({ ...menu, onces: e.target.value })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Café en leche con galletas">Café en leche con galletas</option>
                        <option value="Batido de banano y avena">Batido de banano y avena</option>
                        <option value="Fruta entera">Fruta entera</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formLeche">
                    <Form.Label>Seleccione de acuerdo a su preferencia para todas las preparaciones:</Form.Label>
                    {['Leche entera', 'Leche deslactosada'].map(option => (
                        <Form.Check
                            key={option}
                            type="radio"
                            label={option}
                            value={option}
                            checked={menu.leche === option}
                            onChange={(e) => setMenu({ ...menu, leche: e.target.value })}
                        />
                    ))}
                </Form.Group>

                <Form.Group controlId="formEndulzante">
                    <Form.Label>Azúcar y/o panela o Endulzante artificial</Form.Label>
                    {['Azúcar y/o panela', 'Endulzante artificial'].map(option => (
                        <Form.Check
                            key={option}
                            type="radio"
                            label={option}
                            value={option}
                            checked={menu.endulzante === option}
                            onChange={(e) => setMenu({ ...menu, endulzante: e.target.value })}
                        />
                    ))}
                </Form.Group>

                <h2>Desayuno</h2>
                <Form.Group controlId="formDesayunoJugoOFruta">
                    <Form.Label>Jugo de fruta o Fruta</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.desayuno.jugoOFruta}
                        onChange={(e) => setMenu({
                            ...menu,
                            desayuno: { ...menu.desayuno, jugoOFruta: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Jugo de fruta">Jugo de fruta</option>
                        <option value="Fruta">Fruta</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formDesayunoProteina">
                    <Form.Label>PLATO PRINCIPAL (PROTEINA)</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.desayuno.proteina}
                        onChange={(e) => setMenu({
                            ...menu,
                            desayuno: { ...menu.desayuno, proteina: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Huevo con Maicitos">Huevo con Maicitos</option>
                        <option value="Huevo revuelto">Huevo revuelto</option>
                        <option value="Huevo entero">Huevo entero</option>
                        <option value="Queso cuajada">Queso cuajada</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formDesayunoEnergetico">
                    <Form.Label>ACOMPAÑANTE (ENERGÉTICO)</Form.Label>
                    {['Arepa Blanca', 'Pan', 'Galletas', 'Tostada'].map(option => (
                        <Form.Check
                            key={option}
                            type="checkbox"
                            label={option}
                            value={option}
                            checked={menu.desayuno.energetico.includes(option)}
                            onChange={(e) => handleCheckboxChange(e, 'desayuno', 'energetico')}
                        />
                    ))}
                </Form.Group>

                <Form.Group controlId="formDesayunoBebida">
                    <Form.Label>BEBIDA</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.desayuno.bebida}
                        onChange={(e) => setMenu({
                            ...menu,
                            desayuno: { ...menu.desayuno, bebida: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Jugo de Fruta">Jugo de Fruta</option>
                        <option value="Chocolate">Chocolate</option>
                        <option value="Café">Café</option>
                        <option value="Aromática">Aromática</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formDesayunoBebidaPreparacion">
                    <Form.Label>Preparación de la Bebida</Form.Label>
                    {['En leche', 'En agua'].map(option => (
                        <Form.Check
                            key={option}
                            type="radio"
                            label={option}
                            value={option}
                            checked={menu.desayuno.bebidaPreparacion === option}
                            onChange={(e) => setMenu({
                                ...menu,
                                desayuno: { ...menu.desayuno, bebidaPreparacion: e.target.value }
                            })}
                        />
                    ))}
                </Form.Group>

                <h2>Almuerzo</h2>
                <Form.Group controlId="formAlmuerzoSopa">
                    <Form.Label>Consomé o Sopa del día</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.almuerzo.sopa}
                        onChange={(e) => setMenu({
                            ...menu,
                            almuerzo: { ...menu.almuerzo, sopa: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Consomé">Consomé</option>
                        <option value="Sopa del día">Sopa del día</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formAlmuerzoProteina">
                    <Form.Label>PLATO PRINCIPAL (PROTEINA)</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.almuerzo.proteina}
                        onChange={(e) => setMenu({
                            ...menu,
                            almuerzo: { ...menu.almuerzo, proteina: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Filete de pechuga">Filete de pechuga</option>
                        <option value="Atún">Atún</option>
                        <option value="Carne de Res">Carne de Res</option>
                        <option value="Filete de pescado (Basa)">Filete de pescado (Basa)</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formAlmuerzoEnergetico">
                    <Form.Label>ACOMPAÑANTE (ENERGÉTICO)</Form.Label>
                    {['Papa', 'Plátano', 'Arroz'].map(option => (
                        <Form.Check
                            key={option}
                            type="checkbox"
                            label={option}
                            value={option}
                            checked={menu.almuerzo.energetico.includes(option)}
                            onChange={(e) => handleCheckboxChange(e, 'almuerzo', 'energetico')}
                        />
                    ))}
                </Form.Group>

                <Form.Group controlId="formAlmuerzoVegetales">
                    <Form.Label>VEGETALES (REGULADOR)</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.almuerzo.vegetales}
                        onChange={(e) => setMenu({
                            ...menu,
                            almuerzo: { ...menu.almuerzo, vegetales: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Vegetales crudos">Vegetales crudos</option>
                        <option value="Vegetales calientes">Vegetales calientes</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formAlmuerzoBebida">
                    <Form.Label>BEBIDA</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.almuerzo.bebida}
                        onChange={(e) => setMenu({
                            ...menu,
                            almuerzo: { ...menu.almuerzo, bebida: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Jugo de fruta">Jugo de fruta</option>
                        <option value="Leche">Leche</option>
                        <option value="Aromática">Aromática</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formAlmuerzoGolosina">
                    <Form.Label>Golosina opcional</Form.Label>
                    {['Sí', 'No'].map(option => (
                        <Form.Check
                            key={option}
                            type="radio"
                            label={option}
                            value={option}
                            checked={menu.almuerzo.golosina === option}
                            onChange={(e) => setMenu({ ...menu, almuerzo: { ...menu.almuerzo, golosina: e.target.value } })}
                        />
                    ))}
                </Form.Group>

                <h2>Cena</h2>
                <Form.Group controlId="formCenaSopa">
                    <Form.Label>Consomé o Sopa del día</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.cena.sopa}
                        onChange={(e) => setMenu({
                            ...menu,
                            cena: { ...menu.cena, sopa: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Consomé">Consomé</option>
                        <option value="Sopa del día">Sopa del día</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formCenaProteina">
                    <Form.Label>PLATO PRINCIPAL (PROTEINA)</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.cena.proteina}
                        onChange={(e) => setMenu({
                            ...menu,
                            cena: { ...menu.cena, proteina: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Filete de pechuga">Filete de pechuga</option>
                        <option value="Atún">Atún</option>
                        <option value="Carne de Res">Carne de Res</option>
                        <option value="Filete de pescado (Basa)">Filete de pescado (Basa)</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formCenaEnergetico">
                    <Form.Label>ACOMPAÑANTE (ENERGÉTICO)</Form.Label>
                    {['Papa', 'Plátano', 'Arroz'].map(option => (
                        <Form.Check
                            key={option}
                            type="checkbox"
                            label={option}
                            value={option}
                            checked={menu.cena.energetico.includes(option)}
                            onChange={(e) => handleCheckboxChange(e, 'cena', 'energetico')}
                        />
                    ))}
                </Form.Group>

                <Form.Group controlId="formCenaVegetales">
                    <Form.Label>VEGETALES (REGULADOR)</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.cena.vegetales}
                        onChange={(e) => setMenu({
                            ...menu,
                            cena: { ...menu.cena, vegetales: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Vegetales crudos">Vegetales crudos</option>
                        <option value="Vegetales calientes">Vegetales calientes</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formCenaBebida">
                    <Form.Label>BEBIDA</Form.Label>
                    <Form.Control
                        as="select"
                        value={menu.cena.bebida}
                        onChange={(e) => setMenu({
                            ...menu,
                            cena: { ...menu.cena, bebida: e.target.value }
                        })}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Agua de Panela">Agua de Panela</option>
                        <option value="Jugo de Fruta">Jugo de Fruta</option>
                        <option value="Leche">Leche</option>
                        <option value="Aromática">Aromática</option>
                    </Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit">
                    Guardar
                </Button>
            </Form>
        </div>
    );
};

export default MenuSelection;
