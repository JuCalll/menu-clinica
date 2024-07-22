from rest_framework import serializers
from.models import Habitacion
from servicios.models import Servicio

class HabitacionSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Habitacion.

    Este serializador permite crear y actualizar instancias de Habitacion.
    Incluye un campo de solo lectura `servicio` que devuelve el nombre del servicio relacionado.
    """
    servicio_id = serializers.PrimaryKeyRelatedField(queryset=Servicio.objects.all(), source='servicio', write_only=True)
    servicio = serializers.ReadOnlyField(source='servicio.nombre')

    class Meta:
        model = Habitacion
        fields = ['id', 'numero', 'servicio_id', 'servicio']

    def create(self, validated_data):
        """
        Crea una nueva instancia de Habitacion.

        Args:
            validated_data (dict): Datos validados para crear una nueva instancia de Habitacion.

        Returns:
            Habitacion: La instancia de Habitacion creada.

        Ejemplo:
            >>> serializer = HabitacionSerializer(data={'numero': 101, 'servicio_id': 1})
            >>> serializer.is_valid()
            True
            >>> habitacion = serializer.create(serializer.validated_data)
            >>> habitacion.numero
            101
            >>> habitacion.servicio.nombre
            'Servicio 1'
        """
        servicio = validated_data.pop('servicio')
        habitacion = Habitacion.objects.create(servicio=servicio, **validated_data)
        return habitacion

    def update(self, instance, validated_data):
        """
        Actualiza una instancia existente de Habitacion.

        Args:
            instance (Habitacion): La instancia de Habitacion a actualizar.
            validated_data (dict): Datos validados para actualizar la instancia de Habitacion.

        Returns:
            Habitacion: La instancia de Habitacion actualizada.

        Ejemplo:
            >>> habitacion = Habitacion.objects.get(id=1)
            >>> serializer = HabitacionSerializer(habitacion, data={'numero': 202, 'servicio_id': 2})
            >>> serializer.is_valid()
            True
            >>> habitacion = serializer.update(habitacion, serializer.validated_data)
            >>> habitacion.numero
            202
            >>> habitacion.servicio.nombre
            'Servicio 2'
        """
        instance.numero = validated_data.get('numero', instance.numero)
        instance.servicio = validated_data.get('servicio', instance.servicio)
        instance.save()
        return instance