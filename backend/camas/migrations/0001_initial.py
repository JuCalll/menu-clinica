# Generated by Django 5.0.2 on 2024-12-09 14:45

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('habitaciones', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cama',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=50)),
                ('activo', models.BooleanField(default=True)),
                ('habitacion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='camas', to='habitaciones.habitacion')),
            ],
            options={
                'unique_together': {('nombre', 'habitacion')},
            },
        ),
    ]
