# Generated by Django 5.1.6 on 2025-03-06 09:27

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Patient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=255)),
                ('birth_date', models.DateField()),
                ('card_number', models.CharField(max_length=50, unique=True)),
                ('diagnosis', models.TextField()),
            ],
        ),
    ]
