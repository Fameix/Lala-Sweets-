create table if not exists public.cake_serving_rules (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid null,
  grams_per_adult_small integer not null default 75,
  grams_per_adult_standard integer not null default 100,
  grams_per_adult_generous integer not null default 125,
  grams_per_child_small integer not null default 45,
  grams_per_child_standard integer not null default 60,
  grams_per_child_generous integer not null default 80,
  dessert_reduction_percentage integer not null default 20,
  buffer_percentage integer not null default 10,
  rounding_increment_grams integer not null default 500,
  minimum_weight_grams integer not null default 500,
  maximum_weight_grams integer not null default 5000,
  multi_tier_minimum_weight_grams integer not null default 2000,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  guest_session_id text null,
  language text not null default 'mixed',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz null
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null,
  message_type text not null default 'text',
  content text not null,
  tool_name text null,
  tool_result jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists public.custom_cake_ai_summaries (
  id uuid primary key default gen_random_uuid(),
  custom_cake_request_id uuid null,
  customer_summary text not null,
  structured_summary jsonb not null,
  missing_fields jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  language text not null default 'mixed',
  model_provider text null,
  model_identifier text null,
  confirmed_by_customer boolean not null default false,
  confirmed_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.voice_transcripts (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid null references public.ai_conversations(id) on delete cascade,
  user_id uuid null,
  guest_session_id text null,
  language text not null default 'mixed',
  transcript text not null,
  confirmed_text text null,
  customer_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz null
);

alter table public.cake_serving_rules enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.custom_cake_ai_summaries enable row level security;
alter table public.voice_transcripts enable row level security;

create policy "Public can read active cake serving rules"
  on public.cake_serving_rules for select
  using (is_active = true);

create policy "Users can read own ai conversations"
  on public.ai_conversations for select
  using (auth.uid() = user_id);

create policy "Users can read own ai messages"
  on public.ai_messages for select
  using (
    exists (
      select 1 from public.ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
    )
  );

create policy "Users can read own voice transcripts"
  on public.voice_transcripts for select
  using (auth.uid() = user_id);

