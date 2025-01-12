from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///alwahis.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key')

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    user_type = db.Column(db.String(10))  # 'rider' or 'driver'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    rides_offered = db.relationship('Ride', backref='driver', lazy=True, foreign_keys='Ride.driver_id')
    ride_requests = db.relationship('RideRequest', backref='rider', lazy=True)

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    car_type = db.Column(db.String(20), nullable=False)  # 'SUV' or 'Sedan'
    car_details = db.Column(db.String(200))
    photo_url = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Ride(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    departure_city = db.Column(db.String(100), nullable=False)
    destination_city = db.Column(db.String(100), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    total_seats = db.Column(db.Integer, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    price_per_seat = db.Column(db.Integer, nullable=False)  # in Iraqi Dinar
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=False)
    status = db.Column(db.String(20), default='active')  # 'active', 'completed', 'cancelled'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class RideRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rider_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    departure_city = db.Column(db.String(100), nullable=False)
    destination_city = db.Column(db.String(100), nullable=False)
    desired_date = db.Column(db.DateTime, nullable=False)
    seats_needed = db.Column(db.Integer, nullable=False)
    preferred_car_type = db.Column(db.String(20))  # 'SUV' or 'Sedan'
    full_car_booking = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'matched', 'cancelled'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/api/drivers/rides', methods=['POST'])
def create_ride():
    data = request.json
    try:
        new_ride = Ride(
            driver_id=data['driver_id'],
            departure_city=data['departure_city'],
            destination_city=data['destination_city'],
            departure_time=datetime.fromisoformat(data['departure_time']),
            total_seats=data['total_seats'],
            available_seats=data['total_seats'],
            price_per_seat=data['price_per_seat'],
            car_id=data['car_id']
        )
        db.session.add(new_ride)
        db.session.commit()
        return jsonify({'message': 'تم إنشاء الرحلة بنجاح', 'ride_id': new_ride.id}), 201
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في إنشاء الرحلة'}), 400

@app.route('/api/rides/search', methods=['POST'])
def search_rides():
    data = request.json
    try:
        rides = Ride.query.filter_by(
            departure_city=data['departure_city'],
            destination_city=data['destination_city'],
            status='active'
        ).filter(
            Ride.departure_time >= datetime.fromisoformat(data['date']),
            Ride.available_seats >= data['seats_needed']
        ).all()
        
        if not rides:
            return jsonify({'message': 'لا توجد رحلات متاحة', 'rides': []}), 200
            
        rides_data = []
        for ride in rides:
            car = Car.query.get(ride.car_id)
            driver = User.query.get(ride.driver_id)
            rides_data.append({
                'id': ride.id,
                'departure_city': ride.departure_city,
                'destination_city': ride.destination_city,
                'departure_time': ride.departure_time.isoformat(),
                'available_seats': ride.available_seats,
                'price_per_seat': ride.price_per_seat,
                'car_type': car.car_type,
                'car_photo': car.photo_url,
                'driver_phone': driver.phone
            })
        return jsonify({'rides': rides_data}), 200
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في البحث عن الرحلات'}), 400

@app.route('/api/riders/requests', methods=['POST'])
def create_ride_request():
    data = request.json
    try:
        new_request = RideRequest(
            rider_id=data['rider_id'],
            departure_city=data['departure_city'],
            destination_city=data['destination_city'],
            desired_date=datetime.fromisoformat(data['desired_date']),
            seats_needed=data['seats_needed'],
            preferred_car_type=data.get('preferred_car_type'),
            full_car_booking=data.get('full_car_booking', False)
        )
        db.session.add(new_request)
        db.session.commit()
        return jsonify({'message': 'تم إنشاء الطلب بنجاح', 'request_id': new_request.id}), 201
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في إنشاء الطلب'}), 400

@app.route('/api/drivers/requests', methods=['GET'])
def get_ride_requests():
    try:
        requests = RideRequest.query.filter_by(status='pending').all()
        requests_data = []
        for req in requests:
            rider = User.query.get(req.rider_id)
            requests_data.append({
                'id': req.id,
                'departure_city': req.departure_city,
                'destination_city': req.destination_city,
                'desired_date': req.desired_date.isoformat(),
                'seats_needed': req.seats_needed,
                'preferred_car_type': req.preferred_car_type,
                'full_car_booking': req.full_car_booking,
                'rider_phone': rider.phone
            })
        return jsonify({'requests': requests_data}), 200
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في جلب طلبات الرحلات'}), 400

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
