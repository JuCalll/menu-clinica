from rest_framework import serializers
from pedidos.models import Pedido, PedidoMenuOption
from pacientes.models import Paciente
from pacientes.serializers import PacienteSerializer
from menus.models import Menu, MenuOption
from menus.serializers import MenuSerializer, MenuOptionSerializer

class AdicionalesSerializer(serializers.Serializer):
    leche = serializers.CharField()
    bebida = serializers.CharField()
    azucarPanela = serializers.ListField(child=serializers.CharField())
    vegetales = serializers.CharField()
    golosina = serializers.BooleanField()

class PedidoMenuOptionSerializer(serializers.ModelSerializer):
    menu_option = MenuOptionSerializer()

    class Meta:
        model = PedidoMenuOption
        fields = ['menu_option', 'selected']

class PedidoSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer(read_only=True)
    menu = MenuSerializer(read_only=True)
    opciones = PedidoMenuOptionSerializer(source='pedidomenuoption_set', many=True, read_only=True)
    adicionales = AdicionalesSerializer()

    class Meta:
        model = Pedido
        fields = ['id', 'paciente', 'menu', 'opciones', 'status', 'fecha_pedido', 'adicionales']

    def create(self, validated_data):
        opciones_data = self.initial_data.get('opciones', [])
        adicionales_data = validated_data.pop('adicionales')
        paciente_id = self.initial_data.get('paciente')
        menu_id = self.initial_data.get('menu')

        paciente = Paciente.objects.get(id=paciente_id)
        menu = Menu.objects.get(id=menu_id)

        pedido = Pedido.objects.create(paciente=paciente, menu=menu, **validated_data)

        for opcion_data in opciones_data:
            opcion_id = opcion_data['id']
            selected = opcion_data['selected']
            menu_option = MenuOption.objects.get(id=opcion_id)
            PedidoMenuOption.objects.create(pedido=pedido, menu_option=menu_option, selected=selected)

        pedido.adicionales = adicionales_data
        pedido.save()
        return pedido

    def update(self, instance, validated_data):
        opciones_data = self.initial_data.get('opciones', [])
        adicionales_data = validated_data.pop('adicionales', instance.adicionales)

        instance.paciente = validated_data.get('paciente', instance.paciente)
        instance.menu = validated_data.get('menu', instance.menu)
        instance.status = validated_data.get('status', instance.status)
        instance.adicionales = adicionales_data
        instance.save()

        if opciones_data:
            instance.pedidomenuoption_set.all().delete()  # Eliminar todas las opciones previas
            for opcion_data in opciones_data:
                opcion_id = opcion_data['id']
                selected = opcion_data['selected']
                menu_option = MenuOption.objects.get(id=opcion_id)
                PedidoMenuOption.objects.create(pedido=instance, menu_option=menu_option, selected=selected)

        return instance
