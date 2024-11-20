from rest_framework import serializers
from pedidos.models import Pedido, PedidoMenuOption
from pacientes.models import Paciente
from menus.models import Menu, MenuOption, MenuSection
from pacientes.serializers import PacienteSerializer
from menus.serializers import MenuSerializer, MenuSectionSerializer, MenuOptionSerializer

class PedidoMenuOptionSerializer(serializers.ModelSerializer):
    menu_option = MenuOptionSerializer()
    
    class Meta:
        model = PedidoMenuOption
        fields = ['menu_option', 'selected']

class PedidoSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer(read_only=True)
    paciente_id = serializers.PrimaryKeyRelatedField(
        queryset=Paciente.objects.filter(activo=True),
        source='paciente',
        write_only=True
    )
    menu = MenuSerializer(read_only=True)
    menu_id = serializers.PrimaryKeyRelatedField(
        queryset=Menu.objects.all(),
        source='menu',
        write_only=True
    )
    opciones = PedidoMenuOptionSerializer(source='pedidomenuoption_set', many=True, read_only=True)
    is_fully_completed = serializers.BooleanField(read_only=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'paciente', 'paciente_id', 
            'menu', 'menu_id',
            'opciones', 'status', 'fecha_pedido', 
            'adicionales', 'sectionStatus',
            'observaciones', 'is_fully_completed'
        ]

    def validate(self, data):
        if data.get('paciente') and not data['paciente'].activo:
            raise serializers.ValidationError({
                'paciente': 'No se puede crear un pedido para un paciente inactivo'
            })
        
        return data

    def create(self, validated_data):
        opciones_data = self.initial_data.get('opciones', [])
        adicionales_data = validated_data.pop('adicionales', {})
        section_status_data = validated_data.pop('sectionStatus', {})

        pedido = Pedido.objects.create(
            paciente=validated_data['paciente'],
            menu=validated_data['menu'],
            adicionales=adicionales_data,
            sectionStatus=section_status_data,
            observaciones=validated_data.get('observaciones', '')
        )

        for opcion_data in opciones_data:
            try:
                menu_option = MenuOption.objects.get(id=opcion_data['id'])
                PedidoMenuOption.objects.create(
                    pedido=pedido,
                    menu_option=menu_option,
                    selected=opcion_data.get('selected', False)
                )
            except MenuOption.DoesNotExist:
                continue

        return pedido

    def update(self, instance, validated_data):
        opciones_data = self.initial_data.get('opciones', [])
        adicionales_data = validated_data.pop('adicionales', instance.adicionales)
        section_status_data = validated_data.pop('sectionStatus', instance.sectionStatus)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.adicionales = adicionales_data
        instance.sectionStatus = section_status_data
        instance.save()

        if opciones_data:
            instance.pedidomenuoption_set.all().delete()
            
            for opcion_data in opciones_data:
                opcion_id = opcion_data.get('id')
                if opcion_id is not None:
                    try:
                        menu_option = MenuOption.objects.get(id=opcion_id)
                        PedidoMenuOption.objects.create(
                            pedido=instance,
                            menu_option=menu_option,
                            selected=opcion_data.get('selected', False)
                        )
                    except MenuOption.DoesNotExist:
                        continue

        return instance
