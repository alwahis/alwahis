import { supabase } from '../config/supabase';

export const ridesService = {
  // Create a new ride
  async createRide(rideData) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .insert([
          {
            from_location: rideData.from,
            to_location: rideData.to,
            departure_time: rideData.date,
            available_seats: rideData.seats,
            price_per_seat: rideData.price,
            whatsapp_number: rideData.whatsappNumber,
            status: 'published',
          },
        ])
        .select();

      return { data, error };
    } catch (error) {
      console.error('Error creating ride:', error);
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
      let query = supabase
        .from('rides')
        .select('*')
        .eq('status', 'published');
      
      if (searchParams.from) {
        query = query.ilike('from_location', `%${searchParams.from}%`);
      }
      if (searchParams.to) {
        query = query.ilike('to_location', `%${searchParams.to}%`);
      }
      if (searchParams.date) {
        const searchDate = new Date(searchParams.date);
        console.log('Search date:', searchDate);
        searchDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query = query
          .gte('departure_time', searchDate.toISOString())
          .lt('departure_time', nextDay.toISOString());
      }
      
      const { data, error } = await query.order('departure_time', { ascending: true });
      console.log('Search result:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('Error in searchRides:', error);
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
