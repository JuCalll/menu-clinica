"""
Define las rutas URL para el módulo de pedidos.

Estas rutas URL proporcionan operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para pedidos.

Ejemplos de uso:
    - Para listar todos los pedidos: `GET /pedidos/`
    - Para crear un nuevo pedido: `POST /pedidos/` con una carga útil JSON que contiene los detalles del pedido
    - Para recuperar un pedido específico: `GET /pedidos/<int:pk>/`
    - Para actualizar un pedido específico: `PUT /pedidos/<int:pk>/` con una carga útil JSON que contiene los detalles actualizados del pedido
    - Para actualizar el estado de un pedido específico: `PATCH /pedidos/<int:pk>/status/` con una carga útil JSON que contiene el estado actualizado
"""

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