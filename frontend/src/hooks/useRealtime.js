import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export const useRealtime = (table, filter = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      try {
        let query = supabase.from(table).select('*');
        
        // Apply filters if any
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { data: initialData, error: initialError } = await query;
        
        if (initialError) throw initialError;
        setData(initialData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`${table}_channel`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setData((current) => {
            switch (eventType) {
              case 'INSERT':
                // Check if the new record matches our filter
                if (Object.entries(filter).every(([key, value]) => newRecord[key] === value)) {
                  return [...current, newRecord];
                }
                return current;

              case 'DELETE':
                return current.filter((item) => item.id !== oldRecord.id);

              case 'UPDATE':
                return current.map((item) =>
                  item.id === newRecord.id ? newRecord : item
                );

              default:
                return current;
            }
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, JSON.stringify(filter)]);

  return { data, loading, error };
};

// Example usage for ride requests:
export const useRideRequests = (rideId) => {
  return useRealtime('ride_requests', { ride_id: rideId });
};

// Example usage for user rides:
export const useUserRides = (userId) => {
  return useRealtime('rides', { user_id: userId });
};

// Example usage for published rides:
export const usePublishedRides = () => {
  return useRealtime('rides', { status: 'published' });
};
