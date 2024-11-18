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
        log_data = {
            'status': serializer.validated_data.get('status'),
            'sectionStatus': serializer.validated_data.get('sectionStatus'),
        }
        
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=log_data
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
    INITIALIZE_PRINTER = b'\x1b\x40'
    CODEPAGE_LATINO = b'\x1b\x74\x10'
    CUT_PAPER = b'\x1d\x56\x00'
    PRINTER_IP = '172.168.11.177'
    PRINTER_PORT = 9100
    SOCKET_TIMEOUT = 5

    def format_title(self, title):
        formatted_names = {
            "acompanante": "Acompanante",
            "bebidas_calientes": "Bebidas Calientes",
            "bebidas_frias": "Bebidas Frias",
            "sopa_del_dia": "Sopa del Dia",
            "plato_principal": "Plato Principal",
            "media_manana_fit": "Media Manana Fit",
            "media_manana_tradicional": "Media Manana Tradicional",
            "refrigerio_fit": "Refrigerio Fit",
            "refrigerio_tradicional": "Refrigerio Tradicional",
            "entrada": "Entrada",
            "huevos": "Huevos",
            "toppings": "Toppings",
            "bebidas": "Bebidas",
            "vegetariano": "Vegetariano",
            "vegetales": "Vegetales",
            "adicionales": "Adicionales",
            "leche_entera": "Leche Entera",
            "leche_deslactosada": "Leche Deslactosada",
            "leche_almendras": "Leche de Almendras",
            "agua": "Agua",
            "unica_preparacion": "Única Preparación"
        }
        return formatted_names.get(title.lower(), title.replace('_', ' ').title())

    def print_pedido(self, pedido, section_title):
        sock = None
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.SOCKET_TIMEOUT)

            try:
                sock.connect((self.PRINTER_IP, self.PRINTER_PORT))
            except socket.error as e:
                raise Exception(f"Error de conexión con la impresora: {str(e)}\n"
                              f"IP: {self.PRINTER_IP}, Puerto: {self.PRINTER_PORT}")

            print_data = ""
            
            # 1. DATOS DEL PACIENTE
            print_data += "=== DATOS DEL PACIENTE ===\n"
            print_data += "-------------------------------\n"
            print_data += f"Pedido: {pedido.id}\n"
            print_data += f"Paciente: {pedido.paciente.name}\n"
            print_data += f"Dieta: {pedido.paciente.recommended_diet or 'No especificada'}\n"
            if pedido.paciente.alergias:
                print_data += f"Alergias: {pedido.paciente.alergias}\n"
            print_data += "-------------------------------\n\n"

            # 2. UBICACION
            print_data += "=== UBICACION ===\n"
            print_data += "-------------------------------\n"
            print_data += f"Servicio: {pedido.paciente.cama.habitacion.servicio.nombre}\n"
            print_data += f"Habitacion: {pedido.paciente.cama.habitacion.nombre}\n"
            print_data += f"Cama: {pedido.paciente.cama.nombre}\n"
            print_data += "-------------------------------\n\n"

            # 3. DETALLES DEL PEDIDO
            print_data += f"=== {self.format_title(section_title)} ===\n"
            print_data += "-------------------------------\n"

            selected_options = pedido.pedidomenuoption_set.filter(
                menu_option__section__titulo=section_title,
                selected=True
            ).select_related('menu_option')

            options_by_type = {}
            for pmo in selected_options:
                option = pmo.menu_option
                tipo = option.tipo
                if tipo not in options_by_type:
                    options_by_type[tipo] = []
                options_by_type[tipo].append(option)

            for tipo, opciones in options_by_type.items():
                if opciones:
                    print_data += f"{self.format_title(tipo)}:\n"
                    for opcion in opciones:
                        print_data += f"- {opcion.texto}\n"
                        if section_title in ["bebidas_calientes", "bebidas_frias"] and \
                           pedido.adicionales and \
                           'bebidasPreparacion' in pedido.adicionales and \
                           str(opcion.id) in pedido.adicionales['bebidasPreparacion']:
                            prep = pedido.adicionales['bebidasPreparacion'][str(opcion.id)]
                            print_data += f"  Preparacion: {self.format_title(prep)}\n"
            print_data += "-------------------------------\n\n"

            # 4. OBSERVACIONES (si existen)
            if pedido.observaciones:
                print_data += "=== OBSERVACIONES ===\n"
                print_data += "-------------------------------\n"
                print_data += f"{pedido.observaciones}\n"
                print_data += "-------------------------------\n\n"

            # 5. FECHA (Modificado para usar la hora actual con AM/PM)
            print_data += "=== FECHA Y HORA ===\n"
            print_data += "-------------------------------\n"
            print_data += f"{datetime.now().strftime('%d/%m/%Y %I:%M %p')}\n"
            print_data += "===============================\n"

            # Reemplazar caracteres especiales
            char_map = {
                'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
                'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
                'ñ': 'n', 'Ñ': 'N', 'ü': 'u', 'Ü': 'U'
            }
            for original, replacement in char_map.items():
                print_data = print_data.replace(original, replacement)

            try:
                message = (
                    self.INITIALIZE_PRINTER +
                    self.CODEPAGE_LATINO +
                    print_data.encode('cp850', errors='replace') +
                    b'\n\n\n\n\n' +
                    self.CUT_PAPER
                )
                sock.sendall(message)
            except socket.error as e:
                raise Exception(f"Error al enviar datos a la impresora: {str(e)}")

        except Exception as e:
            print(f"Error de impresión: {str(e)}")
            raise

        finally:
            if sock:
                try:
                    sock.close()
                except:
                    pass

    def post(self, request, pk):
        try:
            pedido = Pedido.objects.get(id=pk)
            section_title = request.data.get('section_title')
            
            if not section_title:
                return Response(
                    {'error': 'Título de sección no proporcionado'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            self.print_pedido(pedido, section_title)
            return Response({'status': 'success'})

        except Pedido.DoesNotExist:
            return Response(
                {'error': 'Pedido no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            error_message = f"Error al imprimir: {str(e)}"
            print(error_message)
            return Response(
                {'error': error_message}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

