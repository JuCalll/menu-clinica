from rest_framework import generics, views
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Pedido
from .serializers import PedidoSerializer
import usb.core
import usb.util

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

class PedidoPrintView(views.APIView):
    def post(self, request, pk):
        try:
            pedido = Pedido.objects.get(pk=pk)
            self.print_pedido(pedido)
            return Response({"status": "success", "message": "Pedido impreso con éxito."})
        except Pedido.DoesNotExist:
            return Response({"status": "error", "message": "Pedido no encontrado."}, status=404)

    def print_pedido(self, pedido):
        dev = usb.core.find(idVendor=0x1FC9, idProduct=0x2016)

        if dev is None:
            raise ValueError('Dispositivo no encontrado')

        dev.set_configuration()

        cfg = dev.get_active_configuration()
        interface_number = cfg[(0,0)].bInterfaceNumber
        intf = usb.util.find_descriptor(cfg, bInterfaceNumber=interface_number)
        ep = usb.util.find_descriptor(
            intf,
            custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT
        )

        print_data = (
            "===============================\n"
            f"Paciente: {pedido.paciente.name}\n"
            f"Servicio: {pedido.paciente.cama.habitacion.servicio.nombre}\n"
            f"Habitación: {pedido.paciente.cama.habitacion.nombre}\n"
            f"Cama: {pedido.paciente.cama.nombre}\n"
            "===============================\n\n\n"
        )

        try:
            ep.write(b'\x1b\x40' + print_data.encode('utf-8'))
            ep.write(b'\n\n\n\n\n')
            ep.write(b'\x1d\x56\x00')
        finally:
            # Liberar la interfaz USB
            usb.util.release_interface(dev, interface_number)
            usb.util.dispose_resources(dev)
            print("Información del paciente impresa y dispositivo liberado con éxito.")
