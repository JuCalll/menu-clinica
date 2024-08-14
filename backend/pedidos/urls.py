# Importamos la función path desde django.urls para definir rutas
from django.urls import path
# Importamos las vistas PedidoListCreateView, PedidoDetailView, PedidoStatusUpdateView y PedidoCompletadosView desde el archivo views
from .views import PedidoListCreateView, PedidoDetailView, PedidoStatusUpdateView, PedidoCompletadosView

# Definimos las rutas para la aplicación de pedidos
urlpatterns = [
    # Ruta para listar todos los pedidos y crear uno nuevo
    path('', PedidoListCreateView.as_view(), name='pedido-list-create'),
    
    # Ruta para obtener, actualizar o eliminar un pedido específico por su ID
    path('<int:pk>/', PedidoDetailView.as_view(), name='pedido-detail'),
    
    # Ruta para actualizar el estado de un pedido específico por su ID
    path('<int:pk>/status/', PedidoStatusUpdateView.as_view(), name='pedido-status-update'),

    # Ruta para obtener los pedidos completados y aplicar filtros
    path('completados/', PedidoCompletadosView.as_view(), name='pedido-completados'),
]
