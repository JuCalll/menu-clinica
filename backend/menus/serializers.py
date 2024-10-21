from rest_framework import serializers
from .models import Menu, MenuSection, MenuOption
from django.db import transaction

class MenuOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuOption
        # Eliminamos el campo 'preparado_en'
        fields = ['id', 'texto', 'tipo']

class MenuSectionSerializer(serializers.ModelSerializer):
    opciones = serializers.DictField(
        child=serializers.ListField(child=MenuOptionSerializer()),
        required=False
    )

    class Meta:
        model = MenuSection
        fields = ['id', 'titulo', 'opciones']

    def create(self, validated_data):
        opciones_data = validated_data.pop('opciones', {})
        menu = self.context.get('menu')
        if not menu:
            raise serializers.ValidationError("El menú asociado es requerido.")
        section = MenuSection.objects.create(menu=menu, **validated_data)

        # Crear opciones
        for tipo, opciones_list in opciones_data.items():
            for opcion_data in opciones_list:
                opcion_data['tipo'] = tipo
                MenuOption.objects.create(section=section, **opcion_data)
        return section

    def update(self, instance, validated_data):
        opciones_data = validated_data.pop('opciones', {})
        instance.titulo = validated_data.get('titulo', instance.titulo)
        instance.save()

        # Actualizar o crear opciones
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

        # Eliminar opciones que no están en la nueva lista
        MenuOption.objects.filter(section=instance).exclude(id__in=existing_option_ids).delete()

        return instance

    def to_representation(self, instance):
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
    sections = MenuSectionSerializer(many=True)

    class Meta:
        model = Menu
        fields = ['id', 'nombre', 'sections']

    def create(self, validated_data):
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
        sections_data = validated_data.pop('sections', [])
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.save()

        # Actualizar o crear secciones
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

        # Eliminar secciones que no están en la nueva lista
        MenuSection.objects.filter(menu=instance).exclude(id__in=existing_section_ids).delete()

        return instance
