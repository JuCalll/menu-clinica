# Generated by Django 5.0.2 on 2024-12-09 14:45

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='LogEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('CREATE', 'Create'), ('UPDATE', 'Update'), ('DELETE', 'Delete'), ('LOGIN', 'Login'), ('LOGOUT', 'Logout'), ('LOGIN_FAILED', 'Login Failed'), ('TOKEN_REFRESH', 'Token Refresh'), ('LIST', 'List')], help_text='Tipo de acción realizada', max_length=20)),
                ('model_name', models.CharField(help_text='Nombre del modelo afectado', max_length=100)),
                ('object_id', models.IntegerField(blank=True, help_text='ID del objeto afectado', null=True)),
                ('details', models.JSONField(default=dict, help_text='Detalles específicos de la acción')),
                ('timestamp', models.DateTimeField(auto_now_add=True, help_text='Fecha y hora de la acción')),
                ('user', models.ForeignKey(blank=True, help_text='Usuario que realizó la acción', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='custom_logs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
    ]
