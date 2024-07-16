# pedidos/views.py
from rest_framework import generics, permissions
from .models import Pedido
from .serializers import PedidoSerializer

# Vista para listar y crear pedidos
class PedidoListCreateView(generics.ListCreateAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

# Vista para ver, actualizar y eliminar un pedido específico
class PedidoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save()
