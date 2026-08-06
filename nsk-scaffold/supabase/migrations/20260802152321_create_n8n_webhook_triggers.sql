drop trigger if exists n8n_bookings_notification on public.bookings;
create trigger n8n_bookings_notification
  after insert or update on public.bookings
  for each row
  execute function supabase_functions.http_request(
    'https://nerosk.app.n8n.cloud/webhook/nsk/bookings-webhook',
    'POST',
    '{"Content-Type":"application/json"}',
    '{}',
    '5000'
  );

drop trigger if exists n8n_leads_followup on public.leads;
create trigger n8n_leads_followup
  after insert on public.leads
  for each row
  execute function supabase_functions.http_request(
    'https://nerosk.app.n8n.cloud/webhook/nsk/leads-webhook',
    'POST',
    '{"Content-Type":"application/json"}',
    '{}',
    '5000'
  );
