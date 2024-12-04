"""
Vistas para la gestión de pedidos hospitalarios.

Define las vistas que manejan las operaciones CRUD y funcionalidades específicas:
- Listado y creación de pedidos
- Detalle, actualización y eliminación de pedidos
- Gestión de estados de pedidos
- Consulta de pedidos completados
- Impresión de pedidos
"""

from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Pedido
from .serializers import PedidoSerializer
from logs.models import LogEntry
import socket
import time

class PedidoListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar todos los pedidos y crear nuevos.
    
    Proporciona filtrado por:
    - Estado del pedido
    - ID del paciente
    - Rango de fechas
    """
    serializer_class = PedidoSerializer

    def get_queryset(self):
        """
        Obtiene el queryset de pedidos aplicando los filtros especificados.
        
        Returns:
            QuerySet: Pedidos filtrados y optimizados con select_related.
        """
        queryset = Pedido.objects.all()
        status = self.request.query_params.get('status', None)
        paciente_id = self.request.query_params.get('paciente_id', None)
        fecha_inicio = self.request.query_params.get('fecha_inicio', None)
        fecha_fin = self.request.query_params.get('fecha_fin', None)

        if status == 'pendiente':
            queryset = queryset.filter(
                Q(sectionStatus={}) |  
                ~Q(status='completado')  
            )
        elif status:
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
        """
        Crea un nuevo pedido y registra la acción en el log.
        
        Args:
            serializer: Serializer validado con los datos del pedido.
            
        Returns:
            Pedido: Instancia del pedido creado.
        """
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
    """
    Vista para ver, actualizar y eliminar pedidos específicos.
    
    Incluye registro de acciones en el log del sistema.
    """
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def perform_update(self, serializer):
        """
        Actualiza un pedido y registra la acción en el log.
        
        Args:
            serializer: Serializer validado con los datos actualizados.
        """
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
        """
        Elimina un pedido y registra la acción en el log.
        
        Args:
            instance: Instancia del pedido a eliminar.
        """
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()

class PedidoCompletadosView(views.APIView):
    """
    Vista para consultar pedidos completados.
    
    Permite filtrar por paciente específico.
    """
    def get(self, request):
        """
        Obtiene la lista de pedidos completados.
        
        Args:
            request: Request HTTP con posibles parámetros de filtrado.
            
        Returns:
            Response: Lista serializada de pedidos completados.
        """
        paciente_id = request.query_params.get('paciente', None)
        pedidos_completados = Pedido.objects.filter(status='completado')
        
        if paciente_id:
            pedidos_completados = pedidos_completados.filter(paciente__id=paciente_id)

        serializer = PedidoSerializer(pedidos_completados, many=True)
        return Response(serializer.data)

class PedidoStatusUpdateView(generics.UpdateAPIView):
    """
    Vista para actualizar el estado de un pedido.
    
    Permite actualizaciones parciales del estado.
    """
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def partial_update(self, request, *args, **kwargs):
        """
        Actualiza parcialmente un pedido.
        
        Args:
            request: Request HTTP con los datos a actualizar.
            
        Returns:
            Response: Datos actualizados del pedido.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class PedidoPrintView(views.APIView):
    """
    Vista para generar e imprimir pedidos.
    
    Gestiona la impresión de pedidos en una impresora térmica DIG-K200L,
    incluyendo el formateo del texto y manejo de errores de conexión.
    
    Attributes:
        INITIALIZE_PRINTER (bytes): Secuencia de inicialización de impresora
        CODEPAGE_LATINO (bytes): Configuración de página de códigos latina
        LINE_SPACING (bytes): Espaciado entre líneas
        ALIGN_CENTER (bytes): Alineación centrada
        ALIGN_LEFT (bytes): Alineación izquierda 
        DOUBLE_WIDTH (bytes): Texto ancho doble
        NORMAL_TEXT (bytes): Texto normal
        CUT_PAPER (bytes): Comando para cortar papel
        PRINTER_IP (str): IP de la impresora
        PRINTER_PORT (int): Puerto de la impresora
        SOCKET_TIMEOUT (int): Tiempo máximo de espera para conexión
        MAX_RETRIES (int): Máximo número de reintentos
        RETRY_DELAY (int): Tiempo entre reintentos
    """
    INITIALIZE_PRINTER = b'\x1b\x40'
    CODEPAGE_LATINO = b'\x1b\x74\x12'
    LINE_SPACING = b'\x1b\x33\x30'
    ALIGN_CENTER = b'\x1b\x61\x01'
    ALIGN_LEFT = b'\x1b\x61\x00'
    DOUBLE_WIDTH = b'\x1b\x21\x20'
    NORMAL_TEXT = b'\x1b\x21\x00'
    CUT_PAPER = b'\x1d\x56\x41\x10'
    PRINTER_IP = '172.168.2.216'
    PRINTER_PORT = 9100
    SOCKET_TIMEOUT = 10
    MAX_RETRIES = 5
    RETRY_DELAY = 3

    def test_printer_connection(self):
        """
        Prueba la conexión con la impresora DIG-K200L.
        
        Returns:
            tuple: (bool, str) Indica si la conexión fue exitosa y mensaje descriptivo
        """
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(self.SOCKET_TIMEOUT)
        
        try:
            try:
                socket.gethostbyname(self.PRINTER_IP)
            except socket.gaierror as e:
                return False, "Error de DNS: No se puede resolver la IP de la impresora"
            
            result = sock.connect_ex((self.PRINTER_IP, self.PRINTER_PORT))
            
            if result == 0:
                return True, "Conexión exitosa"
            elif result in [10061, 111]:
                return False, "Conexión rechazada: Posible bloqueo por firewall"
            else:
                return False, f"Error de conexión (código {result}): Posible puerto cerrado o bloqueado por firewall"
            
        except socket.timeout:
            return False, "Timeout: La conexión fue bloqueada o la impresora no responde"
        except Exception as e:
            return False, f"Error de conexión: {str(e)}"
        finally:
            sock.close()

    def format_title(self, title):
        """
        Formatea títulos de secciones para impresión.
        
        Args:
            title (str): Título a formatear
            
        Returns:
            str: Título formateado
        """
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
        """
        Imprime un pedido específico.
        
        Args:
            pedido (Pedido): Pedido a imprimir
            section_title (str): Título de la sección a imprimir
            
        Raises:
            Exception: Si hay error de conexión o impresión
        """
        attempts = 0
        last_error = None
        
        while attempts < self.MAX_RETRIES:
            sock = None
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(self.SOCKET_TIMEOUT)
                
                try:
                    sock.connect((self.PRINTER_IP, self.PRINTER_PORT))
                except socket.error as e:
                    attempts += 1
                    if attempts < self.MAX_RETRIES:
                        time.sleep(self.RETRY_DELAY)
                        continue
                    raise Exception(f"Error de conexión: {str(e)}")

                init_sequence = (
                    self.INITIALIZE_PRINTER +
                    self.CODEPAGE_LATINO +
                    self.LINE_SPACING
                )
                sock.sendall(init_sequence)
                
                print_data = ""
                
                print_data += "=== DATOS DEL PACIENTE ===\n"
                print_data += "-------------------------------\n"
                print_data += f"Pedido: {pedido.id}\n"
                print_data += f"Paciente: {pedido.paciente.name}\n"
                print_data += f"Dieta: {pedido.paciente.recommended_diet or 'No especificada'}\n"
                if pedido.paciente.alergias:
                    print_data += f"Alergias: {pedido.paciente.alergias}\n"
                print_data += "-------------------------------\n\n"

                print_data += "=== UBICACION ===\n"
                print_data += "-------------------------------\n"
                print_data += f"Servicio: {pedido.paciente.cama.habitacion.servicio.nombre}\n"
                print_data += f"Habitacion: {pedido.paciente.cama.habitacion.nombre}\n"
                print_data += f"Cama: {pedido.paciente.cama.nombre}\n"
                print_data += "-------------------------------\n\n"

                print_data += f"=== {self.format_title(section_title)} ===\n"
                print_data += "-------------------------------\n"

                #selected_options = pedido.pedidomenuoption_set.filter(
                #    menu_option__section__titulo=section_title,
                #    selected=True
                #).select_related('menu_option')
                #
                #options_by_type = {}
                #for pmo in selected_options:
                #    option = pmo.menu_option
                #    tipo = option.tipo
                #    if tipo not in options_by_type:
                #        options_by_type[tipo] = []
                #    options_by_type[tipo].append(option)
                #
                #for tipo, opciones in options_by_type.items():
                #    if opciones:
                #        print_data += f"{self.format_title(tipo)}:\n"
                #        for opcion in opciones:
                #            print_data += f"- {opcion.texto}\n"
                #            if section_title in ["bebidas_calientes", "bebidas_frias"] and \
                #               pedido.adicionales and \
                #               'bebidasPreparacion' in pedido.adicionales and \
                #               str(opcion.id) in pedido.adicionales['bebidasPreparacion']:
                #                prep = pedido.adicionales['bebidasPreparacion'][str(opcion.id)]
                #                print_data += f"  Preparacion: {self.format_title(prep)}\n"
                #print_data += "-------------------------------\n\n"

                if pedido.observaciones:
                    print_data += "=== OBSERVACIONES ===\n"
                    print_data += "-------------------------------\n"
                    print_data += f"{pedido.observaciones}\n"
                    print_data += "-------------------------------\n\n"

                #print_data += "=== FECHA Y HORA ===\n"
                #print_data += "-------------------------------\n"
                #print_data += f"{datetime.now().strftime('%d/%m/%Y %I:%M %p')}\n"
                #print_data += "===============================\n"

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

                break

            except Exception as e:
                attempts += 1
                last_error = str(e)
                
                if attempts < self.MAX_RETRIES:
                    time.sleep(self.RETRY_DELAY)
                    continue
                raise

            finally:
                if sock:
                    try:
                        sock.close()
                    except:
                        pass

    def post(self, request, pk):
        """
        Maneja solicitudes POST para imprimir pedidos.
        
        Args:
            request (Request): Request HTTP con datos del pedido
            pk (int): ID del pedido a imprimir
            
        Returns:
            Response: Respuesta con estado de la impresión
        """
        try:
            pedido = Pedido.objects.get(id=pk)
            section_title = request.data.get('section_title')
            
            if not section_title:
                return Response(
                    {'error': 'Título de sección no proporcionado'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            diagnostic_info = {
                'printer_ip': self.PRINTER_IP,
                'attempted_ports': [self.PRINTER_PORT],
                'network_info': {}
            }
            
            try:
                import subprocess
                ping_result = subprocess.run(['ping', '-c', '1', self.PRINTER_IP], 
                                          capture_output=True, text=True)
                diagnostic_info['network_info']['ping'] = ping_result.returncode == 0
            except:
                diagnostic_info['network_info']['ping'] = 'Error al ejecutar ping'
            
            connection_ok, diagnostic = self.test_printer_connection()
            diagnostic_info['connection_test'] = diagnostic
            
            if not connection_ok:
                return Response(
                    {
                        'error': 'Error de conexión con la impresora',
                        'type': 'printer_connection_error',
                        'message': diagnostic,
                        'details': {
                            'diagnostic_info': diagnostic_info,
                            'possible_solutions': [
                                'Verificar reglas del firewall para el puerto 9100',
                                'Comprobar el firewall de Windows/Linux',
                                'Revisar si hay antivirus bloqueando la conexión',
                                'Verificar que la impresora esté encendida',
                                'Comprobar que la IP sea correcta'
                            ],
                            'firewall_check': [
                                'Windows: Revisar Windows Defender Firewall',
                                'Linux: Verificar iptables o ufw',
                                'Agregar excepción para el puerto 9100 TCP',
                                'Permitir conexiones a la IP de la impresora'
                            ]
                        }
                    }, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
                
            self.print_pedido(pedido, section_title)
            return Response({'status': 'success'})

        except Pedido.DoesNotExist:
            return Response(
                {'error': 'Pedido no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            error_message = str(e)
            return Response(
                {
                    'error': error_message,
                    'type': 'printer_connection_error',
                    'message': 'Error al conectar con la impresora. Por favor, verifique:',
                    'details': {
                        'checks': [
                            'La impresora está encendida',
                            'La dirección IP es correcta',
                            'El puerto 9100 está abierto',
                            'No hay un firewall bloqueando la conexión'
                        ],
                        'technical_details': error_message
                    }
                }, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

