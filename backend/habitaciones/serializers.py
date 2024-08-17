from rest_framework import serializers
from .models import Habitacion
from servicios.models import Servicio
from camas.serializers import CamaSerializer  # Importa el nuevo serializador de camas

class HabitacionSerializer(serializers.ModelSerializer):
    servicio_id = serializers.PrimaryKeyRelatedField(queryset=Servicio.objects.all(), source='servicio', write_only=True)
    servicio = serializers.ReadOnlyField(source='servicio.nombre')
    camas = CamaSerializer(many=True, read_only=True)  # Las camas se gestionan ahora en la nueva app

    class Meta:
        model = Habitacion
        fields = ['id', 'nombre', 'servicio_id', 'servicio', 'activo', 'camas']

    def create(self, validated_data):
        return Habitacion.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.servicio = validated_data.get('servicio', instance.servicio)
        instance.activo = validated_data.get('activo', instance.activo)
        instance.save()
        return instance
