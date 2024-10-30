from rest_framework import serializers
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError
from .models import Paciente
from camas.models import Cama
from habitaciones.models import Habitacion
from servicios.models import Servicio
from dietas.models import Dieta, Alergia

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ['id', 'nombre']

class HabitacionSerializer(serializers.ModelSerializer):
    servicio = ServicioSerializer(read_only=True)

    class Meta:
        model = Habitacion
        fields = ['id', 'nombre', 'servicio']

class CamaSerializer(serializers.ModelSerializer):
    habitacion = HabitacionSerializer(read_only=True)

    class Meta:
        model = Cama
        fields = ['id', 'nombre', 'habitacion']

# Serializador de Dieta
class DietaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dieta
        fields = ['id', 'nombre', 'descripcion']

class AlergiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alergia
        fields = ['id', 'nombre', 'descripcion']

class PacienteSerializer(serializers.ModelSerializer):
    cama_id = serializers.PrimaryKeyRelatedField(queryset=Cama.objects.all(), source='cama', write_only=True)
    cama = CamaSerializer(read_only=True)
    recommended_diet_id = serializers.PrimaryKeyRelatedField(queryset=Dieta.objects.all(), source='recommended_diet', write_only=True)
    recommended_diet = serializers.StringRelatedField(read_only=True)
    alergias = serializers.StringRelatedField(read_only=True)
    alergias_id = serializers.PrimaryKeyRelatedField(queryset=Alergia.objects.all(), source='alergias', write_only=True)

    class Meta:
        model = Paciente
        fields = ['id', 'cedula', 'name', 'cama_id', 'cama', 
                 'recommended_diet_id', 'recommended_diet', 
                 'alergias', 'alergias_id', 'activo', 'created_at']

    def create(self, validated_data):
        paciente = Paciente.objects.create(**validated_data)
        return paciente

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.cama = validated_data.get('cama', instance.cama)
        instance.recommended_diet = validated_data.get('recommended_diet', instance.recommended_diet)
        instance.alergias = validated_data.get('alergias', instance.alergias)
        instance.activo = validated_data.get('activo', instance.activo)
        
        try:
            instance.save()
        except ValidationError as e:
            raise DRFValidationError({"detail": e.messages})

        return instance
