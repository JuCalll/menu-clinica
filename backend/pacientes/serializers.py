# Importamos el módulo serializers de Django REST framework
from rest_framework import serializers
# Importamos el modelo Paciente desde el archivo models
from .models import Paciente
# Importamos el modelo Habitacion desde habitaciones.models
from habitaciones.models import Habitacion
# Importamos el modelo Servicio desde servicios.models
from servicios.models import Servicio

# Definimos un serializer para el modelo Servicio
class ServicioSerializer(serializers.ModelSerializer):
    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = Servicio  # Especificamos el modelo Servicio
        fields = ['id', 'nombre']  # Campos a incluir en la serialización

# Definimos un serializer para el modelo Habitacion
class HabitacionSerializer(serializers.ModelSerializer):
    # Serializamos el campo 'servicio' utilizando el ServicioSerializer, en modo de solo lectura
    servicio = ServicioSerializer(read_only=True)

    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = Habitacion  # Especificamos el modelo Habitacion
        fields = ['id', 'numero', 'servicio']  # Campos a incluir en la serialización

# Definimos un serializer para el modelo Paciente
class PacienteSerializer(serializers.ModelSerializer):
    # Campo para manejar la relación de clave foránea a Habitacion a través de su ID
    # 'queryset=Habitacion.objects.all()' especifica que se validará contra todos los objetos de Habitacion
    # 'source="room"' indica que este campo se refiere al campo 'room' en el modelo Paciente
    # 'write_only=True' significa que este campo solo se utilizará al escribir datos (no se devolverá en las respuestas)
    room_id = serializers.PrimaryKeyRelatedField(queryset=Habitacion.objects.all(), source='room', write_only=True)
    
    # Campo de solo lectura para mostrar la información de la habitación asociada, utilizando el HabitacionSerializer
    room = HabitacionSerializer(read_only=True)

    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = Paciente  # Especificamos el modelo Paciente
        fields = ['id', 'name', 'room_id', 'room', 'recommended_diet']  # Campos a incluir en la serialización

    # Método para crear una nueva instancia de Paciente con los datos validados
    def create(self, validated_data):
        # Creamos y retornamos una nueva instancia de Paciente utilizando los datos validados
        return Paciente.objects.create(**validated_data)

    # Método para actualizar una instancia existente de Paciente con los datos validados
    def update(self, instance, validated_data):
        # Actualizamos el nombre del paciente si se proporciona un nuevo valor
        instance.name = validated_data.get('name', instance.name)
        # Actualizamos la habitación asociada si se proporciona un nuevo valor
        instance.room = validated_data.get('room', instance.room)
        # Actualizamos la dieta recomendada si se proporciona un nuevo valor
        instance.recommended_diet = validated_data.get('recommended_diet', instance.recommended_diet)
        # Guardamos los cambios en la base de datos
        instance.save()
        # Retornamos la instancia del Paciente actualizada
        return instance
