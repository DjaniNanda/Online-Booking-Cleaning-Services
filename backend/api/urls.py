from django.urls import path
from .views import (
    QuoteRequestView, 
    PriceEstimateView,
    BookingView,
    StripePaymentView,
    StripeWebhookView,
    StripeCancelSubscriptionView
)

urlpatterns = [
    path('quote-request/', QuoteRequestView.as_view(), name='quote-request'),
    path('price-estimate/', PriceEstimateView.as_view(), name='price-estimate'),
    path('booking/', BookingView.as_view(), name='booking'),
    
    # Stripe endpoints
    path('stripe/payment/', StripePaymentView.as_view(), name='create-payment-intent'),
    path('stripe/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('stripe/cancel-subscription/<str:subscription_id>/', StripeCancelSubscriptionView.as_view(), name='cancel-subscription'),
]