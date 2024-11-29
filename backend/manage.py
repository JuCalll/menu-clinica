"""
Script principal de administración de Django.

Este script proporciona la interfaz de línea de comandos para tareas administrativas:
- Ejecutar el servidor de desarrollo
- Aplicar migraciones de base de datos
- Crear superusuarios
- Ejecutar pruebas
- Y otras tareas de gestión del proyecto
"""

import os
import sys

def main():
    """
    Función principal que configura y ejecuta los comandos de Django.
    
    Establece la configuración del proyecto y maneja la ejecución
    de comandos administrativos a través de django.core.management.
    
    Raises:
        ImportError: Si Django no está instalado o no se encuentra en PYTHONPATH.
    """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
