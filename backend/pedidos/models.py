from django.db import models
from django.core.exceptions import ValidationError
from pacientes.models import Paciente
from menus.models import Menu, MenuOption

class Pedido(models.Model):
    STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('completado', 'Completado'),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE)
    opciones = models.ManyToManyField(MenuOption, through='PedidoMenuOption', blank=True, related_name='pedidos')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendiente')
    fecha_pedido = models.DateTimeField(auto_now_add=True)
    adicionales = models.JSONField(default=dict, blank=True)
    sectionStatus = models.JSONField(default=dict, blank=True)
    observaciones = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-fecha_pedido']

    def __str__(self):
        return f"Pedido {self.id} - {self.paciente.name} - {self.status}"

    def clean(self):
        if not self.paciente.activo:
            raise ValidationError('No se puede crear un pedido para un paciente inactivo.')

    @property
    def is_fully_completed(self):
        """Verifica si todas las secciones del pedido están completadas"""
        if not self.sectionStatus:
            return False
            
        # Lista de todas las secciones posibles
        required_sections = [
            'desayuno',
            'almuerzo',
            'cena',
            'bebidas_calientes',
            'bebidas_frias',
            'snacks'
        ]
        
        # Verifica que todas las secciones requeridas estén marcadas como completadas
        for section in required_sections:
            if self.sectionStatus.get(section) != 'completado':
                return False
                
        return True

class PedidoMenuOption(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    menu_option = models.ForeignKey(MenuOption, on_delete=models.CASCADE)
    selected = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.pedido.id} - {self.menu_option.texto}"
