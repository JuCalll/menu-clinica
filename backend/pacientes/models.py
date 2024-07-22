from django.db import models
from django.core.exceptions import ValidationError
from habitaciones.models import Habitacion

class Paciente(models.Model):
    """
    Representa a un paciente en el hospital.

    Atributos:
        name (CharField): El nombre del paciente.
        room (ForeignKey): La habitación donde se asigna al paciente.
        recommended_diet (CharField): La dieta recomendada para el paciente.

    Se levanta:
        ValidationError: Si se asignan más de 2 pacientes a la misma habitación.

    Ejemplo:
        >>> paciente = Paciente(name="Juan Pérez", room=Habitacion.objects.get(id=1), recommended_diet="Dieta baja en grasas")
        >>> paciente.save()  # Guarda la instancia del paciente
    """
    name = models.CharField(max_length=100)
    room = models.ForeignKey(Habitacion, on_delete=models.CASCADE)
    recommended_diet = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        if Paciente.objects.filter(room=self.room).count() >= 2:
            raise ValidationError('No se pueden asignar más de 2 pacientes a esta habitación.')
        super(Paciente, self).save(*args, **kwargs)

    def __str__(self):
        return self.name