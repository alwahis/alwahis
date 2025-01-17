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
        response = requests.get(f"{BASE_URL}/api/health")
        print_test("Health Check", response)
        assert response.status_code == 200
    except Exception as e:
        print(f"Health Check Failed: {str(e)}")
        return False

    # Test 2: Create a Ride (with automatic user and car creation)
    print("\nTesting Create Ride...")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    ride_data = {
        "departure_city": "بغداد",
        "destination_city": "البصرة",
        "departure_time": tomorrow,
        "total_seats": 4,
        "available_seats": 4,
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

    # Test 4: Admin Login
    print("\nTesting Admin Login...")
    login_data = {
        "password": "admin123"  # This should be changed in production
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/admin/login", json=login_data)
        print_test("Admin Login", response)
        assert response.status_code == 200
        admin_token = response.json().get('token')
    except Exception as e:
        print(f"Admin Login Failed: {str(e)}")
        return False

    # Test 5: Get Admin Stats
    print("\nTesting Admin Stats...")
    try:
        headers = {'Authorization': f'Bearer {admin_token}'}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        print_test("Admin Stats", response)
        assert response.status_code == 200
        stats = response.json()
        assert 'total_rides' in stats
        assert 'total_users' in stats
        assert 'total_bookings' in stats
    except Exception as e:
        print(f"Admin Stats Failed: {str(e)}")
        return False

    # Test 6: Delete a Ride (Admin)
    print("\nTesting Delete Ride...")
    try:
        headers = {'Authorization': f'Bearer {admin_token}'}
        response = requests.delete(f"{BASE_URL}/api/admin/rides/{ride_id}", headers=headers)
        print_test("Delete Ride", response)
        assert response.status_code == 200
    except Exception as e:
        print(f"Delete Ride Failed: {str(e)}")
        return False

    print("\nAll tests passed successfully!")
    return True

if __name__ == "__main__":
    test_backend()
