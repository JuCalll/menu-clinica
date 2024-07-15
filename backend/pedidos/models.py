# pedidos/models.py

from django.db import models
from django.conf import settings
from menu.models import Menu
from pacientes.models import Paciente  # Esto se agregará después de definir el modelo de Paciente

class Pedido(models.Model):
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE)
    patient = models.ForeignKey(Paciente, on_delete=models.CASCADE)  # Esto se ajustará después de definir el modelo de Paciente

    def __str__(self):
        return f"Pedido {self.id} - {self.status}"
