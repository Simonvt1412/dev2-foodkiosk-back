import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://ltsmcfchbqltxdjmeetn.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0c21jZmNoYnFsdHhkam1lZXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTAxNzUsImV4cCI6MjA2Mjg4NjE3NX0.yv_d747n6UG-nP_86sN4dmd_wzl3zsXLDlWDBDE1ozo";

if (supabaseUrl === "https://ltsmcfchbqltxdjmeetn.supabase.co" || supabaseAnonKey === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0c21jZmNoYnFsdHhkam1lZXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTAxNzUsImV4cCI6MjA2Mjg4NjE3NX0.yv_d747n6UG-nP_86sN4dmd_wzl3zsXLDlWDBDE1ozo") {
  console.warn("Using default Supabase credentials. For security, please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

