from rest_framework import serializers
from .models import Paciente

# Definición del serializador para el modelo Paciente
class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente  # Especifica el modelo que se va a serializar
        fields = ['id', 'name', 'room', 'recommended_diet']  # Campos que se incluirán en la representación JSON
