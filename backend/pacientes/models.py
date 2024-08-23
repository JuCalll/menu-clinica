from django.db import models
from django.core.exceptions import ValidationError
from camas.models import Cama

class Paciente(models.Model):
    id = models.AutoField(primary_key=True)  # Campo autoincremental como nueva clave primaria
    cedula = models.CharField(max_length=20)  # Número de cédula, ya no es único
    name = models.CharField(max_length=100)
    cama = models.ForeignKey(Cama, on_delete=models.CASCADE)
    recommended_diet = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Campo timestamp para la fecha de creación

    def save(self, *args, **kwargs):
        if self.activo:
            if not self.cama.activo:
                raise ValidationError('No se puede activar un paciente porque la cama no está activa.')
            if not self.cama.habitacion.activo:
                raise ValidationError('No se puede activar un paciente porque la habitación no está activa.')
            if not self.cama.habitacion.servicio.activo:
                raise ValidationError('No se puede activar un paciente porque el servicio no está activo.')
        else:
            # Si el paciente se desactiva, liberar la cama asociada
            self.cama.activo = False
            self.cama.save()

        super(Paciente, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
