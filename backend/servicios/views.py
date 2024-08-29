from rest_framework import generics
from .models import Servicio
from .serializers import ServicioSerializer
from logs.models import LogEntry  # Importar el modelo de LogEntry

class ServicioListCreateView(generics.ListCreateAPIView):
    serializer_class = ServicioSerializer

    def get_queryset(self):
        return Servicio.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model=instance.__class__.__name__,
            object_id=instance.id,
            changes=serializer.validated_data,
        )

class ServicioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model=instance.__class__.__name__,
            object_id=instance.id,
            changes=serializer.validated_data,
        )

    def perform_destroy(self, instance):
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model=instance.__class__.__name__,
            object_id=instance.id,
        )
        instance.delete()
