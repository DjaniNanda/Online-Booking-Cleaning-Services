# services.py
from decimal import Decimal
from math import ceil

class PriceCalculator:
    def __init__(self):
        self.TAX_RATE = Decimal('0.13')  # 13% tax rate
    
    def calculate_base_price(self, bedrooms, bathrooms, square_feet):
        """Calculate base price based on home size"""
        base_price = Decimal('99')
        
        # Extract numeric values from strings
        try:
            bathrooms_count = int(bathrooms.split(' ')[0])
        except (ValueError, AttributeError, IndexError):
            bathrooms_count = 0
            
        try:
            bedrooms_count = int(bedrooms.split(' ')[0])
        except (ValueError, AttributeError, IndexError):
            bedrooms_count = 1
            
        # Calculate square feet multiplier
        sq_ft_min = 0
        try:
            sq_ft_parts = square_feet.split(' – ')
            sq_ft_min = int(sq_ft_parts[0])
        except (ValueError, AttributeError, IndexError):
            sq_ft_min = 0
        
        
        sq_ft_multiplier = Decimal(max(1, ceil(sq_ft_min / 500)))
        rooms_price = Decimal('25') * (bathrooms_count + bedrooms_count)
        
        return base_price + (Decimal('30') * sq_ft_multiplier) + rooms_price
    
    def calculate_addon_price(self, addon, bedrooms_count, bathrooms_count, quantity=1):
        """Calculate price for an addon based on its formula"""
        if not addon.variable_price:
            return addon.base_price
        
        if "deluxe cleaning" in addon.name.lower():
            return addon.base_price + (Decimal('15') * (bathrooms_count + bedrooms_count))
        elif "heavy duty" in addon.name.lower():
            return addon.base_price + (Decimal('5') * (bathrooms_count + bedrooms_count))
        elif any(item in addon.name.lower() for item in ["inside fridge", "inside oven", "laundry"]):
            return addon.base_price * Decimal(quantity)
        elif "change linen" in addon.name.lower():
            return addon.base_price * bedrooms_count
        else:
            return addon.base_price
    
    def calculate_discount(self, base_price, frequency):
        """Calculate discount based on frequency"""
        discount_rates = {
            'EVERY_WEEK': Decimal('0.10'),
            'EVERY_2_WEEKS': Decimal('0.15'),
            'EVERY_4_WEEKS': Decimal('0.20'),
            'ONE_TIME': Decimal('0')
        }
        
        discount_rate = discount_rates.get(frequency, Decimal('0'))
        return (base_price * discount_rate).quantize(Decimal('0.01'))
    
    def calculate_booking_total(self, base_price, addons_total, discount, tip_amount=Decimal('0')):
        """Calculate final booking total including tax"""
        subtotal = base_price + addons_total
        total_before_tax = subtotal - discount + tip_amount
        sales_tax = (total_before_tax * self.TAX_RATE).quantize(Decimal('0.01'))
        
        return {
            'subtotal': subtotal,
            'discount': discount,
            'sales_tax': sales_tax,
            'total': total_before_tax + sales_tax
        }
