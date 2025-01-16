from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
import logging
import sys
from sqlalchemy import text

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS for all routes with all origins
CORS(app, resources={
    r"/*": {
        "origins": ["https://alwahis.netlify.app", "http://localhost:5000", "http://localhost:5001"],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

logger.info(f"Using database URL: {DATABASE_URL or 'sqlite:///alwahis.db'}")

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or 'sqlite:///alwahis.db'
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
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Test database connection
        db.session.execute(text('SELECT 1'))
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/api/drivers/rides', methods=['POST'])
def create_ride():
    try:
        data = request.json
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
        logger.error(f"Error in create_ride: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/rides/search', methods=['POST'])
def search_rides():
    try:
        data = request.get_json()
        departure_city = data.get('departure_city')
        destination_city = data.get('destination_city')
        date = data.get('date')
        seats_needed = data.get('seats_needed', 1)

        if not all([departure_city, destination_city, date]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Convert date string to datetime
        try:
            search_date = datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

        # Query rides with their related car and driver information
        rides = db.session.query(Ride, Car, User).join(Car, Ride.car_id == Car.id).join(User, Ride.driver_id == User.id).filter(
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

@app.route('/api/riders/requests', methods=['POST'])
def create_ride_request():
    try:
        data = request.json
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
        logger.error(f"Error in create_ride_request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

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
        logger.error(f"Error in get_ride_requests: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/rides', methods=['GET', 'POST'])
def rides():
    if request.method == 'GET':
        try:
            rides = db.session.query(Ride, Car, User).join(Car, Ride.car_id == Car.id).join(User, Ride.driver_id == User.id).filter(
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
            logger.error(f"Error in rides: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    else:  # POST
        try:
            data = request.json
            
            # First, create or get the user
            user = User.query.filter_by(phone=data['driver_phone']).first()
            if not user:
                user = User(
                    name=data['driver_name'],
                    phone=data['driver_phone'],
                    user_type='driver'
                )
                db.session.add(user)
                db.session.flush()  # This will assign an ID to the user

            # Then, create or get the car
            car = Car.query.filter_by(driver_id=user.id).first()
            if not car:
                car = Car(
                    driver_id=user.id,
                    car_type=data['car_type'],
                    car_details=data.get('car_details', ''),
                    photo_url='default_car.jpg'  # You can update this later
                )
                db.session.add(car)
                db.session.flush()  # This will assign an ID to the car

            # Create the ride
            departure_time = datetime.strptime(data['departure_time'], '%Y-%m-%d')
            new_ride = Ride(
                driver_id=user.id,
                car_id=car.id,
                departure_city=data['departure_city'],
                destination_city=data['destination_city'],
                departure_time=departure_time,
                total_seats=data['total_seats'],
                available_seats=data['available_seats'],
                price_per_seat=data['price_per_seat'],
                status='active'
            )
            
            db.session.add(new_ride)
            db.session.commit()

            # Get matching requests
            matching_requests = db.session.query(RideRequest).filter(
                RideRequest.departure_city == new_ride.departure_city,
                RideRequest.destination_city == new_ride.destination_city,
                RideRequest.desired_date >= departure_time,
                RideRequest.desired_date < departure_time + timedelta(days=1),
                RideRequest.seats_needed <= new_ride.available_seats,
                RideRequest.status == 'pending'
            ).all()

            return jsonify({
                'message': 'تم نشر الرحلة بنجاح',
                'ride_id': new_ride.id,
                'matching_requests': [{
                    'id': req.id,
                    'departure_city': req.departure_city,
                    'destination_city': req.destination_city,
                    'desired_date': req.desired_date.isoformat(),
                    'seats_needed': req.seats_needed
                } for req in matching_requests]
            }), 201

        except Exception as e:
            logger.error(f"Error in rides: {str(e)}")
            db.session.rollback()
            return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/drivers/matching-requests', methods=['POST'])
def get_matching_requests():
    data = request.json
    try:
        # Convert date string to datetime
        ride_date = datetime.fromisoformat(data['departure_time'])
        
        # Find matching requests based on route and date
        matching_requests = RideRequest.query.filter_by(
            departure_city=data['departure_city'],
            destination_city=data['destination_city'],
            status='pending'
        ).filter(
            RideRequest.desired_date >= ride_date,
            RideRequest.desired_date <= ride_date.replace(hour=23, minute=59, second=59)
        ).all()
        
        requests_data = []
        for req in matching_requests:
            rider = User.query.get(req.rider_id)
            requests_data.append({
                'id': req.id,
                'departure_city': req.departure_city,
                'destination_city': req.destination_city,
                'desired_date': req.desired_date.isoformat(),
                'seats_needed': req.seats_needed,
                'preferred_car_type': req.preferred_car_type,
                'full_car_booking': req.full_car_booking,
                'rider_phone': rider.phone,
                'created_at': req.created_at.isoformat()
            })
            
        return jsonify({
            'matching_requests': requests_data,
            'count': len(requests_data)
        }), 200
    except Exception as e:
        logger.error(f"Error in get_matching_requests: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Admin routes
@app.route('/api/admin/rides', methods=['GET'])
def get_all_rides():
    try:
        rides = Ride.query.all()
        rides_data = []
        for ride in rides:
            car = Car.query.get(ride.car_id)
            driver = User.query.get(ride.driver_id)
            rides_data.append({
                'id': ride.id,
                'from': ride.departure_city,
                'to': ride.destination_city,
                'date': ride.departure_time.strftime('%Y-%m-%d'),
                'time': ride.departure_time.strftime('%H:%M'),
                'seats': ride.total_seats,
                'available_seats': ride.available_seats,
                'price': ride.price_per_seat,
                'status': ride.status,
                'driver': {
                    'name': driver.name,
                    'phone': driver.phone
                },
                'car': {
                    'type': car.car_type,
                    'details': car.car_details
                },
                'timestamp': ride.created_at.isoformat()
            })
        return jsonify({'rides': rides_data}), 200
    except Exception as e:
        logger.error(f"Error in get_all_rides: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/rides/<int:ride_id>', methods=['DELETE'])
def delete_ride(ride_id):
    try:
        ride = Ride.query.get_or_404(ride_id)
        db.session.delete(ride)
        db.session.commit()
        return jsonify({'message': 'تم حذف الرحلة بنجاح'}), 200
    except Exception as e:
        logger.error(f"Error in delete_ride: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    try:
        total_rides = Ride.query.count()
        active_rides = Ride.query.filter_by(status='active').count()
        total_users = User.query.count()
        total_drivers = User.query.filter_by(user_type='driver').count()
        
        return jsonify({
            'total_rides': total_rides,
            'active_rides': active_rides,
            'total_users': total_users,
            'total_drivers': total_drivers
        }), 200
    except Exception as e:
        logger.error(f"Error in get_admin_stats: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}")
            sys.exit(1)
    
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port)
