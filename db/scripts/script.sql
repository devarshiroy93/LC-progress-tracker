create function get_mock_problems(
  p_user_id uuid,
  p_limit int
)
returns table (
  id uuid,
  lc_number int,
  title text,
  statement text,
  example_input text,
  example_output text,
  example_explanation text,
  last_status attempt_status,
  last_attempted_at timestamp with time zone,
  last_attempt_time_seconds int
)
language sql
as $$
with params as (
  select
    ceil(p_limit * 0.3)::int as not_solved_quota,
    ceil(p_limit * 0.3)::int as solved_quota
),

latest_attempt as (
  select
    p.id,
    p.lc_number,
    p.title,
    p.statement,
    p.example_input,
    p.example_output,
    p.example_explanation,
    a.status,
    a.attempted_at,
    a.attempt_time_seconds
  from problems p
  left join lateral (
    select status, attempted_at, attempt_time_seconds
    from attempts
    where attempts.problem_id = p.id
      and attempts.user_id = p_user_id
    order by attempted_at desc
    limit 1
  ) a on true
),

-- 1️⃣ NOT_SOLVED ranked
not_solved_ranked as (
  select
    l.*,
    row_number() over (
      order by
        l.attempt_time_seconds desc nulls last,
        l.attempted_at desc
    ) as rn
  from latest_attempt l
  where l.status = 'NOT_SOLVED'
),

not_solved_bucket as (
  select
    id, lc_number, title, statement,
    example_input, example_output, example_explanation,
    status, attempted_at, attempt_time_seconds
  from not_solved_ranked, params
  where rn <= not_solved_quota
),

-- 2️⃣ SOLVED ranked (slow first)
solved_ranked as (
  select
    l.*,
    row_number() over (
      order by
        l.attempt_time_seconds desc nulls last,
        l.attempted_at desc
    ) as rn
  from latest_attempt l
  where l.status = 'SOLVED'
    and l.id not in (select id from not_solved_bucket)
),

solved_bucket as (
  select
    id, lc_number, title, statement,
    example_input, example_output, example_explanation,
    status, attempted_at, attempt_time_seconds
  from solved_ranked, params
  where rn <= solved_quota
),

recall_bucket as (
  select * from not_solved_bucket
  union all
  select * from solved_bucket
),

-- 3️⃣ EXPLORE (always works)
explore_bucket as (
  select
    id, lc_number, title, statement,
    example_input, example_output, example_explanation,
    status, attempted_at, attempt_time_seconds
  from latest_attempt
  where id not in (select id from recall_bucket)
  order by random()
  limit (
    p_limit - (select count(*) from recall_bucket)
  )
)

select
  id,
  lc_number,
  title,
  statement,
  example_input,
  example_output,
  example_explanation,
  status as last_status,
  attempted_at as last_attempted_at,
  attempt_time_seconds as last_attempt_time_seconds
from (
  select * from recall_bucket
  union all
  select * from explore_bucket
) mixed
order by random()
limit p_limit;
$$;



create table problem_exposures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  problem_id uuid not null,
  shown_at timestamptz not null default now(),

  constraint problem_exposures_unique
    unique (user_id, problem_id)
);


create or replace function problem_coverage_stats()
returns table (
  id uuid,
  title text,
  lc_number integer,
  times_shown bigint,
  last_shown_at timestamptz
)
language sql
as $$
  select
    p.id,
    p.title,
    p.lc_number,
    count(e.id) as times_shown,
    max(e.shown_at) as last_shown_at
  from problems p
  left join problem_exposures e
    on p.id = e.problem_id
  group by p.id, p.title, p.lc_number;
$$;
