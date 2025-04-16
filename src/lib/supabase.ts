
import { createClient } from '@supabase/supabase-js';

// Supabase credentials provided
const supabaseUrl = 'https://plgwjspvmvgfccmnzqaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZ3dqc3B2bXZnZmNjbW56cWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzExOTAsImV4cCI6MjA2MDQwNzE5MH0.wOHRyW44qmyoLscx6OHUIWvm6l5Lc9bg3MOaAGhNl9s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
