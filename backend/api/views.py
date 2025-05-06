from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import QuoteRequest, Customer, Address, Booking, AddonOption, BookingAddon
from .serializers import QuoteRequestSerializer, BookingSerializer
from decimal import Decimal
from django.contrib.auth.models import User
from django.db import transaction
from .services import PriceCalculator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags

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
            quote_request = serializer.save()  # Create instance but don't save yet
            
            # Get the calculated price using the service
            price = self.calculate_price(serializer.validated_data)
            
            # Save the calculated price
            quote_request.calculated_price = price
            quote_request.save()
            
            # Add price and creation date to the response
            response_data = serializer.data
            response_data['calculated_price'] = price
            response_data['date_created'] = quote_request.date_created.strftime('%Y-%m-%d %H:%M:%S')
            
            # Send email notification
            self.send_quote_request_email(quote_request, price)
            
            # Return success response
            return Response({
                'status': 'success',
                'message': 'Quote request received successfully',
                'data': response_data,
                'price': price,  # Include price separately for clarity
                'date_created': quote_request.date_created.strftime('%Y-%m-%d %H:%M:%S')  # Include creation date/time
            }, status=status.HTTP_201_CREATED)
        
        # Return error response if validation fails
        return Response({
            'status': 'error',
            'message': 'Invalid data provided',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def send_quote_request_email(self, quote_request, price):
        """
        Send an email notification with the quote request details
        """
        subject = f'New Quote Request #{quote_request.id}'
        
        # Create format helper function for addons
        def format_title(text):
            return text.replace('_', ' ').title()
        
        # Get all available add-ons
        addons = {
            'deluxe_cleaning': quote_request.deluxe_cleaning,
            'heavy_duty': quote_request.heavy_duty,
            'inside_fridge': quote_request.inside_fridge,
            'inside_oven': quote_request.inside_oven,
            'inside_cabinets': quote_request.inside_cabinets,
            'load_dishwasher': quote_request.load_dishwasher,
            'handwash_dishes': quote_request.handwash_dishes,
            'laundry_folding': quote_request.laundry_folding,
            'eco_friendly': quote_request.eco_friendly,
            'pet_hair_fee': quote_request.pet_hair_fee,
            'change_linen': quote_request.change_linen,
        }
        
        # Filter to only selected addons
        selected_addons = {k: v for k, v in addons.items() if v}
        
        # Generate addon rows for HTML
        addon_rows = ""
        for name, value in selected_addons.items():
            addon_rows += f"""
                <tr>
                    <th>{format_title(name)}:</th>
                    <td>{value}</td>
                </tr>
            """
        
        # If no addons were selected
        if not addon_rows:
            addon_rows = "<tr><td colspan='2'>No add-ons selected</td></tr>"
        
        # Create HTML message directly in the code
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #f8f9fa; padding: 15px; border-bottom: 3px solid #007bff; }}
                .section {{ margin-bottom: 20px; }}
                h1 {{ color: #007bff; }}
                table {{ width: 100%; border-collapse: collapse; }}
                th, td {{ padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }}
                .price {{ font-weight: bold; color: #28a745; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Quote Request #{quote_request.id}</h1>
                </div>
                
                <div class="section">
                    <h2>Customer Information</h2>
                    <table>
                        <tr>
                            <th>Name:</th>
                            <td>{quote_request.firstname} {quote_request.lastname}</td>
                        </tr>
                        <tr>
                            <th>Email:</th>
                            <td>{quote_request.email}</td>
                        </tr>
                        <tr>
                            <th>Phone:</th>
                            <td>{quote_request.phone}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <h2>Service Details</h2>
                    <table>
                        <tr>
                            <th>Bedrooms:</th>
                            <td>{quote_request.bedroom}</td>
                        </tr>
                        <tr>
                            <th>Bathrooms:</th>
                            <td>{quote_request.bathroom}</td>
                        </tr>
                        <tr>
                            <th>Square Feet:</th>
                            <td>{quote_request.squarefeet}</td>
                        </tr>
                        <tr>
                            <th>Frequency:</th>
                            <td>{quote_request.frequency}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <h2>Selected Add-ons</h2>
                    <table>
                        {addon_rows}
                    </table>
                </div>
                
                <div class="section">
                    <h2>Price Information</h2>
                    <table>
                        <tr>
                            <th>Calculated Price:</th>
                            <td class="price">${price}</td>
                        </tr>
                        <tr>
                            <th>Date Created:</th>
                            <td>{quote_request.date_created.strftime('%Y-%m-%d %H:%M:%S')}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create plain text version
        plain_message = f"""
        New Quote Request #{quote_request.id}
        
        CUSTOMER INFORMATION:
        Name: {quote_request.firstname} {quote_request.lastname}
        Email: {quote_request.email}
        Phone: {quote_request.phone}
        
        SERVICE DETAILS:
        Bedrooms: {quote_request.bedroom}
        Bathrooms: {quote_request.bathroom}
        Square Feet: {quote_request.squarefeet}
        Frequency: {quote_request.frequency}
        
        SELECTED ADD-ONS:
        """
        
        for name, value in selected_addons.items():
            plain_message += f"- {format_title(name)}: {value}\n"
        
        if not selected_addons:
            plain_message += "No add-ons selected\n"
        
        plain_message += f"""
        PRICE INFORMATION:
        Calculated Price: ${price}
        Date Created: {quote_request.date_created.strftime('%Y-%m-%d %H:%M:%S')}
        """
        
        # Send email
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['djaninandapetrus@gmail.com'],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
    
    def calculate_price(self, data):
        """
        Use PriceCalculator service to calculate the price without taxes
        """
        # Keep the original calculate_price method unchanged
        calculator = PriceCalculator()
        
        # Extract data needed for calculation
        square_feet = data.get('squarefeet')
        bedrooms = data.get('bedroom', '1')
        bathrooms = data.get('bathroom', '1')
        frequency = data.get('frequency', 'onetime')
        
        # Map frequency values
        frequency_mapping = {
            'weekly': 'EVERY_WEEK',
            'biweekly': 'EVERY_2_WEEKS',
            'monthly': 'EVERY_4_WEEKS',
            'onetime': 'ONE_TIME'
        }
        frequency_code = frequency_mapping.get(frequency, 'ONE_TIME')
        
        # Calculate base price
        base_price = calculator.calculate_base_price(bedrooms, bathrooms, square_feet)
        
        # Calculate add-ons price
        addons_total = Decimal('0')
        
        # Handle bedrooms and bathrooms for addon calculations
        try:
            bedrooms_count = int(bedrooms)
        except (ValueError, TypeError):
            bedrooms_count = 1
            
        try:
            bathrooms_count = int(bathrooms)
            if bathrooms_count == 7:  # Handle "No Bathroom" case
                bathrooms_count = 0
        except (ValueError, TypeError):
            bathrooms_count = 1
        
        # Add-ons calculations
        if data.get('deluxe_cleaning', False):
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'deluxe cleaning', 'base_price': Decimal('49'), 'variable_price': True}),
                bedrooms_count,
                bathrooms_count
            )
            
        if data.get('heavy_duty', False):
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'heavy duty', 'base_price': Decimal('49'), 'variable_price': True}),
                bedrooms_count,
                bathrooms_count
            )
            
        if data.get('inside_fridge', 0) > 0:
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'inside fridge', 'base_price': Decimal('35'), 'variable_price': True}),
                bedrooms_count,
                bathrooms_count,
                quantity=data.get('inside_fridge', 0)
            )
            
        if data.get('inside_oven', 0) > 0:
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'inside oven', 'base_price': Decimal('35'), 'variable_price': True}),
                bedrooms_count,
                bathrooms_count,
                quantity=data.get('inside_oven', 0)
            )
            
        if data.get('inside_cabinets', False):
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'inside cabinets', 'base_price': Decimal('49'), 'variable_price': False}),
                bedrooms_count,
                bathrooms_count
            )
            
        if data.get('load_dishwasher', False):
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'load dishwasher', 'base_price': Decimal('15'), 'variable_price': False}),
                bedrooms_count,
                bathrooms_count
            )
            
        if data.get('handwash_dishes', False):
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'handwash dishes', 'base_price': Decimal('25'), 'variable_price': False}),
                bedrooms_count,
                bathrooms_count
            )
            
        if data.get('laundry_folding', 0) > 0:
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'laundry folding', 'base_price': Decimal('25'), 'variable_price': True}),
                bedrooms_count,
                bathrooms_count,
                quantity=data.get('laundry_folding', 0)
            )
            
        if data.get('eco_friendly', False):
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'eco friendly', 'base_price': Decimal('20'), 'variable_price': False}),
                bedrooms_count,
                bathrooms_count
            )
            
        if data.get('pet_hair_fee', False):
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'pet hair fee', 'base_price': Decimal('20'), 'variable_price': False}),
                bedrooms_count,
                bathrooms_count
            )
            
        if data.get('change_linen', False):
            addons_total += calculator.calculate_addon_price(
                type('AddonMock', (), {'name': 'change linen', 'base_price': Decimal('10'), 'variable_price': True}),
                bedrooms_count,
                bathrooms_count
            )
        
        # Calculate discount
        discount = calculator.calculate_discount(base_price, frequency_code)
        
        # Calculate final price without taxes
        final_price = base_price + addons_total - discount
        
        return round(final_price, 2)
    
class PriceEstimateView(APIView):
    def post(self, request):
        # Create a temporary serializer to validate the data
        serializer = QuoteRequestSerializer(data=request.data)
        if serializer.is_valid():
            # Use the QuoteRequestView's calculate_price method to ensure consistency
            price = QuoteRequestView().calculate_price(serializer.validated_data)
            
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


class BookingView(APIView):
    def post(self, request):
        # Extract data from request
        data = request.data
        
        # Initialize calculator
        calculator = PriceCalculator()
        
        try:
            with transaction.atomic():
                # Extract customer data
                customer_data = data.get('customer', {})
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
                
                # Extract service data
                service_data = data.get('service', {})
                service_type = service_data.get('type')
                bathrooms = service_data.get('bathrooms', 0)
                bedrooms = service_data.get('bedrooms', 1)
                square_feet = service_data.get('squareFeet')
                frequency = service_data.get('frequency')
                
                # Extract schedule data
                schedule_data = data.get('schedule', {})
                service_date = schedule_data.get('date')
                time_window = schedule_data.get('timeWindow')
                is_flexible = schedule_data.get('flexible', 'Not flexible')
                
                # Extract access information
                access_data = schedule_data.get('access', {})
                access_method = access_data.get('method')
                access_instructions = access_data.get('instructions', '')
                
                # Extract additional info
                additional_info = data.get('additionalInfo', {})
                condition = additional_info.get('condition', '')
                special_instructions = additional_info.get('specialInstructions', '')
                referral_source = additional_info.get('referralSource', '')
                
                # Extract parking info
                parking_data = data.get('parking', {})
                parking_instructions = parking_data.get('instructions', '')
                parking_cost = parking_data.get('cost', '$0')
                
                # Convert frontend frequency to backend enum
                frequency_mapping = {
                    'Every Week(Discount 20%)': 'EVERY_WEEK',
                    'Every 2 Weeks(Discount 15%)': 'EVERY_2_WEEKS',
                    'Every 4 Weeks(Discount 10%)': 'EVERY_4_WEEKS',
                    'One Time': 'ONE_TIME'
                }
                frequency_code = frequency_mapping.get(frequency, 'ONE_TIME')
                
                # Convert access method if needed (if not already in backend format)
                # This assumes frontend sends the display value, not the code
                access_mapping = {
                    'Someone will be home': 'HOME',
                    'Doorman': 'DOORMAN',
                    'Key in lockbox': 'LOCKBOX',
                    'Smart lock': 'SMART_LOCK'
                }
                access_code = access_mapping.get(access_method, access_method)
                
                # Calculate base price
                base_price = calculator.calculate_base_price(bedrooms, bathrooms, square_feet)
                
                # Calculate addon prices
                addons = service_data.get('addons', [])
                addons_total = Decimal('0')
                addon_items = []
                
                for addon_item in addons:
                    addon_id = addon_item.get('id')
                    quantity = addon_item.get('quantity', 1)
                    
                    try:
                        addon = AddonOption.objects.get(id=addon_id)
                        
                        addon_price = calculator.calculate_addon_price(
                            addon,
                            bedrooms,
                            bathrooms,
                            quantity
                        )
                        
                        addon_items.append({
                            'addon': addon,
                            'name': addon_item.get('name', addon.name),
                            'quantity': quantity,
                            'price': addon_price
                        })
                        
                        addons_total += addon_price
                        
                    except AddonOption.DoesNotExist:
                        # Create a temporary addon object if it doesn't exist in the database
                        # This is useful for handling new addons or testing
                        temp_price = Decimal(str(addon_item.get('price', 0)))
                        addon_price = temp_price * quantity
                        
                        addon_items.append({
                            'addon': None,
                            'name': addon_item.get('name', 'Unknown Addon'),
                            'quantity': quantity,
                            'price': addon_price
                        })
                        
                        addons_total += addon_price
                
                # Calculate discount
                discount = calculator.calculate_discount(base_price + addons_total, frequency_code)
                
                # Get payment data
                payment_data = data.get('payment', {})
                tip_amount = Decimal(str(payment_data.get('tip', 0)))
                
                # Calculate final totals or use provided values
                if payment_data:
                    subtotal = Decimal(str(payment_data.get('subtotal', 0)))
                    discount_amount = Decimal(str(payment_data.get('discount', 0)))
                    sales_tax = Decimal(str(payment_data.get('tax', 0)))
                    total = Decimal(str(payment_data.get('total', 0)))
                    pricing = {
                        'subtotal': subtotal,
                        'discount': discount_amount,
                        'sales_tax': sales_tax,
                        'total': total
                    }
                else:
                    # Calculate if not provided
                    pricing = calculator.calculate_booking_total(
                        base_price, 
                        addons_total, 
                        discount,
                        tip_amount
                    )
                
                # Create booking
                booking = Booking.objects.create(
                    # Customer and address
                    customer=customer,
                    address=address,
                    
                    # Service details
                    service_type=service_type,
                    bathrooms=bathrooms,
                    bedrooms=bedrooms,
                    square_feet=square_feet,
                    frequency=frequency_code,
                    
                    # Schedule
                    service_date=service_date,
                    time_window=time_window,
                    is_flexible=is_flexible,
                    
                    # Access info
                    access_method=access_code,
                    access_instructions=access_instructions,
                    
                    # Parking
                    parking_instructions=parking_instructions,
                    parking_cost=parking_cost,
                    
                    # Additional info
                    condition=condition,
                    special_instructions=special_instructions,
                    referral_source=referral_source,
                    
                    # Payment details
                    tip_amount=tip_amount,
                    subtotal=pricing['subtotal'],
                    discount=pricing['discount'],
                    sales_tax=pricing['sales_tax'],
                    total=pricing['total'],
                    payment_last_four=data.get('payment', {}).get('cardNumber', '')[-4:] if data.get('payment', {}).get('cardNumber') else None
                )
                
                # Create booking addon relationships
                for item in addon_items:
                    BookingAddon.objects.create(
                        booking=booking,
                        addon=item.get('addon'),  # May be None for temporary addons
                        name=item.get('name'),
                        quantity=item.get('quantity'),
                        price=item.get('price')
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