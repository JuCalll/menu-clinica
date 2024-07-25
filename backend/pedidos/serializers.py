from rest_framework import serializers
from .models import Pedido
from pacientes.models import Paciente
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
    room = HabitacionSerializer(read_only=True)

    class Meta:
        model = Paciente
        fields = ['id', 'name', 'room', 'recommended_diet']

class PedidoSerializer(serializers.ModelSerializer):
    patient = PacienteSerializer(read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(queryset=Paciente.objects.all(), source='patient', write_only=True)
    menu_personalizado = serializers.JSONField(required=False)

    class Meta:
        model = Pedido
        fields = ['id', 'order_date', 'status', 'patient', 'patient_id', 'menu_personalizado']

    def create(self, validated_data):
        return Pedido.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.patient = validated_data.get('patient', instance.patient)
        instance.status = validated_data.get('status', instance.status)
        instance.menu_personalizado = validated_data.get('menu_personalizado', instance.menu_personalizado)
        instance.save()
        return instance
