-- Collega i 2 Database Webhook documentati in DEPLOY-ISTRUZIONI.md (8bis),
-- rimasti solo documentati e mai creati: le automazioni n8n esistevano già
-- e sono state testate end-to-end via curl, mancavano solo questi due
-- trigger che le fanno scattare automaticamente dal database.
-- Stesso meccanismo che userebbe la dashboard Supabase (Database > Webhooks):
-- trigger su supabase_functions.http_request(), payload {old_record, record, type, table, schema}.

create trigger "nsk_waste_cost_alert"
after insert on public.waste_items
for each row execute function supabase_functions.http_request(
  'https://nerosk.app.n8n.cloud/webhook/nsk/waste-webhook',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '5000'
);

create trigger "nsk_social_post_ready"
after update on public.social_posts
for each row execute function supabase_functions.http_request(
  'https://nerosk.app.n8n.cloud/webhook/nsk/social-ready-webhook',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '5000'
);
