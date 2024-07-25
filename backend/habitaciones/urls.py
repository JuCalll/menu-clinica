from django.urls import path
from .views import HabitacionListCreateView, HabitacionDetailView

urlpatterns = [
    path('', HabitacionListCreateView.as_view(), name='habitacion-list-create'),
    path('<int:pk>/', HabitacionDetailView.as_view(), name='habitacion-detail'),
]