-- 0006: Weekly cleanup of the activity log so old audit data isn't kept
-- indefinitely. Uses pg_cron; purges entries older than 7 days every Sunday
-- at 03:00 UTC. Adjust the interval / schedule to change retention.
create extension if not exists pg_cron;

-- Replace any existing job with the same name (idempotent re-runs).
do $$
begin
  perform cron.unschedule('purge-old-activity-logs');
exception
  when others then null;
end $$;

select cron.schedule(
  'purge-old-activity-logs',
  '0 3 * * 0',
  $$delete from public.activity_logs where created_at < now() - interval '7 days'$$
);
