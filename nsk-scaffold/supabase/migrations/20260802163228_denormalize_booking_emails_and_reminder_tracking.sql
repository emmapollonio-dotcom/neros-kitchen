alter table public.bookings
  add column if not exists chef_email text,
  add column if not exists customer_email text,
  add column if not exists reminder_sent_at timestamptz;

create or replace function public.populate_booking_emails()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select email into NEW.chef_email from auth.users where id = NEW.chef_id;
  select email into NEW.customer_email from auth.users where id = NEW.customer_id;
  return NEW;
end;
$$;

drop trigger if exists populate_booking_emails_trigger on public.bookings;
create trigger populate_booking_emails_trigger
before insert or update on public.bookings
for each row execute function public.populate_booking_emails();

update public.bookings b
set chef_email = u1.email
from auth.users u1
where b.chef_id = u1.id and b.chef_email is null;

update public.bookings b
set customer_email = u2.email
from auth.users u2
where b.customer_id = u2.id and b.customer_email is null;

drop trigger if exists n8n_bookings_notification on public.bookings;
create trigger n8n_bookings_notification
after insert or update on public.bookings
for each row execute function supabase_functions.http_request(
  'https://nerosk.app.n8n.cloud/webhook/nsk/bookings-webhook', 'POST', '{"Content-Type":"application/json"}', '{}', '5000'
);
