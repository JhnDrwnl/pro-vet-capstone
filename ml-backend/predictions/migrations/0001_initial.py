# Generated by Django 5.1.7 on 2025-03-11 17:22

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('pets', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Prediction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('prediction_date', models.DateTimeField(auto_now_add=True)),
                ('predicted_disease', models.CharField(max_length=200)),
                ('confidence_score', models.FloatField()),
                ('details', models.JSONField(default=dict)),
                ('is_confirmed', models.BooleanField(default=False)),
                ('confirmed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('medical_record', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pets.medicalrecord')),
                ('pet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pets.pet')),
            ],
        ),
    ]
