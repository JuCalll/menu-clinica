from rest_framework import generics
from .models import Cama
from .serializers import CamaSerializer
from logs.models import LogEntry  

class CamaListCreateView(generics.ListCreateAPIView):
    queryset = Cama.objects.all()
    serializer_class = CamaSerializer

    def perform_create(self, serializer):
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
    queryset = Cama.objects.all()
    serializer_class = CamaSerializer

    def perform_update(self, serializer):
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
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()
