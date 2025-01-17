import { supabase } from '../config/supabase';

export const requestsService = {
  // Create a new ride request
  async createRequest(requestData) {
    const { data, error } = await supabase
      .from('ride_requests')
      .insert([requestData])
      .select()
      .single();
    
    return { data, error };
  },

  // Get requests for a specific ride
  async getRideRequests(rideId) {
    const { data, error } = await supabase
      .from('ride_requests')
      .select(`
        *,
        users:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('ride_id', rideId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Get requests made by a user
  async getUserRequests(userId) {
    const { data, error } = await supabase
      .from('ride_requests')
      .select(`
        *,
        rides:ride_id (
          *,
          users:user_id (
            id,
            full_name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Update request status
  async updateRequestStatus(requestId, status) {
    const { data, error } = await supabase
      .from('ride_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();
    
    return { data, error };
  }
};
