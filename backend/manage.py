#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
# Importamos el módulo os para interactuar con las variables de entorno del sistema operativo
import os
# Importamos el módulo sys para manipular el entorno de ejecución de Python
import sys

def main():
    """Run administrative tasks."""
    # Establecemos la variable de entorno 'DJANGO_SETTINGS_MODULE' con el valor 'backend.settings'
    # Esto indica a Django qué archivo de configuración debe usar
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    try:
        # Intentamos importar la función execute_from_command_line desde django.core.management
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # Si ocurre un error al importar Django, lanzamos un mensaje de error específico
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Ejecutamos la función execute_from_command_line, pasando los argumentos de la línea de comandos
    execute_from_command_line(sys.argv)

# Si el script se ejecuta directamente (no importado como módulo), llamamos a la función main()
if __name__ == '__main__':
    main()
