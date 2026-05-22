import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ohqzmjlerxudlhggxqnn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocXptamxlcnh1ZGxoZ2d4cW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDk4NzYsImV4cCI6MjA4ODI4NTg3Nn0.eTDxMhgVGnYlO1jUBMQMiY6lYjp6ud58ltoi8WhKDZo";

export const supabase = createClient(supabaseUrl, supabaseKey);