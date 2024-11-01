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
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='Paciente',
            object_id=response.data['id'],
            details={
                'name': response.data.get('name'),
                'cedula': response.data.get('cedula'),
                'recommended_diet': response.data.get('recommended_diet'),
                'alergias': response.data.get('alergias'),
                'activo': response.data.get('activo'),
            }
        )
        return response

class PacienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={
                'name': instance.name,
                'cedula': instance.cedula,
                'recommended_diet': instance.recommended_diet.nombre if instance.recommended_diet else None,
                'alergias': instance.alergias.nombre if instance.alergias else None,
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
