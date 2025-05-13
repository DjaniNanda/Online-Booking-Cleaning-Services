import stripe
from decimal import Decimal
from datetime import datetime, timedelta
from django.conf import settings

# Configure Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    """Service class for handling Stripe-related operations"""
    
    @staticmethod
    def create_or_get_customer(email, name, phone=None):
        """
        Create or retrieve a Stripe customer by email
        """
        try:
            # Search for existing customer
            customers = stripe.Customer.list(email=email, limit=1)
            
            if customers and customers.data:
                # Update existing customer
                customer = stripe.Customer.modify(
                    customers.data[0].id,
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
            
        except Exception as e:
            print(f"Error creating/retrieving customer: {str(e)}")
            raise
    
    @staticmethod
    def create_payment_intent(amount, currency='usd', customer_id=None, payment_method_id=None):
        """
        Create a payment intent for a one-time payment
        """
        try:
            intent_params = {
                'amount': int(amount),  # Convert to cents
                'currency': currency,
                'payment_method_types': ['card'],
                'capture_method': 'manual'  # We'll capture manually after confirmation
            }
            
            if customer_id:
                intent_params['customer'] = customer_id
                
            if payment_method_id:
                intent_params['payment_method'] = payment_method_id
                
            payment_intent = stripe.PaymentIntent.create(**intent_params)
            return payment_intent
            
        except Exception as e:
            print(f"Error creating payment intent: {str(e)}")
            raise
    
    @staticmethod
    def confirm_payment_intent(payment_intent_id, payment_method_id):
        """
        Confirm a payment intent with a payment method
        """
        try:
            return stripe.PaymentIntent.confirm(
                payment_intent_id,
                payment_method=payment_method_id
            )
        except Exception as e:
            print(f"Error confirming payment intent: {str(e)}")
            raise
    
    @staticmethod
    def capture_payment_intent(payment_intent_id):
        """
        Capture an authorized payment
        """
        try:
            return stripe.PaymentIntent.capture(payment_intent_id)
        except Exception as e:
            print(f"Error capturing payment intent: {str(e)}")
            raise
    
    @staticmethod
    def create_subscription(customer_id, price_id, payment_method_id, trial_end=None):
        """
        Create a subscription for recurring payments
        """
        try:
            # Attach payment method to customer
            stripe.PaymentMethod.attach(
                payment_method_id,
                customer=customer_id
            )
            
            # Set as default payment method
            stripe.Customer.modify(
                customer_id,
                invoice_settings={
                    'default_payment_method': payment_method_id
                }
            )
            
            # Create the subscription
            subscription_params = {
                'customer': customer_id,
                'items': [{'price': price_id}],
                'payment_behavior': 'default_incomplete',
                'expand': ['latest_invoice.payment_intent']
            }
            
            if trial_end:
                subscription_params['trial_end'] = trial_end
                
            subscription = stripe.Subscription.create(**subscription_params)
            return subscription
            
        except Exception as e:
            print(f"Error creating subscription: {str(e)}")
            raise
    
    @staticmethod
    def create_price(amount, currency='usd', interval='month', interval_count=1, product_name='Cleaning Service'):
        """
        Create a price for recurring payments
        """
        try:
            # Create product if it doesn't exist
            product = stripe.Product.create(
                name=product_name,
                type='service'
            )
            
            # Create price
            price = stripe.Price.create(
                product=product.id,
                unit_amount=int(amount),  # Convert to cents
                currency=currency,
                recurring={
                    'interval': interval,
                    'interval_count': interval_count
                }
            )
            
            return price
            
        except Exception as e:
            print(f"Error creating price: {str(e)}")
            raise
    
    @staticmethod
    def cancel_subscription(subscription_id):
        """
        Cancel a subscription
        """
        try:
            return stripe.Subscription.delete(subscription_id)
        except Exception as e:
            print(f"Error canceling subscription: {str(e)}")
            raise
    
    @staticmethod
    def update_subscription(subscription_id, price_id):
        """
        Update a subscription with a new price
        """
        try:
            return stripe.Subscription.modify(
                subscription_id,
                items=[{
                    'id': stripe.Subscription.retrieve(subscription_id)['items']['data'][0].id,
                    'price': price_id
                }]
            )
        except Exception as e:
            print(f"Error updating subscription: {str(e)}")
            raise
            
    @staticmethod
    def convert_interval_to_stripe_format(interval):
        """
        Convert our internal interval format to Stripe's format
        """
        if interval == 'week':
            return 'week', 1
        elif interval == 'two_weeks':
            return 'week', 2
        elif interval == 'month':
            return 'month', 1
        else:
            return None, None  # one-time payment