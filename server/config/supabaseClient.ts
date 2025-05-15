import { createClient } from "@supabase/supabase-js";

// Haal deze waarden uit uw Supabase projectinstellingen
// Het is aanbevolen om deze in environment variables (.env bestand) te plaatsen
// en hier te laden met bijvoorbeeld dotenv, vooral voor de anon key en service role key.
const supabaseUrl = process.env.SUPABASE_URL || "https://ltsmcfchbqltxdjmeetn.supabase.co"; // Vervang dit
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0c21jZmNoYnFsdHhkam1lZXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTAxNzUsImV4cCI6MjA2Mjg4NjE3NX0.yv_d747n6UG-nP_86sN4dmd_wzl3zsXLDlWDBDE1ozo"; // Vervang dit

if (supabaseUrl === "https://ltsmcfchbqltxdjmeetn.supabase.co" || supabaseAnonKey === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0c21jZmNoYnFsdHhkam1lZXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTAxNzUsImV4cCI6MjA2Mjg4NjE3NX0.yv_d747n6UG-nP_86sN4dmd_wzl3zsXLDlWDBDE1ozo") {
  console.warn("Supabase URL or Anon Key is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables or update supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

