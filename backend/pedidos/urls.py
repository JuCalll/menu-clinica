"""
Configuración de URLs para la aplicación de pedidos.

Define las rutas y vistas relacionadas con la gestión de pedidos hospitalarios:
- Listado y creación de pedidos
- Detalle, actualización y eliminación de pedidos específicos
- Actualización de estado de pedidos
- Consulta de pedidos completados
"""

from django.urls import path
from .views import (
    PedidoListCreateView, 
    PedidoDetailView, 
    PedidoStatusUpdateView, 
    PedidoCompletadosView, 
)

urlpatterns = [
    # Ruta para listar todos los pedidos y crear nuevos
    path('', 
         PedidoListCreateView.as_view(), 
         name='pedido-list-create'),
    
    # Ruta para ver, actualizar o eliminar un pedido específico
    path('<int:pk>/', 
         PedidoDetailView.as_view(), 
         name='pedido-detail'),
    
    # Ruta para actualizar el estado de un pedido
    path('<int:pk>/status/', 
         PedidoStatusUpdateView.as_view(), 
         name='pedido-status-update'),
    
    # Ruta para consultar pedidos completados
    path('completados/', 
         PedidoCompletadosView.as_view(), 
         name='pedido-completados'),
]