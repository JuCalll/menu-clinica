from rest_framework import serializers
from .models import Menu

"""
Serializador para el modelo Menu
================================

Este serializador utiliza Django Rest Framework's ModelSerializer para convertir
instancias del modelo Menu en datos JSON y viceversa.

Parámetros
----------
* model : Menu
    El modelo que se va a serializar.
* fields : str
    Un string que indica que se deben incluir todos los campos del modelo.

Ejemplo
-------

>>> menu = Menu(name="Desayuno", description="Comida matutina")
>>> serializer = MenuSerializer(menu)
>>> serializer.data
{'id': 1, 'name': 'Desayuno', 'description': 'Comida matutina'}

"""

class MenuSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Menu.

    Atributos
    ----------
    Meta : Meta
        La clase Meta que define la configuración del serializador.
    """
    class Meta:
        """
        Clase Meta que define la configuración del serializador.

        Atributos
        ----------
        model : Menu
            El modelo que se va a serializar.
        fields : str
            Un string que indica que se deben incluir todos los campos del modelo.
        """
        model = Menu  # Especificamos el modelo que se va a serializar
        fields = '__all__'  # Indicamos que se deben incluir todos los campos del modelo