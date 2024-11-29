"""
Serializadores para la aplicación de pedidos.

Define los serializadores para convertir los modelos de pedidos
en representaciones JSON y viceversa, incluyendo:
- PedidoMenuOption: Relación entre pedidos y opciones de menú
- Pedido: Gestión completa de pedidos con sus relaciones
"""

from rest_framework import serializers
from pedidos.models import Pedido, PedidoMenuOption
from pacientes.models import Paciente
from menus.models import Menu, MenuOption, MenuSection
from pacientes.serializers import PacienteSerializer
from menus.serializers import MenuSerializer, MenuSectionSerializer, MenuOptionSerializer

class PedidoMenuOptionSerializer(serializers.ModelSerializer):
    """
    Serializador para la relación entre pedidos y opciones de menú.
    
    Proporciona la representación de las opciones seleccionadas
    en cada pedido, incluyendo los detalles completos de cada opción.
    """
    menu_option = MenuOptionSerializer()
    
    class Meta:
        model = PedidoMenuOption
        fields = ['menu_option', 'selected']

class PedidoSerializer(serializers.ModelSerializer):
    """
    Serializador principal para el modelo Pedido.
    
    Gestiona la conversión completa de pedidos, incluyendo:
    - Relaciones con pacientes y menús
    - Opciones seleccionadas
    - Estados de las secciones
    - Información adicional y observaciones
    
    Proporciona campos separados para lectura y escritura de las relaciones.
    """
    paciente = PacienteSerializer(read_only=True)
    paciente_id = serializers.PrimaryKeyRelatedField(
        queryset=Paciente.objects.all(),
        source='paciente',
        write_only=True,
        required=False
    )
    menu = MenuSerializer(read_only=True)
    menu_id = serializers.PrimaryKeyRelatedField(
        queryset=Menu.objects.all(),
        source='menu',
        write_only=True
    )
    opciones = PedidoMenuOptionSerializer(
        source='pedidomenuoption_set', 
        many=True, 
        read_only=True
    )
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
        """
        Valida los datos del pedido antes de la creación/actualización.
        
        Verifica que el paciente esté activo antes de permitir
        crear o modificar un pedido.
        
        Args:
            data (dict): Datos validados del pedido.
            
        Returns:
            dict: Datos validados si pasan todas las validaciones.
            
        Raises:
            ValidationError: Si el paciente está inactivo.
        """
        if data.get('paciente') and not data['paciente'].activo:
            raise serializers.ValidationError({
                'paciente': 'No se puede crear un pedido para un paciente inactivo'
            })
        return data

    def create(self, validated_data):
        """
        Crea un nuevo pedido con sus opciones relacionadas.
        
        Args:
            validated_data (dict): Datos validados del pedido.
            
        Returns:
            Pedido: Nueva instancia de pedido creada.
        """
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

        # Usar un set para evitar duplicados
        opciones_procesadas = set()
        
        for opcion_data in opciones_data:
            try:
                opcion_id = opcion_data['id']
                # Si ya procesamos esta opción, la saltamos
                if opcion_id in opciones_procesadas:
                    continue
                
                menu_option = MenuOption.objects.get(id=opcion_id)
                PedidoMenuOption.objects.create(
                    pedido=pedido,
                    menu_option=menu_option,
                    selected=opcion_data.get('selected', False)
                )
                opciones_procesadas.add(opcion_id)
            except MenuOption.DoesNotExist:
                continue

        return pedido

    def update(self, instance, validated_data):
        """
        Actualiza un pedido existente y sus opciones relacionadas.
        
        Args:
            instance (Pedido): Instancia del pedido a actualizar.
            validated_data (dict): Datos validados del pedido.
            
        Returns:
            Pedido: Instancia del pedido actualizada.
        """
        if instance.paciente and not instance.paciente.activo:
            validated_data.pop('paciente', None)
        
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
            
            # Usar un set para evitar duplicados
            opciones_procesadas = set()
            
            for opcion_data in opciones_data:
                opcion_id = opcion_data.get('id')
                if opcion_id is not None and opcion_id not in opciones_procesadas:
                    try:
                        menu_option = MenuOption.objects.get(id=opcion_id)
                        PedidoMenuOption.objects.create(
                            pedido=instance,
                            menu_option=menu_option,
                            selected=opcion_data.get('selected', False)
                        )
                        opciones_procesadas.add(opcion_id)
                    except MenuOption.DoesNotExist:
                        continue

        return instance
