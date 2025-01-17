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
            notes: rideData.notes,
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
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'published')
      .order('departure_date', { ascending: true });
    
    return { data, error };
  },

  // Get rides for a specific user
  async getUserRides(userId) {
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Search rides
  async searchRides(searchParams) {
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
      query = query.gte('departure_date', searchParams.date);
    }
    
    const { data, error } = await query.order('departure_date', { ascending: true });
    return { data, error };
  },

  // Update ride status
  async updateRideStatus(rideId, status) {
    const { data, error } = await supabase
      .from('rides')
      .update({ status })
      .eq('id', rideId)
      .select()
      .single();
    
    return { data, error };
  }
};
