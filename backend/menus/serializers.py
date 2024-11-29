"""
Serializadores para la aplicación de menús.

Define los serializadores para convertir los modelos de menús, secciones y opciones
en representaciones JSON y viceversa, incluyendo la gestión anidada de sus relaciones.
"""

from rest_framework import serializers
from .models import Menu, MenuSection, MenuOption
from django.db import transaction

class MenuOptionSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo MenuOption.
    
    Proporciona la conversión entre instancias de opciones de menú
    y su representación en JSON.
    """
    class Meta:
        model = MenuOption
        fields = ['id', 'texto', 'tipo']

class MenuSectionSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo MenuSection.
    
    Maneja la conversión de secciones de menú incluyendo sus opciones
    agrupadas por tipo.
    
    Atributos:
        opciones (DictField): Diccionario de opciones agrupadas por tipo.
    """
    opciones = serializers.DictField(
        child=serializers.ListField(child=MenuOptionSerializer()),
        required=False
    )

    class Meta:
        model = MenuSection
        fields = ['id', 'titulo', 'opciones']

    def create(self, validated_data):
        """
        Crea una nueva sección de menú con sus opciones asociadas.
        
        Args:
            validated_data: Datos validados de la sección y sus opciones.
            
        Returns:
            MenuSection: Nueva instancia de sección creada.
            
        Raises:
            ValidationError: Si no se proporciona el menú asociado.
        """
        opciones_data = validated_data.pop('opciones', {})
        menu = self.context.get('menu')
        if not menu:
            raise serializers.ValidationError("El menú asociado es requerido.")
        section = MenuSection.objects.create(menu=menu, **validated_data)

        for tipo, opciones_list in opciones_data.items():
            for opcion_data in opciones_list:
                opcion_data['tipo'] = tipo
                MenuOption.objects.create(section=section, **opcion_data)
        return section

    def update(self, instance, validated_data):
        """
        Actualiza una sección existente y sus opciones.
        
        Args:
            instance: Instancia de MenuSection a actualizar.
            validated_data: Nuevos datos validados.
            
        Returns:
            MenuSection: Instancia actualizada.
        """
        opciones_data = validated_data.pop('opciones', {})
        instance.titulo = validated_data.get('titulo', instance.titulo)
        instance.save()

        existing_option_ids = []
        for tipo, opciones_list in opciones_data.items():
            for opcion_data in opciones_list:
                opcion_id = opcion_data.get('id', None)
                opcion_data['tipo'] = tipo
                if opcion_id:
                    try:
                        opcion = MenuOption.objects.get(id=opcion_id, section=instance)
                        for attr, value in opcion_data.items():
                            setattr(opcion, attr, value)
                        opcion.save()
                        existing_option_ids.append(opcion_id)
                    except MenuOption.DoesNotExist:
                        new_option = MenuOption.objects.create(section=instance, **opcion_data)
                        existing_option_ids.append(new_option.id)
                else:
                    new_option = MenuOption.objects.create(section=instance, **opcion_data)
                    existing_option_ids.append(new_option.id)

        MenuOption.objects.filter(section=instance).exclude(id__in=existing_option_ids).delete()
        return instance

    def to_representation(self, instance):
        """
        Convierte una instancia de MenuSection a su representación JSON.
        
        Args:
            instance: Instancia de MenuSection a representar.
            
        Returns:
            dict: Representación JSON de la sección con opciones agrupadas.
        """
        representation = super().to_representation(instance)
        options = instance.options.all()
        grouped_options = {}
        for option in options:
            tipo = option.tipo
            if tipo not in grouped_options:
                grouped_options[tipo] = []
            grouped_options[tipo].append(MenuOptionSerializer(option).data)
        representation['opciones'] = grouped_options
        return representation

class MenuSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Menu.
    
    Maneja la conversión de menús completos incluyendo todas sus secciones
    y opciones de manera anidada.
    
    Atributos:
        sections (MenuSectionSerializer): Serializador anidado para las secciones.
    """
    sections = MenuSectionSerializer(many=True)

    class Meta:
        model = Menu
        fields = ['id', 'nombre', 'sections']

    def create(self, validated_data):
        """
        Crea un nuevo menú con todas sus secciones y opciones.
        
        Args:
            validated_data: Datos validados del menú y sus secciones.
            
        Returns:
            Menu: Nueva instancia de menú creada.
        """
        sections_data = validated_data.pop('sections', [])
        with transaction.atomic():
            menu = Menu.objects.create(nombre=validated_data.get('nombre'))
            for section_data in sections_data:
                section_serializer = MenuSectionSerializer(
                    data=section_data,
                    context={'menu': menu}
                )
                section_serializer.is_valid(raise_exception=True)
                section_serializer.save()
        return menu

    def update(self, instance, validated_data):
        """
        Actualiza un menú existente y todas sus secciones.
        
        Args:
            instance: Instancia de Menu a actualizar.
            validated_data: Nuevos datos validados.
            
        Returns:
            Menu: Instancia actualizada.
        """
        sections_data = validated_data.pop('sections', [])
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.save()

        existing_section_ids = []
        for section_data in sections_data:
            section_id = section_data.get('id', None)
            if section_id:
                try:
                    section = MenuSection.objects.get(id=section_id, menu=instance)
                    section_serializer = MenuSectionSerializer(
                        instance=section,
                        data=section_data,
                        context={'menu': instance}
                    )
                    section_serializer.is_valid(raise_exception=True)
                    section_serializer.save()
                    existing_section_ids.append(section.id)
                except MenuSection.DoesNotExist:
                    new_section_serializer = MenuSectionSerializer(
                        data=section_data,
                        context={'menu': instance}
                    )
                    new_section_serializer.is_valid(raise_exception=True)
                    new_section_serializer.save()
                    existing_section_ids.append(new_section_serializer.instance.id)
            else:
                new_section_serializer = MenuSectionSerializer(
                    data=section_data,
                    context={'menu': instance}
                )
                new_section_serializer.is_valid(raise_exception=True)
                new_section_serializer.save()
                existing_section_ids.append(new_section_serializer.instance.id)

        MenuSection.objects.filter(menu=instance).exclude(id__in=existing_section_ids).delete()
        return instance
