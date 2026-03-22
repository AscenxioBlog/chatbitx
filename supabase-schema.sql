-- Run this in your Supabase SQL editor

-- Users table (linked to auth.users)
create table users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('student', 'instructor', 'admin')) default 'student',
  bio text,
  avatar_url text,
  github_url text,
  created_at timestamptz default now()
);

-- Direct messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references users(id) on delete cascade,
  receiver_id uuid references users(id) on delete cascade,
  content text,
  image_url text,
  is_read boolean default false,
  sent_at timestamptz default now()
);

-- Auto-create user profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.users (auth_id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure handle_new_user();

-- Groups
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null check (type in ('class', 'project', 'study', 'general')) default 'general',
  max_members int,
  passcode text not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

-- Group members
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Group messages
create table group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Posts
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  content text not null,
  type text not null check (type in ('text', 'resource', 'announcement')) default 'text',
  created_at timestamptz default now()
);

-- Post likes
create table post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  unique(post_id, user_id)
);

-- Post comments
create table post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Competitions
create table competitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  rules text,
  prize text,
  prize_breakdown text,
  category text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  entry_fee numeric default 0,
  deadline timestamptz not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

-- Competition registrations
create table competition_registrations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  payment_status text default 'free',
  payment_reference text,
  registered_at timestamptz default now(),
  unique(competition_id, user_id)
);

-- Submissions
create table submissions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  github_url text not null,
  demo_url text,
  description text,
  instructor_score int check (instructor_score between 0 and 100),
  submitted_at timestamptz default now(),
  unique(competition_id, user_id)
);

-- Votes
create table votes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade,
  voter_id uuid references users(id) on delete cascade,
  voted_at timestamptz default now(),
  unique(submission_id, voter_id)
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table users enable row level security;
alter table messages enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table group_messages enable row level security;
alter table posts enable row level security;
alter table post_likes enable row level security;
alter table post_comments enable row level security;
alter table competitions enable row level security;
alter table competition_registrations enable row level security;
alter table submissions enable row level security;
alter table votes enable row level security;
alter table notifications enable row level security;

-- RLS Policies (permissive for authenticated users — tighten as needed)
create policy "Authenticated read users" on users for select to authenticated using (true);
create policy "Users update own" on users for update to authenticated using (auth_id = auth.uid());
create policy "Admins update any user" on users for update to authenticated
  using (
    (select role from users where auth_id = auth.uid()) = 'admin'
  );

create policy "Users read own messages" on messages for select to authenticated
  using (
    sender_id = (select id from users where auth_id = auth.uid()) or
    receiver_id = (select id from users where auth_id = auth.uid())
  );
create policy "Users send messages" on messages for insert to authenticated
  with check (
    sender_id = (select id from users where auth_id = auth.uid())
  );
create policy "Users update read status" on messages for update to authenticated
  using (
    receiver_id = (select id from users where auth_id = auth.uid())
  );

create policy "Authenticated read groups" on groups for select to authenticated using (true);
create policy "Instructors create groups" on groups for insert to authenticated with check (true);

create policy "Authenticated read members" on group_members for select to authenticated using (true);
create policy "Users join groups" on group_members for insert to authenticated with check (user_id = (select id from users where auth_id = auth.uid()));

create policy "Members read messages" on group_messages for select to authenticated using (true);
create policy "Members send messages" on group_messages for insert to authenticated with check (user_id = (select id from users where auth_id = auth.uid()));

create policy "Authenticated read posts" on posts for select to authenticated using (true);
create policy "Users create posts" on posts for insert to authenticated with check (user_id = (select id from users where auth_id = auth.uid()));

create policy "Authenticated read likes" on post_likes for select to authenticated using (true);
create policy "Users like posts" on post_likes for insert to authenticated with check (user_id = (select id from users where auth_id = auth.uid()));
create policy "Users unlike posts" on post_likes for delete to authenticated using (user_id = (select id from users where auth_id = auth.uid()));

create policy "Authenticated read comments" on post_comments for select to authenticated using (true);
create policy "Users comment on posts" on post_comments for insert to authenticated
  with check (user_id = (select id from users where auth_id = auth.uid()));
create policy "Users delete own comments" on post_comments for delete to authenticated
  using (user_id = (select id from users where auth_id = auth.uid()));

create policy "Authenticated read competitions" on competitions for select to authenticated using (true);

create policy "Authenticated read registrations" on competition_registrations for select to authenticated using (true);
create policy "Users register" on competition_registrations for insert to authenticated with check (user_id = (select id from users where auth_id = auth.uid()));
create policy "Users update own registration" on competition_registrations for update to authenticated using (user_id = (select id from users where auth_id = auth.uid()));

create policy "Authenticated read submissions" on submissions for select to authenticated using (true);
create policy "Users submit" on submissions for insert to authenticated with check (user_id = (select id from users where auth_id = auth.uid()));
create policy "Instructors score" on submissions for update to authenticated using (true);

create policy "Authenticated read votes" on votes for select to authenticated using (true);
create policy "Users vote" on votes for insert to authenticated with check (voter_id = (select id from users where auth_id = auth.uid()));

create policy "Users read own notifications" on notifications for select to authenticated using (user_id = (select id from users where auth_id = auth.uid()));
create policy "Users update own notifications" on notifications for update to authenticated using (user_id = (select id from users where auth_id = auth.uid()));

-- Enable realtime for group_messages and notifications
alter publication supabase_realtime add table group_messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table messages;
