"""
Vistas para la gestión de camas hospitalarias.

Define las vistas basadas en clase para:
- Listar y crear camas
- Recuperar, actualizar y eliminar camas específicas
Incluye registro de actividades mediante LogEntry.
"""

from rest_framework import generics
from .models import Cama
from .serializers import CamaSerializer
from logs.models import LogEntry

class CamaListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar todas las camas y crear nuevas.
    
    GET: Retorna lista de todas las camas.
    POST: Crea una nueva cama y registra la acción.
    """
    queryset = Cama.objects.all()
    serializer_class = CamaSerializer

    def perform_create(self, serializer):
        """
        Guarda la nueva cama y registra la acción en el log.
        
        Args:
            serializer: Serializador con los datos validados de la cama.
        """
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={
                'nombre': instance.nombre,
                'habitacion_id': instance.habitacion.id,
                'activo': instance.activo,
            }
        )

class CamaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para gestionar una cama específica.
    
    GET: Retorna detalles de una cama.
    PUT/PATCH: Actualiza una cama existente.
    DELETE: Elimina una cama.
    """
    queryset = Cama.objects.all()
    serializer_class = CamaSerializer

    def perform_update(self, serializer):
        """
        Actualiza la cama y registra la acción en el log.
        
        Args:
            serializer: Serializador con los datos validados de la cama.
        """
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={
                'nombre': instance.nombre,
                'habitacion_id': instance.habitacion.id,
                'activo': instance.activo,
            }
        )

    def perform_destroy(self, instance):
        """
        Elimina la cama y registra la acción en el log.
        
        Args:
            instance: Instancia de la cama a eliminar.
        """
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()
