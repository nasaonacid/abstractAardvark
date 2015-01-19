# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Tree',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('depth', models.IntegerField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(4)])),
                ('difficulty', models.CharField(default=b'easy', max_length=6, choices=[(b'easy', b'Easy'), (b'medium', b'Medium'), (b'hard', b'Hard')])),
                ('content', models.TextField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
