"""
Vistas para la gestión de habitaciones hospitalarias.

Define las vistas basadas en clase para:
- Listar y crear habitaciones
- Recuperar, actualizar y eliminar habitaciones específicas
Incluye registro de actividades mediante LogEntry.
"""

from rest_framework import generics
from .models import Habitacion
from .serializers import HabitacionSerializer
from logs.models import LogEntry

class HabitacionListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar todas las habitaciones y crear nuevas.
    
    GET: Retorna lista de todas las habitaciones.
    POST: Crea una nueva habitación y registra la acción.
    """
    serializer_class = HabitacionSerializer

    def get_queryset(self):
        """Retorna todas las habitaciones."""
        return Habitacion.objects.all()

    def perform_create(self, serializer):
        """
        Guarda la nueva habitación y registra la acción en el log.
        
        Args:
            serializer: Serializador con los datos validados de la habitación.
        """
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={
                'nombre': instance.nombre,
                'servicio_id': instance.servicio.id,
                'activo': instance.activo,
            }
        )

class HabitacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para gestionar una habitación específica.
    
    GET: Retorna detalles de una habitación.
    PUT/PATCH: Actualiza una habitación existente.
    DELETE: Elimina una habitación.
    """
    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer

    def perform_update(self, serializer):
        """
        Actualiza la habitación y registra la acción en el log.
        
        Args:
            serializer: Serializador con los datos validados de la habitación.
        """
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={
                'nombre': instance.nombre,
                'servicio_id': instance.servicio.id,
                'activo': instance.activo,
            }
        )

    def perform_destroy(self, instance):
        """
        Elimina la habitación y registra la acción en el log.
        
        Args:
            instance: Instancia de la habitación a eliminar.
        """
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()
