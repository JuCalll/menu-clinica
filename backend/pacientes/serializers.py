from rest_framework import serializers
from .models import Paciente
from habitaciones.models import Habitacion
from servicios.models import Servicio

class ServicioSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Servicio.

    Ejemplo:
    ```
    {
        "id": 1,
        "nombre": "Servicio ejemplo"
    }
    ```
    """
    class Meta:
        model = Servicio
        fields = ['id', 'nombre']

class HabitacionSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Habitacion.

    El campo `servicio` es un serializador anidado que incluye los detalles del servicio.

    Ejemplo:
    ```
    {
        "id": 1,
        "numero": 101,
        "servicio": {
            "id": 1,
            "nombre": "Servicio ejemplo"
        }
    }
    ```
    """
    servicio = ServicioSerializer(read_only=True)

    class Meta:
        model = Habitacion
        fields = ['id', 'numero', 'servicio']

class PacienteSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Paciente.

    El campo `room_id` es un campo de clave primaria que acepta el ID de una instancia de Habitacion.
    El campo `room` es un campo de solo lectura que incluye los detalles de la habitación.

    Ejemplo:
    ```
    {
        "id": 1,
        "name": "Paciente ejemplo",
        "room_id": 1,
        "room": {
            "id": 1,
            "numero": 101,
            "servicio": {
                "id": 1,
                "nombre": "Servicio ejemplo"
            }
        },
        "recommended_diet": "Dieta ejemplo"
    }
    ```
    """
    room_id = serializers.PrimaryKeyRelatedField(queryset=Habitacion.objects.all(), source='room', write_only=True)
    room = HabitacionSerializer(read_only=True)

    class Meta:
        model = Paciente
        fields = ['id', 'name', 'room_id', 'room', 'recommended_diet']

    def create(self, validated_data):
        """
        Crea una nueva instancia de Paciente.

        Args:
            validated_data (dict): Datos validados del serializador.

        Returns:
            Paciente: La instancia de Paciente creada.
        """
        return Paciente.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Actualiza una instancia existente de Paciente.

        Args:
            instance (Paciente): La instancia de Paciente a actualizar.
            validated_data (dict): Datos validados del serializador.

        Returns:
            Paciente: La instancia de Paciente actualizada.
        """
        instance.name = validated_data.get('name', instance.name)
        instance.room = validated_data.get('room', instance.room)
        instance.recommended_diet = validated_data.get('recommended_diet', instance.recommended_diet)
        instance.save()
        return instance