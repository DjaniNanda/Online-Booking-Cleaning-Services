from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator


class QuoteRequest(models.Model):
    FREQUENCY_CHOICES = [
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-Weekly'),
        ('monthly', 'Monthly'),
        ('onetime', 'One Time(Deep)'),
    ]
    
    BEDROOM_CHOICES = [(str(i), f"{i} Bedroom{'s' if i > 1 else ''}") for i in range(1, 7)]
    
    BATHROOM_CHOICES = [
        ('1', 'One Bathroom'),
        ('2', 'Two Bathroom'),
        ('3', 'Three Bathroom'),
        ('4', 'Four Bathroom'),
        ('5', 'Five Bathroom'),
        ('6', 'Six Bathroom'),
        ('7', 'No Bathroom'),
    ]
    
    SQUARE_FEET_CHOICES = [
        ('0 – 500 Sq Ft', '0 – 500 Sq Ft'),
        ('501 – 1000 Sq Ft', '501 – 1000 Sq Ft'),
        ('1001 – 1500 Sq Ft', '1001 – 1500 Sq Ft'),
        ('1501 – 2000 Sq Ft', '1501 – 2000 Sq Ft'),
        ('2001 – 2500 Sq Ft', '2001 – 2500 Sq Ft'),
        ('2501 – 3000 Sq Ft', '2501 – 3000 Sq Ft'),
        ('3001 – 3500 Sq Ft', '3001 – 3500 Sq Ft'),
        ('3501 – 4000 Sq Ft', '3501 – 4000 Sq Ft'),
        ('4001 – 4500 Sq Ft', '4001 – 4500 Sq Ft'),
        ('4501 – 5000 Sq Ft', '4501 – 5000 Sq Ft'),
        ('5001 – 5500 Sq Ft', '5001 – 5500 Sq Ft'),
        ('5501 – 6000 Sq Ft', '5501 – 6000 Sq Ft'),
        ('6001 – 6500 Sq Ft', '6001 – 6500 Sq Ft'),
        ('6501 – 7000 Sq Ft', '6501 – 7000 Sq Ft'),
        ('7001 – 7500 Sq Ft', '7001 – 7500 Sq Ft'),
        ('7501 – 8000 Sq Ft', '7501 – 8000 Sq Ft'),
    ]
    
    # Personal Information
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Property Details
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    squarefeet = models.CharField(max_length=20, choices=SQUARE_FEET_CHOICES)
    bedroom = models.CharField(max_length=2, choices=BEDROOM_CHOICES)
    bathroom = models.CharField(max_length=2, choices=BATHROOM_CHOICES)
    # Add-ons
    deluxe_cleaning = models.BooleanField(default=False)
    heavy_duty = models.BooleanField(default=False)
    inside_fridge = models.IntegerField(default=0)  # Number of fridges
    inside_oven = models.IntegerField(default=0)  # Number of ovens
    inside_cabinets = models.BooleanField(default=False)
    load_dishwasher = models.BooleanField(default=False)
    handwash_dishes = models.BooleanField(default=False)
    laundry_folding = models.IntegerField(default=0)  # Number of loads
    eco_friendly = models.BooleanField(default=False)
    pet_hair_fee = models.BooleanField(default=False)
    change_linen = models.BooleanField(default=False)
    
    # Price calculation (optional - can be calculated on the fly)
    calculated_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # Metadata
    date_created = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.firstname} {self.lastname} - {self.created_at}"
    

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    mobile = models.CharField(max_length=20)
    send_text_reminders = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Address(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=255)
    apt = models.CharField(max_length=20, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    zip_code = models.CharField(max_length=10)
    
    def __str__(self):
        return f"{self.street}, {self.city}, {self.state} {self.zip_code}"

class AddonOption(models.Model):
    name = models.CharField(max_length=100)
    base_price = models.DecimalField(max_digits=8, decimal_places=2)
    variable_price = models.BooleanField(default=False)
    formula = models.CharField(max_length=255, blank=True, null=True)
    quantity = models.IntegerField(max_length=50,default=1)
    def __str__(self):
        return self.name

class Booking(models.Model):
    FREQUENCY_CHOICES = [
        ('ONE_TIME', 'One Time'),
        ('EVERY_WEEK', 'Every Week(Discount 20%)'),
        ('EVERY_2_WEEKS', 'Every 2 Weeks(Discount 15%)'),
        ('EVERY_4_WEEKS', 'Every 4 Weeks(Discount 10%)'),
    ]
    
    ACCESS_CHOICES = [
        ('HOME', 'Someone will be home'),
        ('DOORMAN', 'Doorman'),
        ('LOCKBOX', 'Key in lockbox'),
        ('SMART_LOCK', 'Smart lock'),
    ]
    
    # Customer and address info
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    address = models.ForeignKey(Address, on_delete=models.CASCADE)
    
    # Service details
    service_type = models.CharField(max_length=100)
    bathrooms = models.IntegerField(default=0)
    bedrooms = models.IntegerField(default=1)
    square_feet = models.CharField(max_length=50)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    
    # Schedule information
    service_date = models.DateField()
    time_window = models.CharField(max_length=20)
    is_flexible = models.CharField(max_length=50, default='Not flexible')
    
    # Access information
    access_method = models.CharField(max_length=50, choices=ACCESS_CHOICES)
    access_instructions = models.TextField(blank=True, null=True)
    
    # Parking information
    parking_instructions = models.TextField(blank=True, null=True)
    parking_cost = models.CharField(max_length=10, default='$0')
    
    # Additional information
    condition = models.CharField(max_length=100, blank=True, null=True)
    special_instructions = models.TextField(blank=True, null=True)
    referral_source = models.CharField(max_length=100, blank=True, null=True)
    
    # Payment details
    tip_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2)
    sales_tax = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    payment_last_four = models.CharField(max_length=4, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Booking {self.id} - {self.customer}"

class BookingAddon(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='addons')
    addon = models.ForeignKey(AddonOption, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    
    def __str__(self):
        return f"{self.addon.name} ({self.quantity}) - ${self.price}"
