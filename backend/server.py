"""
Server entry point - imports from modular main.py

This file exists for backward compatibility with supervisor config.
All actual code is in main.py and the routes/models packages.
"""
from main import app

# Re-export app for uvicorn
__all__ = ['app']
