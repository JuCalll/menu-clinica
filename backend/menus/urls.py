"""
Configuración de URLs para la aplicación de menús.

Define las rutas y vistas relacionadas con la gestión de menús hospitalarios:
- Listado y creación de menús
- Detalle, actualización y eliminación de menús específicos
"""

from django.urls import path
from .views import MenuListCreateView, MenuDetailView

urlpatterns = [
    # Ruta para listar todos los menús y crear nuevos
    path('', 
         MenuListCreateView.as_view(), 
         name='menu-list'),
    
    # Ruta para ver, actualizar o eliminar un menú específico
    path('<int:pk>/', 
         MenuDetailView.as_view(), 
         name='menu-detail'),
]
