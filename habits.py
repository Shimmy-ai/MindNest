import os
DATA_DIR = os.environ.get("DATA_DIR", "/data")
from flask import Flask, request, jsonify
import json
HABITS_FILE = "habits.json"

app = Flask(__name__)


# Load habits from file
def load_habits():
  if os.path.exists(HABITS_FILE):
    with open(HABITS_FILE, "r") as f:
      habits = json.load(f)
      print(f"Loaded habits from file: {habits}")
      return habits
  with open(HABITS_FILE, "w") as f:
    json.dump([], f)
  print("No habits file found, starting with empty list.")
  return []

# Save habits to file
def save_habits(habits):
    with open(HABITS_FILE, "w") as f:
        json.dump(habits, f)
    print(f"Saved habits to file: {habits}")

habits = load_habits()
next_id = max([h.get("id", 0) for h in habits], default=0) + 1

@app.route("/habits", methods=["GET"])
def get_habits():
    date = request.args.get("date")
    if date:
        filtered = [h for h in habits if h.get("date") == date]
        return jsonify(filtered)
    return jsonify(habits)

@app.route("/habits", methods=["POST"])
def add_habit():
  global next_id, habits
  data = request.get_json()
  habit = {
    "id": next_id,
    "text": data.get("habit"),
    "date": data.get("date"),
    "frequency": data.get("frequency", "Daily"),
    "streak": data.get("streak", 0)
  }
  habits.append(habit)
  next_id += 1
  print(f"Adding habit: {habit}")
  save_habits(habits)
  # Return all habits for this date
  date_val = habit.get("date")
  filtered = [h for h in habits if h.get("date") == date_val]
  return jsonify(filtered), 201

