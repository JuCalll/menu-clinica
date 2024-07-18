from rest_framework import generics, status
from rest_framework.response import Response
from .models import Pedido
from .serializers import PedidoSerializer

# Vista para listar y crear pedidos
class PedidoListCreateView(generics.ListCreateAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

# Vista para obtener, actualizar y eliminar un pedido específico
class PedidoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

# Vista para actualizar parcialmente el estado de un pedido
class PedidoStatusUpdateView(generics.UpdateAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
