"""
Serializadores para la aplicación de dietas.

Define los serializadores para convertir los modelos de dietas y alergias
en representaciones JSON y viceversa.
"""

from rest_framework import serializers
from .models import Dieta, Alergia

class DietaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Dieta.
    
    Proporciona la conversión entre instancias del modelo Dieta
    y su representación en JSON. Se utiliza en las vistas de dietas
    y en las relaciones con el modelo Paciente.
    
    Atributos:
        model: Modelo Dieta que será serializado
        fields: Campos del modelo que serán incluidos en la serialización
    """
    class Meta:
        model = Dieta
        fields = ['id', 'nombre', 'descripcion', 'activo']

class AlergiaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Alergia.
    
    Proporciona la conversión entre instancias del modelo Alergia
    y su representación en JSON. Se utiliza en las vistas de alergias
    y en las relaciones con el modelo Paciente.
    
    Atributos:
        model: Modelo Alergia que será serializado
        fields: Campos del modelo que serán incluidos en la serialización
    """
    class Meta:
        model = Alergia
        fields = ['id', 'nombre', 'descripcion', 'activo']
