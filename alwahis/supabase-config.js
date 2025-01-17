// Supabase Configuration
const SUPABASE_URL = 'https://aubxdousivpqnpcdwdyx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1Ynhkb3VzaXZwcW5wY2R3ZHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMDY5MzQsImV4cCI6MjA1MjY4MjkzNH0.XaGxzIFOAX-STax1HR1pAq4icPRZmsaCf38Z_frStWw';

// Initialize Supabase client
let supabase;

function initializeSupabase() {
    try {
        if (typeof window === 'undefined') {
            throw new Error('Window is not defined');
        }
        
        if (!window.supabase) {
            throw new Error('Supabase client not loaded');
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabase = supabase; // Make it globally available
        console.log('Supabase client initialized successfully');
        return supabase;
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
        throw new Error('فشل الاتصال بقاعدة البيانات');
    }
}

// Initialize on load
try {
    initializeSupabase();
} catch (error) {
    console.error('Failed to initialize Supabase on load:', error);
}

// Database tables
const TABLES = {
    RIDES: 'rides',
    RIDE_REQUESTS: 'ride_requests'
};

// Error handling wrapper
const handleSupabaseError = (error) => {
    console.error('Supabase Error:', error);
    if (!supabase) {
        return new Error('فشل الاتصال بقاعدة البيانات');
    }
    if (error.message.includes('JWT')) {
        return new Error('خطأ في الاتصال بالخادم');
    }
    if (error.message.includes('network')) {
        return new Error('خطأ في الاتصال بالإنترنت');
    }
    if (error.message.includes('database')) {
        return new Error('فشل الاتصال بقاعدة البيانات');
    }
    return new Error('حدث خطأ غير متوقع');
};

// Supabase queries
export const supabaseQueries = {
    // Rides
    createRide: async (rideData) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.RIDES)
                .insert([{
                    start_point: rideData.startPoint,
                    end_point: rideData.endPoint,
                    date: rideData.date,
                    time: rideData.time,
                    seats: parseInt(rideData.seats),
                    price: parseInt(rideData.price),
                    driver_name: rideData.driverName,
                    driver_phone: rideData.driverPhone,
                    status: 'active'
                }]);
            
            if (error) throw error;
            return { data: data[0] };
        } catch (error) {
            throw handleSupabaseError(error);
        }
    },

    getRides: async () => {
        try {
            const { data, error } = await supabase
                .from(TABLES.RIDES)
                .select('*')
                .eq('status', 'active')
                .order('date', { ascending: true });
            
            if (error) throw error;
            return { data };
        } catch (error) {
            throw handleSupabaseError(error);
        }
    },

    searchRides: async (startPoint, endPoint, date) => {
        try {
            console.log('Supabase: Starting search query');
            let query = supabase
                .from(TABLES.RIDES)
                .select('*')
                .eq('status', 'active');
                
            if (startPoint && startPoint.trim()) {
                query = query.ilike('start_point', `%${startPoint.trim()}%`);
            }
            if (endPoint && endPoint.trim()) {
                query = query.ilike('end_point', `%${endPoint.trim()}%`);
            }
            if (date && date.trim()) {
                query = query.eq('date', date.trim());
            }
            
            const { data, error } = await query
                .order('date', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase query error:', error);
                throw error;
            }

            console.log('Supabase: Search results:', { count: data?.length });
            return { data: data || [] };
        } catch (error) {
            console.error('Supabase: Search error:', error);
            throw handleSupabaseError(error);
        }
    },

    deleteRide: async (rideId, driverPhone) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.RIDES)
                .update({ status: 'deleted' })
                .match({ id: rideId, driver_phone: driverPhone })
                .select();
            
            if (error) throw error;
            return { data: data[0] };
        } catch (error) {
            throw handleSupabaseError(error);
        }
    },

    // Ride Requests
    createRequest: async (requestData) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.RIDE_REQUESTS)
                .insert([{
                    start_point: requestData.startPoint,
                    end_point: requestData.endPoint,
                    date: requestData.date,
                    seats_needed: parseInt(requestData.seatsNeeded),
                    max_price: requestData.maxPrice ? parseInt(requestData.maxPrice) : null,
                    rider_name: requestData.riderName,
                    rider_phone: requestData.riderPhone,
                    status: 'active'
                }]);
            
            if (error) throw error;
            return { data: data[0] };
        } catch (error) {
            throw handleSupabaseError(error);
        }
    },

    searchRequests: async (startPoint, endPoint, date) => {
        try {
            let query = supabase
                .from(TABLES.RIDE_REQUESTS)
                .select('*')
                .eq('status', 'active');
                
            if (startPoint) {
                query = query.ilike('start_point', `%${startPoint}%`);
            }
            if (endPoint) {
                query = query.ilike('end_point', `%${endPoint}%`);
            }
            if (date) {
                query = query.eq('date', date);
            }
            
            const { data, error } = await query.order('date', { ascending: true });
            if (error) throw error;
            return { data };
        } catch (error) {
            throw handleSupabaseError(error);
        }
    },

    // Real-time subscriptions
    subscribeToRides: (callback) => {
        return supabase
            .from(TABLES.RIDES)
            .on('*', payload => {
                callback(payload);
            })
            .subscribe();
    },

    subscribeToRequests: (callback) => {
        return supabase
            .from(TABLES.RIDE_REQUESTS)
            .on('*', payload => {
                callback(payload);
            })
            .subscribe();
    }
};

export { supabase };
