# Importamos Path de pathlib para manejar rutas de archivos
from pathlib import Path
# Importamos timedelta de datetime para manejar intervalos de tiempo
from datetime import timedelta
# Importamos os para interactuar con variables de entorno y el sistema operativo
import os
# Importamos load_dotenv de dotenv para cargar variables de entorno desde un archivo .env
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Definimos la ruta base del proyecto, es decir, la carpeta principal que contiene todos los archivos del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Obtener las variables de entorno

# Se obtiene la clave secreta de Django desde una variable de entorno, si no se encuentra, se usa un valor por defecto (esto no es seguro para producción)
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'ZOM50YBnVo12HpKqySoeXS9M621bNTB0JJ-mqFYpzUbnTFcMWfEh_7y2iB9ZUvVz6fg')

# Se establece si el modo debug está activado o no, basado en una variable de entorno
DEBUG = os.getenv('DJANGO_DEBUG', 'False') == 'True'

# Lista de hosts permitidos, se separa en una lista desde una cadena en la variable de entorno
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '').split(',')

# Definimos las aplicaciones instaladas en el proyecto
INSTALLED_APPS = [
    'django.contrib.admin',  # Admin de Django
    'django.contrib.auth',  # Autenticación de Django
    'django.contrib.contenttypes',  # Tipos de contenido de Django
    'django.contrib.sessions',  # Manejo de sesiones en Django
    'django.contrib.messages',  # Manejo de mensajes en Django
    'django.contrib.staticfiles',  # Archivos estáticos en Django
    'rest_framework',  # Django REST framework
    'corsheaders',  # Manejo de CORS (Cross-Origin Resource Sharing)
    'authentication',  # Aplicación de autenticación personalizada
    'pedidos',  # Aplicación de gestión de pedidos
    'pacientes',  # Aplicación de gestión de pacientes
    'camas',
    'habitaciones',  # Aplicación de gestión de habitaciones
    'servicios',  # Aplicación de gestión de servicios
    'menus',  # Aplicación de gestión de menús
]

# Configuraciones para Django REST framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # Autenticación basada en tokens JWT
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        # Solo usuarios autenticados pueden acceder a las vistas
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# Configuraciones para JWT (JSON Web Tokens)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),  # Tiempo de vida del token de acceso
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),  # Tiempo de vida del token de refresco
    'BLACKLIST_AFTER_ROTATION': True,  # Poner en lista negra el token anterior después de refrescar
    'UPDATE_LAST_LOGIN': False,  # No actualizar el último inicio de sesión automáticamente
    'ALGORITHM': 'HS256',  # Algoritmo de cifrado para los tokens
    'SIGNING_KEY': SECRET_KEY,  # Clave secreta para firmar los tokens
    'VERIFYING_KEY': None,  # Clave para verificar los tokens (no utilizada aquí)
    'AUDIENCE': None,  # Audiencia (no utilizada aquí)
    'ISSUER': None,  # Emisor (no utilizado aquí)
    'AUTH_HEADER_TYPES': ('Bearer',),  # Tipo de cabecera para el token
    'USER_ID_FIELD': 'id',  # Campo que identifica al usuario en el token
    'USER_ID_CLAIM': 'user_id',  # Reclamación que identifica al usuario en el token
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),  # Clases de tokens utilizados
    'TOKEN_TYPE_CLAIM': 'token_type',  # Tipo de token en la reclamación
    'JTI_CLAIM': 'jti',  # Identificador único de token
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',  # Reclamación de expiración del token de refresco deslizante
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=10),  # Tiempo de vida del token deslizante
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),  # Tiempo de vida del refresco deslizante
}

# Especificamos que el modelo de usuario personalizado se utilizará en lugar del modelo de usuario predeterminado de Django
AUTH_USER_MODEL = 'authentication.CustomUser'

# Definimos el middleware utilizado en el proyecto
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Middleware para manejar CORS
    'django.middleware.common.CommonMiddleware',  # Middleware común de Django
    'django.middleware.security.SecurityMiddleware',  # Middleware de seguridad de Django
    'django.contrib.sessions.middleware.SessionMiddleware',  # Middleware de manejo de sesiones
    'django.middleware.csrf.CsrfViewMiddleware',  # Middleware de protección contra CSRF
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # Middleware de autenticación
    'django.contrib.messages.middleware.MessageMiddleware',  # Middleware de manejo de mensajes
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # Protección contra clickjacking
]

# Configuración para permitir todas las fuentes de CORS y permitir credenciales
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Especificamos el archivo de configuración de URLs raíz para el proyecto
ROOT_URLCONF = 'backend.urls'

# Configuraciones de plantillas de Django
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',  # Backend de plantillas
        'DIRS': [],  # Directorios adicionales para buscar plantillas
        'APP_DIRS': True,  # Buscar plantillas en los directorios de las aplicaciones
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',  # Contexto de depuración
                'django.template.context_processors.request',  # Contexto de la solicitud
                'django.contrib.auth.context_processors.auth',  # Contexto de autenticación
                'django.contrib.messages.context_processors.messages',  # Contexto de mensajes
            ],
        },
    },
]

# Especificamos la configuración de la aplicación WSGI
WSGI_APPLICATION = 'backend.wsgi.application'

# Configuración de la base de datos, utilizando SQLite para desarrollo
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',  # Motor de base de datos SQLite
        'NAME': BASE_DIR / 'db.sqlite3',  # Nombre del archivo de base de datos
    }
}

# Validadores de contraseñas para la autenticación
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Configuración del idioma del proyecto
LANGUAGE_CODE = 'en-us'
# Configuración de la zona horaria
TIME_ZONE = 'America/Bogota'
# Habilitar la internacionalización
USE_I18N = True
# Habilitar el uso de zonas horarias
USE_TZ = False

# URL para servir archivos estáticos
STATIC_URL = 'static/'

# Especificar el tipo de campo auto incremental predeterminado para los modelos
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
