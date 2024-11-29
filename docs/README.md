# Sistema de Gestión de Menús Preferenciales CSJD
# CSJD Preferential Menu Management System

## 📋 Descripción
## 📋 Description
Sistema web para la gestión de menús preferenciales para pacientes hospitalarios de la clínica San Juan de Dios de la ciudad de Manizales. Permite administrar pedidos de comidas, gestionar pacientes, camas, dietas, habitaciones y servicios hospitalarios de manera eficiente e integrada.

Web system for managing preferential menus for hospital patients at the San Juan de Dios clinic in Manizales city. It allows efficient and integrated management of meal orders, patients, beds, diets, rooms and hospital services.

## 📑 Índice
## 📑 Index
- [Características](#-características-principales)
- [Features](#-main-features)
- [Tecnologías](#️-tecnologías)
- [Technologies](#️-technologies)
- [Requisitos](#-requisitos-previos)
- [Requirements](#-prerequisites)
- [Instalación](#-instalación)
- [Installation](#-installation)
- [Ejecución](#-ejecución)
- [Execution](#-execution)
- [Estructura](#-estructura-del-proyecto)
- [Structure](#-project-structure)
- [Seguridad](#-seguridad)
- [Security](#-security)
- [Contribución](#-contribución)
- [Contributing](#-contributing)
- [Licencia](#-licencia)
- [License](#-license)
- [Agradecimientos](#-agradecimientos)
- [Acknowledgments](#-acknowledgments)

## 🚀 Características Principales
## 🚀 Main Features
- **Gestión de Pedidos**: Control completo de pedidos de comidas
- **Order Management**: Complete control of meal orders

- **Administración de Pacientes**: Gestión integral de información de pacientes
- **Patient Administration**: Comprehensive patient information management

- **Control de Instalaciones**: 
- **Facility Control**:
  - Gestión de camas
  - Bed management
  - Administración de habitaciones
  - Room administration
  - Seguimiento de servicios hospitalarios
  - Hospital services monitoring

- **Gestión Nutricional**: 
- **Nutritional Management**:
  - Control de dietas especiales
  - Special diets control
  - Configuración de menús
  - Menu configuration

- **Características Técnicas**:
- **Technical Features**:
  - Sistema de autenticación JWT
  - JWT authentication system
  - Interfaz responsive
  - Responsive interface
  - Documentación administrativa integrada
  - Integrated administrative documentation
  - Sistema de logs
  - Logging system

## 🛠️ Tecnologías
## 🛠️ Technologies

### Backend
- **Framework Principal**: Django 5.0.2
- **Main Framework**: Django 5.0.2

- **API**: Django REST Framework 3.14.0

- **Base de Datos**: MySQL (mysqlclient 2.2.4)
- **Database**: MySQL (mysqlclient 2.2.4)

- **Seguridad**: 
- **Security**:
  - JWT Authentication
  - CORS Headers

- **Testing**: 
  - pytest 8.0.0
  - pytest-django 4.8.0

### Frontend
- **Framework Principal**: React 18.3.1
- **Main Framework**: React 18.3.1

- **UI/UX**: 
  - Ant Design 5.20.4
  - Bootstrap 5.3.3
  - SASS

- **Routing**: React Router DOM

- **HTTP Client**: Axios

- **Testing**: Jest & React Testing Library

## 💻 Requisitos Previos
## 💻 Prerequisites
- Python 3.8+
- Node.js 14+
- MySQL 8.0+
- Git

## 📦 Instalación
## 📦 Installation

### Backend

1. Clonar el repositorio
1. Clone the repository
git clone https://github.com/tu-usuario/menu-preferencial.git
cd menu-preferencial/backend

2. Crear y activar entorno virtual
2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate # Linux/Mac
o / or
venv\Scripts\activate # Windows

3. Instalar dependencias
3. Install dependencies
pip install -r requirements.txt

4. Configurar variables de entorno
4. Configure environment variables
cp .env.example .env
Editar .env con tus configuraciones
Edit .env with your settings

5. Ejecutar migraciones
5. Run migrations
python manage.py migrate

### Frontend

1. Navegar al directorio frontend
1. Navigate to frontend directory
cd ../frontend

2. Instalar dependencias
2. Install dependencies
npm install

3. Configurar variables de entorno
3. Configure environment variables
cp .env.example .env

Editar .env con tus configuraciones
Edit .env with your settings

## 🚀 Ejecución
## 🚀 Execution

### Desarrollo
### Development

- Backend
python manage.py runserver

- Frontend (en otra terminal)
- Frontend (in another terminal)
cd frontend
npm start

### Producción
### Production

- Backend
python manage.py collectstatic
gunicorn backend.wsgi:application

- Frontend
npm run build

## 📚 Estructura del Proyecto
## 📚 Project Structure

### Backend
- `authentication/`: Sistema de autenticación / Authentication system
- `pedidos/`: Gestión de pedidos de comidas / Meal orders management
- `backend/`: Configuración de la API / API configuration
- `pacientes/`: Administración de pacientes / Patient administration
- `camas/`: Control de camas / Bed control
- `dietas/`: Gestión de dietas / Diet management
- `habitaciones/`: Administración de habitaciones / Room administration
- `servicios/`: Gestión de servicios hospitalarios / Hospital services management
- `menus/`: Configuración de menús / Menu configuration
- `logs/`: Sistema de registro de actividades / Activity logging system

### Frontend
- `src/components/`: Componentes React reutilizables / Reusable React components
- `src/pages/`: Páginas principales / Main pages
- `src/services/`: Servicios de API / API services
- `src/utils/`: Utilidades y helpers / Utilities and helpers
- `src/assets/`: Recursos estáticos / Static resources
- `src/App.js`: Configuración principal de la aplicación / Main application configuration
- `src/index.js`: Punto de entrada principal de la aplicación / Main application entry point
- `src/axiosConfig.js`: Configuración de axios para las solicitudes HTTP / Axios configuration for HTTP requests

## 🔒 Seguridad
## 🔒 Security
- Autenticación mediante JWT / JWT Authentication
- Configuración CORS restrictiva / Restrictive CORS configuration
- Variables de entorno securizadas / Secured environment variables
- Validación en frontend y backend / Frontend and backend validation
- Sanitización de datos / Data sanitization
- Protección contra CSRF / CSRF protection

## 🤝 Contribución
## 🤝 Contributing
1. Fork del repositorio / Fork the repository
2. Crear rama de feature / Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios / Commit changes (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama / Push to branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request / Open Pull Request

## 📄 Licencia
## 📄 License
Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.
This project is under MIT License. See [LICENSE](LICENSE) for more details.

## ✨ Agradecimientos
## ✨ Acknowledgments
- Equipo de TICS CSJD / CSJD IT Team
- Contribuidores del proyecto / Project contributors
- Comunidad open source / Open source community

## 📞 Contacto
## 📞 Contact
- **Proyecto / Project**: [GitHub](https://github.com/tu-usuario/menu-preferencial)
