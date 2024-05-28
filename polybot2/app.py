from flask import Flask, jsonify
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

@app.route('/')
def home():
    try:
        return jsonify({"status": "Polybot2 Service Running"})
    except Exception as e:
        app.logger.error(f"Error occurred: {e}", exc_info=True)
        return jsonify({"error": "An error occurred"}), 500

if __name__ == '__main__':
    port = os.getenv('PORT', '8000')  # Default to 8000 if PORT not in .env
    try:
        app.run(host='0.0.0.0', port=int(port))
    except Exception as e:
        app.logger.error(f"Failed to start Flask application: {e}", exc_info=True)