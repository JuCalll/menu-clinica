from rest_framework import serializers
from .models import MenuPersonalizado

class MenuPersonalizadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuPersonalizado
        fields = '__all__'
