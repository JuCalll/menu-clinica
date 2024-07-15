# pedidos/urls.py

from django.urls import path
from .views import PedidoListCreateView, PedidoDetailView

urlpatterns = [
    path('', PedidoListCreateView.as_view(), name='pedido-list-create'),
    path('<int:pk>/', PedidoDetailView.as_view(), name='pedido-detail'),
]
