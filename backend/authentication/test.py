# authentication/tests/test_authentication.py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

@pytest.mark.django_db
def test_register_user():
    client = APIClient()
    payload = {
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'testpassword'
    }
    response = client.post('/api/auth/register/', payload)
    assert response.status_code == status.HTTP_201_CREATED
    user = User.objects.get(username='testuser')
    assert user.email == 'testuser@example.com'

@pytest.mark.django_db
def test_login_user():
    client = APIClient()
    user = User.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword')
    payload = {
        'username': 'testuser',
        'password': 'testpassword'
    }
    response = client.post('/api/auth/login/', payload)
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    assert 'refresh' in response.data
