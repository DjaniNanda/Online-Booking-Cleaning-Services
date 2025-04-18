# Generated by Django 5.1.7 on 2025-04-01 10:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuoteRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(max_length=20)),
                ('frequency', models.CharField(choices=[('weekly', 'Weekly'), ('biweekly', 'Bi-Weekly'), ('triweekly', 'Tri-Weekly'), ('monthly', 'Monthly'), ('onetime', 'One Time(Deep)')], max_length=20)),
                ('square_feet', models.CharField(choices=[('0 – 500 Sq Ft', '0 – 500 Sq Ft'), ('501 – 1000 Sq Ft', '501 – 1000 Sq Ft'), ('1001 – 1500 Sq Ft', '1001 – 1500 Sq Ft'), ('1501 – 2000 Sq Ft', '1501 – 2000 Sq Ft'), ('2001 – 2500 Sq Ft', '2001 – 2500 Sq Ft'), ('2501 – 3000 Sq Ft', '2501 – 3000 Sq Ft'), ('3001 – 3500 Sq Ft', '3001 – 3500 Sq Ft'), ('3501 – 4000 Sq Ft', '3501 – 4000 Sq Ft'), ('4001 – 4500 Sq Ft', '4001 – 4500 Sq Ft'), ('4501 – 5000 Sq Ft', '4501 – 5000 Sq Ft'), ('5001 – 5500 Sq Ft', '5001 – 5500 Sq Ft'), ('5501 – 6000 Sq Ft', '5501 – 6000 Sq Ft'), ('6001 – 6500 Sq Ft', '6001 – 6500 Sq Ft'), ('6501 – 7000 Sq Ft', '6501 – 7000 Sq Ft'), ('7001 – 7500 Sq Ft', '7001 – 7500 Sq Ft'), ('7501 – 8000 Sq Ft', '7501 – 8000 Sq Ft')], max_length=20)),
                ('bedroom', models.CharField(choices=[('1', '1 Bedroom'), ('2', '2 Bedrooms'), ('3', '3 Bedrooms'), ('4', '4 Bedrooms'), ('5', '5 Bedrooms'), ('6', '6 Bedrooms')], max_length=2)),
                ('bathroom', models.CharField(choices=[('1', 'One Bathroom'), ('2', 'Two Bathroom'), ('3', 'Three Bathroom'), ('4', 'Four Bathroom'), ('5', 'Five Bathroom'), ('6', 'Six Bathroom'), ('7', 'No Bathroom')], max_length=2)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.DeleteModel(
            name='Item',
        ),
    ]
