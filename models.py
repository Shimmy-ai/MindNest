from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Habit(db.Model):
    __tablename__ = 'habits'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.String(50))  # e.g., "daily", "weekly"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Habit {self.name}>"

class Goal(db.Model):
    __tablename__ = 'goals'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    deadline = db.Column(db.DateTime, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    date = db.Column(db.String(10), nullable=False)  # Format: YYYY-MM-DD

    def __repr__(self):
        return f"<Goal {self.title}>"

class Worry(db.Model):
    __tablename__ = 'worries'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    date = db.Column(db.String(10), nullable=False)  # Format: YYYY-MM-DD

    def __repr__(self):
        return f"<Worry {self.description}>"
