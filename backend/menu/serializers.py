from rest_framework import serializers
from .models import Menu

# Definimos el serializador para el modelo Menu
class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu  # Especificamos el modelo que se va a serializar
        fields = '__all__'  # Indicamos que se deben incluir todos los campos del modelo
