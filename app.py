from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(env_path, override=True)

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

DB_PATH = 'breaches.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/check_password', methods=['GET'])
def check_password():
    prefix = request.args.get('prefix')
    if not prefix or len(prefix) != 5:
        return jsonify({'error': 'Valid 5 character prefix required'}), 400
        
    prefix = prefix.upper()
    # Connect to the REAL Have I Been Pwned API database!
    # This database contains over 12.5 billion breached passwords.
    hibp_url = f"https://api.pwnedpasswords.com/range/{prefix}"
    headers = {
        "User-Agent": "CyberSentinel-BreachChecker-Demo"
    }
    
    try:
        response = requests.get(hibp_url, headers=headers)
        if response.status_code == 200:
            # HIBP returns the exact same format we were mocking (SUFFIX:COUNT)
            return response.text, 200, {'Content-Type': 'text/plain'}
        else:
            return jsonify({'error': 'Failed to reach breach database'}), 502
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/check_email', methods=['GET'])
def check_email():
    email_hash = request.args.get('hash')
    if not email_hash or len(email_hash) != 64:
        return jsonify({'error': 'Valid 64 character SHA-256 hash required'}), 400
        
    email_hash = email_hash.lower()
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT 1 FROM breached_emails WHERE hash = ?', (email_hash,))
    row = c.fetchone()
    conn.close()
    
    if row:
        return jsonify({'breached': True})
    return jsonify({'breached': False})

@app.route('/api/cyber_chat', methods=['POST'])
def cyber_chat():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400
        
    msg = data['message']
    
    try:
        import urllib.parse
        
        # We craft a prompt to enforce the persona
        prompt = (
            "You are a cutting-edge Cybersecurity Expert AI named 'Cyber Sentinel'. "
            "Your tone should be professional, precise, and highly analytical. "
            "Do NOT use terms like 'netizen', 'cyber-warrior', or cheesy hacker slang. Your advice must be highly accurate and helpful. "
            "Your job is to answer questions about data breaches, cybersecurity, threat intelligence, and password protection. "
            "Keep your responses concise, action-oriented, and easy to read. Do not use markdown like asterisks or bold text, just plain text.\n\n"
            f"User Query: {msg}\n"
            "Cyber Sentinel:"
        )
        
        # Connect strictly to the Free Anonymous Pollinations AI (proxies to OpenAI/open models)
        url = f"https://text.pollinations.ai/{urllib.parse.quote(prompt)}"
        response = requests.get(url)
        
        if response.status_code == 200:
            return jsonify({'response': response.text})
        else:
            return jsonify({'response': "[ERROR] Fallback AI network is currently congested."})
            
    except Exception as e:
        return jsonify({'response': f"[ERROR] AI System Offline: {str(e)}"})

if __name__ == '__main__':
    if not os.path.exists(DB_PATH):
        try:
            from database import init_db
            init_db()
        except Exception as e:
            print("Failed to initialize database", e)
    app.run(debug=True, port=5000)
