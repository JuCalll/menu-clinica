from rest_framework import serializers
from .models import Pedido
from menu.models import Menu
from pacientes.models import Paciente

# Serializador para el modelo Menu
class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = ['id', 'name', 'description']  # Campos incluidos en el serializador

# Serializador para el modelo Paciente
class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = ['id', 'name', 'room', 'recommended_diet']  # Campos incluidos en el serializador

# Serializador para el modelo Pedido
class PedidoSerializer(serializers.ModelSerializer):
    menu = MenuSerializer(read_only=True)  # Serializador anidado para el menú (solo lectura)
    patient = PacienteSerializer(read_only=True)  # Serializador anidado para el paciente (solo lectura)
    menu_id = serializers.PrimaryKeyRelatedField(queryset=Menu.objects.all(), source='menu', write_only=True)  # Campo para escribir la relación de menú
    patient_id = serializers.PrimaryKeyRelatedField(queryset=Paciente.objects.all(), source='patient', write_only=True)  # Campo para escribir la relación de paciente

    class Meta:
        model = Pedido
        fields = ['id', 'order_date', 'status', 'menu', 'patient', 'menu_id', 'patient_id']  # Campos incluidos en el serializador

    def create(self, validated_data):
        # Método para crear un nuevo pedido
        return Pedido.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Método para actualizar un pedido existente
        instance.menu = validated_data.get('menu', instance.menu)
        instance.patient = validated_data.get('patient', instance.patient)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance
