"""
Configuración de URLs para la aplicación de servicios hospitalarios.

Define las rutas y vistas relacionadas con la gestión de servicios:
- Listado y creación de servicios
- Detalle, actualización y eliminación de servicios específicos
"""

from django.urls import path
from .views import ServicioListCreateView, ServicioDetailView

urlpatterns = [
    # Ruta para listar todos los servicios y crear nuevos
    path('', 
         ServicioListCreateView.as_view(), 
         name='servicio-list-create'),
    
    # Ruta para ver, actualizar o eliminar un servicio específico
    path('<int:pk>/', 
         ServicioDetailView.as_view(), 
         name='servicio-detail'),
]
