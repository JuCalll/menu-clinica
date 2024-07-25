from django.db import models
from pacientes.models import Paciente

class Pedido(models.Model):
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)
    patient = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    menu_personalizado = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Pedido {self.id} - {self.status}"
