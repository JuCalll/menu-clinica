import pytest
from rest_framework.test import APIClient
from rest_framework import status
from servicios.models import Servicio
from habitaciones.models import Habitacion
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
def test_create_habitacion(api_client):
    client = api_client
    servicio = Servicio.objects.create(nombre='Servicio de Prueba')
    payload = {
        'numero': '101',
        'servicio_id': servicio.id
    }
    response = client.post('/api/habitaciones/', payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED

@pytest.mark.django_db
def test_list_habitaciones(api_client):
    client = api_client
    servicio = Servicio.objects.create(nombre='Servicio de Prueba')
    Habitacion.objects.create(numero='101', servicio=servicio)
    response = client.get('/api/habitaciones/')
    assert response.status_code == status.HTTP_200_OK
