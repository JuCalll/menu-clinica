from django.db import models

class Servicio(models.Model):
    nombre = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
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
