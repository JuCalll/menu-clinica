from rest_framework import serializers
from .models import Pedido
from menu.models import Menu
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

class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = ['id', 'name', 'description']

class PedidoSerializer(serializers.ModelSerializer):
    menu = MenuSerializer(read_only=True)
    patient = PacienteSerializer(read_only=True)
    menu_id = serializers.PrimaryKeyRelatedField(queryset=Menu.objects.all(), source='menu', write_only=True, required=False)
    patient_id = serializers.PrimaryKeyRelatedField(queryset=Paciente.objects.all(), source='patient', write_only=True)
    menu_personalizado = serializers.JSONField(required=False)

    class Meta:
        model = Pedido
        fields = ['id', 'order_date', 'status', 'menu', 'patient', 'menu_id', 'patient_id', 'menu_personalizado']

    def create(self, validated_data):
        return Pedido.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.menu = validated_data.get('menu', instance.menu)
        instance.patient = validated_data.get('patient', instance.patient)
        instance.status = validated_data.get('status', instance.status)
        instance.menu_personalizado = validated_data.get('menu_personalizado', instance.menu_personalizado)
        instance.save()
        return instance
