from app import app, db, User, Car, Ride
from datetime import datetime, timedelta

def init_db():
    with app.app_context():
        # Drop all tables
        db.drop_all()
        
        # Create all tables
        db.create_all()
        
        # Create test driver
        test_driver = User(
            name="أحمد محمد",
            phone="07801234567",
            user_type="driver"
        )
        db.session.add(test_driver)
        db.session.commit()
        
        # Create test car
        test_car = Car(
            driver_id=test_driver.id,
            car_type="سيدان",
            car_details="تويوتا كامري 2020",
            photo_url="https://example.com/car.jpg"
        )
        db.session.add(test_car)
        db.session.commit()
        
        # Create test rides
        rides = [
            Ride(
                driver_id=test_driver.id,
                departure_city="بغداد",
                destination_city="البصرة",
                departure_time=datetime.now() + timedelta(days=1),
                total_seats=4,
                available_seats=4,
                price_per_seat=25000,
                car_id=test_car.id,
                status="active"
            ),
            Ride(
                driver_id=test_driver.id,
                departure_city="بغداد",
                destination_city="أربيل",
                departure_time=datetime.now() + timedelta(days=2),
                total_seats=4,
                available_seats=2,
                price_per_seat=30000,
                car_id=test_car.id,
                status="active"
            )
        ]
        
        for ride in rides:
            db.session.add(ride)
        
        db.session.commit()
        print("Database initialized with test data!")

if __name__ == "__main__":
    init_db()
