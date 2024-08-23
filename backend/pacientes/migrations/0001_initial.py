# Generated by Django 5.0.7 on 2024-08-22 21:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('camas', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Paciente',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('cedula', models.CharField(max_length=20, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('recommended_diet', models.CharField(max_length=255)),
                ('activo', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('cama', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='camas.cama')),
            ],
        ),
    ]
