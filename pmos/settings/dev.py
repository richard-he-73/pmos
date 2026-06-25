from pathlib import Path
from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ['*']

DATABASES['default']['ENGINE'] = 'django.db.backends.sqlite3'  # noqa: F405
DATABASES['default']['NAME'] = Path(__file__).resolve().parent.parent.parent / 'db.sqlite3'  # noqa: F405

CORS_ALLOW_ALL_ORIGINS = True
