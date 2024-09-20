from rest_framework import serializers
from .models import Dieta

class DietaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dieta
        fields = ['id', 'nombre', 'descripcion']
