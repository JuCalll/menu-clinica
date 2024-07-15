from rest_framework import serializers
from .models import Pedido
from pacientes.serializers import PacienteSerializer
from menu.serializers import MenuSerializer

# Serializador para el modelo Pedido
class PedidoSerializer(serializers.ModelSerializer):
    patient = PacienteSerializer(read_only=True)  # Relación de solo lectura con el serializador Paciente
    menu = MenuSerializer(read_only=True)  # Relación de solo lectura con el serializador Menu

    class Meta:
        model = Pedido  # Modelo que se está serializando
        fields = ['id', 'order_date', 'status', 'menu', 'patient']  # Campos incluidos en la representación del serializador
