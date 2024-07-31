# backend/menus/urls.py

from django.urls import path
from .views import MenuListCreateView, MenuDetailView

# URLs para las vistas de menús
urlpatterns = [
    path('', MenuListCreateView.as_view(), name='menu-list-create'),
    path('<int:pk>/', MenuDetailView.as_view(), name='menu-detail'),
]
