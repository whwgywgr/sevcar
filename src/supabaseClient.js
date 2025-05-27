import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmpuvjiztbsjchbqoeig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcHV2aml6dGJzamNoYnFvZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTAyOTAsImV4cCI6MjA2MzkyNjI5MH0.5YWAfJbEeibfpUmJrlBmdRQY92bXZuDa-oPBYgyANgc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
