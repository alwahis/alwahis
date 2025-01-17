import { supabase } from '../config/supabase';

export const rideRequestsService = {
  // Create a new ride request
  async createRideRequest(requestData) {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .insert([
          {
            from_location: requestData.from,
            to_location: requestData.to,
            preferred_date: requestData.date,
            whatsapp_number: requestData.whatsappNumber,
            status: 'open',
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      return { data, error };
    } catch (error) {
      console.error('Error creating ride request:', error);
      return { error };
    }
  },

  // Get all ride requests
  async getRideRequests() {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching ride requests:', error);
      return { error };
    }
  },

  // Search for ride requests by location and date
  async searchRideRequests(searchParams) {
    try {
      let query = supabase
        .from('ride_requests')
        .select('*')
        .eq('status', 'open');

      if (searchParams.from) {
        query = query.ilike('from_location', `%${searchParams.from}%`);
      }
      if (searchParams.to) {
        query = query.ilike('to_location', `%${searchParams.to}%`);
      }
      if (searchParams.date) {
        const date = new Date(searchParams.date);
        query = query.gte('preferred_date', date.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      console.error('Error searching ride requests:', error);
      return { error };
    }
  },
};
