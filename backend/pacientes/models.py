from django.db import models
from django.core.exceptions import ValidationError
from camas.models import Cama
from dietas.models import Dieta, Alergia

class Paciente(models.Model):
    id = models.AutoField(primary_key=True)  
    cedula = models.CharField(max_length=20)  
    name = models.CharField(max_length=100)
    cama = models.ForeignKey(Cama, on_delete=models.CASCADE)
    recommended_diet = models.ForeignKey(Dieta, on_delete=models.SET_NULL, null=True)
    alergias = models.ForeignKey(Alergia, on_delete=models.SET_NULL, null=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)  

    def save(self, *args, **kwargs):
        if self.activo:
            if not self.cama.activo:
                raise ValidationError('No se puede activar un paciente porque la cama no está activa.')
            if not self.cama.habitacion.activo:
                raise ValidationError('No se puede activar un paciente porque la habitación no está activa.')
            if not self.cama.habitacion.servicio.activo:
                raise ValidationError('No se puede activar un paciente porque el servicio no está activo.')
        else:
            self.cama.activo = False
            self.cama.save()

        super(Paciente, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
