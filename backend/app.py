from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"]
    }
})

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///alwahis.db')
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
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'database': 'connected' if db.engine.pool.checkedout() == 0 else 'error',
        'timestamp': datetime.now().isoformat()
    })

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

@app.route('/api/rides', methods=['GET', 'POST'])
def rides():
    if request.method == 'GET':
        try:
            rides = Ride.query.all()
            return jsonify({
                'message': 'تم جلب الرحلات بنجاح',
                'rides': [{
                    'id': ride.id,
                    'from': ride.departure_city,
                    'to': ride.destination_city,
                    'departure_time': ride.departure_time.isoformat(),
                    'total_seats': ride.total_seats,
                    'available_seats': ride.available_seats,
                    'price_per_seat': ride.price_per_seat,
                    'status': ride.status,
                    'driver': {
                        'name': ride.driver.name,
                        'phone': ride.driver.phone
                    } if ride.driver else None
                } for ride in rides]
            }), 200
        except Exception as e:
            print('Error fetching rides:', str(e))
            return jsonify({'error': 'حدث خطأ في جلب الرحلات'}), 500
    else:  # POST
        try:
            data = request.json
            print('Received ride data:', data)

            # Create or get driver
            driver = User.query.filter_by(phone=data['driver_phone']).first()
            if not driver:
                driver = User(
                    name=data['driver_name'],
                    phone=data['driver_phone'],
                    user_type='driver'
                )
                db.session.add(driver)
                db.session.commit()

            # Create or get car
            car = Car.query.filter_by(driver_id=driver.id).first()
            if not car:
                car = Car(
                    driver_id=driver.id,
                    car_type=data['car_type'],
                    car_details=data.get('car_details', ''),
                    photo_url='default.jpg'
                )
                db.session.add(car)
                db.session.commit()

            # Parse date and time
            departure_time = datetime.strptime(f"{data['date']} {data['time']}", "%Y-%m-%d %H:%M")

            # Create ride
            ride = Ride(
                driver_id=driver.id,
                departure_city=data['from'],
                destination_city=data['to'],
                departure_time=departure_time,
                total_seats=int(data['total_seats']),
                available_seats=int(data['total_seats']),
                price_per_seat=int(data['price_per_seat']),
                car_id=car.id,
                status='active'
            )
            db.session.add(ride)
            db.session.commit()

            return jsonify({
                'message': 'تم نشر الرحلة بنجاح',
                'ride': {
                    'id': ride.id,
                    'from': ride.departure_city,
                    'to': ride.destination_city,
                    'date': ride.departure_time.strftime('%Y-%m-%d'),
                    'time': ride.departure_time.strftime('%H:%M'),
                    'driver': {
                        'name': driver.name,
                        'phone': driver.phone
                    }
                }
            }), 201

        except Exception as e:
            print('Error publishing ride:', str(e))
            return jsonify({'error': 'حدث خطأ في نشر الرحلة'}), 500

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
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/rides/<int:ride_id>', methods=['DELETE'])
def delete_ride(ride_id):
    try:
        ride = Ride.query.get_or_404(ride_id)
        db.session.delete(ride)
        db.session.commit()
        return jsonify({'message': 'تم حذف الرحلة بنجاح'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
