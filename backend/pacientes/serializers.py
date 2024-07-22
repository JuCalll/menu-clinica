from rest_framework import serializers
from .models import Paciente
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
        fields = ['id', 'numero', 'servicio']

class PacienteSerializer(serializers.ModelSerializer):
    room_id = serializers.PrimaryKeyRelatedField(queryset=Habitacion.objects.all(), source='room', write_only=True)
    room = HabitacionSerializer(read_only=True)

    class Meta:
        model = Paciente
        fields = ['id', 'name', 'room_id', 'room', 'recommended_diet']

    def create(self, validated_data):
        return Paciente.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.room = validated_data.get('room', instance.room)
        instance.recommended_diet = validated_data.get('recommended_diet', instance.recommended_diet)
        instance.save()
        return instance
