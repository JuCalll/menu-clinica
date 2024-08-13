# Importamos la función path desde django.urls para definir rutas
from django.urls import path
# Importamos las vistas PedidoListCreateView, PedidoDetailView, y PedidoStatusUpdateView desde el archivo views
from .views import PedidoListCreateView, PedidoDetailView, PedidoStatusUpdateView

# Definimos las rutas para la aplicación de pedidos
urlpatterns = [
    # Ruta para listar todos los pedidos y crear uno nuevo
    # Esta vista maneja solicitudes GET para listar y POST para crear
    path('', PedidoListCreateView.as_view(), name='pedido-list-create'),
    
    # Ruta para obtener, actualizar o eliminar un pedido específico por su ID
    # Esta vista maneja solicitudes GET para obtener, PUT/PATCH para actualizar, y DELETE para eliminar
    path('<int:pk>/', PedidoDetailView.as_view(), name='pedido-detail'),
    
    # Ruta para actualizar el estado de un pedido específico por su ID
    # Esta vista maneja solicitudes PUT/PATCH para actualizar únicamente el estado del pedido
    path('<int:pk>/status/', PedidoStatusUpdateView.as_view(), name='pedido-status-update'),
]
