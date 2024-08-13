# Importamos el módulo serializers de Django REST framework
from rest_framework import serializers
# Importamos los modelos Pedido y PedidoMenuOption desde pedidos.models
from pedidos.models import Pedido, PedidoMenuOption
# Importamos el modelo Paciente desde pacientes.models
from pacientes.models import Paciente
# Importamos los serializers PacienteSerializer desde pacientes.serializers
from pacientes.serializers import PacienteSerializer
# Importamos los modelos Menu y MenuOption desde menus.models
from menus.models import Menu, MenuOption
# Importamos los serializers MenuSerializer y MenuOptionSerializer desde menus.serializers
from menus.serializers import MenuSerializer, MenuOptionSerializer

# Definimos un serializer para manejar los datos adicionales del pedido
class AdicionalesSerializer(serializers.Serializer):
    # Campos adicionales del pedido, que pueden ser opcionales y nulos
    leche = serializers.CharField(required=False, allow_null=True)
    bebida = serializers.CharField(required=False, allow_null=True)
    azucarPanela = serializers.ListField(
        child=serializers.CharField(), required=False, allow_null=True
    )
    vegetales = serializers.CharField(required=False, allow_null=True)
    golosina = serializers.BooleanField(required=False, allow_null=True)

    # Método para personalizar la representación del serializer
    def to_representation(self, instance):
        return {
            'leche': instance.get('leche', None),
            'bebida': instance.get('bebida', None),
            'azucarPanela': instance.get('azucarPanela', []),
            'vegetales': instance.get('vegetales', None),
            'golosina': instance.get('golosina', None),
        }

# Definimos un serializer para manejar la relación entre Pedido y MenuOption
class PedidoMenuOptionSerializer(serializers.ModelSerializer):
    # Anidamos el serializer MenuOptionSerializer para representar la opción de menú
    menu_option = MenuOptionSerializer()

    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = PedidoMenuOption  # Especificamos el modelo PedidoMenuOption
        fields = ['menu_option', 'selected']  # Campos a incluir en la serialización

# Definimos un serializer para el modelo Pedido
class PedidoSerializer(serializers.ModelSerializer):
    # Anidamos el serializer PacienteSerializer para representar el paciente asociado, en modo de solo lectura
    paciente = PacienteSerializer(read_only=True)
    # Anidamos el serializer MenuSerializer para representar el menú asociado, en modo de solo lectura
    menu = MenuSerializer(read_only=True)
    # Anidamos el serializer PedidoMenuOptionSerializer para representar las opciones de menú seleccionadas
    # Usamos 'source' para especificar el nombre relacionado del modelo intermedio
    opciones = PedidoMenuOptionSerializer(source='pedidomenuoption_set', many=True, read_only=True)
    # Anidamos el serializer AdicionalesSerializer para manejar los datos adicionales del pedido
    adicionales = AdicionalesSerializer()

    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = Pedido  # Especificamos el modelo Pedido
        fields = ['id', 'paciente', 'menu', 'opciones', 'status', 'fecha_pedido', 'adicionales']  # Campos a incluir en la serialización

    # Método para crear una nueva instancia de Pedido con los datos validados
    def create(self, validated_data):
        # Obtenemos los datos de las opciones de menú desde la solicitud inicial
        opciones_data = self.initial_data.get('opciones', [])
        # Extraemos los datos adicionales del pedido desde los datos validados
        adicionales_data = validated_data.pop('adicionales')
        # Obtenemos el ID del paciente desde la solicitud inicial
        paciente_id = self.initial_data.get('paciente')
        # Obtenemos el ID del menú desde la solicitud inicial
        menu_id = self.initial_data.get('menu')

        # Recuperamos las instancias de Paciente y Menu a partir de los IDs obtenidos
        paciente = Paciente.objects.get(id=paciente_id)
        menu = Menu.objects.get(id=menu_id)

        # Creamos y guardamos una nueva instancia de Pedido
        pedido = Pedido.objects.create(paciente=paciente, menu=menu, **validated_data)

        # Creamos y asociamos las opciones de menú seleccionadas con el pedido
        for opcion_data in opciones_data:
            opcion_id = opcion_data['id']
            selected = opcion_data['selected']
            menu_option = MenuOption.objects.get(id=opcion_id)
            PedidoMenuOption.objects.create(pedido=pedido, menu_option=menu_option, selected=selected)

        # Guardamos los datos adicionales en el pedido y guardamos el pedido nuevamente
        pedido.adicionales = adicionales_data
        pedido.save()
        return pedido

    # Método para actualizar una instancia existente de Pedido con los datos validados
    def update(self, instance, validated_data):
        # Obtenemos los datos de las opciones de menú desde la solicitud inicial
        opciones_data = self.initial_data.get('opciones', [])
        # Extraemos los datos adicionales del pedido desde los datos validados o usamos los existentes
        adicionales_data = validated_data.pop('adicionales', instance.adicionales)

        # Actualizamos los campos del pedido con los nuevos datos o mantenemos los existentes
        instance.paciente = validated_data.get('paciente', instance.paciente)
        instance.menu = validated_data.get('menu', instance.menu)
        instance.status = validated_data.get('status', instance.status)
        instance.adicionales = adicionales_data
        instance.save()

        # Si hay datos de opciones, las actualizamos eliminando las existentes y creando nuevas
        if opciones_data:
            instance.pedidomenuoption_set.all().delete()
            for opcion_data in opciones_data:
                opcion_id = opcion_data['id']
                selected = opcion_data['selected']
                menu_option = MenuOption.objects.get(id=opcion_id)
                PedidoMenuOption.objects.create(pedido=instance, menu_option=menu_option, selected=selected)

        return instance
