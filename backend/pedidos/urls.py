from django.urls import path
from .views import PedidoListCreateView, PedidoDetailView, PedidoStatusUpdateView, PedidoCompletadosView, PedidoPrintView

urlpatterns = [
    path('', PedidoListCreateView.as_view(), name='pedido-list-create'),
    path('<int:pk>/', PedidoDetailView.as_view(), name='pedido-detail'),
    path('<int:pk>/status/', PedidoStatusUpdateView.as_view(), name='pedido-status-update'),
    path('completados/', PedidoCompletadosView.as_view(), name='pedido-completados'),
    path('<int:pk>/print/', PedidoPrintView.as_view(), name='pedido-print'),
]