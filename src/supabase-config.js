import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://bkwsulzqofvldubagrxs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrd3N1bHpxb2Z2bGR1YmFncnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxNjE1NjgsImV4cCI6MjA1NDczNzU2OH0.njk1Buywu6t3xoXGBDfOD9OD2k8F8A9ixHMjGuj-vSs";
const supabase = createClient(supabaseUrl, supabaseKey);
