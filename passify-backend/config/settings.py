import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production")
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    # MySQL connection
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))

    # KDF settings
    KDF_ITERATIONS = int(os.getenv("KDF_ITERATIONS", 100_000))
    KDF_KEY_LENGTH = 32
    SALT_BYTE_LENGTH = 16


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
