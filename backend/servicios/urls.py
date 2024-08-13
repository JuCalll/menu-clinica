# Importamos la función path desde django.urls para definir rutas
from django.urls import path
# Importamos las vistas ServicioListCreateView y ServicioDetailView desde el archivo views
from .views import ServicioListCreateView, ServicioDetailView

# Definimos las rutas para la aplicación de servicios
urlpatterns = [
    # Ruta para listar todos los servicios y crear uno nuevo
    # Esta vista maneja solicitudes GET para listar y POST para crear
    path('', ServicioListCreateView.as_view(), name='servicio-list-create'),
    
    # Ruta para obtener, actualizar o eliminar un servicio específico por su ID
    # Esta vista maneja solicitudes GET para obtener, PUT/PATCH para actualizar, y DELETE para eliminar
    path('<int:pk>/', ServicioDetailView.as_view(), name='servicio-detail'),
]
