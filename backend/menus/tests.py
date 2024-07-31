import pytest
from rest_framework.test import APIClient
from rest_framework import status
from menus.models import Menu
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
def test_create_menu(api_client):
    client = api_client
    payload = {
        'nombre': 'Menú de Prueba',
        'sections': [
            {
                'titulo': 'Desayuno',
                'options': [
                    {'texto': 'Opción 1', 'tipo': 'opciones'},
                    {'texto': 'Opción 2', 'tipo': 'bebidas'}
                ]
            }
        ]
    }
    response = client.post('/api/menus/', payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED

@pytest.mark.django_db
def test_list_menus(api_client):
    client = api_client
    Menu.objects.create(nombre='Menú de Prueba')
    response = client.get('/api/menus/')
    assert response.status_code == status.HTTP_200_OK
