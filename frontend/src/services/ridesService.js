import { supabase } from '../config/supabase';

export const ridesService = {
  // Create a new ride
  async createRide(rideData) {
    try {
      if (!rideData.whatsappNumber) {
        return { error: 'WhatsApp number is required' };
      }

      const { data, error } = await supabase
        .from('rides')
        .insert([
          {
            from_location: rideData.from,
            to_location: rideData.to,
            departure_time: rideData.date?.toISOString(),
            available_seats: parseInt(rideData.seats) || 1,
            price_per_seat: parseInt(rideData.price) || 0,
            whatsapp_number: rideData.whatsappNumber,
            status: 'published',
          },
        ])
        .select();

      if (error) {
        console.error('Error creating ride:', error);
      }
      return { data, error };
    } catch (error) {
      console.error('Exception creating ride:', error);
      return { error };
    }
  },

  // Get all rides
  async getRides() {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .order('departure_time', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Error fetching rides:', error);
      return { error };
    }
  },

  // Get all published rides
  async getPublishedRides() {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('status', 'published')
        .order('departure_time', { ascending: true });
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching published rides:', error);
      return { error };
    }
  },

  // Get rides for a specific user
  async getUserRides(userId) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching user rides:', error);
      return { error };
    }
  },

  // Search rides
  async searchRides(searchParams) {
    try {
      console.log('Starting search with params:', searchParams);
      
      // Validate search params
      if (!searchParams) {
        console.error('Search params are undefined');
        return { error: 'Invalid search parameters' };
      }

      let query = supabase
        .from('rides')
        .select('*');
      
      // Add status filter only if we have published rides
      const { data: statusCheck } = await supabase
        .from('rides')
        .select('status')
        .limit(1);
      
      if (statusCheck && statusCheck.length > 0) {
        query = query.eq('status', 'published');
      }

      if (searchParams.from) {
        query = query.ilike('from_location', `%${searchParams.from}%`);
      }
      if (searchParams.to) {
        query = query.ilike('to_location', `%${searchParams.to}%`);
      }
      if (searchParams.date) {
        try {
          const searchDate = new Date(searchParams.date);
          console.log('Search date:', searchDate);
          
          if (!isNaN(searchDate.getTime())) {
            searchDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            query = query
              .gte('departure_time', searchDate.toISOString())
              .lt('departure_time', nextDay.toISOString());
          }
        } catch (dateError) {
          console.error('Error processing date:', dateError);
        }
      }
      
      const { data, error } = await query.order('departure_time', { ascending: true });
      
      if (error) {
        console.error('Supabase search error:', error);
        return { error };
      }

      console.log('Search results:', data);
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Exception in searchRides:', error);
      return { error: 'An unexpected error occurred' };
    }
  },

  // Test function to verify Supabase connection
  async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      
      // First, try to create a test ride
      const testRide = {
        from_location: 'الرياض - حي الملقا',
        to_location: 'جدة - حي الروضة',
        departure_time: new Date('2025-01-18T10:00:00Z').toISOString(),
        available_seats: 3,
        price_per_seat: 150,
        whatsapp_number: '966500000000',
        status: 'published'
      };

      console.log('Creating test ride:', testRide);
      const { data: createData, error: createError } = await supabase
        .from('rides')
        .insert([testRide])
        .select();

      if (createError) {
        console.error('Error creating test ride:', createError);
        return { error: createError };
      }
      console.log('Test ride created:', createData);

      // Now try to search for the ride
      const searchParams = {
        from: 'الرياض',
        to: 'جدة',
        date: new Date('2025-01-18')
      };

      console.log('Searching for test ride:', searchParams);
      const { data: searchData, error: searchError } = await this.searchRides(searchParams);

      if (searchError) {
        console.error('Error searching for test ride:', searchError);
        return { error: searchError };
      }
      console.log('Search results:', searchData);

      return { data: { created: createData, searched: searchData }, error: null };
    } catch (error) {
      console.error('Error in test connection:', error);
      return { error };
    }
  },

  // Update ride status
  async updateRideStatus(rideId, status) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .update({ status })
        .eq('id', rideId)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error updating ride status:', error);
      return { error };
    }
  }
};
