# Generated by Django 5.1.7 on 2025-04-07 19:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_addonoption_address_booking_bookingaddon_customer_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='addonoption',
            name='quantity',
            field=models.IntegerField(default=1, max_length=50),
        ),
    ]
