from rest_framework import generics
from .models import Paciente
from .serializers import PacienteSerializer
from logs.models import LogEntry

class PacienteListCreateView(generics.ListCreateAPIView):
    serializer_class = PacienteSerializer

    def get_queryset(self):
        return Paciente.objects.filter(activo=True)  

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        changes = {
            'name': response.data.get('name'),
            'cedula': response.data.get('cedula'),
            'activo': response.data.get('activo'),
            # Asegúrate de que estás utilizando campos serializables
        }
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model='Paciente',
            object_id=response.data['id'],
            changes=changes,
        )
        return response

class PacienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        changes = {
            'name': instance.name,
            'cedula': instance.cedula,
            'activo': instance.activo,
            # Incluye aquí otros campos relevantes que sean serializables
        }
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model=instance.__class__.__name__,
            object_id=instance.id,
            changes=changes,  # Solo datos serializables
        )

    def perform_destroy(self, instance):
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model=instance.__class__.__name__,
            object_id=instance.id,
        )
        instance.delete()
