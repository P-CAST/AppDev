import logging
from flask import Flask
from config.settings import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.passwords import passwords_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(passwords_bp, url_prefix="/api/passwords")

    return app
