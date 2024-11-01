from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Pedido
from .serializers import PedidoSerializer
from logs.models import LogEntry
import socket

class PedidoListCreateView(generics.ListCreateAPIView):
    serializer_class = PedidoSerializer

    def get_queryset(self):
        queryset = Pedido.objects.all()
        status = self.request.query_params.get('status', None)
        paciente_id = self.request.query_params.get('paciente_id', None)
        fecha_inicio = self.request.query_params.get('fecha_inicio', None)
        fecha_fin = self.request.query_params.get('fecha_fin', None)

        if status:
            queryset = queryset.filter(status=status)
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)
        if fecha_inicio:
            queryset = queryset.filter(fecha_pedido__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha_pedido__lte=fecha_fin)

        return queryset.select_related(
            'paciente',
            'menu',
            'paciente__cama',
            'paciente__cama__habitacion',
            'paciente__cama__habitacion__servicio'
        )

    def perform_create(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={
                'paciente_id': instance.paciente.id,
                'paciente_nombre': instance.paciente.name,
                'menu_id': instance.menu.id,
                'menu_nombre': instance.menu.nombre,
                'status': instance.status,
                'fecha_pedido': instance.fecha_pedido.isoformat()
            }
        )
        return instance

class PedidoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

    def perform_destroy(self, instance):
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()

class PedidoCompletadosView(views.APIView):
    def get(self, request):
        paciente_id = request.query_params.get('paciente', None)
        pedidos_completados = Pedido.objects.filter(status='completado')
        
        if paciente_id:
            pedidos_completados = pedidos_completados.filter(paciente__id=paciente_id)

        serializer = PedidoSerializer(pedidos_completados, many=True)
        return Response(serializer.data)

class PedidoStatusUpdateView(generics.UpdateAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class PedidoPrintView(views.APIView):
    def post(self, request, pk):
        try:
            pedido = Pedido.objects.get(pk=pk)
            self.print_pedido(pedido)
            return Response({"status": "success", "message": "Pedido impreso con éxito."})
        except Pedido.DoesNotExist:
            return Response({"status": "error", "message": "Pedido no encontrado."}, status=404)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)

    def print_pedido(self, pedido):
        printer_ip = '172.168.11.177'
        printer_port = 9100

        print_data = (
            "===============================\n"
            f"Paciente: {pedido.paciente.name}\n"
            f"Servicio: {pedido.paciente.cama.habitacion.servicio.nombre}\n"
            f"Habitación: {pedido.paciente.cama.habitacion.nombre}\n"
            f"Cama: {pedido.paciente.cama.nombre}\n"
            "===============================\n\n\n"
        )

        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)
            sock.connect((printer_ip, printer_port))
            initialize_printer = b'\x1b\x40'
            cut_paper = b'\x1d\x56\x00'
            message = initialize_printer + print_data.encode('utf-8') + b'\n\n\n\n\n' + cut_paper
            sock.sendall(message)
        except socket.error as e:
            raise Exception(f"Error al conectar con la impresora: {e}")
        finally:
            sock.close()

