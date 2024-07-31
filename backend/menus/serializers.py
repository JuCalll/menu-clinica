from rest_framework import serializers
from .models import Menu, MenuSection, MenuOption

class MenuOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuOption
        fields = ['id', 'texto', 'tipo', 'selected']

class MenuSectionSerializer(serializers.ModelSerializer):
    adicionales = serializers.SerializerMethodField()
    platos_principales = serializers.SerializerMethodField()
    acompanantes = serializers.SerializerMethodField()
    bebidas = serializers.SerializerMethodField()

    class Meta:
        model = MenuSection
        fields = ['id', 'titulo', 'adicionales', 'platos_principales', 'acompanantes', 'bebidas']

    def get_adicionales(self, obj):
        return MenuOptionSerializer(obj.options.filter(tipo='adicional'), many=True).data

    def get_platos_principales(self, obj):
        return MenuOptionSerializer(obj.options.filter(tipo='plato_principal'), many=True).data

    def get_acompanantes(self, obj):
        return MenuOptionSerializer(obj.options.filter(tipo='acompanante'), many=True).data

    def get_bebidas(self, obj):
        return MenuOptionSerializer(obj.options.filter(tipo='bebida'), many=True).data

class MenuSerializer(serializers.ModelSerializer):
    sections = MenuSectionSerializer(many=True, required=False)

    class Meta:
        model = Menu
        fields = ['id', 'nombre', 'sections']

    def create(self, validated_data):
        sections_data = self.context['request'].data.get('sections', [])
        print(f"Creating Menu with data: {validated_data}")
        print(f"Sections: {sections_data}")
        menu = Menu.objects.create(nombre=validated_data.get('nombre'))
        for section_data in sections_data:
            adicionales_data = section_data.pop('adicionales', [])
            platos_principales_data = section_data.pop('platos_principales', [])
            acompanantes_data = section_data.pop('acompanantes', [])
            bebidas_data = section_data.pop('bebidas', [])
            print(f"Creating Section with data: {section_data}")
            print(f"Adicionales: {adicionales_data}, Platos Principales: {platos_principales_data}, Acompanantes: {acompanantes_data}, Bebidas: {bebidas_data}")
            section = MenuSection.objects.create(menu=menu, titulo=section_data['titulo'])
            for adicional_data in adicionales_data:
                MenuOption.objects.create(section=section, **adicional_data)
            for plato_principal_data in platos_principales_data:
                MenuOption.objects.create(section=section, **plato_principal_data)
            for acompanante_data in acompanantes_data:
                MenuOption.objects.create(section=section, **acompanante_data)
            for bebida_data in bebidas_data:
                MenuOption.objects.create(section=section, **bebida_data)
        return menu

    def update(self, instance, validated_data):
        sections_data = validated_data.pop('sections', [])
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.save()

        for section_data in sections_data:
            adicionales_data = section_data.pop('adicionales', [])
            platos_principales_data = section_data.pop('platos_principales', [])
            acompanantes_data = section_data.pop('acompanantes', [])
            bebidas_data = section_data.pop('bebidas', [])
            section_id = section_data.get('id')

            if section_id:
                section = MenuSection.objects.get(id=section_id, menu=instance)
                section.titulo = section_data.get('titulo', section.titulo)
                section.save()
            else:
                section = MenuSection.objects.create(menu=instance, **section_data)

            # Clear existing options
            section.options.all().delete()

            for adicional_data in adicionales_data:
                MenuOption.objects.create(section=section, **adicional_data)
            for plato_principal_data in platos_principales_data:
                MenuOption.objects.create(section=section, **plato_principal_data)
            for acompanante_data in acompanantes_data:
                MenuOption.objects.create(section=section, **acompanante_data)
            for bebida_data in bebidas_data:
                MenuOption.objects.create(section=section, **bebida_data)

        return instance
