import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from menus.models import Menu, MenuSection, MenuOption
from authentication.models import CustomUser

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user(db):
    user = CustomUser.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='testpass',
        name='Test User',
        cedula='1234567890',
        role='admin',
        activo=True
    )
    return user

@pytest.fixture
def access_token(api_client, test_user):
    url = reverse('login')
    response = api_client.post(url, {
        'username': 'testuser',
        'password': 'testpass'
    }, format='json')
    assert response.status_code == status.HTTP_200_OK
    return response.data['access']

@pytest.fixture
def authenticated_client(api_client, access_token):
    api_client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
    return api_client

class TestMenuCRUD:
    @pytest.mark.django_db
    def test_create_menu_with_sections_and_options(self, authenticated_client):
        url = reverse('menu-list')
        payload = {
            'nombre': 'Menú de Prueba',
            'sections': [
                {
                    'titulo': 'Desayuno',
                    'opciones': {
                        'entrada': [
                            {'texto': 'Fruta Fresca', 'tipo': 'entrada'},
                        ],
                        'huevos': [
                            {'texto': 'Huevos Revueltos', 'tipo': 'huevos'},
                        ],
                        'bebidas': [
                            {
                                'texto': 'Café',
                                'tipo': 'bebidas',
                                'preparado_en': ['Leche', 'Agua']
                            },
                        ],
                    }
                },
                {
                    'titulo': 'Almuerzo',
                    'opciones': {
                        'plato_principal': [
                            {'texto': 'Pollo a la Plancha', 'tipo': 'plato_principal'},
                        ],
                        'vegetariano': [
                            {'texto': 'Ensalada Mixta', 'tipo': 'vegetariano'},
                        ],
                    }
                },
            ]
        }

        response = authenticated_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert Menu.objects.count() == 1
        assert MenuSection.objects.count() == 2
        assert MenuOption.objects.count() == 5

        # Verificar que los datos almacenados coinciden con el payload
        menu = Menu.objects.get(nombre='Menú de Prueba')
        assert menu.sections.count() == 2
        desayuno_section = menu.sections.get(titulo='Desayuno')
        assert desayuno_section.options.filter(tipo='entrada', texto='Fruta Fresca').exists()
        assert desayuno_section.options.filter(tipo='huevos', texto='Huevos Revueltos').exists()
        bebida = desayuno_section.options.get(tipo='bebidas', texto='Café')
        assert bebida.preparado_en == ['Leche', 'Agua']

    @pytest.mark.django_db
    def test_update_menu(self, authenticated_client):
        # Crear menú previamente
        menu = Menu.objects.create(nombre='Menú Inicial')
        section = MenuSection.objects.create(menu=menu, titulo='Desayuno')
        option = MenuOption.objects.create(
            section=section,
            texto='Fruta Fresca',
            tipo='entrada'
        )

        url = reverse('menu-detail', args=[menu.id])
        payload = {
            'nombre': 'Menú Actualizado',
            'sections': [
                {
                    'id': section.id,
                    'titulo': 'Desayuno Actualizado',
                    'opciones': {
                        'entrada': [
                            {
                                'id': option.id,
                                'texto': 'Fruta de Temporada',
                                'tipo': 'entrada'
                            },
                        ],
                        'huevos': [
                            {'texto': 'Huevos Fritos', 'tipo': 'huevos'},
                        ],
                    }
                },
            ]
        }

        response = authenticated_client.put(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        menu.refresh_from_db()
        assert menu.nombre == 'Menú Actualizado'
        section = MenuSection.objects.get(id=section.id)
        assert section.titulo == 'Desayuno Actualizado'
        assert MenuOption.objects.filter(id=option.id, texto='Fruta de Temporada').exists()
        assert MenuOption.objects.filter(tipo='huevos', texto='Huevos Fritos').exists()

    @pytest.mark.django_db
    def test_delete_menu(self, authenticated_client):
        menu = Menu.objects.create(nombre='Menú a Eliminar')
        section = MenuSection.objects.create(menu=menu, titulo='Desayuno')
        MenuOption.objects.create(section=section, texto='Fruta Fresca', tipo='entrada')

        url = reverse('menu-detail', args=[menu.id])
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Menu.objects.filter(id=menu.id).exists()
        assert not MenuSection.objects.filter(menu=menu).exists()
        assert not MenuOption.objects.filter(section=section).exists()

    @pytest.mark.django_db
    def test_create_invalid_menu(self, authenticated_client):
        url = reverse('menu-list')
        payload = {
            'nombre': '',  # Nombre vacío para probar la validación
            'sections': []
        }
        response = authenticated_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'nombre' in response.data

    @pytest.mark.django_db
    def test_access_protected_endpoint_without_authentication(self, api_client):
        url = reverse('menu-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.django_db
    def test_update_preparado_en_in_beverage(self, authenticated_client):
        menu = Menu.objects.create(nombre='Menú con Bebida')
        section = MenuSection.objects.create(menu=menu, titulo='Desayuno')
        option = MenuOption.objects.create(
            section=section,
            texto='Café',
            tipo='bebidas',
            preparado_en=['Agua']
        )

        url = reverse('menu-detail', args=[menu.id])
        payload = {
            'nombre': 'Menú con Bebida Actualizado',
            'sections': [
                {
                    'id': section.id,
                    'titulo': 'Desayuno',
                    'opciones': {
                        'bebidas': [
                            {
                                'id': option.id,
                                'texto': 'Café',
                                'tipo': 'bebidas',
                                'preparado_en': ['Leche', 'Agua']
                            },
                        ],
                    }
                },
            ]
        }

        response = authenticated_client.put(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK
        option = MenuOption.objects.get(id=option.id)
        assert option.preparado_en == ['Leche', 'Agua']