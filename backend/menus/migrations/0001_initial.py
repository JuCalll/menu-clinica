# Generated by Django 5.0.7 on 2024-11-29 12:42

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Menu',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='MenuSection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=255)),
                ('menu', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sections', to='menus.menu')),
            ],
        ),
        migrations.CreateModel(
            name='MenuOption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('texto', models.CharField(max_length=255)),
                ('tipo', models.CharField(choices=[('entrada', 'Entrada'), ('huevos', 'Huevos'), ('acompanante', 'Acompañante'), ('toppings', 'Toppings'), ('bebidas', 'Bebidas'), ('media_manana_fit', 'Media Mañana Fit'), ('media_manana_tradicional', 'Media Mañana Tradicional'), ('bebidas_calientes', 'Bebidas Calientes'), ('bebidas_frias', 'Bebidas Frías'), ('sopa_del_dia', 'Sopa del Día'), ('plato_principal', 'Plato Principal'), ('vegetariano', 'Vegetariano'), ('vegetales', 'Vegetales'), ('postre', 'Postre'), ('refrigerio_fit', 'Refrigerio Fit'), ('refrigerio_tradicional', 'Refrigerio Tradicional'), ('adicionales', 'Adicionales')], max_length=50)),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='options', to='menus.menusection')),
            ],
        ),
    ]
