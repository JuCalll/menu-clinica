"""
Módulo de modelos para la gestión de servicios hospitalarios.

Define el modelo principal para manejar los servicios o departamentos del hospital,
incluyendo la lógica de cascada para la desactivación de elementos relacionados:
- Habitaciones asociadas
- Camas dentro de las habitaciones
- Pacientes asignados a esas camas
"""

from django.db import models

class Servicio(models.Model):
    """
    Modelo que representa un servicio o departamento hospitalario.
    
    Un servicio puede contener múltiples habitaciones y gestiona
    el estado activo/inactivo de toda su estructura jerárquica.
    
    Atributos:
        nombre (str): Nombre identificativo del servicio.
        activo (bool): Estado del servicio (activo/inactivo).
    """
    nombre = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def __str__(self):
        """Representación en string del servicio."""
        return self.nombre

    def save(self, *args, **kwargs):
        """
        Sobrescribe el método save para implementar la lógica de cascada.
        
        Cuando un servicio se desactiva, automáticamente desactiva todas
        las habitaciones asociadas, sus camas y los pacientes asignados.
        
        Args:
            *args: Argumentos posicionales para el método save.
            **kwargs: Argumentos de palabra clave para el método save.
        """
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if not is_new and not self.activo:
            from habitaciones.models import Habitacion
            from camas.models import Cama
            from pacientes.models import Paciente

            habitaciones = self.habitacion_set.all()
            habitaciones.update(activo=False)

            camas = Cama.objects.filter(habitacion__in=habitaciones)
            camas.update(activo=False)

            Paciente.objects.filter(cama__in=camas).update(activo=False)
