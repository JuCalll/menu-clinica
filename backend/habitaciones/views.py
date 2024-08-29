from rest_framework import generics
from .models import Habitacion
from .serializers import HabitacionSerializer
from logs.models import LogEntry  # Importar el modelo de LogEntry

class HabitacionListCreateView(generics.ListCreateAPIView):
    serializer_class = HabitacionSerializer

    def get_queryset(self):
        return Habitacion.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model=instance.__class__.__name__,
            object_id=instance.id,
            changes=serializer.validated_data,
        )

class HabitacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer

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
