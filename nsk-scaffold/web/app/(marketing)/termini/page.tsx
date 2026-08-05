export default function TerminiPage() {
  return (
    <main className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl">Termini di servizio</h1>
        <p className="mt-2 font-body text-sm text-smoke">
          Ultimo aggiornamento: 5 agosto 2026
        </p>

        <p className="mt-6 rounded-nsk border border-gold/40 bg-gold/10 p-4 font-body text-sm text-charcoal">
          Questa pagina è una bozza completa nella struttura, ma le politiche di cancellazione e
          rimborso (sezione 4) e i dati societari (sezione 1) vanno confermati/completati da te
          prima della pubblicazione — sono scelte di business, non tecniche, e vale la pena farle
          rivedere da un legale prima di renderle vincolanti.
        </p>

        <div className="mt-10 space-y-10 font-body text-sm leading-relaxed text-charcoal">
          <section>
            <h2 className="font-display text-xl">1. Chi siamo e accettazione dei termini</h2>
            <p className="mt-3">
              Nero&apos;s Kitchen (&quot;N&apos;sK&quot;, &quot;la piattaforma&quot;, &quot;noi&quot;) è un servizio gestito da
              [Nome/Ragione sociale], [indirizzo], [P.IVA/Codice Fiscale]. Creando un account o
              usando il servizio accetti questi termini. Se non li accetti, non puoi usare la
              piattaforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">2. Cosa fa N&apos;sK</h2>
            <p className="mt-3">
              N&apos;sK è un marketplace che mette in contatto clienti e chef professionisti
              indipendenti per servizi di ristorazione a domicilio, corsi di cucina e consulenza,
              e offre agli chef strumenti gestionali (food cost, HACCP, zero waste, social media,
              CRM, academy) alcuni dei quali assistiti da intelligenza artificiale. N&apos;sK agisce
              da intermediario tecnologico: gli chef restano professionisti indipendenti, non
              dipendenti o collaboratori di N&apos;sK, e sono responsabili della qualità e
              conformità normativa (es. HACCP) dei servizi che erogano.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">3. Account</h2>
            <p className="mt-3">
              Devi avere almeno 18 anni per registrarti. Sei responsabile della riservatezza delle
              tue credenziali e di ogni attività svolta con il tuo account. Segnalaci subito ogni
              accesso non autorizzato.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">4. Prenotazioni, pagamenti e cancellazioni</h2>
            <p className="mt-3">
              Una prenotazione richiesta da un cliente diventa vincolante solo dopo la conferma
              esplicita da parte dello chef (preventivo accettato). I pagamenti sono elaborati da
              Stripe; N&apos;sK trattiene una commissione di piattaforma sull&apos;importo pagato,
              indicata prima della conferma.
            </p>
            <p className="mt-3">
              [Da definire: politica di cancellazione — es. rimborso pieno se cancellata più di X
              giorni prima dell&apos;evento, parziale entro Y giorni, nessun rimborso sotto le Z ore.
              Inserire qui la policy scelta.]
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">5. Abbonamenti N&apos;sK Pro</h2>
            <p className="mt-3">
              I piani a pagamento per chef si rinnovano automaticamente su base mensile o annuale
              tramite Stripe, finché non li cancelli dalle impostazioni del tuo account. Puoi
              cancellare in ogni momento; l&apos;accesso alle funzionalità Pro resta attivo fino alla
              fine del periodo già pagato.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">6. Funzionalità con intelligenza artificiale</h2>
            <p className="mt-3">
              Alcune funzionalità (assistente ricette, analisi food cost, consulente zero waste,
              consulente HACCP, generatore contenuti social, qualificazione lead, tutor academy,
              risposte alle recensioni, rilevamento allergeni) usano modelli di intelligenza
              artificiale per generare suggerimenti. Questi suggerimenti:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>sono un supporto operativo, non una certificazione né una consulenza professionale, legale, medica o nutrizionale vincolante;</li>
              <li>vanno sempre verificati da un umano prima di essere applicati, specialmente per allergeni, sicurezza alimentare (HACCP) e prezzi;</li>
              <li>possono contenere imprecisioni: la responsabilità finale delle decisioni prese resta dell&apos;utente (chef o cliente) che le applica.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl">7. Contenuti utente</h2>
            <p className="mt-3">
              Resti proprietario dei contenuti che carichi (ricette, foto, testi). Ci concedi una
              licenza non esclusiva per mostrarli sulla piattaforma nella misura necessaria a
              fornire il servizio (es. mostrare le tue ricette pubbliche ad altri utenti).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">8. Uso vietato</h2>
            <p className="mt-3">
              Non puoi: usare la piattaforma per scopi illeciti, tentare di aggirare i limiti
              tecnici di sicurezza (es. i limiti di richieste alle funzionalità AI), estrarre dati
              in massa (scraping), impersonare altri utenti, o caricare contenuti offensivi,
              discriminatori o che violano diritti di terzi.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">9. Limitazione di responsabilità</h2>
            <p className="mt-3">
              N&apos;sK fornisce la piattaforma &quot;così com&apos;è&quot;. Nella misura massima consentita
              dalla legge applicabile, non siamo responsabili per danni indiretti derivanti
              dall&apos;uso del servizio, né per la qualità dei servizi erogati dagli chef
              indipendenti, che restano sotto la loro esclusiva responsabilità professionale.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">10. Sospensione e cessazione</h2>
            <p className="mt-3">
              Possiamo sospendere o chiudere un account che viola questi termini, dandone
              comunicazione quando ragionevolmente possibile. Puoi chiudere il tuo account in ogni
              momento dalle impostazioni del profilo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">11. Legge applicabile</h2>
            <p className="mt-3">
              Questi termini sono regolati dalla legge italiana. Per ogni controversia è
              competente il foro del consumatore ove applicabile, altrimenti il foro di [città].
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">12. Modifiche ai termini</h2>
            <p className="mt-3">
              Possiamo aggiornare questi termini nel tempo; in caso di modifiche sostanziali te ne
              daremo comunicazione tramite il sito o via email prima che entrino in vigore.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">13. Contatti</h2>
            <p className="mt-3">Per domande su questi termini: [email di contatto].</p>
          </section>
        </div>
      </div>
    </main>
  );
}
