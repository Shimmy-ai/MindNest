import os
DATA_DIR = os.environ.get("DATA_DIR", "/data")
from flask import Blueprint, request, jsonify
import json
GOALS_FILE = os.path.join(DATA_DIR, "goals.json")

GOALS_FILE = "goals.json"

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/goals', methods=['GET'])
def get_goals():
    if not os.path.exists(GOALS_FILE):
        with open(GOALS_FILE, 'w') as f:
            json.dump([], f)
        return jsonify([])
    with open(GOALS_FILE, 'r') as f:
        goals = json.load(f)
    return jsonify(goals)

@goals_bp.route('/goals', methods=['POST'])
def add_goal():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if not os.path.exists(GOALS_FILE):
        goals = []
    else:
        with open(GOALS_FILE, 'r') as f:
            goals = json.load(f)
    new_goal = {
        'id': len(goals) + 1,
        'name': data.get('name'),
        'description': data.get('description', ''),
        'completed': False
    }
    goals.append(new_goal)
    with open(GOALS_FILE, 'w') as f:
        json.dump(goals, f)
    return jsonify(new_goal), 201
