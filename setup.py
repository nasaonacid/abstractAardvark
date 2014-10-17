# -*- coding: utf-8 -*-
#!/usr/bin/env python

import os
import sys


try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

import abstractAardvark
version = abstractAardvark.__version__

setup(
    name='abstractAardvark',
    version=version,
    author='',
    author_email='jmstewart1991@gmail.com',
    packages=[
        'abstractAardvark',
    ],
    include_package_data=True,
    install_requires=[
        'Django>=1.6.5',
    ],
    zip_safe=False,
    scripts=['abstractAardvark/manage.py'],
)