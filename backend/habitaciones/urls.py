# Importamos la función path desde django.urls para definir rutas
from django.urls import path
# Importamos las vistas HabitacionListCreateView y HabitacionDetailView desde el archivo views
from .views import HabitacionListCreateView, HabitacionDetailView

# Definimos las rutas para la aplicación de habitaciones
urlpatterns = [
    # Ruta para listar todas las habitaciones y crear una nueva
    # Esta vista maneja solicitudes GET para listar y POST para crear
    path('', HabitacionListCreateView.as_view(), name='habitacion-list-create'),
    
    # Ruta para obtener, actualizar o eliminar una habitación específica por su ID
    # Esta vista maneja solicitudes GET para obtener, PUT/PATCH para actualizar, y DELETE para eliminar
    path('<int:pk>/', HabitacionDetailView.as_view(), name='habitacion-detail'),
]
