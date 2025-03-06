from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'patients', PatientViewSet)  # Этот маршрут отвечает за /api/patients/

urlpatterns = [
    path('', include(router.urls)),  # Подключаем patients
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
