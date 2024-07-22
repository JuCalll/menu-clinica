from rest_framework import serializers
from .models import Habitacion
from servicios.models import Servicio

class HabitacionSerializer(serializers.ModelSerializer):
    servicio_id = serializers.PrimaryKeyRelatedField(queryset=Servicio.objects.all(), source='servicio', write_only=True)
    servicio = serializers.ReadOnlyField(source='servicio.nombre')

    class Meta:
        model = Habitacion
        fields = ['id', 'numero', 'servicio_id', 'servicio']

    def create(self, validated_data):
        servicio = validated_data.pop('servicio')
        habitacion = Habitacion.objects.create(servicio=servicio, **validated_data)
        return habitacion

    def update(self, instance, validated_data):
        instance.numero = validated_data.get('numero', instance.numero)
        instance.servicio = validated_data.get('servicio', instance.servicio)
        instance.save()
        return instance
