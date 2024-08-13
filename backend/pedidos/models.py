# Importamos el módulo models de Django para crear modelos
from django.db import models
# Importamos el modelo Paciente desde pacientes.models
from pacientes.models import Paciente
# Importamos los modelos Menu y MenuOption desde menus.models
from menus.models import Menu, MenuOption

# Definimos un modelo para representar un pedido
class Pedido(models.Model):
    # Definimos opciones de estado para un pedido
    STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),  # El pedido está pendiente
        ('en_proceso', 'En Proceso'),  # El pedido está en proceso
        ('completado', 'Completado'),  # El pedido ha sido completado
    ]

    # Relación de clave foránea a la tabla Paciente, indicando que un pedido está asociado a un paciente
    # on_delete=models.CASCADE asegura que si un paciente es eliminado, los pedidos asociados también lo sean
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)

    # Relación de clave foránea a la tabla Menu, indicando que un pedido está asociado a un menú
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE)

    # Relación de muchos a muchos con MenuOption a través del modelo intermedio PedidoMenuOption
    # 'blank=True' permite que este campo sea opcional
    # 'related_name="pedidos"' permite acceder a los pedidos desde una opción de menú a través del nombre 'pedidos'
    opciones = models.ManyToManyField(MenuOption, through='PedidoMenuOption', blank=True, related_name='pedidos')

    # Campo para almacenar el estado del pedido, con opciones definidas en STATUS_CHOICES
    # Por defecto, se establece como 'pendiente'
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendiente')

    # Campo para almacenar la fecha y hora en que se realizó el pedido, se establece automáticamente al crear un pedido
    fecha_pedido = models.DateTimeField(auto_now_add=True)

    # Campo para almacenar datos adicionales en formato JSON, por defecto es un diccionario vacío
    adicionales = models.JSONField(default=dict, blank=True)

    # Definimos una función para representar el pedido como una cadena de texto
    def __str__(self):
        # Devolvemos una cadena que incluye el ID del pedido, el nombre del paciente y el estado del pedido
        return f"Pedido {self.id} - {self.paciente.name} - {self.status}"

# Definimos un modelo intermedio para representar la relación entre Pedido y MenuOption
class PedidoMenuOption(models.Model):
    # Relación de clave foránea a la tabla Pedido, indicando que la opción está asociada a un pedido
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)

    # Relación de clave foránea a la tabla MenuOption, indicando que la opción pertenece a un pedido
    menu_option = models.ForeignKey(MenuOption, on_delete=models.CASCADE)

    # Campo booleano para indicar si la opción ha sido seleccionada
    selected = models.BooleanField(default=False)
