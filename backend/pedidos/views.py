from rest_framework import generics, views
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Pedido
from .serializers import PedidoSerializer

class PedidoListCreateView(generics.ListCreateAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        pedidos_pendientes = Pedido.objects.filter(status='pendiente')
        serializer = self.get_serializer(pedidos_pendientes, many=True)
        return Response(serializer.data)

class PedidoCompletadosView(views.APIView):
    def get(self, request):
        # Obtener el ID del paciente en lugar del nombre
        paciente_id = request.query_params.get('paciente', None)
        pedidos_completados = Pedido.objects.filter(status='completado')
        
        if paciente_id:
            pedidos_completados = pedidos_completados.filter(paciente__id=paciente_id)
            print(f"Filtrando pedidos completados para el paciente ID: {paciente_id}")
        else:
            print("No se proporcionó un paciente ID.")

        # Añadimos un log para verificar los pedidos encontrados
        print(f"Pedidos Completados encontrados: {pedidos_completados.count()}")

        serializer = PedidoSerializer(pedidos_completados, many=True)
        return Response(serializer.data)

class PedidoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

class PedidoStatusUpdateView(generics.UpdateAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
