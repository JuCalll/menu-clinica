"""
Módulo de modelos para la gestión de pacientes hospitalarios.

Define el modelo principal para manejar los pacientes en el sistema,
incluyendo sus relaciones con:
- Camas asignadas
- Dietas recomendadas
- Alergias registradas
Incluye validaciones para el estado activo/inactivo del paciente.
"""

from django.db import models
from django.core.exceptions import ValidationError
from camas.models import Cama
from dietas.models import Dieta, Alergia

class Paciente(models.Model):
    """
    Modelo que representa un paciente hospitalario.
    
    Gestiona la información básica del paciente y sus relaciones
    con otros elementos del sistema hospitalario.
    
    Atributos:
        id (AutoField): Identificador único del paciente.
        cedula (str): Número de identificación del paciente.
        name (str): Nombre completo del paciente.
        cama (Cama): Cama asignada al paciente.
        dietas (ManyToManyField): Dietas recomendadas para el paciente.
        alergias (ManyToManyField): Alergias registradas del paciente.
        activo (bool): Estado del paciente en el sistema.
        created_at (DateTime): Fecha y hora de registro del paciente.
    """
    id = models.AutoField(primary_key=True)  
    cedula = models.CharField(max_length=20)  
    name = models.CharField(max_length=100)
    cama = models.ForeignKey(Cama, on_delete=models.CASCADE)
    dietas = models.ManyToManyField(Dieta, related_name='pacientes')
    alergias = models.ManyToManyField(Alergia, related_name='pacientes')
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)  

    def save(self, *args, **kwargs):
        """
        Sobrescribe el método save para incluir validaciones adicionales.
        
        Verifica el estado activo de la cama, habitación y servicio antes
        de activar un paciente. Si el paciente se desactiva, también
        desactiva su cama asignada.
        
        Raises:
            ValidationError: Si se intenta activar un paciente con cama,
                           habitación o servicio inactivos.
        """
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
        """
        Representación en string del paciente.
        
        Returns:
            str: Nombre del paciente.
        """
        return self.name
