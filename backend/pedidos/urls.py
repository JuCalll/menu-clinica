from django.urls import path
from .views import PedidoListCreateView, PedidoDetailView, PedidoStatusUpdateView

# Definición de las rutas URL para el módulo de pedidos
urlpatterns = [
    # Ruta para listar y crear pedidos
    path('', PedidoListCreateView.as_view(), name='pedido-list-create'),

    # Ruta para recuperar, actualizar y eliminar un pedido específico
    path('<int:pk>/', PedidoDetailView.as_view(), name='pedido-detail'),

    # Ruta para actualizar parcialmente el estado de un pedido
    path('<int:pk>/status/', PedidoStatusUpdateView.as_view(), name='pedido-status-update'),
]
