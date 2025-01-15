import os
import json
from datetime import datetime, timedelta
import webbrowser

def clear_local_storage():
    """Clear all test data from localStorage"""
    storage_file = os.path.expanduser('~/Library/Application Support/Google/Chrome/Default/Local Storage/leveldb/000003.log')
    if os.path.exists(storage_file):
        with open(storage_file, 'w') as f:
            f.write('')

def create_test_ride():
    """Create a test ride in localStorage"""
    ride = {
        "timestamp": datetime.now().isoformat(),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "time": "14:30",
        "from": "بغداد",
        "to": "البصرة",
        "phone": "07801234567",
        "price": 25000,
        "seats": 4,
        "carType": "سيدان"
    }
    
    rides = []
    rides.append(ride)
    
    with open('test_data.json', 'w', encoding='utf-8') as f:
        json.dump({
            'publishedRides': rides
        }, f, ensure_ascii=False, indent=2)
    
    print("Test ride created:", ride)
    return ride

def main():
    # Clear existing data
    try:
        clear_local_storage()
        print("Cleared localStorage")
    except Exception as e:
        print("Error clearing localStorage:", e)
    
    # Create test ride
    test_ride = create_test_ride()
    print("\nTest data created successfully")
    
    # Open admin panel
    admin_panel_path = 'file:///Users/mudhafar.hamid/alwahis/admin-panel-8x7y9z.html'
    webbrowser.open(admin_panel_path)
    
    print("\nTest Instructions:")
    print("1. Open browser console (F12)")
    print("2. Run this command to add test data:")
    print(f"localStorage.setItem('publishedRides', '{json.dumps([test_ride], ensure_ascii=False)}')")
    print("3. Login with password: password")
    print("4. Check if the ride appears in the table")

if __name__ == "__main__":
    main()
