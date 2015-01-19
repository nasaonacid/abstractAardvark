# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('abstractAardvark', '0002_auto_20150118_1412'),
    ]

    operations = [
        migrations.RenameField(
            model_name='tree',
            old_name='content',
            new_name='root',
        ),
    ]
