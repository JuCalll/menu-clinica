"""
Configuración de Django para el proyecto backend.

Generado por 'django-admin startproject' usando Django 5.0.7.

Para más información sobre este archivo, ver:
https://docs.djangoproject.com/en/5.0/topics/settings/

Para la lista completa de configuraciones y sus valores, ver:
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path
from datetime import timedelta

# Construye rutas dentro del proyecto como BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Configuración rápida de desarrollo - no adecuada para producción
# Ver https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# ADVERTENCIA DE SEGURIDAD: ¡mantén la clave secreta usada en producción en secreto!
SECRET_KEY = 'django-insecure-#&r^&i1d4kme7qq$q%lne_(6m2!-xebt@u1$k*#28ets-jk-t^'

# ADVERTENCIA DE SEGURIDAD: ¡no ejecutes con debug activado en producción!
DEBUG = True

ALLOWED_HOSTS = []  # Lista de hosts permitidos para este proyecto

# Definición de aplicaciones instaladas
INSTALLED_APPS = [
    'django.contrib.admin',  # Administración de Django
    'django.contrib.auth',  # Autenticación de Django
    'django.contrib.contenttypes',  # Tipos de contenido de Django
    'django.contrib.sessions',  # Sesiones de Django
    'django.contrib.messages',  # Mensajes de Django
    'django.contrib.staticfiles',  # Archivos estáticos de Django
    'rest_framework',  # Django REST framework
    'corsheaders',  # Django CORS headers
    'authentication',  # Aplicación de autenticación personalizada
    'menu',  # Aplicación de menús
    'pedidos',  # Aplicación de pedidos
    'pacientes',  # Aplicación de pacientes
    'habitaciones', #Aplicación de habitaciones 
    'servicios', #Aplicación de servicios
    'MenuPersonalizado',
]

# Configuración de Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Autenticación JWT
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',  # Requiere autenticación por defecto
    ),
}

# Configuración de Simple JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),  # Duración del token de acceso
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),  # Duración del token de actualización
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,

    'ALGORITHM': 'HS256',  # Algoritmo usado para firmar el token
    'SIGNING_KEY': SECRET_KEY,  # Clave de firma
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,

    'AUTH_HEADER_TYPES': ('Bearer',),  # Tipo de encabezado esperado para los tokens
    'USER_ID_FIELD': 'id',  # Campo de ID de usuario
    'USER_ID_CLAIM': 'user_id',  # Reclamación de ID de usuario

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),  # Clases de token
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=10),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# Modelo de usuario personalizado
AUTH_USER_MODEL = 'authentication.CustomUser'

# Configuración de middlewares
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Middleware de CORS
    'django.middleware.common.CommonMiddleware',  # Asegúrate de que esté después de corsheaders
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configurar CORS
CORS_ALLOW_ALL_ORIGINS = True  # Permitir todas las solicitudes de origen cruzado
# O si deseas permitir solo ciertos orígenes
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]

CORS_ALLOW_CREDENTIALS = True  # Permitir el envío de credenciales en solicitudes CORS

# Configuración de URL raíz
ROOT_URLCONF = 'backend.urls'

# Configuración de plantillas
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Aplicación WSGI
WSGI_APPLICATION = 'backend.wsgi.application'

# Configuración de base de datos
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',  # Motor de base de datos
        'NAME': BASE_DIR / 'db.sqlite3',  # Nombre de la base de datos
    }
}

# Validación de contraseñas
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators
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

# Internacionalización
# https://docs.djangoproject.com/en/5.0/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Archivos estáticos (CSS, JavaScript, Imágenes)
# https://docs.djangoproject.com/en/5.0/howto/static-files/
STATIC_URL = 'static/'

# Tipo de campo de clave primaria por defecto
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
