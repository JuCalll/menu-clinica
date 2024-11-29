"""
Vistas para la gestión de servicios hospitalarios.

Define las vistas basadas en clase para:
- Listar y crear servicios
- Recuperar, actualizar y eliminar servicios específicos
Incluye registro de actividades mediante LogEntry.
"""

from rest_framework import generics
from .models import Servicio
from .serializers import ServicioSerializer
from logs.models import LogEntry  

class ServicioListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar todos los servicios y crear nuevos.
    
    GET: Retorna lista de todos los servicios.
    POST: Crea un nuevo servicio y registra la acción.
    """
    serializer_class = ServicioSerializer

    def get_queryset(self):
        """Retorna todos los servicios."""
        return Servicio.objects.all()

    def perform_create(self, serializer):
        """
        Guarda el nuevo servicio y registra la acción en el log.
        
        Args:
            serializer: Serializador con los datos validados del servicio.
        """
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

class ServicioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para gestionar un servicio específico.
    
    GET: Retorna los detalles del servicio.
    PUT/PATCH: Actualiza el servicio y registra la acción.
    DELETE: Elimina el servicio y registra la acción.
    """
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

    def perform_update(self, serializer):
        """
        Actualiza el servicio y registra la acción en el log.
        
        Args:
            serializer: Serializador con los datos validados del servicio.
        """
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

    def perform_destroy(self, instance):
        """
        Elimina el servicio y registra la acción en el log.
        
        Args:
            instance: Instancia del servicio a eliminar.
        """
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()
