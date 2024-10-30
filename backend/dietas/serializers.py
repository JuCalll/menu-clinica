from rest_framework import serializers
from .models import Dieta, Alergia

class DietaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dieta
        fields = ['id', 'nombre', 'descripcion']

class AlergiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alergia
        fields = ['id', 'nombre', 'descripcion']
