import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import CustomUser

@pytest.mark.django_db
def test_register_user():
    client = APIClient()
    url = reverse('register')
    data = {
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'testpass123'
    }
    response = client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert CustomUser.objects.count() == 1
    assert CustomUser.objects.get().username == 'testuser'

@pytest.mark.django_db
def test_login_user():
    user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='testpass123')
    client = APIClient()
    url = reverse('login')
    data = {
        'username': 'testuser',
        'password': 'testpass123'
    }
    response = client.post(url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    assert 'refresh' in response.data
