import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Pedido
from pacientes.models import Paciente
from menu.models import Menu
from authentication.models import CustomUser

@pytest.mark.django_db
def test_create_pedido():
    client = APIClient()
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpass123')
    client.login(username='testuser', password='testpass123')

    url = reverse('login')
    response = client.post(url, {'username': 'testuser', 'password': 'testpass123'}, format='json')
    client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])

    patient = Paciente.objects.create(name="John Doe", room="101A", recommended_diet="Vegetarian")
    menu = Menu.objects.create(name="Desayuno Continental", description="Una deliciosa opción de desayuno.", is_available=True)
    url = reverse('pedido-list-create')
    data = {
        'status': 'Pending',
        'menu_id': menu.id,  # Cambiado a menu_id
        'patient_id': patient.id  # Cambiado a patient_id
    }
    response = client.post(url, data, format='json')
    if response.status_code != status.HTTP_201_CREATED:
        print(response.data)  # Imprime los detalles del error
    assert response.status_code == status.HTTP_201_CREATED
    assert Pedido.objects.count() == 1
    assert Pedido.objects.get().status == 'Pending'

@pytest.mark.django_db
def test_list_pedidos():
    patient = Paciente.objects.create(name="John Doe", room="101A", recommended_diet="Vegetarian")
    menu = Menu.objects.create(name="Desayuno Continental", description="Una deliciosa opción de desayuno.", is_available=True)
    Pedido.objects.create(status='Pending', menu=menu, patient=patient)
    client = APIClient()
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpass123')
    client.login(username='testuser', password='testpass123')

    url = reverse('login')
    response = client.post(url, {'username': 'testuser', 'password': 'testpass123'}, format='json')
    client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])

    url = reverse('pedido-list-create')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['status'] == 'Pending'
