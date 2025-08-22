from flask import Blueprint, request, jsonify
import json
import os

goals_bp = Blueprint('goals', __name__)
GOALS_FILE = 'goals.json'

@goals_bp.route('/goals', methods=['GET'])
def get_goals():
    if not os.path.exists(GOALS_FILE):
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
