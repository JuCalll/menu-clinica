# Importamos la función path desde django.urls para definir rutas
from django.urls import path
# Importamos las vistas PacienteListCreateView y PacienteDetailView desde el archivo views
from .views import PacienteListCreateView, PacienteDetailView

# Definimos las rutas para la aplicación de pacientes
urlpatterns = [
    # Ruta para listar todos los pacientes y crear uno nuevo
    # Esta vista maneja solicitudes GET para listar y POST para crear
    path('', PacienteListCreateView.as_view(), name='paciente-list-create'),
    
    # Ruta para obtener, actualizar o eliminar un paciente específico por su ID
    # Esta vista maneja solicitudes GET para obtener, PUT/PATCH para actualizar, y DELETE para eliminar
    path('<int:pk>/', PacienteDetailView.as_view(), name='paciente-detail'),
]
