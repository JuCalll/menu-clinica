from rest_framework import generics
from .models import Cama
from .serializers import CamaSerializer
from logs.models import LogEntry  # Importar el modelo de LogEntry

class CamaListCreateView(generics.ListCreateAPIView):
    queryset = Cama.objects.all()
    serializer_class = CamaSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        # Serializar manualmente los cambios
        changes = {
            'nombre': instance.nombre,
            'habitacion_id': instance.habitacion.id,
            'activo': instance.activo,
        }
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model=instance.__class__.__name__,
            object_id=instance.id,
            changes=changes,  # Usar la versión serializada
        )

class CamaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cama.objects.all()
    serializer_class = CamaSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        # Serializar manualmente los cambios
        changes = {
            'nombre': instance.nombre,
            'habitacion_id': instance.habitacion.id,
            'activo': instance.activo,
        }
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model=instance.__class__.__name__,
            object_id=instance.id,
            changes=changes,  # Usar la versión serializada
        )

    def perform_destroy(self, instance):
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model=instance.__class__.__name__,
            object_id=instance.id,
        )
        instance.delete()
