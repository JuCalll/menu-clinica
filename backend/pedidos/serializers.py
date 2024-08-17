from rest_framework import serializers
from pedidos.models import Pedido, PedidoMenuOption
from pacientes.models import Paciente
from pacientes.serializers import PacienteSerializer
from menus.models import Menu, MenuOption
from menus.serializers import MenuSerializer, MenuOptionSerializer

class PedidoSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer(read_only=True)
    menu = MenuSerializer(read_only=True)
    opciones = MenuOptionSerializer(source='pedidomenuoption_set', many=True, read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'paciente', 'menu', 'opciones', 'status', 'fecha_pedido', 'adicionales', 'sectionStatus']

    def create(self, validated_data):
        opciones_data = self.initial_data.get('opciones', [])
        adicionales_data = validated_data.pop('adicionales')
        section_status_data = validated_data.pop('sectionStatus', {})
        paciente_id = self.initial_data.get('paciente')
        menu_id = self.initial_data.get('menu')

        paciente = Paciente.objects.get(id=paciente_id)
        menu = Menu.objects.get(id=menu_id)

        # Validamos que el paciente esté activo
        if not paciente.activo:
            raise serializers.ValidationError("El paciente seleccionado no está activo.")

        pedido = Pedido.objects.create(paciente=paciente, menu=menu, sectionStatus=section_status_data, **validated_data)

        for opcion_data in opciones_data:
            opcion_id = opcion_data.get('id')
            if opcion_id is not None:
                selected = opcion_data.get('selected', False)
                menu_option = MenuOption.objects.get(id=opcion_id)
                PedidoMenuOption.objects.create(pedido=pedido, menu_option=menu_option, selected=selected)

        pedido.adicionales = adicionales_data
        pedido.save()
        return pedido

    def update(self, instance, validated_data):
        opciones_data = self.initial_data.get('opciones', [])
        adicionales_data = validated_data.pop('adicionales', instance.adicionales)
        section_status_data = validated_data.pop('sectionStatus', instance.sectionStatus)

        instance.paciente = validated_data.get('paciente', instance.paciente)
        instance.menu = validated_data.get('menu', instance.menu)
        instance.status = validated_data.get('status', instance.status)
        instance.adicionales = adicionales_data
        instance.sectionStatus = section_status_data
        instance.save()

        if opciones_data:
            for opcion_data in opciones_data:
                opcion_id = opcion_data.get('id')
                if opcion_id is not None:
                    selected = opcion_data['selected']
                    menu_option = MenuOption.objects.get(id=opcion_id)
                    PedidoMenuOption.objects.update_or_create(
                        pedido=instance,
                        menu_option=menu_option,
                        defaults={'selected': selected}
                    )

        return instance
