"""
Configuración de URLs para la aplicación de dietas.

Define las rutas y vistas relacionadas con la gestión de dietas y alergias:
- Listado y creación de dietas
- Detalle, actualización y eliminación de dietas específicas
- Listado y creación de alergias
- Detalle, actualización y eliminación de alergias específicas
"""

from django.urls import path
from .views import (
    DietaListCreateView, 
    DietaDetailView,
    AlergiaListCreateView,
    AlergiaDetailView
)

urlpatterns = [
    # Rutas para gestión de dietas
    path('dietas/', 
         DietaListCreateView.as_view(), 
         name='dieta-list-create'),
    
    path('dietas/<int:pk>/', 
         DietaDetailView.as_view(), 
         name='dieta-detail'),
    
    # Rutas para gestión de alergias
    path('alergias/', 
         AlergiaListCreateView.as_view(), 
         name='alergia-list-create'),
    
    path('alergias/<int:pk>/', 
         AlergiaDetailView.as_view(), 
         name='alergia-detail'),
]
