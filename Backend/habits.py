from flask import Flask, request, jsonify

app = Flask(__name__)

# In-memory "database"
habits = []
next_id = 1

@app.route("/habits", methods=["GET"])
def get_habits():
    return jsonify(habits)

@app.route("/habits", methods=["POST"])
def add_habit():
    global next_id
    data = request.get_json()
    habit = {
        "id": next_id,
        "name": data.get("name"),
        "frequency": data.get("frequency", "Daily"),
        "streak": data.get("streak", 0)
    }
    habits.append(habit)
    next_id += 1
    return jsonify(habit), 201

if __name__ == "__main__":
    app.run(debug=True)
