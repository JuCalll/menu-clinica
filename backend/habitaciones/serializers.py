# Importamos el módulo serializers de Django REST framework
from rest_framework import serializers
# Importamos el modelo Habitacion desde el archivo models
from .models import Habitacion
# Importamos el modelo Servicio desde servicios.models
from servicios.models import Servicio

# Definimos un serializer para el modelo Habitacion
class HabitacionSerializer(serializers.ModelSerializer):
    # Campo para manejar la relación de clave foránea a Servicio a través de su ID
    # 'queryset=Servicio.objects.all()' especifica que se validará contra todos los objetos de Servicio
    # 'source="servicio"' indica que este campo se refiere al campo 'servicio' en el modelo Habitacion
    # 'write_only=True' significa que este campo solo se utilizará al escribir datos (no se devolverá en las respuestas)
    servicio_id = serializers.PrimaryKeyRelatedField(queryset=Servicio.objects.all(), source='servicio', write_only=True)
    
    # Campo de solo lectura para mostrar el nombre del servicio asociado a la habitación
    # 'source="servicio.nombre"' indica que se debe mostrar el nombre del servicio asociado
    servicio = serializers.ReadOnlyField(source='servicio.nombre')
    
    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = Habitacion  # Especificamos el modelo Habitacion
        fields = ['id', 'numero', 'servicio_id', 'servicio']  # Campos a incluir en la serialización

    # Método para crear una nueva instancia de Habitacion con los datos validados
    def create(self, validated_data):
        # Creamos y retornamos una nueva instancia de Habitacion utilizando los datos validados
        return Habitacion.objects.create(**validated_data)

    # Método para actualizar una instancia existente de Habitacion con los datos validados
    def update(self, instance, validated_data):
        # Actualizamos el número de la habitación si se proporciona un nuevo valor
        instance.numero = validated_data.get('numero', instance.numero)
        # Actualizamos el servicio asociado si se proporciona un nuevo valor
        instance.servicio = validated_data.get('servicio', instance.servicio)
        # Guardamos los cambios en la base de datos
        instance.save()
        # Retornamos la instancia de Habitacion actualizada
        return instance
