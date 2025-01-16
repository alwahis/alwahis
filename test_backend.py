import requests
import json
from datetime import datetime, timedelta

def test_backend():
    BASE_URL = "http://localhost:5003"
    
    def print_test(name, response):
        print(f"\n=== Testing {name} ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json() if response.text else 'No content'}")
        
    # Test 1: Health Check
    print("\nTesting Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print_test("Health Check", response)
        assert response.status_code == 200
    except Exception as e:
        print(f"Health Check Failed: {str(e)}")
        return False

    # Test 2: Create a Ride
    print("\nTesting Create Ride...")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    ride_data = {
        "departure_city": "بغداد",
        "destination_city": "البصرة",
        "departure_time": f"{tomorrow}T10:00:00",
        "total_seats": 4,
        "price_per_seat": 25000,
        "driver_name": "أحمد محمد",
        "driver_phone": "07801234567",
        "car_type": "تويوتا كامري",
        "car_details": "موديل 2023 - أبيض"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/rides", json=ride_data)
        print_test("Create Ride", response)
        assert response.status_code == 201
        ride_id = response.json().get('ride_id')
    except Exception as e:
        print(f"Create Ride Failed: {str(e)}")
        return False

    # Test 3: Search Rides
    print("\nTesting Search Rides...")
    search_data = {
        "departure_city": "بغداد",
        "destination_city": "البصرة",
        "date": tomorrow,
        "seats_needed": 2
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/rides/search", json=search_data)
        print_test("Search Rides", response)
        assert response.status_code == 200
        assert len(response.json().get('rides', [])) > 0
    except Exception as e:
        print(f"Search Rides Failed: {str(e)}")
        return False

    print("\nAll tests passed successfully!")
    return True

if __name__ == "__main__":
    test_backend()
