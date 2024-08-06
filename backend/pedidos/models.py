from django.db import models
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
    opciones = models.ManyToManyField(MenuOption, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendiente')
    fecha_pedido = models.DateTimeField(auto_now_add=True)
    adicionales = models.JSONField(default=dict, blank=True)  # Campo para opciones adicionales

    def __str__(self):
        return f"Pedido {self.id} - {self.paciente.name} - {self.status}"
