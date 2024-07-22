from django.urls import path
from .views import MenuListCreateView, MenuDetailView

"""
Define las rutas para la aplicación 'menu'.

Estas rutas proporcionan operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para menús.

Ejemplo:
    - Para listar todos los menús, envíe una solicitud GET a `/menu/`
    - Para crear un nuevo menú, envíe una solicitud POST a `/menu/` con los datos del menú
    - Para recuperar un menú por ID, envíe una solicitud GET a `/menu/<id>/`
    - Para actualizar un menú, envíe una solicitud PATCH a `/menu/<id>/` con los datos actualizados del menú
    - Para eliminar un menú, envíe una solicitud DELETE a `/menu/<id>/`
"""

# Definimos las rutas para la aplicación 'menu'
urlpatterns = [
    # Ruta para listar y crear menús
    path('', MenuListCreateView.as_view(), name='menu-list-create'),
    # Ruta para obtener, actualizar y eliminar un menú por su ID
    path('<int:pk>/', MenuDetailView.as_view(), name='menu-detail'),
]