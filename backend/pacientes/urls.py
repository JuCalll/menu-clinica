from django.urls import path
from .views import PacienteListCreateView, PacienteDetailView

# Definición de las rutas URL para la aplicación pacientes
urlpatterns = [
    # Ruta para listar y crear pacientes
    path('pacientes/', PacienteListCreateView.as_view(), name='paciente-list-create'),
    
    # Ruta para obtener, actualizar y eliminar un paciente específico
    path('pacientes/<int:pk>/', PacienteDetailView.as_view(), name='paciente-detail'),
]
