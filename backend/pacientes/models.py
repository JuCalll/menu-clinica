from django.db import models

class Paciente(models.Model):
    name = models.CharField(max_length=100)
    room = models.CharField(max_length=10)
    recommended_diet = models.CharField(max_length=255)

    def __str__(self):
        return self.name
