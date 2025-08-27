from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
import os

from gratitude import gratitude_bp
from spending import spending_bp

db = SQLAlchemy()

app = Flask(__name__)
CORS(app)

# Database setup (SQLite file in project root)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///thinky.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

# Models
class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.String(50))
    date = db.Column(db.String(10), nullable=False)  # Format: YYYY-MM-DD

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    deadline = db.Column(db.String(50))
    date = db.Column(db.String(10), nullable=False)  # Format: YYYY-MM-DD


class Worry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    resolved = db.Column(db.Boolean, default=False)
    date = db.Column(db.String(10), nullable=False)  # Format: YYYY-MM-DD

# Calendar Event Model
class CalendarEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)  # Format: YYYY-MM-DD
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500))

# Register blueprints

app.register_blueprint(gratitude_bp)
app.register_blueprint(spending_bp)

with app.app_context():
    db.create_all()

# ----------------- CRUD for Habits -----------------

@app.route("/habits", methods=["GET", "POST", "DELETE"])
def handle_habits():
    if request.method == "GET":
        date = request.args.get("date")
        if date:
            habits = Habit.query.filter_by(date=date).all()
        else:
            habits = Habit.query.all()
        return jsonify([
            {"id": h.id, "name": h.name, "frequency": h.frequency, "date": h.date}
            for h in habits
        ])

    elif request.method == "POST":
        data = request.json
        # Accept both 'name' and 'text' for compatibility
        habit_name = data.get("name") or data.get("text")
        habit = Habit(
            name=habit_name,
            frequency=data.get("frequency"),
            date=data["date"]
        )
        db.session.add(habit)
        db.session.commit()
        return jsonify({"id": habit.id, "name": habit.name, "frequency": habit.frequency, "date": habit.date}), 201

    elif request.method == "DELETE":
        Habit.query.delete()
        db.session.commit()
        return jsonify({"message": "All habits deleted."})


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
        return jsonify([
            {"id": g.id, "title": g.title, "description": g.description, "deadline": g.deadline, "date": g.date}
            for g in goals
        ])

    if request.method == "POST":
        data = request.json
        goal = Goal(
            title=data["title"],
            description=data.get("description"),
            deadline=data.get("deadline"),
            date=data["date"]
        )
        db.session.add(goal)
        db.session.commit()
        return jsonify({"id": goal.id, "title": goal.title, "description": goal.description, "deadline": goal.deadline, "date": goal.date}), 201


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
        return jsonify([
            {"id": w.id, "text": w.text, "resolved": w.resolved, "date": w.date}
            for w in worries
        ])

    if request.method == "POST":
        data = request.json
        worry = Worry(
            text=data["text"],
            resolved=data.get("resolved", False),
            date=data["date"]
        )
        db.session.add(worry)
        db.session.commit()
        return jsonify({"id": worry.id, "text": worry.text, "resolved": worry.resolved, "date": worry.date}), 201


@app.route("/worries/<int:worry_id>", methods=["PUT", "DELETE"])
def handle_worry(worry_id):
    worry = Worry.query.get(worry_id)
    if not worry:
        return jsonify({"error": "Worry not found"}), 404

    if request.method == "PUT":
        data = request.json
        worry.text = data.get("text", worry.text)
        worry.resolved = data.get("resolved", worry.resolved)
        db.session.commit()
        return jsonify({"id": worry.id, "text": worry.text, "resolved": worry.resolved})

    if request.method == "DELETE":
        db.session.delete(worry)
        db.session.commit()
        return jsonify({"message": "Worry deleted"})



# ----------------- CRUD for Calendar Events -----------------
@app.route("/calendar", methods=["GET", "POST"])
def handle_calendar():
    if request.method == "GET":
        date = request.args.get("date")
        if date:
            events = CalendarEvent.query.filter_by(date=date).all()
        else:
            events = CalendarEvent.query.all()
        return jsonify([
            {"id": e.id, "date": e.date, "title": e.title, "description": e.description}
            for e in events
        ])
    if request.method == "POST":
        data = request.json
        event = CalendarEvent(
            date=data["date"],
            title=data["title"],
            description=data.get("description", "")
        )
        db.session.add(event)
        db.session.commit()
        return jsonify({"id": event.id, "date": event.date, "title": event.title, "description": event.description}), 201

@app.route("/calendar/<int:event_id>", methods=["PUT", "DELETE"])
def handle_calendar_event(event_id):
    event = CalendarEvent.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    if request.method == "PUT":
        data = request.json
        event.date = data.get("date", event.date)
        event.title = data.get("title", event.title)
        event.description = data.get("description", event.description)
        db.session.commit()
        return jsonify({"id": event.id, "date": event.date, "title": event.title, "description": event.description})
    if request.method == "DELETE":
        db.session.delete(event)
        db.session.commit()
        return jsonify({"message": "Event deleted"})


# ----------------- Welcome Endpoint -----------------
@app.route("/")
def index():
    return jsonify({
        "message": "Welcome to MindNest API!",
        "endpoints": ["/habits", "/goals", "/worries", "/calendar"]
    })


# ----------------- Run server -----------------
if __name__ == "__main__":
    app.run(debug=True)
