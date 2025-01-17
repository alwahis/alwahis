from setuptools import setup, find_packages

setup(
    name="alwahis",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'flask',
        'flask-sqlalchemy',
        'flask-cors',
        'flask-migrate',
        'psycopg2-binary',
        'gunicorn',
        'PyJWT',
        'python-dotenv'
    ]
)
