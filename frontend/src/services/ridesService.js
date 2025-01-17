import { supabase } from '../config/supabase';

export const ridesService = {
  // Create a new ride
  async createRide(rideData) {
    const { data, error } = await supabase
      .from('rides')
      .insert([rideData])
      .select()
      .single();
    
    return { data, error };
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
