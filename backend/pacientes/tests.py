import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Paciente
from authentication.models import CustomUser

@pytest.mark.django_db
def test_create_paciente():
    client = APIClient()
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpass123')
    client.login(username='testuser', password='testpass123')
    
    url = reverse('login')
    response = client.post(url, {'username': 'testuser', 'password': 'testpass123'}, format='json')
    client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])
    
    url = reverse('paciente-list-create')
    data = {
        'name': 'Jane Doe',
        'room': '102B',
        'recommended_diet': 'Sin gluten'
    }
    response = client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert Paciente.objects.count() == 1
    assert Paciente.objects.get().name == 'Jane Doe'

@pytest.mark.django_db
def test_list_pacientes():
    Paciente.objects.create(name="Jane Doe", room="102B", recommended_diet="Sin gluten")
    client = APIClient()
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpass123')
    client.login(username='testuser', password='testpass123')
    
    url = reverse('login')
    response = client.post(url, {'username': 'testuser', 'password': 'testpass123'}, format='json')
    client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])
    
    url = reverse('paciente-list-create')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['name'] == "Jane Doe"
