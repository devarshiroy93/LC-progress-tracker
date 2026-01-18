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
with latest_attempt as (
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
    select
      status,
      attempted_at,
      attempt_time_seconds
    from attempts
    where attempts.problem_id = p.id
      and attempts.user_id = p_user_id
    order by attempted_at desc
    limit 1
  ) a on true
),

recall_bucket as (
  select *
  from latest_attempt
  where attempted_at is not null
  order by
    (status = 'NOT_SOLVED') desc,
    attempt_time_seconds desc,
    attempted_at desc
  limit ceil(p_limit * 0.8)
),

explore_bucket as (
  select *
  from latest_attempt
  where attempted_at is null
    and id not in (select id from recall_bucket)
  order by random()
  limit (p_limit - (select count(*) from recall_bucket))
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
