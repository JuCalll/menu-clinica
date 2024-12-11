"""
Vistas para la gestión de pacientes hospitalarios.

Define las vistas basadas en clase para:
- Listar y crear pacientes
- Recuperar, actualizar y eliminar pacientes específicos
Incluye registro de actividades mediante LogEntry.
"""

from rest_framework import generics
from .models import Paciente
from .serializers import PacienteSerializer
from logs.models import LogEntry

class PacienteListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar todos los pacientes activos y crear nuevos.
    
    GET: Retorna lista de todos los pacientes activos.
    POST: Crea un nuevo paciente y registra la acción.
    """
    serializer_class = PacienteSerializer

    def get_queryset(self):
        """
        Filtra el queryset para retornar solo pacientes activos.
        
        Returns:
            QuerySet: Pacientes con estado activo=True.
        """
        return Paciente.objects.filter(activo=True)

    def create(self, request, *args, **kwargs):
        """
        Crea un nuevo paciente y registra la acción en el log.
        
        Args:
            request: Solicitud HTTP con los datos del paciente.
            
        Returns:
            Response: Respuesta HTTP con los datos del paciente creado.
        """
        response = super().create(request, *args, **kwargs)
        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='Paciente',
            object_id=response.data['id'],
            details={
                'name': response.data.get('name'),
                'cedula': response.data.get('cedula'),
                'dietas': response.data.get('dietas'),
                'alergias': response.data.get('alergias'),
                'activo': response.data.get('activo'),
            }
        )
        return response

class PacienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para gestionar un paciente específico.
    
    GET: Retorna los detalles de un paciente.
    PUT/PATCH: Actualiza los datos de un paciente.
    DELETE: Elimina un paciente del sistema.
    """
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer

    def perform_update(self, serializer):
        """
        Actualiza un paciente y registra la acción en el log.
        
        Args:
            serializer: Serializador con los datos validados del paciente.
        """
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={
                'name': instance.name,
                'cedula': instance.cedula,
                'dietas': [dieta.nombre for dieta in instance.dietas.all()],
                'alergias': [alergia.nombre for alergia in instance.alergias.all()],
                'activo': instance.activo,
            }
        )

    def perform_destroy(self, instance):
        """
        Elimina un paciente y registra la acción en el log.
        
        Args:
            instance: Instancia del paciente a eliminar.
        """
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()
