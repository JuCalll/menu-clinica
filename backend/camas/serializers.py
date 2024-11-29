"""
Serializadores para la aplicación de camas.

Define los serializadores para convertir los modelos de camas
en representaciones JSON y viceversa.
"""

from rest_framework import serializers
from .models import Cama

class CamaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Cama.
    
    Proporciona la conversión entre instancias del modelo Cama
    y su representación en JSON, incluyendo las relaciones
    con otros modelos.
    
    Atributos:
        model: Modelo Cama que será serializado
        fields: Campos del modelo que serán incluidos en la serialización
    """
    class Meta:
        model = Cama
        fields = ['id', 'nombre', 'habitacion', 'activo']
