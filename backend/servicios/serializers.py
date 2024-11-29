"""
Serializadores para la aplicación de servicios hospitalarios.

Define los serializadores para convertir los modelos de servicios
en representaciones JSON y viceversa, permitiendo la gestión
del estado activo/inactivo de los servicios y sus elementos relacionados.
"""

from rest_framework import serializers
from .models import Servicio

class ServicioSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Servicio.
    
    Proporciona la conversión entre instancias del modelo Servicio
    y su representación en JSON, incluyendo el estado activo/inactivo
    que afecta a toda la jerarquía de elementos hospitalarios.
    
    Atributos:
        id (int): Identificador único del servicio.
        nombre (str): Nombre del servicio hospitalario.
        activo (bool): Estado actual del servicio.
    """
    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'activo']  
