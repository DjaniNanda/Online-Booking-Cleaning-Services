from django.db import migrations


def remove_addon_options(apps, schema_editor):
    # Get the model
    AddonOption = apps.get_model('api', 'AddonOption')
    
    # Delete all addon options - use a safer method that doesn't rely on specific IDs
    AddonOption.objects.all().delete()

def add_addon_options(apps, schema_editor):
    # Get the model
    AddonOption = apps.get_model('api', 'AddonOption')
    
    # Create addon options from the table - without specifying IDs
    addon_options = [
        AddonOption(
            id=11, 
            name="Change Linens", 
            base_price=10.00, 
            variable_price=True, 
            formula="Base price * bedroom",
            quantity=1
        ),
        AddonOption(
            id=10, 
            name="Pet Hair Fee", 
            base_price=20.00, 
            variable_price=False, 
            formula="",  # Using empty string instead of None
            quantity=1
        ),
        AddonOption(
            id=9, 
            name="Eco-friendly Products", 
            base_price=20.00, 
            variable_price=False, 
            formula="",
            quantity=1
        ),
        AddonOption(
            id=8, 
            name="Laundry & Folding", 
            base_price=25.00, 
            variable_price=True, 
            formula="Base price * Quantity",
            quantity=1
        ),
        AddonOption(
            id=7, 
            name="Handwash Dishes", 
            base_price=25.00, 
            variable_price=False, 
            formula="",
            quantity=1
        ),
        AddonOption(
            id=6, 
            name="Load Dishwasher", 
            base_price=15.00, 
            variable_price=False, 
            formula="",
            quantity=1
        ),
        AddonOption(
            id=5, 
            name="Inside Cabinets", 
            base_price=49.00, 
            variable_price=False, 
            formula="",
            quantity=1
        ),
        AddonOption(
            id=4, 
            name="Inside Oven", 
            base_price=35.00, 
            variable_price=True, 
            formula="Base price * Quantity",
            quantity=1
        ),
        AddonOption(
            id=3, 
            name="Inside Fridge", 
            base_price=35.00, 
            variable_price=True, 
            formula="Base price * Quantity",
            quantity=1
        ),
        AddonOption(
            id=2, 
            name="Heavy Duty", 
            base_price=49.00, 
            variable_price=True, 
            formula="5 * (bathroom + bedroom)",
            quantity=1
        ),
        AddonOption(
            id=1, 
            name="Deluxe Cleaning", 
            base_price=49.00, 
            variable_price=True, 
            formula="15 * (bathroom + bedroom)",
            quantity=1
        ),
    ]
    
    # Create one by one to better handle errors
    for option in addon_options:
        option.save()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_bookingaddon_name'),  
    ]

    operations = [
        migrations.RunPython(
            code=add_addon_options,
            reverse_code=remove_addon_options,
        ),
    ]