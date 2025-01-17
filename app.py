from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
import logging
import sys
from sqlalchemy import text
import jwt
from functools import wraps
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": ["https://alwahis.netlify.app", "http://localhost:5000", "http://localhost:5001"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/')
def home():
    try:
        # Return basic API status
        return jsonify({
            'status': 'success',
            'message': 'Alwahis API is running',
            'version': '1.0'
        })
    except Exception as e:
        logger.error(f"Error in home route: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///alwahis.db')
app.config.update(
    SQLALCHEMY_DATABASE_URI=DATABASE_URL,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_key')
)

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    user_type = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    rides_offered = db.relationship('Ride', backref='driver', lazy=True)
    ride_requests = db.relationship('RideRequest', backref='rider', lazy=True)

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    car_type = db.Column(db.String(20), nullable=False)
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
    price_per_seat = db.Column(db.Integer, nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=False)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class RideRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rider_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    departure_city = db.Column(db.String(100), nullable=False)
    destination_city = db.Column(db.String(100), nullable=False)
    desired_date = db.Column(db.DateTime, nullable=False)
    seats_needed = db.Column(db.Integer, nullable=False)
    preferred_car_type = db.Column(db.String(20))
    full_car_booking = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def validate_phone(phone):
    """Validate Iraqi phone number format."""
    if not phone:
        return False
    pattern = r'^07[3-9]\d{8}$'
    return bool(re.match(pattern, phone))

def validate_ride_data(data):
    """Validate ride creation data."""
    errors = []
    
    # Required fields
    required_fields = ['driver_name', 'driver_phone', 'car_type', 'departure_city', 
                      'destination_city', 'departure_time', 'total_seats', 
                      'available_seats', 'price_per_seat']
    
    for field in required_fields:
        if field not in data or not data[field]:
            errors.append(f'حقل {field} مطلوب')
    
    # Phone number validation
    if 'driver_phone' in data and not validate_phone(data['driver_phone']):
        errors.append('رقم الهاتف غير صحيح. يجب أن يبدأ بـ 07 ويتكون من 11 رقم')
    
    # Date validation
    if 'departure_time' in data:
        try:
            departure_time = datetime.strptime(data['departure_time'], '%Y-%m-%dT%H:%M')
            if departure_time < datetime.now():
                errors.append('لا يمكن إنشاء رحلة في تاريخ سابق')
        except ValueError:
            errors.append('صيغة التاريخ غير صحيحة')
    
    # Seats validation
    if 'total_seats' in data:
        try:
            total_seats = int(data['total_seats'])
            if total_seats < 1 or total_seats > 7:
                errors.append('عدد المقاعد يجب أن يكون بين 1 و 7')
        except ValueError:
            errors.append('عدد المقاعد يجب أن يكون رقماً')
    
    # Price validation
    if 'price_per_seat' in data:
        try:
            price = int(data['price_per_seat'])
            if price < 1000:
                errors.append('السعر يجب أن يكون 1000 دينار على الأقل')
        except ValueError:
            errors.append('السعر يجب أن يكون رقماً')
    
    return errors

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({'status': 'healthy'}), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy'}), 500

@app.route('/api/drivers/rides', methods=['POST'])
def create_ride():
    try:
        data = request.json
        
        # Validate input data
        validation_errors = validate_ride_data(data)
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
        
        user = User.query.filter_by(phone=data['driver_phone']).first()
        if not user:
            user = User(
                name=data.get('driver_name', 'Unknown'),
                phone=data['driver_phone'],
                user_type='driver'
            )
            db.session.add(user)
            db.session.flush()
            
        car = Car.query.filter_by(driver_id=user.id).first()
        if not car:
            car = Car(
                driver_id=user.id,
                car_type=data['car_type'],
                car_details=data.get('car_details', ''),
                photo_url='default.jpg'
            )
            db.session.add(car)
            db.session.flush()
            
        departure_time = datetime.strptime(data['departure_time'], '%Y-%m-%dT%H:%M')
        new_ride = Ride(
            driver_id=user.id,
            departure_city=data['departure_city'],
            destination_city=data['destination_city'],
            departure_time=departure_time,
            total_seats=data['total_seats'],
            available_seats=data['available_seats'],
            price_per_seat=data['price_per_seat'],
            car_id=car.id,
            status='active'
        )
        
        db.session.add(new_ride)
        db.session.commit()
        
        return jsonify({
            'message': 'تم إنشاء الرحلة بنجاح',
            'ride_id': new_ride.id
        }), 201
        
    except Exception as e:
        logger.error(f"Error in create_ride: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/rides/search', methods=['POST'])
def search_rides():
    try:
        data = request.get_json()
        logger.info(f"Received search request with data: {data}")
        
        departure_city = data.get('departure_city')
        destination_city = data.get('destination_city')
        date = data.get('date')
        seats_needed = data.get('seats_needed', 1)

        if not all([departure_city, destination_city, date]):
            missing_fields = []
            if not departure_city:
                missing_fields.append('departure_city')
            if not destination_city:
                missing_fields.append('destination_city')
            if not date:
                missing_fields.append('date')
            error_msg = f"Missing required fields: {', '.join(missing_fields)}"
            logger.error(error_msg)
            return jsonify({'error': error_msg}), 400

        try:
            search_date = datetime.strptime(date, '%Y-%m-%d')
            logger.info(f"Parsed date: {search_date}")
        except ValueError as e:
            error_msg = f"Invalid date format. Please use YYYY-MM-DD format. Error: {str(e)}"
            logger.error(error_msg)
            return jsonify({'error': error_msg}), 400

        logger.info(f"Searching for rides from {departure_city} to {destination_city} on {search_date}")
        rides = db.session.query(Ride, Car, User).join(
            Car, Ride.car_id == Car.id
        ).join(
            User, Ride.driver_id == User.id
        ).filter(
            Ride.departure_city == departure_city,
            Ride.destination_city == destination_city,
            Ride.departure_time >= search_date,
            Ride.departure_time < search_date + timedelta(days=1),
            Ride.available_seats >= seats_needed,
            Ride.status == 'active'
        ).all()

        return jsonify({
            'rides': [{
                'id': ride.id,
                'departure_city': ride.departure_city,
                'destination_city': ride.destination_city,
                'departure_time': ride.departure_time.isoformat(),
                'available_seats': ride.available_seats,
                'price_per_seat': ride.price_per_seat,
                'car_type': car.car_type,
                'driver_phone': driver.phone
            } for ride, car, driver in rides]
        }), 200

    except Exception as e:
        logger.error(f"Error in search_rides: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/rides/matching-requests', methods=['POST'])
def get_matching_requests():
    try:
        data = request.json
        ride_date = datetime.fromisoformat(data['departure_time'])
        
        matching_requests = RideRequest.query.filter_by(
            departure_city=data['departure_city'],
            destination_city=data['destination_city'],
            status='pending'
        ).filter(
            RideRequest.desired_date >= ride_date,
            RideRequest.desired_date <= ride_date.replace(hour=23, minute=59)
        ).all()
        
        requests_data = []
        for req in matching_requests:
            rider = User.query.get(req.rider_id)
            if rider:
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
            
        return jsonify({
            'matching_requests': requests_data,
            'count': len(requests_data)
        }), 200
    except Exception as e:
        logger.error(f"Error in get_matching_requests: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5003)
