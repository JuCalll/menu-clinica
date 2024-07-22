from rest_framework import serializers
from .models import Pedido
from menu.models import Menu
from pacientes.models import Paciente
from habitaciones.models import Habitacion
from servicios.models import Servicio

class ServicioSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Servicio.

    Ejemplo:
    {
        "id": 1,
        "nombre": "Servicio ejemplo"
    }
    """
    class Meta:
        model = Servicio
        fields = ['id', 'nombre']

class HabitacionSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Habitacion.

    Ejemplo:
    {
        "id": 1,
        "numero": 101,
        "servicio": {
            "id": 1,
            "nombre": "Servicio ejemplo"
        }
    }
    """
    servicio = ServicioSerializer(read_only=True)

    class Meta:
        model = Habitacion
        fields = ['id', 'numero', 'servicio']

class PacienteSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Paciente.

    Ejemplo:
    {
        "id": 1,
        "name": "Paciente ejemplo",
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
    """
    room = HabitacionSerializer(read_only=True)

    class Meta:
        model = Paciente
        fields = ['id', 'name', 'room', 'recommended_diet']

class MenuSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Menu.

    Ejemplo:
    {
        "id": 1,
        "name": "Menu ejemplo",
        "description": "Descripcion del menu"
    }
    """
    class Meta:
        model = Menu
        fields = ['id', 'name', 'description']

class PedidoSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Pedido.

    Ejemplo:
    {
        "id": 1,
        "order_date": "2022-01-01",
        "status": "pendiente",
        "menu": {
            "id": 1,
            "name": "Menu ejemplo",
            "description": "Descripcion del menu"
        },
        "patient": {
            "id": 1,
            "name": "Paciente ejemplo",
            "room": {
                "id": 1,
                "numero": 101,
                "servicio": {
                    "id": 1,
                    "nombre": "Servicio ejemplo"
                }
            },
            "recommended_diet": "Dieta ejemplo"
        },
        "menu_id": 1,
        "patient_id": 1
    }
    """
    menu = MenuSerializer(read_only=True)
    patient = PacienteSerializer(read_only=True)
    menu_id = serializers.PrimaryKeyRelatedField(queryset=Menu.objects.all(), source='menu', write_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(queryset=Paciente.objects.all(), source='patient', write_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'order_date', 'status', 'menu', 'patient', 'menu_id', 'patient_id']

    def create(self, validated_data):
        """
        Crea una nueva instancia de Pedido.

        Args:
            validated_data (dict): Datos validados para la instancia de Pedido.

        Returns:
            Pedido: La instancia de Pedido creada.
        """
        return Pedido.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Actualiza una instancia existente de Pedido.

        Args:
            instance (Pedido): La instancia de Pedido a actualizar.
            validated_data (dict): Datos validados para la actualización.

        Returns:
            Pedido: La instancia de Pedido actualizada.
        """
        instance.menu = validated_data.get('menu', instance.menu)
        instance.patient = validated_data.get('patient', instance.patient)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance