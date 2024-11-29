"""
Configuración de URLs para la aplicación de habitaciones.

Define las rutas y vistas relacionadas con la gestión de habitaciones hospitalarias:
- Listado y creación de habitaciones
- Detalle, actualización y eliminación de habitaciones específicas
"""

from django.urls import path
from .views import HabitacionListCreateView, HabitacionDetailView

urlpatterns = [
    # Ruta para listar todas las habitaciones y crear nuevas
    path('', 
         HabitacionListCreateView.as_view(), 
         name='habitacion-list-create'),
    
    # Ruta para ver, actualizar o eliminar una habitación específica
    path('<int:pk>/', 
         HabitacionDetailView.as_view(), 
         name='habitacion-detail'),
]
