from rest_framework import generics
from .models import Dieta, Alergia
from .serializers import DietaSerializer, AlergiaSerializer
from logs.models import LogEntry

class DietaListCreateView(generics.ListCreateAPIView):
    queryset = Dieta.objects.all()
    serializer_class = DietaSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

class DietaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Dieta.objects.all()
    serializer_class = DietaSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
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

class AlergiaListCreateView(generics.ListCreateAPIView):
    queryset = Alergia.objects.all()
    serializer_class = AlergiaSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

class AlergiaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alergia.objects.all()
    serializer_class = AlergiaSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
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
