from django.db import models
from menu.models import Menu
from pacientes.models import Paciente

class Pedido(models.Model):
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, null=True, blank=True)
    patient = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    menu_personalizado = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Pedido {self.id} - {self.status}"
