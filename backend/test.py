import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from habitaciones.models import Habitacion
from camas.models import Cama
from servicios.models import Servicio
from pacientes.models import Paciente
from authentication.models import CustomUser

@pytest.mark.django_db
def test_create_paciente_with_unique_id():
    client = APIClient()

    # Autenticar el cliente con el modelo de usuario personalizado
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword')
    client.force_authenticate(user=user)

    servicio = Servicio.objects.create(nombre="SERVICIO TEST", activo=True)
    habitacion = Habitacion.objects.create(nombre="Habitación 101", servicio=servicio, activo=True)
    cama = Cama.objects.create(nombre="Cama 101", habitacion=habitacion, activo=True)

    data = {
        "id": "12345678",
        "name": "Juan Aguirre",
        "cama_id": cama.id,
        "recommended_diet": "Hipoglúcida",
        "activo": True
    }
    
    response = client.post(reverse('paciente-list-create'), data=data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert Paciente.objects.count() == 1

@pytest.mark.django_db
def test_create_paciente_with_duplicate_id():
    client = APIClient()

    # Autenticar el cliente con el modelo de usuario personalizado
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword')
    client.force_authenticate(user=user)

    servicio = Servicio.objects.create(nombre="SERVICIO TEST", activo=True)
    habitacion = Habitacion.objects.create(nombre="Habitación 101", servicio=servicio, activo=True)
    cama = Cama.objects.create(nombre="Cama 101", habitacion=habitacion, activo=True)

    # Create the first patient
    data1 = {
        "id": "12345678",
        "name": "Juan Aguirre",
        "cama_id": cama.id,
        "recommended_diet": "Hipoglúcida",
        "activo": True
    }
    response1 = client.post(reverse('paciente-list-create'), data=data1, format='json')
    assert response1.status_code == status.HTTP_201_CREATED

    # Try to create a second patient with the same id but different timestamp
    data2 = {
        "id": "12345678",
        "name": "Juan Aguirre",
        "cama_id": cama.id,
        "recommended_diet": "Hipoglúcida",
        "activo": True
    }
    response2 = client.post(reverse('paciente-list-create'), data=data2, format='json')
    assert response2.status_code == status.HTTP_201_CREATED  # Esperamos que se cree correctamente
    assert Paciente.objects.count() == 2  # Verificamos que hay dos registros en la base de datos
