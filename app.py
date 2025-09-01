from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
import os

from gratitude import gratitude_bp
from spending import spending_bp

db = SQLAlchemy()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Database setup (SQLite file in project root)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////tmp/thinky.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

# Models
class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.String(50))
    date = db.Column(db.String(20), nullable=False)

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    deadline = db.Column(db.String(50))
    date = db.Column(db.String(20), nullable=False)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(20), nullable=False)


class Worry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    resolved = db.Column(db.Boolean, default=False)
    date = db.Column(db.String(20), nullable=False)

# ----------------- CRUD for Events -----------------
@app.route("/events", methods=["GET", "POST"])
def handle_events():
    if request.method == "GET":
        date = request.args.get("date")
        if date:
            events = Event.query.filter_by(date=date).all()
        else:
            events = Event.query.all()
        return jsonify([{"id": e.id, "text": e.text, "date": e.date} for e in events])

    if request.method == "POST":
        data = request.json
        event_text = data.get("text")
        date = data.get("date")
        if event_text and date:
            event = Event(text=event_text, date=date)
            db.session.add(event)
            db.session.commit()
            # Return all events for this date after adding
            events = Event.query.filter_by(date=date).all()
            return jsonify([{"id": e.id, "text": e.text, "date": e.date} for e in events])
        else:
            return jsonify({"error": "Missing text or date"}), 400

# Register blueprints
app.register_blueprint(gratitude_bp)
app.register_blueprint(spending_bp)

with app.app_context():
    db.create_all()

# ----------------- CRUD for Habits -----------------
@app.route("/habits", methods=["GET", "POST"])
def handle_habits():
    if request.method == "GET":
        date = request.args.get("date")
        if date:
            habits = Habit.query.filter_by(date=date).all()
            print(f"Habits for {date}: {[{'id': h.id, 'text': h.name, 'frequency': h.frequency, 'date': h.date} for h in habits]}")
        else:
            habits = Habit.query.all()
            print(f"All habits: {[{'id': h.id, 'text': h.name, 'frequency': h.frequency, 'date': h.date} for h in habits]}")
        return jsonify([
            {"id": h.id, "text": h.name, "frequency": h.frequency, "date": h.date} for h in habits
        ])

    if request.method == "POST":
        data = request.json
        habit_text = data.get("habit")
        date = data.get("date")
        frequency = data.get("frequency", "daily")
        if habit_text and date:
            habit = Habit(name=habit_text, frequency=frequency, date=date)
            db.session.add(habit)
            db.session.commit()
            # Return all habits for this date after adding
            habits = Habit.query.filter_by(date=date).all()
            result = [{"id": h.id, "text": h.name, "frequency": h.frequency, "date": h.date} for h in habits]
            print(f"POST /habits: Returning habits for {date}: {result}")
            return jsonify(result)
        else:
            return jsonify({"error": "Missing habit or date"}), 400


@app.route("/habits/<int:habit_id>", methods=["PUT", "DELETE"])
def handle_habit(habit_id):
    habit = Habit.query.get(habit_id)
    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    if request.method == "PUT":
        data = request.json
        habit.name = data.get("name", habit.name)
        habit.frequency = data.get("frequency", habit.frequency)
        db.session.commit()
        return jsonify({"id": habit.id, "name": habit.name, "frequency": habit.frequency})

    if request.method == "DELETE":
        db.session.delete(habit)
        db.session.commit()
        return jsonify({"message": "Habit deleted"})


# ----------------- CRUD for Goals -----------------
@app.route("/goals", methods=["GET", "POST"])
def handle_goals():
    if request.method == "GET":
        date = request.args.get("date")
        if date:
            goals = Goal.query.filter_by(date=date).all()
        else:
            goals = Goal.query.all()
        return jsonify([{"id": g.id, "title": g.title, "description": g.description, "deadline": g.deadline, "date": g.date} for g in goals])

    if request.method == "POST":
        data = request.json
        print(f"POST /goals received data: {data}")
        try:
            goal = Goal(title=data["title"], description=data.get("description"), deadline=data.get("deadline"), date=data.get("deadline"))
            db.session.add(goal)
            db.session.commit()
            # Return all goals for the selected date after adding
            date = data.get("deadline")
            if date:
                goals = Goal.query.filter_by(date=date).all()
            else:
                goals = Goal.query.all()
            return jsonify([{"id": g.id, "title": g.title, "description": g.description, "deadline": g.deadline, "date": g.date} for g in goals]), 201
        except Exception as e:
            print(f"Error in POST /goals: {e}")
            return jsonify({"error": str(e)}), 500


@app.route("/goals/<int:goal_id>", methods=["PUT", "DELETE"])
def handle_goal(goal_id):
    goal = Goal.query.get(goal_id)
    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    if request.method == "PUT":
        data = request.json
        goal.title = data.get("title", goal.title)
        goal.description = data.get("description", goal.description)
        goal.deadline = data.get("deadline", goal.deadline)
        db.session.commit()
        return jsonify({"id": goal.id, "title": goal.title, "description": goal.description, "deadline": goal.deadline})

    if request.method == "DELETE":
        db.session.delete(goal)
        db.session.commit()
        return jsonify({"message": "Goal deleted"})


# ----------------- CRUD for Worries -----------------
@app.route("/worries", methods=["GET", "POST"])
def handle_worries():
    if request.method == "GET":
        date = request.args.get("date")
        if date:
            worries = Worry.query.filter_by(date=date).all()
        else:
            worries = Worry.query.all()
        return jsonify([{"id": w.id, "name": w.text, "resolved": w.resolved, "date": w.date} for w in worries])

    if request.method == "POST":
        data = request.json
        print(f"POST /worries received data: {data}")
        worry = Worry(text=data["name"], resolved=data.get("resolved", False), date=data["date"])
        db.session.add(worry)
        db.session.commit()
        # Return all worries for this date after adding
        worries = Worry.query.filter_by(date=data["date"]).all()
        return jsonify([{"id": w.id, "name": w.text, "resolved": w.resolved, "date": w.date} for w in worries])


@app.route("/worries/<int:worry_id>", methods=["PUT", "DELETE"])
def handle_worry(worry_id):
    worry = Worry.query.get(worry_id)
    if not worry:
        return jsonify({"error": "Worry not found"}), 404

    if request.method == "POST":
        data = request.get_json()
        worry = Worry(text=data["name"], resolved=data.get("resolved", False))
        db.session.add(worry)
        db.session.commit()
        return jsonify({"id": worry.id, "name": worry.text, "resolved": worry.resolved})

    if request.method == "DELETE":
        db.session.delete(worry)
        db.session.commit()
        return jsonify({"message": "Worry deleted"})


# ----------------- Welcome Endpoint -----------------
@app.route("/")
def index():
    return jsonify({
        "message": "Welcome to MindNest API!",
        "endpoints": ["/habits", "/goals", "/worries"]
    })


# ----------------- Run server -----------------
if __name__ == "__main__":
    app.run(debug=True)
