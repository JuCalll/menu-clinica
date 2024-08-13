# Importamos el módulo de serializers de Django REST framework
from rest_framework import serializers
# Importamos los modelos Menu, MenuSection y MenuOption desde el archivo models
from .models import Menu, MenuSection, MenuOption

# Definimos un serializer para representar el modelo MenuOption
class MenuOptionSerializer(serializers.ModelSerializer):
    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = MenuOption  # Especificamos el modelo MenuOption
        fields = ['id', 'texto', 'tipo']  # Campos a incluir en la serialización

# Definimos un serializer para representar el modelo MenuSection
class MenuSectionSerializer(serializers.ModelSerializer):
    # Campos adicionales definidos como métodos personalizados
    adicionales = serializers.SerializerMethodField()
    platos_principales = serializers.SerializerMethodField()
    acompanantes = serializers.SerializerMethodField()
    bebidas = serializers.SerializerMethodField()

    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = MenuSection  # Especificamos el modelo MenuSection
        fields = ['id', 'titulo', 'adicionales', 'platos_principales', 'acompanantes', 'bebidas']  # Campos a incluir en la serialización

    # Método para obtener las opciones del tipo 'adicionales'
    def get_adicionales(self, obj):
        # Filtramos las opciones por tipo y las serializamos
        return MenuOptionSerializer(obj.options.filter(tipo='adicionales'), many=True).data

    # Método para obtener las opciones del tipo 'platos_principales'
    def get_platos_principales(self, obj):
        # Filtramos las opciones por tipo y las serializamos
        return MenuOptionSerializer(obj.options.filter(tipo='platos_principales'), many=True).data

    # Método para obtener las opciones del tipo 'acompanantes'
    def get_acompanantes(self, obj):
        # Filtramos las opciones por tipo y las serializamos
        return MenuOptionSerializer(obj.options.filter(tipo='acompanantes'), many=True).data

    # Método para obtener las opciones del tipo 'bebidas'
    def get_bebidas(self, obj):
        # Filtramos las opciones por tipo y las serializamos
        return MenuOptionSerializer(obj.options.filter(tipo='bebidas'), many=True).data

# Definimos un serializer para representar el modelo Menu
class MenuSerializer(serializers.ModelSerializer):
    # Secciones del menú serializadas con un serializer anidado
    sections = MenuSectionSerializer(many=True, required=False)

    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = Menu  # Especificamos el modelo Menu
        fields = ['id', 'nombre', 'sections']  # Campos a incluir en la serialización

    # Método para crear un nuevo menú junto con sus secciones y opciones
    def create(self, validated_data):
        # Obtenemos los datos de las secciones desde la solicitud
        sections_data = self.context['request'].data.get('sections', [])
        # Creamos el menú con los datos validados
        menu = Menu.objects.create(nombre=validated_data.get('nombre'))
        # Iteramos sobre cada sección para crearla junto con sus opciones
        for section_data in sections_data:
            # Extraemos las opciones de cada tipo
            adicionales_data = section_data.pop('adicionales', [])
            platos_principales_data = section_data.pop('platos_principales', [])
            acompanantes_data = section_data.pop('acompanantes', [])
            bebidas_data = section_data.pop('bebidas', [])
            # Creamos la sección correspondiente
            section = MenuSection.objects.create(menu=menu, titulo=section_data['titulo'])
            # Creamos las opciones asociadas a la sección
            for adicional_data in adicionales_data:
                MenuOption.objects.create(section=section, **adicional_data)
            for plato_principal_data in platos_principales_data:
                MenuOption.objects.create(section=section, **plato_principal_data)
            for acompanante_data in acompanantes_data:
                MenuOption.objects.create(section=section, **acompanante_data)
            for bebida_data in bebidas_data:
                MenuOption.objects.create(section=section, **bebida_data)
        # Retornamos el menú creado
        return menu

    # Método para actualizar un menú existente junto con sus secciones y opciones
    def update(self, instance, validated_data):
        # Obtenemos los datos de las secciones desde la solicitud
        sections_data = self.context['request'].data.get('sections', [])
        # Actualizamos el nombre del menú si se ha proporcionado un nuevo valor
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.save()

        # Eliminamos secciones existentes que no están en la solicitud
        existing_section_ids = {section.id for section in instance.sections.all()}
        request_section_ids = {section_data.get('id') for section_data in sections_data if 'id' in section_data}
        sections_to_delete = existing_section_ids - request_section_ids
        if sections_to_delete:
            MenuSection.objects.filter(id__in=sections_to_delete).delete()

        # Iteramos sobre cada sección proporcionada en los datos
        for section_data in sections_data:
            # Extraemos las opciones de cada tipo
            adicionales_data = section_data.pop('adicionales', [])
            platos_principales_data = section_data.pop('platos_principales', [])
            acompanantes_data = section_data.pop('acompanantes', [])
            bebidas_data = section_data.pop('bebidas', [])
            section_id = section_data.get('id')

            # Si la sección ya existe, la actualizamos
            if section_id and MenuSection.objects.filter(id=section_id, menu=instance).exists():
                section = MenuSection.objects.get(id=section_id, menu=instance)
                section.titulo = section_data.get('titulo', section.titulo)
                section.save()

                # Eliminamos las opciones existentes para la sección
                section.options.all().delete()
            else:
                # Si la sección no existe, la creamos
                section = MenuSection.objects.create(menu=instance, **section_data)

            # Creamos las nuevas opciones para la sección
            for adicional_data in adicionales_data:
                MenuOption.objects.create(section=section, **adicional_data)
            for plato_principal_data in platos_principales_data:
                MenuOption.objects.create(section=section, **plato_principal_data)
            for acompanante_data in acompanantes_data:
                MenuOption.objects.create(section=section, **acompanante_data)
            for bebida_data in bebidas_data:
                MenuOption.objects.create(section=section, **bebida_data)

        # Retornamos la instancia del menú actualizada
        return instance
