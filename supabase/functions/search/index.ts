import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from Search Function!')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse request body
    const { 
      departure_city,
      destination_city,
      date,
      min_price,
      max_price,
      departure_time_start,
      departure_time_end,
      min_available_seats,
      sort_by = 'departure_time',
      sort_order = 'asc',
      page = 1,
      per_page = 10
    } = await req.json()

    // Build query
    let query = supabaseClient
      .from('rides')
      .select('*', { count: 'exact' })
      .eq('status', 'published')

    // Apply filters
    if (departure_city) {
      query = query.eq('departure_city', departure_city)
    }
    if (destination_city) {
      query = query.eq('destination_city', destination_city)
    }
    if (date) {
      query = query.gte('departure_time', `${date}T00:00:00`)
        .lt('departure_time', `${date}T23:59:59`)
    }
    if (min_price) {
      query = query.gte('price_per_seat', min_price)
    }
    if (max_price) {
      query = query.lte('price_per_seat', max_price)
    }
    if (departure_time_start) {
      query = query.gte('departure_time', `${date}T${departure_time_start}:00`)
    }
    if (departure_time_end) {
      query = query.lte('departure_time', `${date}T${departure_time_end}:00`)
    }
    if (min_available_seats) {
      query = query.gte('available_seats', min_available_seats)
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' })

    // Apply pagination
    const from = (page - 1) * per_page
    const to = from + per_page - 1
    query = query.range(from, to)

    // Execute query
    const { data: rides, count, error } = await query

    if (error) {
      throw error
    }

    // Return response
    return new Response(
      JSON.stringify({
        rides,
        pagination: {
          current_page: page,
          per_page,
          total_items: count,
          total_pages: Math.ceil(count / per_page)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
