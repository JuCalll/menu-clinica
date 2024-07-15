from django.urls import path
from .views import MenuListCreateView, MenuDetailView

# Definimos las rutas para la aplicación 'menu'
urlpatterns = [
    # Ruta para listar y crear menús
    path('', MenuListCreateView.as_view(), name='menu-list-create'),
    # Ruta para obtener, actualizar y eliminar un menú por su ID
    path('<int:pk>/', MenuDetailView.as_view(), name='menu-detail'),
]
