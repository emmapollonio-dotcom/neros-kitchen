export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-charcoal px-6 py-16 text-ivory">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl">Informativa sulla privacy</h1>
        <p className="mt-2 font-body text-sm text-ivory/70">
          Ultimo aggiornamento: 5 agosto 2026
        </p>

        <div className="mt-8 rounded-panel border border-line bg-white p-6 shadow-soft md:p-10">
        <p className="rounded-nsk border border-teal/40 bg-teal/10 p-4 font-body text-sm text-charcoal">
          Questa pagina è una bozza completa dal punto di vista tecnico, ma i dati del titolare
          del trattamento (sezione 1) vanno completati con la ragione sociale reale prima della
          pubblicazione, ed è opportuno farla rivedere da un legale/consulente privacy prima di
          renderla operativa, in particolare le sezioni su conservazione dei dati e trasferimenti
          extra-UE.
        </p>

        <div className="mt-10 space-y-10 font-body text-sm leading-relaxed text-charcoal">
          <section>
            <h2 className="font-display text-xl">1. Titolare del trattamento</h2>
            <p className="mt-3">
              [Nome/Ragione sociale], [indirizzo], [P.IVA/Codice Fiscale] — email di contatto per
              questioni privacy: [inserire email, es. privacy@neroskitchen.it].
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">2. Quali dati raccogliamo</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Dati account:</strong> nome, email, password (in forma cifrata), ruolo
                (cliente/chef), lingua preferita.
              </li>
              <li>
                <strong>Dati di prenotazione:</strong> tipo di evento, data, numero di ospiti,
                luogo, note, cronologia delle prenotazioni.
              </li>
              <li>
                <strong>Dati di pagamento:</strong> gestiti direttamente da Stripe — non
                memorizziamo mai numeri di carta sui nostri server. Conserviamo solo importi,
                stato del pagamento e riferimenti alla transazione Stripe.
              </li>
              <li>
                <strong>Interazioni con le funzionalità AI:</strong> il testo che scrivi agli
                assistenti (es. Food Cost Analyst, Booking Assistant) e le risposte generate,
                registrati per finalità di sicurezza e miglioramento del servizio.
              </li>
              <li>
                <strong>Dati tecnici:</strong> indirizzo IP, tipo di dispositivo/browser, log di
                errore (se hai attivato il monitoraggio errori), identificativo di notifica push
                (se hai attivato le notifiche sull&apos;app mobile).
              </li>
              <li>
                <strong>Cookie:</strong> vedi la sezione dedicata più sotto e il banner mostrato
                alla prima visita.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl">3. Perché li trattiamo (finalità e base giuridica)</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Erogazione del servizio</strong> (creare prenotazioni, gestire pagamenti,
                far funzionare l&apos;account) — base giuridica: esecuzione del contratto.
              </li>
              <li>
                <strong>Funzionalità basate su intelligenza artificiale</strong> (suggerimenti di
                food cost, riduzione sprechi, risposte alle recensioni, ecc.) — base giuridica:
                esecuzione del contratto, essendo funzionalità richieste attivamente dall&apos;utente.
              </li>
              <li>
                <strong>Sicurezza e prevenzione abusi</strong> (es. limiti di richieste per
                prevenire un uso anomalo delle funzionalità AI) — base giuridica: legittimo
                interesse.
              </li>
              <li>
                <strong>Comunicazioni di servizio</strong> (conferme di prenotazione, promemoria,
                notifiche di stato) — base giuridica: esecuzione del contratto.
              </li>
              <li>
                <strong>Comunicazioni di marketing</strong> (se previste in futuro) — base
                giuridica: consenso esplicito, revocabile in ogni momento.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl">4. Con chi condividiamo i dati</h2>
            <p className="mt-3">
              Alcuni fornitori terzi trattano i dati per nostro conto, in qualità di responsabili
              del trattamento, solo nella misura necessaria a fornire il servizio:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>Supabase</strong> — database e autenticazione.</li>
              <li><strong>Vercel</strong> — hosting del sito.</li>
              <li><strong>Stripe</strong> — elaborazione dei pagamenti.</li>
              <li><strong>OpenAI</strong> — elaborazione delle richieste alle funzionalità AI.</li>
              <li>
                <strong>SendGrid</strong> (tramite la piattaforma di automazione n8n) — invio di
                email transazionali (conferme, promemoria).
              </li>
              <li>
                <strong>OneSignal</strong> — invio delle notifiche push sull&apos;app mobile, se
                attivate.
              </li>
              <li>
                <strong>Sentry</strong> — monitoraggio errori tecnici, se attivato dal titolare.
              </li>
            </ul>
            <p className="mt-3">
              Non vendiamo né condividiamo i tuoi dati con terzi per finalità pubblicitarie.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">5. Trasferimento dei dati fuori dall&apos;UE</h2>
            <p className="mt-3">
              Alcuni fornitori (es. OpenAI, Stripe) possono trattare dati su server situati negli
              Stati Uniti. In questi casi il trasferimento avviene sulla base delle Clausole
              Contrattuali Standard approvate dalla Commissione Europea o di altro meccanismo di
              adeguatezza previsto dal fornitore.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">6. Per quanto tempo conserviamo i dati</h2>
            <p className="mt-3">
              I dati dell&apos;account vengono conservati per la durata del rapporto contrattuale
              e, dopo la chiusura dell&apos;account, per il tempo necessario ad adempiere a
              obblighi legali (es. fiscali) o a far valere/difendere un diritto in sede
              giudiziaria. I log tecnici vengono conservati per un periodo limitato, tipicamente
              non superiore a 90 giorni.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">7. I tuoi diritti</h2>
            <p className="mt-3">
              In quanto interessato puoi richiedere in ogni momento: accesso ai tuoi dati,
              rettifica, cancellazione, limitazione del trattamento, portabilità dei dati e
              opposizione al trattamento basato sul legittimo interesse. Puoi esercitare questi
              diritti scrivendo a [email privacy]. Hai inoltre diritto di proporre reclamo
              all&apos;Autorità Garante per la protezione dei dati personali (garanteprivacy.it).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">8. Minori</h2>
            <p className="mt-3">
              Il servizio non è rivolto a persone di età inferiore ai 18 anni e non raccogliamo
              consapevolmente dati di minori.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">9. Cookie</h2>
            <p className="mt-3">
              Usiamo cookie tecnici essenziali (es. mantenere la sessione di accesso), sempre
              attivi perché necessari al funzionamento del sito. Se in futuro attiveremo cookie
              di analisi o marketing, te lo chiederemo esplicitamente tramite il banner mostrato
              alla prima visita, e potrai accettarli o rifiutarli liberamente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">10. Modifiche a questa informativa</h2>
            <p className="mt-3">
              Possiamo aggiornare questa informativa nel tempo. In caso di modifiche sostanziali
              te ne daremo comunicazione tramite il sito o via email.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">11. Contatti</h2>
            <p className="mt-3">Per qualsiasi domanda su questa informativa: [email di contatto].</p>
          </section>
        </div>
        </div>
      </div>
    </div>
  );
}
