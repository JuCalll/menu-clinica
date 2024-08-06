import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Pedido
from pacientes.models import Paciente
from habitaciones.models import Habitacion
from servicios.models import Servicio
from menus.models import Menu, MenuOption, MenuSection
from django.contrib.auth import get_user_model

@pytest.fixture
def api_client():
    client = APIClient()
    user = get_user_model().objects.create_user(username='testuser', email='testuser@example.com', password='testpass')
    client.force_authenticate(user=user)
    return client

@pytest.fixture
def servicio():
    return Servicio.objects.create(nombre="Test Servicio")

@pytest.fixture
def habitacion(servicio):
    return Habitacion.objects.create(numero="101", servicio=servicio)

@pytest.fixture
def paciente(habitacion):
    return Paciente.objects.create(name="Test Paciente", room=habitacion, recommended_diet="Diet Test")

@pytest.fixture
def menu():
    return Menu.objects.create(nombre="Test Menu")

@pytest.fixture
def menu_section(menu):
    return MenuSection.objects.create(menu=menu, titulo="Test Section")

@pytest.fixture
def menu_option(menu_section):
    return MenuOption.objects.create(section=menu_section, texto="Option Test", tipo="adicional", selected=False)

@pytest.mark.django_db
def test_create_pedido(api_client, paciente, menu, menu_option):
    url = reverse('pedido-list-create')
    data = {
        "paciente": paciente.id,
        "menu": menu.id,
        "opciones": [menu_option.id],
        "status": "pendiente"
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == 201

@pytest.mark.django_db
def test_get_pedidos(api_client):
    url = reverse('pedido-list-create')
    response = api_client.get(url)
    assert response.status_code == 200

@pytest.mark.django_db
def test_update_pedido_status(api_client, paciente, menu, menu_option):
    pedido = Pedido.objects.create(paciente=paciente, menu=menu, status="pendiente")
    pedido.opciones.add(menu_option)
    url = reverse('pedido-status-update', args=[pedido.id])
    data = {"status": "completado"}
    response = api_client.patch(url, data, format='json')
    assert response.status_code == 200
    pedido.refresh_from_db()
    assert pedido.status == "completado"
