// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nteijvfpgynwahjqgrzt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50ZWlqdmZwZ3lud2FoanFncnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzAzNjIsImV4cCI6MjA2ODI0NjM2Mn0.zvKSTKVmiwVwLXNa7GxK5Y0b8x9jIInl8ImR1Umq_mA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});