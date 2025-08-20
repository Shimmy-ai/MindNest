from flask import Blueprint, request, jsonify
import json
import os

worries_bp = Blueprint('worries', __name__)
WORRIES_FILE = 'worries.json'

@worries_bp.route('/worries', methods=['GET'])
def get_worries():
    if not os.path.exists(WORRIES_FILE):
        return jsonify([])
    with open(WORRIES_FILE, 'r') as f:
        worries = json.load(f)
    return jsonify(worries)

@worries_bp.route('/worries', methods=['POST'])
def add_worry():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if not os.path.exists(WORRIES_FILE):
        worries = []
    else:
        with open(WORRIES_FILE, 'r') as f:
            worries = json.load(f)
    new_worry = {
        'id': len(worries) + 1,
        'name': data.get('name'),
        'description': data.get('description', ''),
        'resolved': False
    }
    worries.append(new_worry)
    with open(WORRIES_FILE, 'w') as f:
        json.dump(worries, f)
    return jsonify(new_worry), 201
