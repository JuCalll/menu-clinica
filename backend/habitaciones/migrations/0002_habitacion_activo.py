# Generated by Django 5.0.7 on 2024-08-15 14:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('habitaciones', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='habitacion',
            name='activo',
            field=models.BooleanField(default=True),
        ),
    ]
