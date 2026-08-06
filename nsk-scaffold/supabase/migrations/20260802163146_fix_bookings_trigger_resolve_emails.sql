create or replace function public.notify_n8n_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chef_email text;
  customer_email text;
  payload jsonb;
begin
  select u.email into chef_email from auth.users u where u.id = NEW.chef_id;
  select u.email into customer_email from auth.users u where u.id = NEW.customer_id;

  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', to_jsonb(NEW) || jsonb_build_object('chef_email', chef_email, 'customer_email', customer_email)
  );

  perform net.http_post(
    url := 'https://nerosk.app.n8n.cloud/webhook/nsk/bookings-webhook',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := payload
  );
  return NEW;
end;
$$;

drop trigger if exists n8n_bookings_notification on public.bookings;
create trigger n8n_bookings_notification
after insert or update on public.bookings
for each row execute function public.notify_n8n_booking();
