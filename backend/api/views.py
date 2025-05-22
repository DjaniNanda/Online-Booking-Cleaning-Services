from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import QuoteRequest, Customer, Address, Booking, AddonOption, BookingAddon, StripePayment
from .serializers import QuoteRequestSerializer, BookingSerializer
from decimal import Decimal
from django.contrib.auth.models import User
from django.db import transaction
from .services import PriceCalculator
from .stripe_service import StripeService
from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags
import json
import stripe

import logging

logger = logging.getLogger(__name__)


# Configure Stripe with your secret key
stripe.api_key = settings.STRIPE_SECRET_KEY

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
                
                # Check if we have Stripe payment details
                stripe_payment = None
                payment_id = payment_data.get('paymentId')
                if payment_id:
                    # Try to get existing payment record first
                    try:
                        stripe_payment = StripePayment.objects.get(payment_id=payment_id)
                        # If this booking is associated with a different payment already, 
                        # we should return an error to prevent duplicate bookings
                        if hasattr(stripe_payment, 'booking'):
                            return Response({
                                'success': False,
                                'error': 'This payment has already been used for another booking',
                                'booking_id': stripe_payment.booking.id
                            }, status=status.HTTP_400_BAD_REQUEST)
                    except StripePayment.DoesNotExist:
                        # Create new payment record only if it doesn't exist
                        stripe_payment = StripePayment.objects.create(
                            payment_id=payment_id,
                            customer_id=payment_data.get('customerId'),
                            subscription_id=payment_data.get('subscriptionId'),
                            amount=pricing['total'],
                            payment_status='succeeded',
                            payment_method=payment_id,
                            is_recurring=frequency_code != 'ONE_TIME'
                        )
                    
                    # Update the customer with their Stripe ID
                    if payment_data.get('customerId') and not customer.stripe_customer_id:
                        customer.stripe_customer_id = payment_data.get('customerId')
                        customer.save()
                
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
                    payment_last_four=data.get('payment', {}).get('cardNumber', '')[-4:] if data.get('payment', {}).get('cardNumber') else None,
                    
                    # Stripe payment
                    stripe_payment=stripe_payment
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
                
                # Send confirmation email to customer
                self.send_booking_confirmation_email(booking, addon_items, pricing)
                
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
                
    def send_booking_confirmation_email(self, booking, addon_items, pricing):
        """Send a confirmation email to the customer with booking details."""
        try:
            # Get display versions of enum values
            frequency_display = {
                'EVERY_WEEK': 'Every Week',
                'EVERY_2_WEEKS': 'Every 2 Weeks',
                'EVERY_4_WEEKS': 'Every 4 Weeks',
                'ONE_TIME': 'One Time'
            }.get(booking.frequency, 'One Time')
            
            access_display = {
                'HOME': 'Someone will be home',
                'DOORMAN': 'Doorman',
                'LOCKBOX': 'Key in lockbox',
                'SMART_LOCK': 'Smart lock'
            }.get(booking.access_method, booking.access_method)
            
            # Format the date - handle both string and datetime objects
            if isinstance(booking.service_date, str):
                # If it's already a string, use it directly or parse it first if needed
                service_date = booking.service_date
                try:
                    # Try to parse the string into a datetime for better formatting
                    from datetime import datetime
                    parsed_date = datetime.strptime(booking.service_date, '%Y-%m-%d')
                    service_date = parsed_date.strftime('%A, %B %d, %Y')
                except (ValueError, TypeError):
                    # If parsing fails, use the string as is
                    pass
            else:
                # If it's a datetime object, format it
                service_date = booking.service_date.strftime('%A, %B %d, %Y')
            
            # Format address
            address_str = f"{booking.address.street}"
            if booking.address.apt:
                address_str += f", Apt {booking.address.apt}"
            address_str += f", {booking.address.city}, {booking.address.state} {booking.address.zip_code}"
            
            # Format addons list
            addons_list = ""
            if addon_items:
                for item in addon_items:
                    addons_list += f"- {item['name']} (Qty: {item['quantity']}): ${float(item['price']):.2f}\n"
            else:
                addons_list = "No additional services selected"
            
            # Build the email subject
            subject = f" Your cleaning is scheduled!"
            
            # Build the email message
            message = f"""
Hello {booking.customer.first_name},

Thank you for booking with us! Your cleaning service has been successfully scheduled.

Booking Details:
----------------
Date: {service_date}
Time Window: {booking.time_window}
Address: {address_str}

Service Details:
---------------
Bedrooms: {booking.bedrooms}
Bathrooms: {booking.bathrooms}
Square Feet: {booking.square_feet}
Frequency: {frequency_display}

Access Method:
-------------
{access_display}
Instructions: {booking.access_instructions}

Parking Information:
------------------
Instructions: {booking.parking_instructions}
Parking Cost: {booking.parking_cost}

Additional Services:
------------------
{addons_list}

Payment Summary:
--------------
Subtotal: ${float(pricing['subtotal']):.2f}
Discount: ${float(pricing['discount']):.2f}
Sales Tax: ${float(pricing['sales_tax']):.2f}
Tip: ${float(booking.tip_amount):.2f}
Total: ${float(pricing['total']):.2f}

Special Instructions:
-------------------
{booking.special_instructions}

If you need to modify or cancel your booking, please contact us at lovelyserenitycorporation@gmail.com or call +1(647)913-7817 at least 24 hours before your scheduled service.

Thank you for choosing our cleaning service!

Best regards,
Lovely Serenity Corp 
"""
            # Get the customer's email
            recipient_email = booking.customer.email
            
            # Send the email
            from django.core.mail import send_mail
            send_mail(
                subject=subject,
                message=message,
                from_email='lovelyserenitycorporation@gmail.com',  # Replace with your actual sender email
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            
            # Log the email sending
            logger.info(f"Confirmation email sent to {recipient_email} for booking #{booking.id}")
            
        except Exception as e:
            # Log the error but don't interrupt the response to the user
            logger.error(f"Failed to send confirmation email for booking #{booking.id}: {str(e)}")

class StripePaymentView(APIView):
    """
    Combined view for creating and processing Stripe payments
    All Stripe functionality is contained within this view class
    """
    def post(self, request):
        try:
            # Extract data from request
            data = request.data
            amount = data.get('amount')  # Frontend should send this in cents (already multiplied by 100)
            currency = data.get('currency', 'cad')
            customer_email = data.get('customer_email')
            customer_name = data.get('customer_name')
            customer_phone = data.get('customer_phone')
            payment_type = data.get('payment_type', 'one_time')
            payment_method_id = data.get('payment_method_id')
            interval = data.get('interval', 'one_time')
            
            # Create or get Stripe customer
            customer = self._create_or_get_customer(
                email=customer_email,
                name=customer_name,
                phone=customer_phone
            )
            
            # Update local customer with Stripe ID if needed
            try:
                db_customer = Customer.objects.get(email=customer_email)
                if not db_customer.stripe_customer_id:
                    db_customer.stripe_customer_id = customer.id
                    db_customer.save()
            except Customer.DoesNotExist:
                pass
            
            # Handle one-time payments
            if payment_type == 'one_time':
                # No changes needed to one-time payment flow
                payment_intent = self._create_payment_intent(
                    amount=amount,
                    currency=currency,
                    customer_id=customer.id
                )
                
                # If payment_method_id is provided, confirm the payment immediately
                if payment_method_id:
                    # Attach payment method to customer if not already attached
                    self._attach_payment_method_to_customer(
                        payment_method_id=payment_method_id,
                        customer_id=customer.id
                    )
                    
                    # Confirm the payment intent
                    payment_intent = self._confirm_payment_intent(
                        payment_intent_id=payment_intent.id,
                        payment_method_id=payment_method_id
                    )
                    
                    # Capture the payment if needed
                    if payment_intent.status == 'requires_capture':
                        payment_intent = self._capture_payment_intent(
                            payment_intent_id=payment_intent.id
                        )
                    
                    # Store the payment in our database if payment is successful
                    if payment_intent.status in ['succeeded', 'requires_capture']:
                        stripe_payment = StripePayment.objects.create(
                            payment_id=payment_intent.id,
                            customer_id=customer.id,
                            amount=Decimal(amount) / 100,  # Convert from cents
                            currency=currency,
                            payment_status=payment_intent.status,
                            payment_method=payment_method_id,
                            is_recurring=False
                        )
                    
                    return Response({
                        'success': True,
                        'payment_id': payment_intent.id,
                        'customer_id': customer.id,
                        'status': payment_intent.status,
                        'client_secret': payment_intent.client_secret,
                        'requires_action': payment_intent.status == 'requires_action',
                        'payment_intent_status': payment_intent.status
                    })
                
                # If no payment_method_id, just return the client secret
                return Response({
                    'success': True,
                    'client_secret': payment_intent.client_secret,
                    'customer_id': customer.id,
                    'payment_intent_id': payment_intent.id
                })
            
            # Handle recurring payments
            else:
                # Convert our interval to Stripe format
                interval_name, interval_count = self._convert_interval_to_stripe_format(interval)
                
                if not interval_name:
                    return Response({
                        'success': False,
                        'error': 'Invalid interval for recurring payment'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create a price for the subscription
                price = self._create_price(
                    amount=amount,
                    currency=currency,
                    interval=interval_name,
                    interval_count=interval_count,
                    product_name=f'Cleaning Service ({interval})'
                )
                
                # If payment_method_id is provided, create and handle subscription
                if payment_method_id:
                    try:
                        # Attach payment method to customer if not already attached
                        self._attach_payment_method_to_customer(
                            payment_method_id=payment_method_id,
                            customer_id=customer.id
                        )
                        
                        # Create the subscription with automatic confirmation
                        subscription = self._create_subscription_with_auto_confirm(
                            customer_id=customer.id,
                            price_id=price.id,
                            payment_method_id=payment_method_id
                        )
                        
                        # Check subscription status
                        if subscription.status in ['active', 'trialing']:
                            # Subscription was created successfully
                            stripe_payment = StripePayment.objects.create(
                                payment_id='sub_' + subscription.id,
                                customer_id=customer.id,
                                subscription_id=subscription.id,
                                amount=Decimal(amount) / 100,  # Convert from cents
                                currency=currency,
                                payment_status=subscription.status,
                                payment_method=payment_method_id,
                                is_recurring=True
                            )
                            
                            return Response({
                                'success': True,
                                'payment_id': 'sub_' + subscription.id,
                                'customer_id': customer.id,
                                'subscription_id': subscription.id,
                                'status': subscription.status,
                                'requires_action': False
                            })
                        
                        # If the subscription requires action (usually for 3D Secure)
                        elif subscription.status == 'incomplete':
                            # Check if we have the latest invoice
                            if subscription.latest_invoice:
                                invoice = subscription.latest_invoice
                                
                                # Check if there's a payment intent
                                payment_intent = None
                                if hasattr(invoice, 'payment_intent') and invoice.payment_intent:
                                    if isinstance(invoice.payment_intent, str):
                                        # Fetch the full payment intent
                                        payment_intent = stripe.PaymentIntent.retrieve(invoice.payment_intent)
                                    else:
                                        payment_intent = invoice.payment_intent
                                
                                # If we have a payment intent that requires action
                                if payment_intent and payment_intent.status == 'requires_action':
                                    return Response({
                                        'success': True,  # Mark as success so frontend can handle it
                                        'payment_id': payment_intent.id,
                                        'customer_id': customer.id,
                                        'subscription_id': subscription.id,
                                        'status': payment_intent.status,
                                        'requires_action': True,
                                        'client_secret': payment_intent.client_secret
                                    })
                            
                            # If we got here, the subscription is incomplete for other reasons
                            return Response({
                                'success': False,
                                'error': 'The subscription could not be completed automatically.',
                                'subscription_id': subscription.id,
                                'status': subscription.status
                            }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Other subscription statuses indicate an issue
                        else:
                            return Response({
                                'success': False,
                                'error': f"Subscription status: {subscription.status}. Please check your payment method.",
                                'subscription_id': subscription.id,
                                'status': subscription.status
                            }, status=status.HTTP_400_BAD_REQUEST)
                    
                    except Exception as e:
                        import traceback
                        error_msg = str(e)
                        print(f"Subscription error: {error_msg}")
                        print(traceback.format_exc())
                        
                        return Response({
                            'success': False,
                            'error': error_msg
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                # If no payment_method_id, create setup intent for future subscription
                else:
                    setup_intent = self._create_setup_intent(
                        customer_id=customer.id
                    )
                    
                    return Response({
                        'success': True,
                        'setup_intent_id': setup_intent.id,
                        'client_secret': setup_intent.client_secret,
                        'customer_id': customer.id,
                        'price_id': price.id
                    })
                
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        """
        Update an existing payment intent or subscription
        """
        try:
            data = request.data
            payment_intent_id = data.get('payment_intent_id')
            payment_method_id = data.get('payment_method_id')
            
            if not payment_intent_id or not payment_method_id:
                return Response({
                    'success': False,
                    'error': 'Payment intent ID and payment method ID are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Confirm the payment intent with the new payment method
            payment_intent = self._confirm_payment_intent(
                payment_intent_id=payment_intent_id,
                payment_method_id=payment_method_id
            )
            
            # Capture the payment if needed
            if payment_intent.status == 'requires_capture':
                payment_intent = self._capture_payment_intent(
                    payment_intent_id=payment_intent.id
                )
            
            # Update the payment in our database
            try:
                stripe_payment = StripePayment.objects.get(payment_id=payment_intent.id)
                stripe_payment.payment_status = payment_intent.status
                stripe_payment.payment_method = payment_method_id
                stripe_payment.save()
            except StripePayment.DoesNotExist:
                pass
            
            return Response({
                'success': True,
                'payment_id': payment_intent.id,
                'status': payment_intent.status,
                'requires_action': payment_intent.status == 'requires_action',
                'client_secret': payment_intent.client_secret if payment_intent.status == 'requires_action' else None
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    # Helper methods for Stripe operations
    def _create_subscription_with_auto_confirm(self, customer_id, price_id, payment_method_id):
        """
        Create a subscription for a customer with automatic confirmation
        """
        try:
            # First ensure the payment method is the default for the customer
            stripe.Customer.modify(
                customer_id,
                invoice_settings={
                    'default_payment_method': payment_method_id
                }
            )
            
            # Create subscription with basic expansion of latest_invoice
            subscription_params = {
                'customer': customer_id,
                'items': [{'price': price_id}],
                'default_payment_method': payment_method_id,
                'expand': ['latest_invoice']  # Just expand the invoice
            }
            
            subscription = stripe.Subscription.create(**subscription_params)
            
            # Now let's handle potential different response formats
            if subscription.latest_invoice:
                # Get the invoice object, whether directly or by fetching
                invoice = None
                if isinstance(subscription.latest_invoice, str):
                    # It's just an ID, fetch the full invoice
                    invoice = stripe.Invoice.retrieve(subscription.latest_invoice)
                else:
                    # It's already the expanded invoice object
                    invoice = subscription.latest_invoice
                
                # Now handle the payment intent if it exists
                if hasattr(invoice, 'payment_intent') and invoice.payment_intent:
                    payment_intent_id = invoice.payment_intent
                    if isinstance(payment_intent_id, str):
                        # It's just the ID, fetch the full payment intent
                        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
                        # Store it back on the invoice
                        invoice.payment_intent = payment_intent
                
                # Store the processed invoice back on the subscription
                subscription.latest_invoice = invoice
                
            return subscription
            
        except Exception as e:
            print(f"Error in create_subscription_with_auto_confirm: {str(e)}")
            import traceback
            print(traceback.format_exc())
            raise e  # Re-raise the exception
    
    def _create_or_get_customer(self, email, name, phone):
        """
        Create a new customer or get existing one
        """
        # Check if customer already exists
        existing_customers = stripe.Customer.list(email=email, limit=1)
        
        if existing_customers and existing_customers.data:
            customer = existing_customers.data[0]
            # Update customer info if needed
            if (customer.name != name or 
                (customer.phone != phone and phone is not None)):
                customer = stripe.Customer.modify(
                    customer.id,
                    name=name,
                    phone=phone
                )
            return customer
        
        # Create new customer
        customer = stripe.Customer.create(
            email=email,
            name=name,
            phone=phone
        )
        
        return customer
    
    def _create_payment_intent(self, amount, currency, customer_id, payment_method_id=None):
        """
        Create a payment intent
        """
        intent_params = {
            'amount': amount,
            'currency': currency,
            'customer': customer_id,
            'setup_future_usage': 'off_session',
            'automatic_payment_methods': {
                'enabled': True,
                'allow_redirects': 'never'  # Disable redirect-based payment methods
            }
        }
        
        if payment_method_id:
            intent_params['payment_method'] = payment_method_id
            intent_params['confirm'] = False  # Don't confirm automatically
    
        payment_intent = stripe.PaymentIntent.create(**intent_params)
        
        return payment_intent
    
    def _confirm_payment_intent(self, payment_intent_id, payment_method_id):
        """
        Confirm a payment intent with a payment method
        """
        payment_intent = stripe.PaymentIntent.confirm(
            payment_intent_id,
            payment_method=payment_method_id
        )
        
        return payment_intent
    
    def _capture_payment_intent(self, payment_intent_id):
        """
        Capture an authorized payment intent
        """
        payment_intent = stripe.PaymentIntent.capture(payment_intent_id)
        
        return payment_intent
    
    def _convert_interval_to_stripe_format(self, interval):
        """
        Convert our interval format to Stripe's format
        """
        interval_map = {
            'week': ('week', 1),
            'two_weeks': ('week', 2),
            'month': ('month', 1),
            'one_time': (None, None)
        }
        
        return interval_map.get(interval, (None, None))
    
    def _create_price(self, amount, currency, interval, interval_count, product_name):
        """
        Create a price for a subscription
        """
        # First create the product if it doesn't exist
        products = stripe.Product.list(limit=1, active=True)
        if products and products.data:
            product = products.data[0]
        else:
            product = stripe.Product.create(
                name=product_name,
                type='service'
            )
        
        # Then create the price
        price = stripe.Price.create(
            product=product.id,
            unit_amount=amount,
            currency=currency,
            recurring={
                'interval': interval,
                'interval_count': interval_count
            }
        )
        
        return price
    
    def _attach_payment_method_to_customer(self, payment_method_id, customer_id):
        """
        Attach a payment method to a customer
        """
        payment_method = stripe.PaymentMethod.attach(
            payment_method_id,
            customer=customer_id
        )
        
        # Set as the default payment method for the customer
        stripe.Customer.modify(
            customer_id,
            invoice_settings={
                'default_payment_method': payment_method_id
            }
        )
        
        return payment_method
    
    def _create_setup_intent(self, customer_id):
        """
        Create a setup intent for a customer
        """
        setup_intent = stripe.SetupIntent.create(
            customer=customer_id,
            usage='off_session'
        )
        
        return setup_intent

class StripeWebhookView(APIView):
    """
    Handle Stripe webhooks
    """
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            
            # Handle different event types
            if event.type == 'payment_intent.succeeded':
                payment_intent = event.data.object
                # Update payment status in our database
                try:
                    payment = StripePayment.objects.get(payment_id=payment_intent.id)
                    payment.payment_status = 'succeeded'
                    payment.save()
                except StripePayment.DoesNotExist:
                    pass
                    
            elif event.type == 'payment_intent.payment_failed':
                payment_intent = event.data.object
                # Update payment status in our database
                try:
                    payment = StripePayment.objects.get(payment_id=payment_intent.id)
                    payment.payment_status = 'failed'
                    payment.save()
                except StripePayment.DoesNotExist:
                    pass
                    
            elif event.type == 'customer.subscription.deleted':
                subscription = event.data.object
                # Update subscription status in our database
                try:
                    payment = StripePayment.objects.get(subscription_id=subscription.id)
                    payment.payment_status = 'canceled'
                    payment.save()
                except StripePayment.DoesNotExist:
                    pass
                    
            # Return a response to acknowledge receipt of the event
            return Response({'status': 'success'})
            
        except ValueError as e:
            # Invalid payload
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
            
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StripeCancelSubscriptionView(APIView):
    """
    Cancel a Stripe subscription
    """
    def post(self, request, subscription_id):
        try:
            # Cancel the subscription in Stripe
            subscription = StripeService.cancel_subscription(subscription_id)
            
            # Update our database
            try:
                payment = StripePayment.objects.get(subscription_id=subscription_id)
                payment.payment_status = 'canceled'
                payment.save()
            except StripePayment.DoesNotExist:
                pass
                
            return Response({
                'success': True,
                'status': 'canceled'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)