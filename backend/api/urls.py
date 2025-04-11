# urls.py in your app (e.g., cleaning_service/urls.py)
from django.urls import path
from .views import QuoteRequestView, PriceEstimateView,BookingView

urlpatterns = [
    path('quote-request/', QuoteRequestView.as_view(), name='quote-request'),
    path('price-estimate/', PriceEstimateView.as_view(), name='price-estimate'),
    path('booking/', BookingView.as_view(), name='booking'),
]