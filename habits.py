from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

# File for persistence
HABITS_FILE = "habits.json"


# Load habits from file
def load_habits():
    if os.path.exists(HABITS_FILE):
        with open(HABITS_FILE, "r") as f:
            habits = json.load(f)
            print(f"Loaded habits from file: {habits}")
            return habits
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

if __name__ == "__main__":
    app.run(debug=True)

<Button colorScheme="teal" onClick={() => {
  if (!inputValue) return;
  fetch('http://127.0.0.1:5000/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habit: inputValue, date: dateKey })
  })
    .then(res => res.json())
    .then(data => {
      setHabits(Array.isArray(data) ? data : []);
      setInputValue("");
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 2000);
    })
    .catch(() => {
      setHabits(prev => [...prev, { text: inputValue, date: dateKey }]);
      setInputValue("");
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 2000);
    });
}}>
  Add
</Button>
