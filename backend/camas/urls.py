"""
Configuración de URLs para la aplicación de camas.

Define las rutas y vistas relacionadas con la gestión de camas hospitalarias:
- Listado y creación de camas
- Detalle, actualización y eliminación de camas específicas
"""

from django.urls import path
from .views import CamaListCreateView, CamaDetailView

urlpatterns = [
    # Ruta para listar todas las camas y crear nuevas
    path('', 
         CamaListCreateView.as_view(), 
         name='cama-list-create'),
    
    # Ruta para ver, actualizar o eliminar una cama específica
    path('<int:pk>/', 
         CamaDetailView.as_view(), 
         name='cama-detail'),
]
