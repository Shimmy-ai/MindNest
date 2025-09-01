import os
DATA_DIR = os.environ.get("DATA_DIR", "/data")
from flask import Blueprint, request, jsonify, Response
import json
SPENDING_FILE = os.path.join(DATA_DIR, "spending.json")
import os
from datetime import datetime

spending_bp = Blueprint('spending', __name__)

SPENDING_FILE = "/tmp/spending.json"
if not os.path.exists(SPENDING_FILE):
    with open(SPENDING_FILE, 'w', encoding='utf-8') as f:
        json.dump({}, f)

def load_spending():
    if not os.path.exists(SPENDING_FILE):
        return {}
    with open(SPENDING_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except Exception:
            return {}

def save_spending(data):
    with open(SPENDING_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@spending_bp.route('/spending/export_md', methods=['GET'])
def export_spending_md():
    import datetime
    data = load_spending()
    md = ['# Spending\n']
    for date, entries in data.items():
        md.append(f"## {date}")
        total = 0
        for entry in entries:
            item = entry.get('item', '')
            amount = entry.get('amount', 0)
            total += amount
            md.append(f"- {item}: {amount} SEK")
        md.append(f"**Total:** {total} SEK\n")
    md_content = '\n'.join(md)
    filename = f"spending_{datetime.date.today()}.md"
    return Response(md_content, mimetype='text/markdown', headers={"Content-Disposition": f"attachment; filename={filename}"})

@spending_bp.route('/spending', methods=['GET'])
def get_spending():
    date = request.args.get('date')
    data = load_spending()
    if date:
        return jsonify(data.get(date, []))
    return jsonify(data)

@spending_bp.route('/spending', methods=['POST'])
def add_spending():
    item = request.json.get('item')
    amount = request.json.get('amount')
    date = request.json.get('date')
    if not date:
        date = datetime.now().strftime('%Y-%m-%d')
    if not item or amount is None:
        return jsonify({'error': 'Missing item or amount'}), 400
    data = load_spending()
    entry = {'item': item, 'amount': amount}
    if date not in data:
        data[date] = []
    data[date].append(entry)
    save_spending(data)
    return jsonify({'success': True, 'entry': entry})
