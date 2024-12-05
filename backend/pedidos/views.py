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


