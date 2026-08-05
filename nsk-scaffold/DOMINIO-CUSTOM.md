# N'sK — Collegare un dominio personalizzato

Non ho accesso a Vercel né a un registrar di domini in questa sessione (nessun connettore collegato), quindi questi passaggi li devi fare tu — qui sotto la guida.

## Se non hai ancora un dominio
Registralo su un registrar qualsiasi (es. Namecheap, GoDaddy, Cloudflare Registrar, IONOS, Aruba se preferisci italiano). Per un'attività italiana con ambizioni anche estere, un `.it` o un `.com` vanno bene entrambi — `.com` se punti anche a clienti esteri, `.it` se vuoi segnalare subito la sede italiana. Costo indicativo 10-15€/anno.

## Collegarlo a Vercel (una volta che lo possiedi)
1. Vercel Dashboard → progetto `neros-kitchen` → Settings → Domains → Add.
2. Digita il dominio (es. `neroskitchen.it`). Vercel ti mostra i record DNS da aggiungere:
   - Dominio "nudo" (`neroskitchen.it`): record **A** verso `76.76.21.21`
   - Sottodominio `www`: record **CNAME** verso `cname.vercel-dns.com`
   (i valori esatti li conferma Vercel al momento — a volte cambia l'IP dell'A record, segui quello mostrato in dashboard)
3. Vai sul pannello DNS del tuo registrar e aggiungi quei record.
4. La propagazione DNS richiede da pochi minuti a 24-48h. Vercel emette da solo il certificato SSL una volta rilevato il DNS corretto.
5. Imposta quale dei due (dominio nudo o `www`) è il "primary" in Vercel — l'altro farà redirect automatico.

## Dopo il collegamento, da aggiornare
- `NEXT_PUBLIC_SITE_URL` su Vercel (Environment Variables) → nuovo dominio, poi redeploy.
- Se e quando passi Stripe a live (vedi `STRIPE-GO-LIVE.md`): success/cancel/refresh/return URL e webhook endpoint vanno puntati al dominio nuovo.
- Se hai già configurato Supabase Auth → URL Configuration (Site URL / Redirect URLs) su `neros-kitchen.vercel.app`, vanno aggiornati o affiancati con il nuovo dominio.

Dimmi il dominio che vuoi usare (o se ne possiedi già uno) e continuo io da qui su quello che posso fare da remoto — es. aggiornare `NEXT_PUBLIC_SITE_URL` nel codice/doc, ricordarti i punti Supabase Auth da aggiornare. I passaggi su Vercel/DNS/registrar restano comunque tuoi.
