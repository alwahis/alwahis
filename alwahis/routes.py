from flask import jsonify, request
from datetime import datetime, timedelta
from sqlalchemy import text, and_, or_
from alwahis import app, db, logger
from alwahis.models import User, Car, Ride, RideRequest

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Test database connection
        db.session.execute(text('SELECT 1'))
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/api/rides', methods=['POST'])
def create_ride():
    try:
        data = request.json
        
        # Create a new user (driver) if not exists
        user = User.query.filter_by(phone=data['driver_phone']).first()
        if not user:
            user = User(
                name=data['driver_name'],
                phone=data['driver_phone'],
                user_type='driver'
            )
            db.session.add(user)
            db.session.flush()
        
        # Create a new car
        car = Car(
            driver_id=user.id,
            car_type=data['car_type'],
            car_details=data['car_details'],
            photo_url='default.jpg'  # TODO: Implement photo upload
        )
        db.session.add(car)
        db.session.flush()
        
        # Create the ride
        ride = Ride(
            driver_id=user.id,
            departure_city=data['departure_city'],
            destination_city=data['destination_city'],
            departure_time=datetime.fromisoformat(data['departure_time']),
            total_seats=data['total_seats'],
            available_seats=data['total_seats'],
            price_per_seat=data['price_per_seat'],
            car_id=car.id
        )
        db.session.add(ride)
        db.session.commit()
        
        return jsonify({'message': 'Ride created successfully', 'ride_id': ride.id}), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating ride: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/rides/search', methods=['POST'])
def search_rides():
    try:
        data = request.json
        departure_city = data['departure_city']
        destination_city = data['destination_city']
        date = datetime.strptime(data['date'], '%Y-%m-%d')
        seats_needed = int(data['seats_needed'])
        
        # Get the date range for the search
        start_date = date.replace(hour=0, minute=0, second=0)
        end_date = (start_date + timedelta(days=1)).replace(hour=23, minute=59, second=59)
        
        # Query rides
        rides = Ride.query.filter(
            and_(
                Ride.departure_city == departure_city,
                Ride.destination_city == destination_city,
                Ride.departure_time.between(start_date, end_date),
                Ride.available_seats >= seats_needed,
                Ride.status == 'active'
            )
        ).all()
        
        # Format the results
        results = []
        for ride in rides:
            driver = User.query.get(ride.driver_id)
            car = Car.query.get(ride.car_id)
            
            results.append({
                'id': ride.id,
                'driver': {
                    'name': driver.name,
                    'phone': driver.phone
                },
                'car': {
                    'type': car.car_type,
                    'details': car.car_details
                },
                'departure_city': ride.departure_city,
                'destination_city': ride.destination_city,
                'departure_time': ride.departure_time.isoformat(),
                'available_seats': ride.available_seats,
                'price_per_seat': ride.price_per_seat,
                'total_price': ride.price_per_seat * seats_needed
            })
        
        return jsonify({'rides': results}), 200
        
    except Exception as e:
        logger.error(f"Error searching rides: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/ride-requests', methods=['POST'])
def create_ride_request():
    try:
        data = request.json
        
        # Create a new user (rider) if not exists
        user = User.query.filter_by(phone=data['rider_phone']).first()
        if not user:
            user = User(
                name=data['rider_name'],
                phone=data['rider_phone'],
                user_type='rider'
            )
            db.session.add(user)
        
        # Create the ride request
        request = RideRequest(
            rider_id=user.id,
            departure_city=data['departure_city'],
            destination_city=data['destination_city'],
            desired_date=datetime.fromisoformat(data['desired_date']),
            seats_needed=data['seats_needed'],
            preferred_car_type=data.get('preferred_car_type'),
            full_car_booking=data.get('full_car_booking', False)
        )
        db.session.add(request)
        db.session.commit()
        
        return jsonify({'message': 'Ride request created successfully', 'request_id': request.id}), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating ride request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/ride-requests', methods=['GET'])
def get_ride_requests():
    try:
        # Get query parameters
        departure_city = request.args.get('departure_city')
        destination_city = request.args.get('destination_city')
        
        # Build the query
        query = RideRequest.query
        if departure_city:
            query = query.filter(RideRequest.departure_city == departure_city)
        if destination_city:
            query = query.filter(RideRequest.destination_city == destination_city)
            
        # Get active requests from the last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        requests = query.filter(
            and_(
                RideRequest.status == 'pending',
                RideRequest.created_at >= seven_days_ago
            )
        ).all()
        
        # Format the results
        results = []
        for req in requests:
            rider = User.query.get(req.rider_id)
            results.append({
                'id': req.id,
                'rider': {
                    'name': rider.name,
                    'phone': rider.phone
                },
                'departure_city': req.departure_city,
                'destination_city': req.destination_city,
                'desired_date': req.desired_date.isoformat(),
                'seats_needed': req.seats_needed,
                'preferred_car_type': req.preferred_car_type,
                'full_car_booking': req.full_car_booking,
                'created_at': req.created_at.isoformat()
            })
        
        return jsonify({'requests': results}), 200
        
    except Exception as e:
        logger.error(f"Error getting ride requests: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Admin routes
@app.route('/api/admin/rides', methods=['GET'])
def get_all_rides():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Query all rides with pagination
        rides = Ride.query.order_by(Ride.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False)
        
        # Format the results
        results = []
        for ride in rides.items:
            driver = User.query.get(ride.driver_id)
            car = Car.query.get(ride.car_id)
            
            results.append({
                'id': ride.id,
                'driver': {
                    'name': driver.name,
                    'phone': driver.phone
                },
                'car': {
                    'type': car.car_type,
                    'details': car.car_details
                },
                'departure_city': ride.departure_city,
                'destination_city': ride.destination_city,
                'departure_time': ride.departure_time.isoformat(),
                'total_seats': ride.total_seats,
                'available_seats': ride.available_seats,
                'price_per_seat': ride.price_per_seat,
                'status': ride.status,
                'created_at': ride.created_at.isoformat()
            })
        
        return jsonify({
            'rides': results,
            'total': rides.total,
            'pages': rides.pages,
            'current_page': rides.page
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting all rides: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/rides/<int:ride_id>', methods=['DELETE'])
def delete_ride(ride_id):
    try:
        ride = Ride.query.get_or_404(ride_id)
        ride.status = 'deleted'
        db.session.commit()
        return jsonify({'message': 'Ride deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting ride: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    try:
        # Get counts
        total_rides = Ride.query.count()
        active_rides = Ride.query.filter_by(status='active').count()
        total_users = User.query.count()
        total_requests = RideRequest.query.count()
        
        # Get popular routes
        popular_routes = db.session.query(
            Ride.departure_city,
            Ride.destination_city,
            db.func.count(Ride.id).label('count')
        ).group_by(
            Ride.departure_city,
            Ride.destination_city
        ).order_by(
            db.func.count(Ride.id).desc()
        ).limit(5).all()
        
        return jsonify({
            'total_rides': total_rides,
            'active_rides': active_rides,
            'total_users': total_users,
            'total_requests': total_requests,
            'popular_routes': [
                {
                    'departure_city': route[0],
                    'destination_city': route[1],
                    'count': route[2]
                }
                for route in popular_routes
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting admin stats: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
