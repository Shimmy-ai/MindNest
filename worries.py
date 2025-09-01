import os
DATA_DIR = os.environ.get("DATA_DIR", "/data")
from flask import Blueprint, request, jsonify
import json
WORRIES_FILE = os.path.join(DATA_DIR, "worries.json")
import os

worries_bp = Blueprint('worries', __name__)
WORRIES_FILE = "worries.json"
if not os.path.exists(WORRIES_FILE):
    with open(WORRIES_FILE, 'w') as f:
        json.dump([], f)

@worries_bp.route('/worries', methods=['GET'])
def get_worries():
    date = request.args.get('date')
    if not os.path.exists(WORRIES_FILE):
        return jsonify([])
    with open(WORRIES_FILE, 'r') as f:
        worries = json.load(f)
    if date:
        filtered = [w for w in worries if w.get('date') == date]
        print(f"Worries for {date}: {filtered}")
        return jsonify(filtered)
    else:
        print(f"All worries: {worries}")
        return jsonify(worries)

@worries_bp.route('/worries', methods=['POST'])
def add_worry():
    data = request.get_json()
    print(f"POST /worries received data: {data}")
    date = data.get('date')
    name = data.get('name')
    if not data or not date or not name or not isinstance(name, str) or not name.strip():
        print(f"POST /worries error: No data provided, missing date, or empty name. Data: {data}")
        return jsonify({'error': 'No data provided, missing date, or empty name'}), 400
    if not os.path.exists(WORRIES_FILE):
        worries = []
    else:
        with open(WORRIES_FILE, 'r') as f:
            worries = json.load(f)
    new_worry = {
        'id': len(worries) + 1,
        'name': data.get('name'),
        'description': data.get('description', ''),
        'resolved': False,
        'date': date
    }
    worries.append(new_worry)
    with open(WORRIES_FILE, 'w') as f:
        json.dump(worries, f)
    # Return all worries for this date after adding
    filtered = [w for w in worries if w.get('date') == date]
    print(f"POST /worries: Returning worries for {date}: {filtered}")
    return jsonify(filtered)
