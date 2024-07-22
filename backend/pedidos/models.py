from django.db import models
from menu.models import Menu
from pacientes.models import Paciente

"""
Modelo para representar un pedido.

Un pedido se crea cuando un paciente selecciona un menú y se establece automáticamente la fecha y hora de creación.
El estado del pedido se puede actualizar manualmente.

Atributos:
    order_date (DateTimeField): Fecha y hora en la que se creó el pedido, se establece automáticamente.
    status (CharField): Estado del pedido (e.g. "pendiente", "entregado", "cancelado").
    menu (ForeignKey): Relación con el menú seleccionado por el paciente.
    patient (ForeignKey): Relación con el paciente que realizó el pedido.

Ejemplo:
    >>> pedido = Pedido(status="pendiente", menu=Menu.objects.get(id=1), patient=Paciente.objects.get(id=1))
    >>> print(pedido)  # Salida: Pedido 1 - pendiente
"""

class Pedido(models.Model):
    order_date = models.DateTimeField(auto_now_add=True)  # Fecha y hora en la que se creó el pedido, se establece automáticamente
    status = models.CharField(max_length=50)  # Estado del pedido
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE)  # Relación con el menú, se elimina el pedido si se elimina el menú asociado
    patient = models.ForeignKey(Paciente, on_delete=models.CASCADE)  # Relación con el paciente, se elimina el pedido si se elimina el paciente asociado

    def __str__(self):
        return f"Pedido {self.id} - {self.status}"  # Representación en cadena del pedido, útil para el panel de administración