from django.urls import path
from .views import PedidoListCreateView, PedidoDetailView

# Definición de las rutas URL para la aplicación de pedidos
urlpatterns = [
    # Ruta para listar y crear pedidos
    path('', PedidoListCreateView.as_view(), name='pedido-list-create'),
    # Ruta para ver, actualizar y eliminar un pedido específico por su ID
    path('<int:pk>/', PedidoDetailView.as_view(), name='pedido-detail'),
]
