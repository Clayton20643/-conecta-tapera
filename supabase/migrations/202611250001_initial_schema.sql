-- CONECTA TAPERA — schema inicial
-- Execute no SQL Editor do Supabase. Esta migration é segura para execução única.

create type public.app_role as enum ('resident', 'editor', 'admin');
create type public.business_status as enum ('draft', 'pending', 'approved', 'rejected', 'suspended');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.post_type as enum ('news', 'event', 'announcement');

create table public.municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state_code char(2) not null default 'AL',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, state_code)
);
insert into public.municipalities (name, state_code)
values ('São José da Tapera', 'AL')
on conflict (name, state_code) do nothing;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  municipality_id uuid references public.municipalities(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'resident',
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'resident')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  municipality_id uuid not null references public.municipalities(id),
  name text not null check (char_length(name) between 2 and 120),
  category text not null,
  description text not null default '',
  phone text,
  whatsapp text,
  website text,
  address text,
  neighborhood text,
  status public.business_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index businesses_public_search_idx on public.businesses (municipality_id, category, status);
create index businesses_owner_idx on public.businesses (owner_id);
create trigger businesses_set_updated_at before update on public.businesses
  for each row execute procedure public.set_updated_at();

create table public.business_services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text not null default '',
  price_from numeric(10,2) check (price_from is null or price_from >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index business_services_business_idx on public.business_services (business_id);
create trigger business_services_set_updated_at before update on public.business_services
  for each row execute procedure public.set_updated_at();

create table public.job_posts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null,
  application_contact text,
  expires_at timestamptz,
  status public.business_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index job_posts_status_idx on public.job_posts (status, expires_at);
create trigger job_posts_set_updated_at before update on public.job_posts
  for each row execute procedure public.set_updated_at();

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete restrict,
  municipality_id uuid references public.municipalities(id) on delete set null,
  post_type public.post_type not null,
  title text not null check (char_length(title) between 3 and 180),
  body text not null,
  image_url text,
  event_starts_at timestamptz,
  event_location text,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index community_posts_public_idx
  on public.community_posts (municipality_id, post_type, status, published_at desc);
create trigger community_posts_set_updated_at before update on public.community_posts
  for each row execute procedure public.set_updated_at();

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  status text not null default 'pending' check (status in ('pending', 'visible', 'rejected')),
  created_at timestamptz not null default now(),
  unique (user_id, business_id)
);
create index reviews_business_status_idx on public.reviews (business_id, status);

alter table public.municipalities enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_services enable row level security;
alter table public.job_posts enable row level security;
alter table public.community_posts enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;

create policy "Active municipalities are public" on public.municipalities
  for select to anon, authenticated using (is_active);
create policy "Admins manage municipalities" on public.municipalities
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Users read their own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Users update their own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins manage profiles" on public.profiles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Users read their own role assignments" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage role assignments" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Public sees approved businesses"
  on public.businesses for select to anon
  using (status = 'approved');
create policy "Authenticated sees approved, own, and admin-visible businesses"
  on public.businesses for select to authenticated
  using (status = 'approved' or owner_id = auth.uid()
    or public.has_role(auth.uid(), 'admin'));
create policy "Owners submit businesses for review" on public.businesses
  for insert to authenticated
  with check (owner_id = auth.uid() and status in ('draft', 'pending'));
create policy "Owners edit unapproved business records" on public.businesses
  for update to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and status in ('draft', 'pending', 'rejected'));
create policy "Owners delete their business records" on public.businesses
  for delete to authenticated using (owner_id = auth.uid());
create policy "Admins fully manage businesses" on public.businesses
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Public sees active services of approved businesses" on public.business_services
  for select to anon
  using (is_active and exists (select 1 from public.businesses b
    where b.id = business_id and b.status = 'approved'));
create policy "Authenticated sees approved and own business services" on public.business_services
  for select to authenticated
  using (
    (is_active and exists (select 1 from public.businesses b
      where b.id = business_id and b.status = 'approved'))
    or exists (select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );
create policy "Business owners manage their services" on public.business_services
  for all to authenticated
  using (exists (select 1 from public.businesses b
    where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b
    where b.id = business_id and b.owner_id = auth.uid()));
create policy "Admins manage all services" on public.business_services
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Public sees published jobs for approved businesses" on public.job_posts
  for select to anon, authenticated
  using (status = 'approved' and (expires_at is null or expires_at > now())
    and exists (select 1 from public.businesses b
      where b.id = business_id and b.status = 'approved'));
create policy "Owners view and manage their job posts" on public.job_posts
  for all to authenticated
  using (exists (select 1 from public.businesses b
    where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b
    where b.id = business_id and b.owner_id = auth.uid())
    and status in ('draft', 'pending', 'rejected'));
create policy "Admins manage all job posts" on public.job_posts
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Published community posts are public" on public.community_posts
  for select to anon, authenticated using (status = 'published');
create policy "Editors and admins manage community posts" on public.community_posts
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create policy "Users manage their own favorites" on public.favorites
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Public sees visible reviews" on public.reviews
  for select to anon using (status = 'visible');
create policy "Authenticated sees visible and own reviews" on public.reviews
  for select to authenticated
  using (status = 'visible' or user_id = auth.uid()
    or public.has_role(auth.uid(), 'admin'));
create policy "Authenticated users submit pending reviews" on public.reviews
  for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "Users delete their pending reviews" on public.reviews
  for delete to authenticated using (user_id = auth.uid() and status = 'pending');
create policy "Admins moderate reviews" on public.reviews
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant usage on schema public to anon, authenticated;
grant select on public.municipalities to anon, authenticated;
grant insert, update, delete on public.municipalities to authenticated;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, municipality_id) on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select on public.businesses to anon, authenticated;
grant insert, update, delete on public.businesses to authenticated;
grant select on public.business_services to anon, authenticated;
grant insert, update, delete on public.business_services to authenticated;
grant select on public.job_posts to anon, authenticated;
grant insert, update, delete on public.job_posts to authenticated;
grant select on public.community_posts to anon, authenticated;
grant insert, update, delete on public.community_posts to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;

-- Novas contas recebem o papel resident. Conceda admin manualmente no SQL Editor.
