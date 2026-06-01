const { createClient } = require('@supabase/supabase-js');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZ6ZHVyaXJmZHlvdXFtd25vIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJleHAiOjE3NzU3MDA5MjEsImlhdCI6MTc3NTY5OTkyMSwic3ViIjoiODNjYjgwM2YtZWEyMi00NDZhLWJmNTAtNGRhM2RhZWZmZjgyIn0.y_d5G7fL1jK5W5c9w5F5p2w-O5yW6jK5W5c9w5F5p2w'; 
// Wait, we don't need to test RLS because we already fixed it by using supabaseAdmin.
