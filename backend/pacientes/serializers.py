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
    dietas_ids = serializers.PrimaryKeyRelatedField(
        queryset=Dieta.objects.all(),
        source='dietas',
        write_only=True,
        many=True
    )
    dietas = serializers.StringRelatedField(many=True, read_only=True)
    alergias_ids = serializers.PrimaryKeyRelatedField(
        queryset=Alergia.objects.all(),
        source='alergias',
        write_only=True,
        many=True
    )
    alergias = serializers.StringRelatedField(many=True, read_only=True)

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
        dietas = validated_data.pop('dietas', [])
        alergias = validated_data.pop('alergias', [])
        
        paciente = Paciente.objects.create(**validated_data)
        
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
        instance.name = validated_data.get('name', instance.name)
        instance.cama = validated_data.get('cama', instance.cama)
        instance.dietas = validated_data.get('dietas', instance.dietas)
        instance.alergias = validated_data.get('alergias', instance.alergias)
        instance.activo = validated_data.get('activo', instance.activo)
        
        try:
            instance.save()
        except ValidationError as e:
            raise DRFValidationError({"detail": e.messages})

        return instance
