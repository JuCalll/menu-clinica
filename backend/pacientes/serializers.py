"""
Serializadores para la aplicación de pacientes.

Define los serializadores para convertir los modelos relacionados con pacientes
en representaciones JSON y viceversa, incluyendo:
- Servicios hospitalarios
- Habitaciones
- Camas
- Dietas
- Alergias
- Pacientes
"""

from rest_framework import serializers
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError
from .models import Paciente
from camas.models import Cama
from habitaciones.models import Habitacion
from servicios.models import Servicio
from dietas.models import Dieta, Alergia

class ServicioSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Servicio.
    
    Proporciona una representación básica de los servicios hospitalarios.
    """
    class Meta:
        model = Servicio
        fields = ['id', 'nombre']

class HabitacionSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Habitacion.
    
    Incluye la relación con el servicio hospitalario al que pertenece.
    """
    servicio = ServicioSerializer(read_only=True)

    class Meta:
        model = Habitacion
        fields = ['id', 'nombre', 'servicio']

class CamaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Cama.
    
    Incluye la relación con la habitación a la que pertenece.
    """
    habitacion = HabitacionSerializer(read_only=True)

    class Meta:
        model = Cama
        fields = ['id', 'nombre', 'habitacion']

class DietaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Dieta.
    
    Proporciona una representación básica de las dietas disponibles.
    """
    class Meta:
        model = Dieta
        fields = ['id', 'nombre', 'descripcion']

class AlergiaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Alergia.
    
    Proporciona una representación básica de las alergias registradas.
    """
    class Meta:
        model = Alergia
        fields = ['id', 'nombre', 'descripcion']

class PacienteSerializer(serializers.ModelSerializer):
    """
    Serializador principal para el modelo Paciente.
    
    Gestiona la conversión completa de pacientes, incluyendo sus relaciones con:
    - Cama asignada
    - Dieta recomendada
    - Alergias registradas
    
    Proporciona campos separados para lectura y escritura de las relaciones.
    """
    cama_id = serializers.PrimaryKeyRelatedField(
        queryset=Cama.objects.all(), 
        source='cama', 
        write_only=True
    )
    cama = CamaSerializer(read_only=True)
    
    # Campos para lectura y escritura de dietas
    dietas = DietaSerializer(many=True, read_only=True)
    dietas_ids = serializers.PrimaryKeyRelatedField(
        queryset=Dieta.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='dietas'
    )
    
    # Campos para lectura y escritura de alergias
    alergias = AlergiaSerializer(many=True, read_only=True)
    alergias_ids = serializers.PrimaryKeyRelatedField(
        queryset=Alergia.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='alergias'
    )

    class Meta:
        model = Paciente
        fields = ['id', 'cedula', 'name', 'cama_id', 'cama', 
                 'dietas_ids', 'dietas', 
                 'alergias_ids', 'alergias', 
                 'activo', 'created_at']

    def create(self, validated_data):
        """
        Crea una nueva instancia de Paciente.
        
        Args:
            validated_data (dict): Datos validados del paciente.
            
        Returns:
            Paciente: Nueva instancia del paciente creado.
        """
        # Extraer las relaciones many-to-many
        dietas = validated_data.pop('dietas', [])
        alergias = validated_data.pop('alergias', [])
        
        # Crear el paciente sin las relaciones many-to-many
        paciente = Paciente.objects.create(**validated_data)
        
        # Establecer las relaciones many-to-many después de crear el paciente
        if dietas:
            paciente.dietas.set(dietas)
        if alergias:
            paciente.alergias.set(alergias)
        
        return paciente

    def update(self, instance, validated_data):
        """
        Actualiza una instancia existente de Paciente.
        
        Args:
            instance (Paciente): Instancia del paciente a actualizar.
            validated_data (dict): Nuevos datos validados.
            
        Returns:
            Paciente: Instancia actualizada del paciente.
            
        Raises:
            DRFValidationError: Si hay errores en la validación del modelo.
        """
        dietas = validated_data.pop('dietas', None)
        alergias = validated_data.pop('alergias', None)
        
        # Actualizar los campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        try:
            instance.save()
            
            # Actualizar relaciones many-to-many si se proporcionaron
            if dietas is not None:
                instance.dietas.set(dietas)
            if alergias is not None:
                instance.alergias.set(alergias)
                
            return instance
            
        except ValidationError as e:
            raise DRFValidationError(detail=str(e))
