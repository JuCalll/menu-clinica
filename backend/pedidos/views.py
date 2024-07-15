# pedidos/views.py

from rest_framework import generics, permissions
from .models import Pedido
from .serializers import PedidoSerializer

class PedidoListCreateView(generics.ListCreateAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        patient_id = self.request.data.get('patient')
        menu_id = self.request.data.get('menu')
        if patient_id and menu_id:
            serializer.save(patient_id=patient_id, menu_id=menu_id)
        else:
            raise ValueError("Los campos 'patient' y 'menu' son obligatorios.")

class PedidoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    permission_classes = [permissions.IsAuthenticated]

class PedidoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
