import { createClient, SupabaseClient } from '@supabase/supabase-js';

/*
SQL Schema for the 'phones' table:

create table phones (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  chipset text not null,
  price numeric not null,
  is_sold boolean default false,
  images text[] default '{}',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table phones enable row level security;

-- Create policies
create policy "Public can view phones" on phones for select using (true);
create policy "Authenticated users can manage phones" on phones for all using (auth.role() = 'authenticated');

-- Create storage bucket 'phone_images' and policies
-- (Run this in Supabase Dashboard or SQL Editor)
-- insert into storage.buckets (id, name, public) values ('phone_images', 'phone_images', true);
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'phone_images' );
-- create policy "Authenticated Upload" on storage.objects for insert with check ( bucket_id = 'phone_images' AND auth.role() = 'authenticated' );
*/

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create client only if configured to avoid "supabaseUrl is required" crash
export const supabase: SupabaseClient = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any); // We'll handle null checks in components
