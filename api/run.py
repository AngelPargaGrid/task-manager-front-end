"""Application entry point."""

import os

from app import create_app, socketio

flask_app = create_app(os.getenv("FLASK_ENV", "development"))
app = flask_app  # For FLASK_APP=run:app

if __name__ == "__main__":
    socketio.run(
        flask_app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5001)),
        debug=True,
        allow_unsafe_werkzeug=True,  # For development without eventlet
    )
