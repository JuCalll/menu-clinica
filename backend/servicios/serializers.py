from rest_framework import serializers
from.models import Servicio

class ServicioSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Servicio.

    Este serializador convierte una instancia de Servicio en una representación JSON
    y viceversa.

    Atributos:
        id (int): El identificador único del servicio.
        nombre (str): El nombre del servicio.

    Ejemplo:
        >>> servicio = Servicio(id=1, nombre='Servicio 1')
        >>> serializador = ServicioSerializer(servicio)
        >>> serializador.data
        {'id': 1, 'nombre': 'Servicio 1'}

    """
    class Meta:
        model = Servicio
        fields = ['id', 'nombre']