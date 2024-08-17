from rest_framework import serializers
from .models import Cama

class CamaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cama
        fields = ['id', 'nombre', 'habitacion', 'activo']
