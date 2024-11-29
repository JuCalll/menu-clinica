"""
Serializadores para la aplicación de habitaciones.

Define los serializadores para convertir los modelos de habitaciones
en representaciones JSON y viceversa, incluyendo las relaciones
con servicios y camas.
"""

from rest_framework import serializers
from .models import Habitacion
from servicios.models import Servicio
from camas.serializers import CamaSerializer

class HabitacionSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Habitación.
    
    Proporciona la conversión entre instancias del modelo Habitación
    y su representación en JSON, incluyendo las relaciones con
    servicios y camas asociadas.
    
    Atributos:
        servicio_id: ID del servicio al que pertenece la habitación (write_only)
        servicio: Nombre del servicio (read_only)
        camas: Lista de camas asociadas a la habitación (read_only)
    """
    servicio_id = serializers.PrimaryKeyRelatedField(
        queryset=Servicio.objects.all(), 
        source='servicio', 
        write_only=True
    )
    servicio = serializers.ReadOnlyField(source='servicio.nombre')
    camas = CamaSerializer(many=True, read_only=True)

    class Meta:
        model = Habitacion
        fields = ['id', 'nombre', 'servicio_id', 'servicio', 'activo', 'camas']

    def create(self, validated_data):
        """
        Crea una nueva habitación con los datos validados.
        
        Args:
            validated_data: Diccionario con los datos validados de la habitación.
            
        Returns:
            Habitacion: Nueva instancia de habitación creada.
        """
        habitacion = Habitacion.objects.create(**validated_data)
        return habitacion

    def update(self, instance, validated_data):
        """
        Actualiza una habitación existente.
        
        Args:
            instance: Instancia actual de la habitación.
            validated_data: Diccionario con los nuevos datos validados.
            
        Returns:
            Habitacion: Instancia actualizada de la habitación.
            
        Raises:
            ValidationError: Si se intenta activar una habitación con servicio inactivo.
        """
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.servicio = validated_data.get('servicio', instance.servicio)
        instance.activo = validated_data.get('activo', instance.activo)

        if instance.activo and not instance.servicio.activo:
            raise serializers.ValidationError(
                "No se puede activar la habitación porque el servicio está inactivo."
            )

        instance.save()

        if not instance.activo:
            instance.camas.update(activo=False)

        return instance
