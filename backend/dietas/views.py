"""
Vistas para la gestión de dietas y alergias.

Define las vistas basadas en clase para:
- Listar y crear dietas y alergias
- Recuperar, actualizar y eliminar dietas y alergias específicas
Incluye validaciones para evitar conflictos con pacientes activos.
"""

from rest_framework import generics
from rest_framework import status
from rest_framework.exceptions import ValidationError
from .models import Dieta, Alergia
from .serializers import DietaSerializer, AlergiaSerializer
from logs.models import LogEntry
from pacientes.models import Paciente

class DietaListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar todas las dietas y crear nuevas.
    
    GET: Retorna lista de todas las dietas.
    POST: Crea una nueva dieta y registra la acción.
    """
    queryset = Dieta.objects.all()
    serializer_class = DietaSerializer

    def perform_create(self, serializer):
        """Guarda la nueva dieta y registra la acción en el log."""
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

class DietaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para gestionar una dieta específica.
    
    GET: Retorna detalles de una dieta.
    PUT/PATCH: Actualiza una dieta existente.
    DELETE: Elimina una dieta si no está asignada a pacientes activos.
    """
    queryset = Dieta.objects.all()
    serializer_class = DietaSerializer

    def perform_update(self, serializer):
        """
        Actualiza la dieta verificando que no haya conflictos con pacientes activos.
        
        Raises:
            ValidationError: Si se intenta desactivar una dieta asignada a pacientes activos.
        """
        if 'activo' in serializer.validated_data and not serializer.validated_data['activo']:
            self._validar_pacientes_activos(serializer.instance)
        
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
        Elimina la dieta verificando que no haya conflictos con pacientes activos.
        
        Raises:
            ValidationError: Si se intenta eliminar una dieta asignada a pacientes activos.
        """
        self._validar_pacientes_activos(instance)
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()

    def _validar_pacientes_activos(self, dieta):
        """Método auxiliar para validar pacientes activos con una dieta."""
        pacientes_con_dieta = Paciente.objects.filter(
            recommended_diet=dieta, 
            activo=True
        )
        if pacientes_con_dieta.exists():
            pacientes = ", ".join([p.name for p in pacientes_con_dieta[:3]])
            raise ValidationError(
                detail={
                    "error": f"No se puede modificar la dieta porque hay {pacientes_con_dieta.count()} paciente(s) activo(s) que la tienen asignada (ej: {pacientes}...)",
                    "code": "conflict"
                },
                code=status.HTTP_409_CONFLICT
            )

class AlergiaListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar todas las alergias y crear nuevas.
    
    GET: Retorna lista de todas las alergias.
    POST: Crea una nueva alergia y registra la acción.
    """
    queryset = Alergia.objects.all()
    serializer_class = AlergiaSerializer

    def perform_create(self, serializer):
        """Guarda la nueva alergia y registra la acción en el log."""
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

class AlergiaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para gestionar una alergia específica.
    
    GET: Retorna detalles de una alergia.
    PUT/PATCH: Actualiza una alergia existente.
    DELETE: Elimina una alergia si no está asignada a pacientes activos.
    """
    queryset = Alergia.objects.all()
    serializer_class = AlergiaSerializer

    def perform_update(self, serializer):
        """
        Actualiza la alergia verificando que no haya conflictos con pacientes activos.
        
        Raises:
            ValidationError: Si se intenta desactivar una alergia asignada a pacientes activos.
        """
        if 'activo' in serializer.validated_data and not serializer.validated_data['activo']:
            self._validar_pacientes_activos(serializer.instance)
        
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
        Elimina la alergia verificando que no haya conflictos con pacientes activos.
        
        Raises:
            ValidationError: Si se intenta eliminar una alergia asignada a pacientes activos.
        """
        self._validar_pacientes_activos(instance)
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()

    def _validar_pacientes_activos(self, alergia):
        """Método auxiliar para validar pacientes activos con una alergia."""
        pacientes_con_alergia = Paciente.objects.filter(
            alergias=alergia,
            activo=True
        )
        if pacientes_con_alergia.exists():
            pacientes = ", ".join([p.name for p in pacientes_con_alergia[:3]])
            raise ValidationError(
                detail={
                    "error": f"No se puede modificar la alergia porque hay {pacientes_con_alergia.count()} paciente(s) activo(s) que la tienen asignada (ej: {pacientes}...)",
                    "code": "conflict"
                },
                code=status.HTTP_409_CONFLICT
            )
