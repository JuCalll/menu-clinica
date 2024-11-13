from rest_framework import generics
from .models import Dieta, Alergia
from .serializers import DietaSerializer, AlergiaSerializer
from logs.models import LogEntry
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from pacientes.models import Paciente
from rest_framework.exceptions import ValidationError

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
        if 'activo' in serializer.validated_data and not serializer.validated_data['activo']:
            pacientes_con_dieta = Paciente.objects.filter(
                recommended_diet=serializer.instance, 
                activo=True
            )
            if pacientes_con_dieta.exists():
                pacientes = ", ".join([p.name for p in pacientes_con_dieta[:3]])
                raise ValidationError(
                    detail={
                        "error": f"No se puede desactivar la dieta porque hay {pacientes_con_dieta.count()} paciente(s) activo(s) que la tienen asignada (ej: {pacientes}...)",
                        "code": "conflict"
                    },
                    code=status.HTTP_409_CONFLICT
                )
        
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

    def perform_destroy(self, instance):
        pacientes_con_dieta = Paciente.objects.filter(
            recommended_diet=instance, 
            activo=True
        )
        if pacientes_con_dieta.exists():
            pacientes = ", ".join([p.name for p in pacientes_con_dieta[:3]])
            raise ValidationError(
                detail={
                    "error": f"No se puede eliminar la dieta porque está asignada a pacientes activos (ej: {pacientes}...)",
                    "code": "conflict"
                },
                code=status.HTTP_409_CONFLICT
            )
            
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
        if 'activo' in serializer.validated_data and not serializer.validated_data['activo']:
            pacientes_con_alergia = Paciente.objects.filter(
                alergias=serializer.instance,
                activo=True
            )
            if pacientes_con_alergia.exists():
                pacientes = ", ".join([p.name for p in pacientes_con_alergia[:3]])
                raise ValidationError(
                    detail={
                        "error": f"No se puede desactivar la alergia porque hay {pacientes_con_alergia.count()} paciente(s) activo(s) que la tienen asignada (ej: {pacientes}...)",
                        "code": "conflict"
                    },
                    code=status.HTTP_409_CONFLICT
                )
        
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

    def perform_destroy(self, instance):
        pacientes_con_alergia = Paciente.objects.filter(
            alergias=instance,
            activo=True
        )
        if pacientes_con_alergia.exists():
            pacientes = ", ".join([p.name for p in pacientes_con_alergia[:3]])
            raise ValidationError(
                detail={
                    "error": f"No se puede eliminar la alergia porque está asignada a pacientes activos (ej: {pacientes}...)",
                    "code": "conflict"
                },
                code=status.HTTP_409_CONFLICT
            )
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()
