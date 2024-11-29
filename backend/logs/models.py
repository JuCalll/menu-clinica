"""
Módulo de modelos para el registro de actividades del sistema.

Define el modelo LogEntry para mantener un registro detallado de todas las
acciones realizadas en el sistema, incluyendo:
- Operaciones CRUD en modelos
- Eventos de autenticación
- Acciones de usuarios
"""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class LogEntry(models.Model):
    """
    Modelo que representa una entrada en el registro de actividades.
    
    Almacena información detallada sobre cada acción realizada en el sistema,
    incluyendo el usuario que la realizó, el tipo de acción, el modelo afectado
    y los detalles específicos de la operación.
    
    Atributos:
        user (User): Usuario que realizó la acción.
        action (str): Tipo de acción realizada (CREATE, UPDATE, etc.).
        model_name (str): Nombre del modelo afectado.
        object_id (int): ID del objeto afectado.
        details (dict): Detalles específicos de la acción.
        timestamp (datetime): Fecha y hora de la acción.
    """
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('LOGIN_FAILED', 'Login Failed'),
        ('TOKEN_REFRESH', 'Token Refresh'),
        ('LIST', 'List')
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='custom_logs',
        help_text='Usuario que realizó la acción'
    )
    action = models.CharField(
        max_length=20, 
        choices=ACTION_CHOICES,
        help_text='Tipo de acción realizada'
    )
    model_name = models.CharField(
        max_length=100,
        help_text='Nombre del modelo afectado'
    )
    object_id = models.IntegerField(
        null=True, 
        blank=True,
        help_text='ID del objeto afectado'
    )
    details = models.JSONField(
        default=dict,
        help_text='Detalles específicos de la acción'
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text='Fecha y hora de la acción'
    )

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        """Representación en string del registro."""
        return f"{self.action} - {self.model_name} - {self.timestamp}"

