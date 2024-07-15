# pedidos/serializers.py
from rest_framework import serializers
from .models import Pedido
from pacientes.serializers import PacienteSerializer
from menu.serializers import MenuSerializer

class PedidoSerializer(serializers.ModelSerializer):
    patient = PacienteSerializer(read_only=True)
    menu = MenuSerializer(read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'order_date', 'status', 'menu', 'patient']
