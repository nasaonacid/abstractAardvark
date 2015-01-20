# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('abstractAardvark', '0003_auto_20150118_2153'),
    ]

    operations = [
        migrations.AlterField(
            model_name='node',
            name='level',
            field=models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(4)]),
        ),
        migrations.AlterField(
            model_name='tree',
            name='height',
            field=models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(4)]),
        ),
    ]
