# Generated by Django 5.0.7 on 2024-08-15 14:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('servicios', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='servicio',
            name='activo',
            field=models.BooleanField(default=True),
        ),
    ]
