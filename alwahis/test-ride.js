import { supabaseQueries } from './supabase-config.js';

// Test data
const testRides = [
    {
        startPoint: 'بغداد - المنصور',
        endPoint: 'كربلاء',
        date: '2025-01-18',
        time: '10:00',
        seats: 4,
        price: 15000,
        driverName: 'محمد علي',
        driverPhone: '07712345678'
    },
    {
        startPoint: 'بغداد - الكرادة',
        endPoint: 'النجف',
        date: '2025-01-18',
        time: '11:00',
        seats: 3,
        price: 18000,
        driverName: 'احمد حسين',
        driverPhone: '07798765432'
    }
];

// Test functions
async function runTests() {
    console.log('Starting tests...');
    
    try {
        // Test 1: Create rides
        console.log('\nTest 1: Creating test rides...');
        for (const ride of testRides) {
            const { data, error } = await supabaseQueries.createRide(ride);
            if (error) {
                console.error('Error creating ride:', error);
                throw error;
            }
            console.log(`✓ Created ride: ${ride.startPoint} to ${ride.endPoint}`);
        }

        // Test 2: Search rides
        console.log('\nTest 2: Testing search functionality...');
        const searchTests = [
            { startPoint: 'بغداد', endPoint: '', date: '' },
            { startPoint: '', endPoint: 'كربلاء', date: '' },
            { startPoint: 'بغداد', endPoint: 'كربلاء', date: '2025-01-18' }
        ];

        for (const search of searchTests) {
            console.log(`\nSearching with:`, search);
            const { data: rides, error } = await supabaseQueries.searchRides(
                search.startPoint,
                search.endPoint,
                search.date
            );
            
            if (error) {
                console.error('Search error:', error);
                throw error;
            }
            
            console.log(`✓ Found ${rides.length} rides`);
            rides.forEach(ride => {
                console.log(`  - ${ride.start_point} to ${ride.end_point} on ${ride.date}`);
            });
        }

        // Test 3: Create a ride request
        console.log('\nTest 3: Creating ride request...');
        const testRequest = {
            startPoint: 'بغداد',
            endPoint: 'كربلاء',
            date: '2025-01-18',
            seatsNeeded: 2,
            maxPrice: 20000,
            riderName: 'علي محمد',
            riderPhone: '07712345678'
        };

        const { error: requestError } = await supabaseQueries.createRequest(testRequest);
        if (requestError) {
            console.error('Error creating request:', requestError);
            throw requestError;
        }
        console.log('✓ Created ride request');

        console.log('\nAll tests completed successfully! ✓');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        throw error;
    }
}

// Run the tests
runTests().catch(console.error);
