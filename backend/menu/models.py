from django.db import models

class Menu(models.Model):
    """
    Representa un menú en el sistema.

    Atributos:
        name (CharField): El nombre del menú (máximo 255 caracteres).
        description (TextField): Una breve descripción del menú.
        is_available (BooleanField): Indica si el menú está disponible o no (por defecto=True).

    Ejemplo:
        >>> menu = Menu(name="Desayuno", description="Comienza tu día con nuestras deliciosas opciones de desayuno", is_available=True)
        >>> menu.save()
    """

    name = models.CharField(max_length=255)
    description = models.TextField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        """
        Devuelve una representación de cadena del objeto Menu.

        Devuelve:
            str: El nombre del menú.

        Ejemplo:
            >>> menu = Menu(name="Almuerzo")
            >>> str(menu)
            'Almuerzo'
        """
        return self.name