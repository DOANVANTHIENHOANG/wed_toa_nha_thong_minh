from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Device(db.Model):
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    floor = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(10), default='OFF')  # ON/OFF
    power = db.Column(db.Float, default=0.0)
    load_status = db.Column(db.String(20), default='Normal')  # Normal/High/Critical
    
    def to_dict(self):
        """Convert to JSON format required by frontend"""
        return {
            "name": self.name,
            "floor": self.floor,
            "status": self.status,
            "power": float(self.power),
            "load_status": self.load_status
        }
    
    def __repr__(self):
        return f'<Device {self.name}: {self.status}, {self.power}kW, {self.load_status}>'

def get_load_status(power):
    """Calculate load_status based on power"""
    if power < 1.5:
        return 'Normal'
    elif power < 2.5:
        return 'High'
    else:
        return 'Critical'

