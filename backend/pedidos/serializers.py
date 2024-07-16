from rest_framework import serializers
from .models import Pedido
from pacientes.models import Paciente
from pacientes.serializers import PacienteSerializer
from menu.models import Menu
from menu.serializers import MenuSerializer

class PedidoSerializer(serializers.ModelSerializer):
    patient = PacienteSerializer(read_only=True)
    menu = MenuSerializer(read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(queryset=Paciente.objects.all(), source='patient')
    menu_id = serializers.PrimaryKeyRelatedField(queryset=Menu.objects.all(), source='menu')

    class Meta:
        model = Pedido
        fields = ['id', 'order_date', 'status', 'menu', 'patient', 'menu_id', 'patient_id']

    def create(self, validated_data):
        return Pedido.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.patient = validated_data.get('patient', instance.patient)
        instance.menu = validated_data.get('menu', instance.menu)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance
