# Importamos el módulo serializers de Django REST framework
from rest_framework import serializers
# Importamos el modelo Servicio desde el archivo models
from .models import Servicio

# Definimos un serializer para el modelo Servicio
class ServicioSerializer(serializers.ModelSerializer):
    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = Servicio  # Especificamos el modelo Servicio
        fields = ['id', 'nombre']  # Campos a incluir en la serialización
