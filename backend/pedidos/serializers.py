from rest_framework import serializers
from pedidos.models import Pedido, PedidoMenuOption
from pacientes.models import Paciente
from pacientes.serializers import PacienteSerializer
from menus.models import Menu, MenuOption
from menus.serializers import MenuSerializer, MenuOptionSerializer

class PedidoMenuOptionSerializer(serializers.ModelSerializer):
    texto = serializers.CharField(source='menu_option.texto', read_only=True)

    class Meta:
        model = PedidoMenuOption
        fields = ['id', 'texto', 'selected']

class PedidoSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer(read_only=True)
    menu = MenuSerializer(read_only=True)
    opciones = PedidoMenuOptionSerializer(source='pedidomenuoption_set', many=True, read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'paciente', 'menu', 'opciones', 'status', 'fecha_pedido', 'adicionales', 'sectionStatus']

    def create(self, validated_data):
        opciones_data = self.initial_data.get('opciones', [])
        adicionales_data = validated_data.pop('adicionales')
        section_status_data = validated_data.pop('sectionStatus', {})
        paciente_id = self.initial_data.get('paciente')
        menu_id = self.initial_data.get('menu')

        print(f"Creando pedido para paciente ID: {paciente_id} con menú ID: {menu_id}")

        paciente = Paciente.objects.get(id=paciente_id)
        menu = Menu.objects.get(id=menu_id)

        # Validamos que el paciente esté activo
        if not paciente.activo:
            raise serializers.ValidationError("El paciente seleccionado no está activo.")

        pedido = Pedido.objects.create(paciente=paciente, menu=menu, sectionStatus=section_status_data, **validated_data)

        print(f"Pedido creado con ID: {pedido.id}")

        for opcion_data in opciones_data:
            opcion_id = opcion_data.get('id')
            if opcion_id is not None:
                selected = opcion_data.get('selected', False)
                try:
                    menu_option = MenuOption.objects.get(id=opcion_id)
                    PedidoMenuOption.objects.create(pedido=pedido, menu_option=menu_option, selected=selected)
                except MenuOption.DoesNotExist:
                    print(f"MenuOption con ID {opcion_id} no existe. Saltando esta opción.")
                    continue

        pedido.adicionales = adicionales_data
        pedido.save()

        print(f"Pedido guardado con adicionales: {pedido.adicionales}")
        return pedido

    def update(self, instance, validated_data):
        opciones_data = self.initial_data.get('opciones', [])
        adicionales_data = validated_data.pop('adicionales', instance.adicionales)
        section_status_data = validated_data.pop('sectionStatus', instance.sectionStatus)

        print(f"Actualizando pedido ID: {instance.id}")

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
                    try:
                        menu_option = MenuOption.objects.get(id=opcion_id)
                        selected = opcion_data['selected']
                        PedidoMenuOption.objects.update_or_create(
                            pedido=instance,
                            menu_option=menu_option,
                            defaults={'selected': selected}
                        )
                    except MenuOption.DoesNotExist:
                        print(f"MenuOption con ID {opcion_id} no existe. Saltando esta opción.")
                        continue

        print(f"Pedido actualizado con status: {instance.status}")
        return instance
