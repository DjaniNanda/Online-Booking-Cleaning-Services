from rest_framework import serializers
from .models import QuoteRequest, Customer, Address, Booking, AddonOption, BookingAddon, StripePayment

class QuoteRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteRequest
        fields = '__all__'

class AddonOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddonOption
        fields = ['id', 'name', 'base_price', 'variable_price', 'formula']

class BookingAddonSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingAddon
        fields = ['id', 'name', 'quantity', 'price']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['street', 'apt', 'city', 'state', 'zip_code']

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['first_name', 'last_name', 'email', 'mobile', 'send_text_reminders']

class StripePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StripePayment
        fields = ['payment_id', 'customer_id', 'subscription_id', 'amount', 'currency', 
                  'payment_status', 'payment_method', 'created_at', 'is_recurring']

class BookingSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    address = AddressSerializer()
    addons = BookingAddonSerializer(many=True, read_only=True)
    payment = StripePaymentSerializer(source='stripe_payment', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'customer', 'address', 'service_type', 'bathrooms', 'bedrooms',
            'square_feet', 'frequency', 'service_date', 'time_window', 'is_flexible',
            'access_method', 'access_instructions', 'parking_instructions', 'parking_cost',
            'condition', 'special_instructions', 'referral_source', 'tip_amount',
            'subtotal', 'discount', 'sales_tax', 'total', 'addons', 'payment',
            'created_at', 'updated_at'
        ]