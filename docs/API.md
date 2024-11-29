# API Documentation - Sistema de Menús Preferenciales CSJD / CSJD Preferential Menu System

## Descripción General / General Description
Esta documentación describe los endpoints disponibles en la API REST del Sistema de Menús Preferenciales CSJD. / This documentation describes the available endpoints in the REST API of the CSJD Preferential Menu System.

## Autenticación / Authentication
La API utiliza autenticación JWT (JSON Web Token). Todos los endpoints, excepto login y registro, requieren un token válido. / The API uses JWT (JSON Web Token) authentication. All endpoints, except login and register, require a valid token.

## Endpoints Principales / Main Endpoints

### Autenticación / Authentication
- `POST /auth/register/` - Registro de usuarios / User registration
- `POST /auth/login/` - Inicio de sesión / Login
- `GET /auth/users/` - Obtener lista de usuarios / Get users list
- `POST /auth/users/` - Crear usuario / Create user
- `PUT /auth/users/{id}/` - Actualizar usuario / Update user

### Gestión de Menús / Menu Management
- `GET /menus/` - Obtener menús / Get menus
- `POST /menus/` - Crear menú / Create menu
- `PUT /menus/{id}/` - Actualizar menú / Update menu
- `DELETE /menus/{id}/` - Eliminar menú / Delete menu
- `GET /menus/options/` - Obtener opciones de menú / Get menu options
- `POST /menus/options/` - Crear opción de menú / Create menu option

### Gestión de Pacientes / Patient Management
- `GET /pacientes/` - Obtener pacientes / Get patients
- `POST /pacientes/` - Crear paciente / Create patient
- `PUT /pacientes/{id}/` - Actualizar paciente / Update patient

### Gestión de Dietas / Diet Management
- `GET /dietas/dietas/` - Obtener dietas / Get diets
- `POST /dietas/dietas/` - Crear dieta / Create diet
- `PUT /dietas/dietas/{id}/` - Actualizar dieta / Update diet
- `DELETE /dietas/dietas/{id}/` - Eliminar dieta / Delete diet

### Gestión de Pedidos / Order Management
- `GET /pedidos/` - Obtener pedidos / Get orders
- `POST /pedidos/` - Crear pedido / Create order
- `PUT /pedidos/{id}/` - Actualizar pedido / Update order
- `DELETE /pedidos/{id}/` - Eliminar pedido / Delete order
- `GET /pedidos/completados/` - Obtener pedidos completados / Get completed orders

### Gestión de Infraestructura / Infrastructure Management
- `GET /camas/` - Obtener camas / Get beds
- `POST /camas/` - Crear cama / Create bed
- `PUT /camas/{id}/` - Actualizar cama / Update bed
- `DELETE /camas/{id}/` - Eliminar cama / Delete bed
- `POST /habitaciones/` - Crear habitación / Create room
- `PUT /habitaciones/{id}/` - Actualizar habitación / Update room
- `POST /servicios/` - Crear servicio / Create service
- `PUT /servicios/{id}/` - Actualizar servicio / Update service

### Gestión de Alergias / Allergy Management
- `GET /dietas/alergias/` - Obtener alergias / Get allergies
- `POST /dietas/alergias/` - Crear alergia / Create allergy
- `PUT /dietas/alergias/{id}/` - Actualizar alergia / Update allergy
- `DELETE /dietas/alergias/{id}/` - Eliminar alergia / Delete allergy

## Formato de Respuestas / Response Format
Todas las respuestas son en formato JSON y siguen la siguiente estructura: / All responses are in JSON format and follow this structure:

{
"success": true,
"data": {},
"message": "Operación exitosa" / "Successful operation"
}

## Manejo de Errores / Error Handling
Los errores siguen este formato: / Errors follow this format:

{
"success": false,
"error": "Descripción del error" / "Error description",
"code": "ERROR_CODE"
}

## Notas Adicionales / Additional Notes
- Todos los endpoints requieren autenticación excepto `/auth/login/` y `/auth/register/` / All endpoints require authentication except `/auth/login/` and `/auth/register/`
- Las peticiones deben incluir el header: `Authorization: Bearer {token}` / Requests must include the header: `Authorization: Bearer {token}`
- Los datos se envían en formato JSON / Data is sent in JSON format