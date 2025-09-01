from flask import Flask, Blueprint, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)
gratitude_bp = Blueprint('gratitude', __name__)
DATA_DIR = os.environ.get("DATA_DIR", "/data")
DATA_FILE = os.path.join(DATA_DIR, "gratitude.json")

def read_gratitude():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump({}, f)
        return {}
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except Exception:
            return {}

def write_gratitude(entries):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f)

@gratitude_bp.route('/gratitude', methods=['GET'])
def get_gratitude():
    date = request.args.get('date')
    all_entries = read_gratitude()
    if date:
        entries = all_entries.get(date, [])
        print(f"Gratitude for {date}: {entries}")
        return jsonify(entries)
    else:
        print(f"All gratitude entries: {all_entries}")
        return jsonify(all_entries)

@gratitude_bp.route('/gratitude', methods=['POST'])
def add_gratitude():
    data = request.get_json()
    date = data.get('date')
    entries = data.get('entries')  # should be a list of up to 3
    if not date or not entries or not isinstance(entries, list):
        return jsonify({'error': 'Missing date or entries'}), 400
    all_entries = read_gratitude()
    if date not in all_entries:
        all_entries[date] = []
    labels = ['a', 'b', 'c']
    for i, entry in enumerate(entries):
        if entry.strip():
            all_entries[date].append({
                'label': labels[i] if i < len(labels) else chr(97+i),
                'text': entry.strip()
            })
    write_gratitude(all_entries)
    return jsonify(all_entries[date])

app.register_blueprint(gratitude_bp)

if __name__ == '__main__':
    app.run(debug=True)
