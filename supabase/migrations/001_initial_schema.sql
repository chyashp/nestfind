-- ============================================
-- NestFind Database Schema
-- ============================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text check (role in ('owner', 'buyer', 'admin')) default 'buyer' not null,
  full_name  text not null,
  avatar_url text,
  phone      text,
  bio        text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Properties table
create table if not exists public.properties (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references public.profiles(user_id) on delete cascade not null,
  title          text not null,
  description    text,
  property_type  text check (property_type in ('house','apartment','condo','townhouse','land','commercial')) not null,
  listing_type   text check (listing_type in ('sale','rent')) not null,
  status         text check (status in ('draft','active','under_contract','sold','rented')) default 'draft' not null,
  price          numeric(12,2) not null,
  currency       text default 'USD' not null,

  -- Location
  address        text not null,
  city           text not null,
  state          text not null,
  zip_code       text,
  country        text default 'US' not null,
  latitude       double precision,
  longitude      double precision,

  -- Details
  bedrooms       integer,
  bathrooms      numeric(3,1),
  sqft           integer,
  lot_size       integer,
  year_built     integer,
  parking_spaces integer,

  -- JSON fields
  amenities      jsonb default '[]'::jsonb not null,
  images         jsonb default '[]'::jsonb not null,

  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

-- 3. Saved Properties (favorites)
create table if not exists public.saved_properties (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(user_id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  created_at  timestamptz default now() not null,
  unique(user_id, property_id)
);

-- 4. Enquiries
create table if not exists public.enquiries (
  id             uuid primary key default gen_random_uuid(),
  property_id    uuid references public.properties(id) on delete cascade not null,
  sender_id      uuid references public.profiles(user_id) on delete cascade not null,
  owner_id       uuid references public.profiles(user_id) on delete cascade not null,
  message        text not null,
  phone          text,
  preferred_date date,
  status         text check (status in ('unread','read','replied','archived')) default 'unread' not null,
  created_at     timestamptz default now() not null
);

-- ============================================
-- Indexes
-- ============================================
create index if not exists idx_properties_owner_id on public.properties(owner_id);
create index if not exists idx_properties_listing_type on public.properties(listing_type);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_property_type on public.properties(property_type);
create index if not exists idx_properties_city on public.properties(city);
create index if not exists idx_properties_price on public.properties(price);
create index if not exists idx_properties_location on public.properties using gist (
  point(longitude, latitude)
);
create index if not exists idx_enquiries_property_id on public.enquiries(property_id);
create index if not exists idx_enquiries_sender_id on public.enquiries(sender_id);
create index if not exists idx_enquiries_owner_id on public.enquiries(owner_id);
create index if not exists idx_enquiries_status on public.enquiries(status);
create index if not exists idx_saved_properties_user_id on public.saved_properties(user_id);

-- ============================================
-- Triggers
-- ============================================

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, role, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'buyer'),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'User'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists set_updated_at_properties on public.properties;
create trigger set_updated_at_properties
  before update on public.properties
  for each row execute function public.update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.saved_properties enable row level security;
alter table public.enquiries enable row level security;

-- Helper: check if current user is admin via JWT (avoids infinite recursion on profiles)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Admin can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- PROPERTIES
create policy "Anyone can read active properties"
  on public.properties for select
  using (status = 'active');

create policy "Owners can read own properties (any status)"
  on public.properties for select
  using (auth.uid() = owner_id);

create policy "Admin can read all properties"
  on public.properties for select
  using (public.is_admin());

create policy "Owners can insert own properties"
  on public.properties for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update own properties"
  on public.properties for update
  using (auth.uid() = owner_id);

create policy "Owners can delete own properties"
  on public.properties for delete
  using (auth.uid() = owner_id);

create policy "Admin can update any property"
  on public.properties for update
  using (public.is_admin());

create policy "Admin can delete any property"
  on public.properties for delete
  using (public.is_admin());

-- SAVED PROPERTIES
create policy "Users can manage own saved properties"
  on public.saved_properties for all
  using (auth.uid() = user_id);

-- ENQUIRIES
create policy "Buyers can create enquiries"
  on public.enquiries for insert
  with check (auth.uid() = sender_id);

create policy "Senders can read own enquiries"
  on public.enquiries for select
  using (auth.uid() = sender_id);

create policy "Owners can read enquiries for their properties"
  on public.enquiries for select
  using (auth.uid() = owner_id);

create policy "Owners can update enquiry status"
  on public.enquiries for update
  using (auth.uid() = owner_id);

create policy "Admin can read all enquiries"
  on public.enquiries for select
  using (public.is_admin());

-- ============================================
-- Storage bucket for property images
-- ============================================
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
  );

create policy "Anyone can read property images"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "Users can delete own images"
  on storage.objects for delete
  using (
    bucket_id = 'property-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
