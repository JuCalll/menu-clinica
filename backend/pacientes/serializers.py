from rest_framework import serializers
from rest_framework.exceptions import ValidationError as DRFValidationError  # Importamos la excepción de DRF
from django.core.exceptions import ValidationError  # Importamos la excepción de Django
from .models import Paciente
from camas.models import Cama
from habitaciones.models import Habitacion
from servicios.models import Servicio

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

class PacienteSerializer(serializers.ModelSerializer):
    cama_id = serializers.PrimaryKeyRelatedField(queryset=Cama.objects.all(), source='cama', write_only=True)
    cama = CamaSerializer(read_only=True)

    class Meta:
        model = Paciente
        fields = ['id', 'name', 'cama_id', 'cama', 'recommended_diet', 'activo']

    def create(self, validated_data):
        return Paciente.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.cama = validated_data.get('cama', instance.cama)
        instance.recommended_diet = validated_data.get('recommended_diet', instance.recommended_diet)
        instance.activo = validated_data.get('activo', instance.activo)
        
        try:
            instance.save()
        except ValidationError as e:  # Se captura la excepción de Django
            raise DRFValidationError(e.messages)  # Se lanza como una excepción de DRF

        return instance
