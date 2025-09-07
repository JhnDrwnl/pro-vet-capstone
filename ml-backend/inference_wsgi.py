"""
WSGI config for ML inference service
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inference_settings')

application = get_wsgi_application()

