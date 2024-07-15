# Clínica San Juan de Dios - Sistema de Menús y Pedidos

Este proyecto es un sistema de gestión de menús y pedidos para la Clínica San Juan de Dios, diseñado para pacientes de medicina prepagada.

## Requisitos

- Python 3.9+
- Django 3.2+
- Django REST Framework
- Simple JWT

## Instalación

1. Clona este repositorio.
2. Crea un entorno virtual:
    ```bash
    python -m venv env
    ```
3. Activa el entorno virtual:
    - En Windows:
        ```bash
        .\env\Scripts\activate
        ```
    - En Unix o MacOS:
        ```bash
        source env/bin/activate
        ```
4. Instala las dependencias:
    ```bash
    pip install -r requirements.txt
    ```
5. Aplica las migraciones:
    ```bash
    python manage.py migrate
    ```

## Uso

1. Ejecuta el servidor de desarrollo:
    ```bash
    python manage.py runserver
    ```
2. Accede a `http://127.0.0.1:8000/admin` para el panel de administración.
3. Accede a las APIs en `http://127.0.0.1:8000/api/`.

## Endpoints

### Autenticación
- `POST /api/auth/register/` - Registro de usuarios.
- `POST /api/auth/login/` - Inicio de sesión.

### Menús
- `GET /api/menus/` - Lista de menús.
- `POST /api/menus/` - Crear un menú.
- `GET /api/menus/<id>/` - Detalle de un menú.
- `PUT /api/menus/<id>/` - Actualizar un menú.
- `DELETE /api/menus/<id>/` - Eliminar un menú.

### Pedidos
- `GET /api/pedidos/` - Lista de pedidos.
- `POST /api/pedidos/` - Crear un pedido.
- `GET /api/pedidos/<id>/` - Detalle de un pedido.
- `PUT /api/pedidos/<id>/` - Actualizar un pedido.
- `DELETE /api/pedidos/<id>/` - Eliminar un pedido.

### Pacientes
- `GET /api/pacientes/` - Lista de pacientes.
- `POST /api/pacientes/` - Crear un paciente.
- `GET /api/pacientes/<id>/` - Detalle de un paciente.
- `PUT /api/pacientes/<id>/` - Actualizar un paciente.
- `DELETE /api/pacientes/<id>/` - Eliminar un paciente.
