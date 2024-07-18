from django.db import models
from menu.models import Menu
from pacientes.models import Paciente

# Modelo para representar un pedido
class Pedido(models.Model):
    order_date = models.DateTimeField(auto_now_add=True)  # Fecha y hora en la que se creó el pedido, se establece automáticamente
    status = models.CharField(max_length=50)  # Estado del pedido
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE)  # Relación con el menú, se elimina el pedido si se elimina el menú asociado
    patient = models.ForeignKey(Paciente, on_delete=models.CASCADE)  # Relación con el paciente, se elimina el pedido si se elimina el paciente asociado

    def __str__(self):
        return f"Pedido {self.id} - {self.status}"  # Representación en cadena del pedido, útil para el panel de administración
