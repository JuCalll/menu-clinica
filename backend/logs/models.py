from django.db import models
from django.contrib.auth import get_user_model

class LogEntry(models.Model):
    ACTIONS = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
    ]

    user = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, related_name='logs')  # Agregamos related_name
    action = models.CharField(max_length=10, choices=ACTIONS)
    model = models.CharField(max_length=50)
    object_id = models.CharField(max_length=50, null=True, blank=True)
    changes = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f'{self.action} - {self.model} - {self.object_id} by {self.user}'
