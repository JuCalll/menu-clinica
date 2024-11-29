"""
Vistas para la gestión de menús hospitalarios.

Define las vistas basadas en clase para:
- Listar y crear menús
- Recuperar, actualizar y eliminar menús específicos
Incluye registro de actividades mediante LogEntry.
"""

from rest_framework import generics
from .models import Menu
from .serializers import MenuSerializer
from logs.models import LogEntry

class MenuListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar todos los menús y crear nuevos.
    
    GET: Retorna lista de todos los menús.
    POST: Crea un nuevo menú y registra la acción.
    """
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer

    def perform_create(self, serializer):
        """
        Guarda el nuevo menú y registra la acción en el log.
        
        Args:
            serializer: Serializador con los datos validados del menú.
        """
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )


class MenuDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para recuperar, actualizar o eliminar un menú específico.
    
    GET: Retorna los detalles de un menú.
    PUT: Actualiza un menú existente.
    DELETE: Elimina un menú existente.
    """
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer

    def perform_update(self, serializer):
        """
        Actualiza un menú existente y registra la acción en el log.
        
        Args:
            serializer: Serializador con los datos validados del menú.
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
        Elimina un menú existente y registra la acción en el log.
        
        Args:
            instance: Instancia del menú a eliminar.
        """
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()
