
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import QuoteRequest,Customer, Address, Booking, AddonOption, BookingAddon
from .serializers import QuoteRequestSerializer,BookingSerializer
from decimal import Decimal
from django.contrib.auth.models import User
from django.db import transaction
from .services import PriceCalculator

class QuoteRequestView(APIView):
    def post(self, request):
        # Print the incoming data for debugging
        print("Received data:", request.data)
        
        # Map form field names to model field names if they differ
        data = request.data.copy()
        
        # Create and validate serializer
        serializer = QuoteRequestSerializer(data=data)
        if serializer.is_valid():
            # Calculate price before saving
            quote_request = serializer.save(commit=False)  # Create instance but don't save yet
            
            # Get the calculated price
            price = self.calculate_price(serializer.validated_data)
            
            # Save the calculated price
            quote_request.calculated_price = price
            quote_request.save()
            
            # Add price to the response
            response_data = serializer.data
            response_data['calculated_price'] = price
            
            # Return success response
            return Response({
                'status': 'success',
                'message': 'Quote request received successfully',
                'data': response_data,
                'price': price  # Include price separately for clarity
            }, status=status.HTTP_201_CREATED)
        
        # Return error response if validation fails
        return Response({
            'status': 'error',
            'message': 'Invalid data provided',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def calculate_price(self, data):
        """
        Calculate cleaning price based on the formula:
        Recurring Cleaning Price = 
            (99 + 30 × [Square Footage/500] + 25 * [#bathroom + #bedroom]) + (Add-ons) - (Discounts)
        """
        # Extract basic data
        square_feet = data.get('squarefeet')
        bedrooms = int(data.get('bedroom', 1))
        bathrooms = int(data.get('bathroom', 1))
        if bathrooms == 7:  # Handle "No Bathroom" case
            bathrooms = 0
        frequency = data.get('frequency', 'onetime')
        
        # Parse square footage
        # Extract first number from range (e.g., "501 – 1000 Sq Ft" -> 501)
        sq_ft_value = int(square_feet.split('–')[0].strip())
        
        # Base calculation
        base_price = Decimal('99')
        square_footage_factor = Decimal('30') * (Decimal(sq_ft_value) / Decimal('500'))
        room_factor = Decimal('25') * (bedrooms + bathrooms)
        
        # Calculate base price
        price = base_price + square_footage_factor + room_factor
        
        # Add-ons
        if data.get('deluxe_cleaning', False):
            price += Decimal('49') + Decimal('15') * (bedrooms + bathrooms)
            
        if data.get('heavy_duty', False):
            price += Decimal('49') + Decimal('5') * (bedrooms + bathrooms)
            
        if data.get('inside_fridge', 0) > 0:
            price += Decimal('35') * data.get('inside_fridge')
            
        if data.get('inside_oven', 0) > 0:
            price += Decimal('35') * data.get('inside_oven')
            
        if data.get('inside_cabinets', False):
            price += Decimal('49')
            
        if data.get('load_dishwasher', False):
            price += Decimal('15')
            
        if data.get('handwash_dishes', False):
            price += Decimal('25')
            
        if data.get('laundry_folding', 0) > 0:
            price += Decimal('25') * data.get('laundry_folding')
            
        if data.get('eco_friendly', False):
            price += Decimal('20')
            
        if data.get('pet_hair_fee', False):
            price += Decimal('20')
            
        if data.get('change_linen', False):
            price += Decimal('10') * bedrooms
        
        # Apply discount based on frequency
        discount = Decimal('0')
        if frequency == 'weekly':
            discount = price * Decimal('0.20')  # 20% discount
        elif frequency == 'biweekly':
            discount = price * Decimal('0.15')  # 15% discount
        elif frequency == 'monthly':
            discount = price * Decimal('0.10')  # 10% discount
        
        # Calculate final price
        final_price = price - discount
        
        return round(final_price, 2)
    
class PriceEstimateView(APIView):
    def post(self, request):
        # Create a temporary serializer to validate the data
        serializer = QuoteRequestSerializer(data=request.data)
        if serializer.is_valid():
            # Calculate price
            price = self.calculate_price(serializer.validated_data)
            
            # Return just the price
            return Response({
                'status': 'success',
                'price': price
            })
        
        return Response({
            'status': 'error',
            'message': 'Invalid data provided',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    

    def calculate_price(self,data):
        """
        Calculate cleaning price based on the formula:
        Recurring Cleaning Price = 
            (99 + 30 × [Square Footage/500] + 25 * [#bathroom + #bedroom]) + (Add-ons) - (Discounts)
        """
        # Extract basic data
        square_feet = data.get('squarefeet')
        bedrooms = int(data.get('bedroom', 1))
        bathrooms = int(data.get('bathroom', 1))
        if bathrooms == 7:  # Handle "No Bathroom" case
            bathrooms = 0
        frequency = data.get('frequency', 'onetime')
        
        # Parse square footage
        # Extract first number from range (e.g., "501 – 1000 Sq Ft" -> 501)
        sq_ft_value = int(square_feet.split('–')[0].strip())
        
        # Base calculation
        base_price = Decimal('99')
        square_footage_factor = Decimal('30') * (Decimal(sq_ft_value) / Decimal('500'))
        room_factor = Decimal('25') * (bedrooms + bathrooms)
        
        # Calculate base price
        price = base_price + square_footage_factor + room_factor
        
        # Add-ons
        if data.get('deluxe_cleaning', False):
            price += Decimal('49') + Decimal('15') * (bedrooms + bathrooms)
            
        if data.get('heavy_duty', False):
            price += Decimal('49') + Decimal('5') * (bedrooms + bathrooms)
            
        if data.get('inside_fridge', 0) > 0:
            price += Decimal('35') * data.get('inside_fridge')
            
        if data.get('inside_oven', 0) > 0:
            price += Decimal('35') * data.get('inside_oven')
            
        if data.get('inside_cabinets', False):
            price += Decimal('49')
            
        if data.get('load_dishwasher', False):
            price += Decimal('15')
            
        if data.get('handwash_dishes', False):
            price += Decimal('25')
            
        if data.get('laundry_folding', 0) > 0:
            price += Decimal('25') * data.get('laundry_folding')
            
        if data.get('eco_friendly', False):
            price += Decimal('20')
            
        if data.get('pet_hair_fee', False):
            price += Decimal('20')
            
        if data.get('change_linen', False):
            price += Decimal('10') * bedrooms
        
        # Apply discount based on frequency
        discount = Decimal('0')
        if frequency == 'weekly':
            discount = price * Decimal('0.20')  # 20% discount
        elif frequency == 'biweekly':
            discount = price * Decimal('0.15')  # 15% discount
        elif frequency == 'monthly':
            discount = price * Decimal('0.10')  # 10% discount
        
        # Calculate final price
        final_price = price - discount
        
        return round(final_price, 2)


class BookingView(APIView):
    def post(self, request):
        # Extract data from request
        data = request.data
        
        # Initialize calculator
        calculator = PriceCalculator()
        
        try:
            with transaction.atomic():
                # Create or get customer
                customer_data = data.get('personalInfo', {})
                customer, created = Customer.objects.get_or_create(
                    email=customer_data.get('email'),
                    defaults={
                        'first_name': customer_data.get('firstName'),
                        'last_name': customer_data.get('lastName'),
                        'mobile': customer_data.get('mobile'),
                        'send_text_reminders': customer_data.get('sendTextReminders', True),
                    }
                )
                
                if not created:
                    # Update existing customer data
                    customer.first_name = customer_data.get('firstName')
                    customer.last_name = customer_data.get('lastName')
                    customer.mobile = customer_data.get('mobile')
                    customer.send_text_reminders = customer_data.get('sendTextReminders', True)
                    customer.save()
                
                # Create address
                address_data = data.get('address', {})
                address = Address.objects.create(
                    customer=customer,
                    street=address_data.get('street'),
                    apt=address_data.get('apt'),
                    city=address_data.get('city'),
                    state=address_data.get('state'),
                    zip_code=address_data.get('zipCode')
                )
                
                service_type = data.get('serviceType')
                bathrooms = data.get('bathrooms')
                bedrooms = data.get('bedrooms')
                square_feet = data.get('squareFeet')
                frequency = data.get('frequency')
                
                # Convert frontend frequency to backend enum
                frequency_mapping = {
                    'Every Week(Discount 10%)': 'EVERY_WEEK',
                    'Every 2 Weeks(Discount 15%)': 'EVERY_2_WEEKS',
                    'Every 4 Weeks(Discount 20%)': 'EVERY_4_WEEKS',
                    'One Time': 'ONE_TIME'
                }
                frequency_code = frequency_mapping.get(frequency, 'ONE_TIME')
                
                # Extract numeric values for calculations
                try:
                    bathrooms_count = int(bathrooms.split(' ')[0])
                except (ValueError, AttributeError, IndexError):
                    bathrooms_count = 0
                    
                try:
                    bedrooms_count = int(bedrooms.split(' ')[0])
                except (ValueError, AttributeError, IndexError):
                    bedrooms_count = 1
                
                # Calculate base price
                base_price = calculator.calculate_base_price(bedrooms, bathrooms, square_feet)
                
                # Calculate addon prices - THIS SECTION NEEDS UPDATING
                selected_addons = data.get('selectedAddons', [])
                addons_total = Decimal('0')
                addon_items = []
                
                # Handle the case where selectedAddons contains objects with id and quantity
                for addon_item in selected_addons:
                    # Handle both simple id values and objects with id and quantity
                    if isinstance(addon_item, dict):
                        addon_id = addon_item.get('id')
                        quantity = addon_item.get('quantity', 1)
                    else:
                        addon_id = addon_item
                        # Check if there's a separate quantity entry for this addon
                        addon_data = next((item for item in data.get('addonQuantities', []) 
                                         if item.get('id') == addon_id), None)
                        quantity = addon_data.get('quantity', 1) if addon_data else 1
                    
                    try:
                        addon = AddonOption.objects.get(id=addon_id)
                        
                        addon_price = calculator.calculate_addon_price(
                            addon,
                            bedrooms_count,
                            bathrooms_count,
                            quantity
                        )
                        
                        addon_items.append({
                            'addon': addon,
                            'quantity': quantity,
                            'price': addon_price
                        })
                        
                        addons_total += addon_price
                        
                    except AddonOption.DoesNotExist:
                        pass
                
                # Calculate discount
                discount = calculator.calculate_discount(base_price, frequency_code)
                
                # Get tip amount if provided
                tip_amount = Decimal('0')
                if data.get('tip'):
                    try:
                        tip_amount = Decimal(data.get('tip').replace('$', '').strip())
                    except:
                        tip_amount = Decimal('0')
                
                # Calculate final totals
                pricing = calculator.calculate_booking_total(
                    base_price, 
                    addons_total, 
                    discount,
                    tip_amount
                )
                
                # Create booking
                booking = Booking.objects.create(
                    customer=customer,
                    address=address,
                    service_type=service_type,
                    bathrooms=bathrooms,
                    bedrooms=bedrooms,
                    square_feet=square_feet,
                    frequency=frequency_code,
                    service_date=data.get('dateTime'),
                    time_window=data.get('timeWindow'),
                    
                    # Additional info
                    condition=data.get('additionalInfo', {}).get('condition', '3'),
                    preferred_team=data.get('additionalInfo', {}).get('preferredTeam', 'No preference'),
                    is_flexible=data.get('additionalInfo', {}).get('flexible', 'Not flexible'),
                    referral_source=data.get('additionalInfo', {}).get('referralSource', ''),
                    
                    # Access and parking
                    access_method=data.get('access', {}).get('method', 'HOME'),
                    access_instructions=data.get('access', {}).get('instructions', ''),
                    parking_instructions=data.get('parking', {}).get('instructions', ''),
                    parking_cost=data.get('parking', {}).get('cost', '$0'),
                    
                    # Other details
                    special_instructions=data.get('specialInstructions', ''),
                    tip_amount=tip_amount,
                    payment_last_four=data.get('payment', {}).get('cardNumber', '')[-4:],
                    
                    # Pricing details
                    subtotal=pricing['subtotal'],
                    discount=pricing['discount'],
                    sales_tax=pricing['sales_tax'],
                    total=pricing['total']
                )
                
                # Create booking addon relationships
                for item in addon_items:
                    BookingAddon.objects.create(
                        booking=booking,
                        addon=item['addon'],
                        quantity=item['quantity'],
                        price=item['price']
                    )
                
                # Return response with booking details
                serializer = BookingSerializer(booking)
                response_data = {
                    'success': True,
                    'booking_id': booking.id,
                    'booking': serializer.data,
                    'pricing_details': {
                        'base_price': float(base_price),
                        'addons_total': float(addons_total),
                        'subtotal': float(pricing['subtotal']),
                        'discount': float(pricing['discount']),
                        'sales_tax': float(pricing['sales_tax']),
                        'total': float(pricing['total']),
                        'tip': float(tip_amount),
                    }
                }
                
                return Response(response_data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)