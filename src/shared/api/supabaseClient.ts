import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qeksjcmnniegxewcrefd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla3NqY21ubmllZ3hld2NyZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjI5MTQsImV4cCI6MjA4NTU5ODkxNH0.PJpCO3OpGtEmZxZT7sKZ0qEKb8CFOTOnrw0EGljqsEs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
})
