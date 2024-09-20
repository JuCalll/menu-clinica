from rest_framework import generics
from .models import Paciente
from .serializers import PacienteSerializer
from logs.models import LogEntry

class PacienteListCreateView(generics.ListCreateAPIView):
    serializer_class = PacienteSerializer

    def get_queryset(self):
        return Paciente.objects.filter(activo=True)

    def create(self, request, *args, **kwargs):
        print("Datos recibidos para crear paciente:", request.data)
        response = super().create(request, *args, **kwargs)
        changes = {
            'name': response.data.get('name'),
            'cedula': response.data.get('cedula'),
            'recommended_diet': response.data.get('recommended_diet'),  # Registrar la dieta recomendada
            'alergias': response.data.get('alergias'),  # Registrar las alergias
            'activo': response.data.get('activo'),
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
            'recommended_diet': instance.recommended_diet.id if instance.recommended_diet else None,  # Guardar la dieta recomendada
            'alergias': instance.alergias,  # Guardar las alergias
            'activo': instance.activo,
        }
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model=instance.__class__.__name__,
            object_id=instance.id,
            changes=changes,
        )

    def perform_destroy(self, instance):
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model=instance.__class__.__name__,
            object_id=instance.id,
        )
        instance.delete()
