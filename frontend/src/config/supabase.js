import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cevaewlleblsnjrcmufd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldmFld2xsZWJsc25qcmNtdWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMDI4NzksImV4cCI6MjA1MjY3ODg3OX0.yMCeHoIlIgz6aN_7Z2sunqObKsIL54bDI4Vnh9y14do'

console.log('Initializing Supabase client...');
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
