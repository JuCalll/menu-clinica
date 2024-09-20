# Generated by Django 5.0.7 on 2024-09-20 11:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('menus', '0001_initial'),
        ('pacientes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pedido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pendiente', 'Pendiente'), ('en_proceso', 'En Proceso'), ('completado', 'Completado')], default='pendiente', max_length=20)),
                ('fecha_pedido', models.DateTimeField(auto_now_add=True)),
                ('adicionales', models.JSONField(blank=True, default=dict)),
                ('sectionStatus', models.JSONField(blank=True, default=dict)),
                ('menu', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='menus.menu')),
                ('paciente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pacientes.paciente')),
            ],
        ),
        migrations.CreateModel(
            name='PedidoMenuOption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('selected', models.BooleanField(default=False)),
                ('menu_option', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='menus.menuoption')),
                ('pedido', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pedidos.pedido')),
            ],
        ),
        migrations.AddField(
            model_name='pedido',
            name='opciones',
            field=models.ManyToManyField(blank=True, related_name='pedidos', through='pedidos.PedidoMenuOption', to='menus.menuoption'),
        ),
    ]
