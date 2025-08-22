from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
import re

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

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    deadline = db.Column(db.String(50))

class Worry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    resolved = db.Column(db.Boolean, default=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

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


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400
    if len(username) < 3 or len(username) > 30 or not re.match(r"^[A-Za-z0-9_]+$", username):
        return jsonify({"error": "Username must be 3-30 characters and contain only letters, numbers, and underscores."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long."}), 400
    if not re.search(r"[A-Za-z]", password) or not re.search(r"[0-9]", password):
        return jsonify({"error": "Password must contain both letters and numbers."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    user = User(username=username)
    user.set_password(password)  # Hash the password
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "username": user.username}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        return jsonify({"success": True, "username": user.username})
    return jsonify({"error": "Invalid credentials"}), 401

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
