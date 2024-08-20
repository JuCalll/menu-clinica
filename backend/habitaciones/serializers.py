from rest_framework import serializers
from .models import Habitacion
from servicios.models import Servicio
from camas.serializers import CamaSerializer

class HabitacionSerializer(serializers.ModelSerializer):
    servicio_id = serializers.PrimaryKeyRelatedField(queryset=Servicio.objects.all(), source='servicio', write_only=True)
    servicio = serializers.ReadOnlyField(source='servicio.nombre')
    camas = CamaSerializer(many=True, read_only=True)

    class Meta:
        model = Habitacion
        fields = ['id', 'nombre', 'servicio_id', 'servicio', 'activo', 'camas']

    def create(self, validated_data):
        habitacion = Habitacion.objects.create(**validated_data)
        return habitacion

    def update(self, instance, validated_data):
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.servicio = validated_data.get('servicio', instance.servicio)
        instance.activo = validated_data.get('activo', instance.activo)

        # Validación para asegurar que no se active la habitación si el servicio está desactivado
        if instance.activo and not instance.servicio.activo:
            raise serializers.ValidationError("No se puede activar la habitación porque el servicio está inactivo.")

        instance.save()

        # Desactivación de las camas si la habitación se desactiva
        if not instance.activo:
            instance.camas.update(activo=False)

        return instance
