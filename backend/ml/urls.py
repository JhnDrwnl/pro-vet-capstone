# """
# URL configuration for ml project.

# The `urlpatterns` list routes URLs to views. For more information please see:
#     https://docs.djangoproject.com/en/5.1/topics/http/urls/
# Examples:
# Function views
#     1. Add an import:  from my_app import views
#     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# Class-based views
#     1. Add an import:  from other_app.views import Home
#     2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
# Including another URLconf
#     1. Import the include() function: from django.urls import include, path
#     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# """

# backend/ml/urls.py
from django.contrib import admin
from django.urls import path, include

# Correct the import of 'api' to reference the 'api' app in the 'backend' folder
from api import urls as api_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(api_urls))  # Include the 'api.urls' from the 'api' app
]

