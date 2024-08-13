# Importamos la función path desde django.urls para definir rutas
from django.urls import path
# Importamos las vistas MenuListCreateView y MenuDetailView desde el archivo views
from .views import MenuListCreateView, MenuDetailView

# Definimos las rutas para la aplicación de menús
urlpatterns = [
    # Ruta para listar todos los menús y crear uno nuevo
    # Esta vista maneja solicitudes GET para listar y POST para crear
    path('', MenuListCreateView.as_view(), name='menu-list-create'),
    
    # Ruta para obtener, actualizar o eliminar un menú específico por su ID
    # Esta vista maneja solicitudes GET para obtener, PUT/PATCH para actualizar, y DELETE para eliminar
    path('<int:pk>/', MenuDetailView.as_view(), name='menu-detail'),
]
