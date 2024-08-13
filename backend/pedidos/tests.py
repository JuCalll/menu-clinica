import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from pacientes.models import Paciente, Habitacion
from servicios.models import Servicio
from menus.models import Menu, MenuSection, MenuOption
from pedidos.models import Pedido, PedidoMenuOption
from authentication.models import CustomUser

@pytest.mark.django_db
def test_pedido_creation():
    client = APIClient()

    # Autenticar el cliente con el modelo de usuario personalizado
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword')
    client.force_authenticate(user=user)

    # Crear datos de prueba
    servicio = Servicio.objects.create(nombre="SERVICIO TEST")
    habitacion = Habitacion.objects.create(numero="101", servicio=servicio)
    paciente = Paciente.objects.create(name="Juan Pérez", room=habitacion, recommended_diet="Diabetes")

    menu = Menu.objects.create(nombre="Menú Preferencial Prueba")
    section = MenuSection.objects.create(titulo="Adicional", menu=menu)
    opcion1 = MenuOption.objects.create(texto="Jarra de Jugo Natural", tipo="adicionales", section=section)
    opcion2 = MenuOption.objects.create(texto="Cereal", tipo="adicionales", section=section)
    opcion3 = MenuOption.objects.create(texto="Café en Leche", tipo="bebidas", section=section)

    pedido_data = {
        "paciente": paciente.id,
        "menu": menu.id,
        "opciones": [
            {"id": opcion1.id, "selected": True},
            {"id": opcion2.id, "selected": False},
            {"id": opcion3.id, "selected": True},
        ],
        "adicionales": {
            "leche": "entera",
            "bebida": "leche",
            "azucarPanela": ["azucar", "panela"],
            "vegetales": "crudos",
            "golosina": True
        }
    }

    response = client.post(reverse('pedido-list-create'), data=pedido_data, format='json')

    assert response.status_code == status.HTTP_201_CREATED
    assert Pedido.objects.count() == 1
    pedido = Pedido.objects.first()

    # Verificar que las opciones se guardaron correctamente
    assert pedido.pedidomenuoption_set.filter(selected=True).count() == 2  # Verificamos que solo se seleccionaron 2 opciones

@pytest.mark.django_db
def test_pedido_update():
    client = APIClient()

    # Autenticar el cliente con el modelo de usuario personalizado
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword')
    client.force_authenticate(user=user)

    # Crear datos de prueba
    servicio = Servicio.objects.create(nombre="SERVICIO TEST")
    habitacion = Habitacion.objects.create(numero="101", servicio=servicio)
    paciente = Paciente.objects.create(name="Juan Pérez", room=habitacion, recommended_diet="Diabetes")

    menu = Menu.objects.create(nombre="Menú Preferencial Prueba")
    section = MenuSection.objects.create(titulo="Adicional", menu=menu)
    opcion1 = MenuOption.objects.create(texto="Jarra de Jugo Natural", tipo="adicionales", section=section)
    opcion2 = MenuOption.objects.create(texto="Cereal", tipo="adicionales", section=section)
    opcion3 = MenuOption.objects.create(texto="Café en Leche", tipo="bebidas", section=section)

    pedido = Pedido.objects.create(paciente=paciente, menu=menu, adicionales={"leche": "entera", "bebida": "leche"})

    update_data = {
        "opciones": [
            {"id": opcion1.id, "selected": False},
            {"id": opcion2.id, "selected": True},
            {"id": opcion3.id, "selected": True},
        ],
        "adicionales": {
            "leche": "deslactosada",
            "bebida": "agua",
            "azucarPanela": ["panela"],
            "vegetales": "calientes",
            "golosina": False
        }
    }

    response = client.patch(reverse('pedido-detail', args=[pedido.id]), data=update_data, format='json')

    assert response.status_code == status.HTTP_200_OK
    pedido.refresh_from_db()

    # Verificar que las opciones se actualizaron correctamente
    assert pedido.pedidomenuoption_set.filter(selected=True).count() == 2  # Verificamos que se seleccionaron 2 opciones

@pytest.mark.django_db
def test_pedido_retrieve():
    client = APIClient()

    # Autenticar el cliente con el modelo de usuario personalizado
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword')
    client.force_authenticate(user=user)

    # Crear datos de prueba
    servicio = Servicio.objects.create(nombre="SERVICIO TEST")
    habitacion = Habitacion.objects.create(numero="101", servicio=servicio)
    paciente = Paciente.objects.create(name="Juan Pérez", room=habitacion, recommended_diet="Diabetes")

    menu = Menu.objects.create(nombre="Menú Preferencial Prueba")
    section = MenuSection.objects.create(titulo="Adicional", menu=menu)
    opcion1 = MenuOption.objects.create(texto="Jarra de Jugo Natural", tipo="adicionales", section=section)
    opcion2 = MenuOption.objects.create(texto="Cereal", tipo="adicionales", section=section)
    opcion3 = MenuOption.objects.create(texto="Café en Leche", tipo="bebidas", section=section)

    pedido = Pedido.objects.create(paciente=paciente, menu=menu, adicionales={"leche": "entera", "bebida": "leche"})
    PedidoMenuOption.objects.create(pedido=pedido, menu_option=opcion1, selected=True)
    PedidoMenuOption.objects.create(pedido=pedido, menu_option=opcion3, selected=True)

    response = client.get(reverse('pedido-detail', args=[pedido.id]))

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    # Verificar que los datos recuperados son correctos
    assert data['paciente']['id'] == paciente.id
    assert data['menu']['id'] == menu.id
    assert len(data['opciones']) == 2
    assert data['adicionales'].get('leche') == "entera"
    assert 'azucarPanela' in data['adicionales']  # Verificar que existe la clave 'azucarPanela' si estaba en el pedido original

@pytest.mark.django_db
def test_pedido_deletion():
    client = APIClient()

    # Autenticar el cliente con el modelo de usuario personalizado
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword')
    client.force_authenticate(user=user)

    # Crear datos de prueba
    servicio = Servicio.objects.create(nombre="SERVICIO TEST")
    habitacion = Habitacion.objects.create(numero="101", servicio=servicio)
    paciente = Paciente.objects.create(name="Juan Pérez", room=habitacion, recommended_diet="Diabetes")

    menu = Menu.objects.create(nombre="Menú Preferencial Prueba")
    section = MenuSection.objects.create(titulo="Adicional", menu=menu)
    opcion1 = MenuOption.objects.create(texto="Jarra de Jugo Natural", tipo="adicionales", section=section)

    pedido = Pedido.objects.create(paciente=paciente, menu=menu, adicionales={"leche": "entera", "bebida": "leche"})
    PedidoMenuOption.objects.create(pedido=pedido, menu_option=opcion1, selected=True)

    response = client.delete(reverse('pedido-detail', args=[pedido.id]))

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Pedido.objects.count() == 0
    assert PedidoMenuOption.objects.count() == 0
