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

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///thinky.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

# Models
class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.String(50))

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    deadline = db.Column(db.String(50))

class Worry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    resolved = db.Column(db.Boolean, default=False)

# Register blueprints
app.register_blueprint(gratitude_bp)
app.register_blueprint(spending_bp)

with app.app_context():
    db.create_all()


# ----------------- CRUD for Habits -----------------
@app.route("/habits", methods=["GET", "POST"])
def handle_habits():
    if request.method == "GET":
        habits = Habit.query.all()
        return jsonify([{"id": h.id, "name": h.name, "frequency": h.frequency} for h in habits])

    if request.method == "POST":
        data = request.json
        habit = Habit(name=data["name"], frequency=data.get("frequency"))
        db.session.add(habit)
        db.session.commit()
        return jsonify({"id": habit.id, "name": habit.name, "frequency": habit.frequency}), 201


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
        goals = Goal.query.all()
        return jsonify([{"id": g.id, "title": g.title, "description": g.description, "deadline": g.deadline} for g in goals])

    if request.method == "POST":
        data = request.json
        goal = Goal(title=data["title"], description=data.get("description"), deadline=data.get("deadline"))
        db.session.add(goal)
        db.session.commit()
        return jsonify({"id": goal.id, "title": goal.title, "description": goal.description, "deadline": goal.deadline}), 201


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
        worries = Worry.query.all()
        return jsonify([{"id": w.id, "text": w.text, "resolved": w.resolved} for w in worries])

    if request.method == "POST":
        data = request.json
        worry = Worry(text=data["text"], resolved=data.get("resolved", False))
        db.session.add(worry)
        db.session.commit()
        return jsonify({"id": worry.id, "text": worry.text, "resolved": worry.resolved}), 201


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


# ----------------- Welcome Endpoint -----------------
@app.route("/")
def index():
    return jsonify({
        "message": "Welcome to MindNest API!",
        "endpoints": ["/habits", "/goals", "/worries"]
    })


# ----------------- Run server -----------------yy
if __name__ == "__main__":
    app.run(debug=True)
