import pytest
from rest_framework.test import APIClient
from rest_framework import status
from pedidos.models import Pedido
from pacientes.models import Paciente
from habitaciones.models import Habitacion
from servicios.models import Servicio
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.fixture
def api_client():
    user = get_user_model().objects.create_user(username='testuser', email='testuser@example.com', password='testpassword')
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.mark.django_db
def test_create_pedido(api_client):
    client = api_client
    servicio = Servicio.objects.create(nombre='Servicio de Prueba')
    habitacion = Habitacion.objects.create(numero='101', servicio=servicio)
    paciente = Paciente.objects.create(name='Paciente de Prueba', room=habitacion, recommended_diet='Dieta de Prueba')
    payload = {
        'status': 'pending',
        'patient_id': paciente.id
    }
    response = client.post('/api/pedidos/', payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED

@pytest.mark.django_db
def test_list_pedidos(api_client):
    client = api_client
    servicio = Servicio.objects.create(nombre='Servicio de Prueba')
    habitacion = Habitacion.objects.create(numero='101', servicio=servicio)
    paciente = Paciente.objects.create(name='Paciente de Prueba', room=habitacion, recommended_diet='Dieta de Prueba')
    Pedido.objects.create(status='pending', patient=paciente)
    response = client.get('/api/pedidos/')
    assert response.status_code == status.HTTP_200_OK
