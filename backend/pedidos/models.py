"""
Módulo de modelos para la gestión de pedidos hospitalarios.

Define los modelos principales para manejar los pedidos de comidas:
- Pedido: Gestiona los pedidos de comidas de los pacientes
- PedidoMenuOption: Maneja las opciones seleccionadas en cada pedido

Incluye validaciones para:
- Estado del paciente
- Estado de completitud del pedido
- Relaciones entre pedidos y opciones de menú
"""

from django.db import models
from django.core.exceptions import ValidationError
from pacientes.models import Paciente
from menus.models import Menu, MenuOption

class Pedido(models.Model):
    """
    Modelo que representa un pedido de comida hospitalario.
    
    Gestiona toda la información relacionada con un pedido de comida,
    incluyendo el paciente, menú seleccionado, estado y opciones elegidas.
    
    Atributos:
        paciente (Paciente): Paciente que realiza el pedido.
        menu (Menu): Menú del cual se realizan las selecciones.
        opciones (ManyToManyField): Opciones seleccionadas del menú.
        status (str): Estado actual del pedido (pendiente/en_proceso/completado).
        fecha_pedido (DateTime): Fecha y hora de creación del pedido.
        adicionales (JSONField): Información adicional del pedido en formato JSON.
        sectionStatus (JSONField): Estado de completitud de cada sección.
        observaciones (str): Notas adicionales sobre el pedido.
    """
    STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('completado', 'Completado'),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE)
    opciones = models.ManyToManyField(
        MenuOption, 
        through='PedidoMenuOption', 
        blank=True, 
        related_name='pedidos'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendiente')
    fecha_pedido = models.DateTimeField(auto_now_add=True)
    adicionales = models.JSONField(default=dict, blank=True)
    sectionStatus = models.JSONField(default=dict, blank=True)
    observaciones = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-fecha_pedido']

    def __str__(self):
        """Representación en string del pedido."""
        return f"Pedido {self.id} - {self.paciente.name} - {self.status}"

    def clean(self):
        """
        Validación personalizada del pedido.
        
        Verifica que el paciente esté activo antes de permitir crear un pedido.
        
        Raises:
            ValidationError: Si el paciente está inactivo.
        """
        if not self.paciente.activo:
            raise ValidationError('No se puede crear un pedido para un paciente inactivo.')

    @property
    def is_fully_completed(self):
        """
        Verifica si todas las secciones del pedido están completadas.
        
        Returns:
            bool: True si todas las secciones están marcadas como completadas,
                 False en caso contrario.
        """
        if not self.sectionStatus:
            return False
            
        required_sections = [
            'desayuno',
            'almuerzo',
            'cena',
            'bebidas_calientes',
            'bebidas_frias',
            'snacks'
        ]
        
        for section in required_sections:
            if self.sectionStatus.get(section) != 'completado':
                return False
                
        return True

class PedidoMenuOption(models.Model):
    """
    Modelo intermedio para relacionar pedidos con opciones de menú.
    
    Gestiona la relación many-to-many entre Pedido y MenuOption,
    permitiendo marcar qué opciones fueron seleccionadas.
    
    Atributos:
        pedido (Pedido): Pedido al que pertenece la selección.
        menu_option (MenuOption): Opción de menú seleccionada.
        selected (bool): Indica si la opción fue seleccionada.
    """
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    menu_option = models.ForeignKey(MenuOption, on_delete=models.CASCADE)
    selected = models.BooleanField(default=False)

    def __str__(self):
        """Representación en string de la selección de menú."""
        return f"{self.pedido.id} - {self.menu_option.texto}"
