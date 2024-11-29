"""
Configuración de URLs para la aplicación de pacientes.

Define las rutas y vistas relacionadas con la gestión de pacientes:
- Listado y creación de pacientes
- Detalle, actualización y eliminación de pacientes específicos
"""

from django.urls import path
from .views import PacienteListCreateView, PacienteDetailView

urlpatterns = [
    # Ruta para listar todos los pacientes y crear nuevos
    path('', 
         PacienteListCreateView.as_view(), 
         name='paciente-list-create'),
    
    # Ruta para ver, actualizar o eliminar un paciente específico
    path('<int:pk>/', 
         PacienteDetailView.as_view(), 
         name='paciente-detail'),  
]
