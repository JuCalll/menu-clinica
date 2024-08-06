from rest_framework import serializers
from .models import Pedido

class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = ['id', 'paciente', 'menu', 'opciones', 'status', 'fecha_pedido']
