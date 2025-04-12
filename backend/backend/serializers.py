from rest_framework import serializers
from .models import QuoteRequest,Customer, Address, Booking, BookingAddon, AddonOption

class QuoteRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteRequest
        fields = [
            'firstname', 'lastname', 'email', 'phone',
            'frequency', 'squarefeet', 'bedroom', 'bathroom',
            'deluxe_cleaning', 'heavy_duty', 'inside_fridge', 'inside_oven',
            'inside_cabinets', 'load_dishwasher', 'handwash_dishes',
            'laundry_folding', 'eco_friendly', 'pet_hair_fee', 'change_linen',
            'calculated_price'
        ]
        read_only_fields = ['calculated_price']

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'first_name', 'last_name', 'email', 'mobile', 'send_text_reminders']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'street', 'apt', 'city', 'state', 'zip_code']

class AddonOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddonOption
        fields = ['id', 'name', 'base_price', 'variable_price', 'formula','quantity']

class BookingAddonSerializer(serializers.ModelSerializer):
    addon = AddonOptionSerializer()
    
    class Meta:
        model = BookingAddon
        fields = ['id', 'addon', 'quantity', 'price']

class BookingSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    address = AddressSerializer()
    addons = BookingAddonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'

