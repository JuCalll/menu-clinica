import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Menu
from authentication.models import CustomUser

@pytest.mark.django_db
def test_create_menu():
    client = APIClient()
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpass123')
    client.login(username='testuser', password='testpass123')
    
    url = reverse('login')
    response = client.post(url, {'username': 'testuser', 'password': 'testpass123'}, format='json')
    client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])
    
    url = reverse('menu-list-create')
    data = {
        'name': 'Desayuno Continental',
        'description': 'Una deliciosa opción de desayuno.',
        'is_available': True
    }
    response = client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert Menu.objects.count() == 1
    assert Menu.objects.get().name == 'Desayuno Continental'

@pytest.mark.django_db
def test_list_menu():
    Menu.objects.create(name="Desayuno Continental", description="Una deliciosa opción de desayuno.", is_available=True)
    client = APIClient()
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpass123')
    client.login(username='testuser', password='testpass123')
    
    url = reverse('login')
    response = client.post(url, {'username': 'testuser', 'password': 'testpass123'}, format='json')
    client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])
    
    url = reverse('menu-list-create')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['name'] == "Desayuno Continental"
