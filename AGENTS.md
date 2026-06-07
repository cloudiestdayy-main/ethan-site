# AGENTS.md — Guida per agenti IA

> File di onboarding + stato lavori per agenti IA che lavorano su questo progetto.
> **Non è il README** (quello è per umani / deploy). Qui c'è il contesto operativo,
> cosa funziona davvero, cosa è finto, e i prossimi passi.
> Aggiorna questo file quando completi un blocco di lavoro.

Ultimo aggiornamento: 2026-06-07

---

## 1. Cos'è il progetto

Portfolio editoriale per **Ethan**, artista manga italiano ("Ethan's Drawings" /
"Studio Tavole"). Mostra tavole/illustrazioni e raccoglie richieste di commissione.
Tema dark cinematico, animazioni d'ingresso, layout asimmetrici.

Stack: **Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + Supabase
(Postgres + Auth + Storage) + Framer Motion + Resend**. TypeScript ovunque.

## 2. Ambiente & comandi

- OS di sviluppo: **Windows + PowerShell**. Attenzione alla sintassi shell
  (`$env:VAR`, non `$VAR`; niente `&&` in PowerShell 5.1).
- Node con npm. Build/dev usano **webpack** esplicito (non Turbopack), vedi `package.json`.

```bash
npm install
npm run dev      # next dev --webpack  -> http://localhost:3000
npm run build    # next build --webpack  (ESLint gira nel build e FALLISCE sugli errori)
npm run lint     # eslint
```

> ⚠️ `next build` esegue ESLint e **fallisce sugli errori** (nessun
> `eslint.ignoreDuringBuilds`). Tieni il lint pulito o il deploy si rompe.

## 3. Variabili d'ambiente

Vedi `.env.example`. Il codice **degrada con grazia** se Supabase non è configurato
(ritorna liste vuote / mostra stati "configurazione richiesta"), quindi gira anche
senza `.env.local`.

- `NEXT_PUBLIC_SITE_URL` — usato per `metadataBase`.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client pubblico.
- `SUPABASE_SERVICE_ROLE_KEY` — **solo server** (mutazioni, lettura admin). Mai esporre.
- `ADMIN_EMAILS` — allowlist admin, separate da virgola.
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — email opzionali (commissioni).

## 4. Mappa architettura (dove sta cosa)

```
src/
  app/
    (site)/                 # sito pubblico (layout = SiteShell con header/footer)
      page.tsx              # HOME — DINAMICA da Supabase featured + fallback
      portfolio/page.tsx    # griglia opere — DINAMICA da Supabase
      portfolio/[slug]/     # dettaglio opera — DINAMICO
      about/page.tsx        # statica
      contact/page.tsx      # form commissioni
    admin/
      page.tsx              # pannello admin (server component, gated)
      login/page.tsx        # magic link login
    api/admin/
      upload-url/route.ts   # crea signed upload URL per Storage
      artworks/route.ts     # POST: salva metadati opera (Zod)
      artworks/[id]/route.ts # PATCH/DELETE: modifica/elimina opera + cleanup Storage
      artworks/reorder/route.ts # POST: aggiorna sort_order
      artworks/backfill-dimensions/route.ts # POST: legge dimensioni mancanti
    auth/callback/route.ts  # scambio code->session (magic link)
    actions/contact.ts      # server action: salva commission_requests + email
  lib/
    env.ts                  # lettura/validazione env (config opzionale)
    admin.ts                # sessione admin, allowlist, requireAdminForMutation
    artworks.ts             # query pubbliche (server-only)
    artworks-shared.ts      # getArtworkImageUrl (URL pubblico Storage)
    email.ts                # Resend (no-op se non configurato)
    slug.ts                 # slugify
    supabase/{server,browser,types}.ts
  components/               # header, footer, card, form, reveal, admin manager, ecc.
supabase/schema.sql         # tabelle, RLS, bucket Storage
```

### Flusso dati chiave
- **Lettura pubblica**: `getPublicArtworks()` / `getArtworkBySlug()` → tabella
  `artworks` con `published = true` (RLS lo impone). Pagine con `export const revalidate = 60`.
- **Upload admin**: browser chiede signed URL a `/api/admin/upload-url` → carica il file
  diretto su Storage bucket `artworks` → `POST /api/admin/artworks` salva i metadati e
  fa `revalidatePath("/")` e `revalidatePath("/portfolio")`.
- **CRUD admin**: `PATCH /api/admin/artworks/[id]` modifica metadati/toggle/immagine,
  `DELETE /api/admin/artworks/[id]` elimina record e prova a rimuovere il file Storage,
  `/reorder` aggiorna `sort_order`, `/backfill-dimensions` legge dimensioni mancanti.
- **Sicurezza mutazioni**: ogni mutazione passa da `requireAdminForMutation()` (verifica
  sessione + email in `ADMIN_EMAILS`). La service-role key è usata solo lato server.

## 5. Stato attuale (cosa è REALE vs FINTO)

| Area | Stato |
|------|-------|
| `/portfolio` (area lavori) | ✅ Reale, legge da Supabase; layout scroller orizzontale con cornici grigie |
| `/portfolio/[slug]` (dettaglio) | ✅ Reale (prev/next, metadata OG) |
| `/contact` (form commissioni) | ✅ Reale (salva su DB + email opzionale) |
| Admin: upload opere | ✅ Reale |
| Admin: gestione opere (edit/delete/toggle/riordino) | ✅ Reale |
| Home "Opere in evidenza" | ✅ Reale, legge `featured = true` da Supabase (fallback ultime pubblicate) |
| Home Stats / Testimonial / Blog | ✅ Rimossi dalla home; sostituiti con metodo + CTA commissioni |
| Campo `category` | ✅ Codice/schema/form pronti (applicare SQL al DB remoto se già esistente) |
| Larghezza/altezza immagini | ✅ Salvate sui nuovi upload admin |
| Social links (IG/Twitter/ArtStation) | ⚠️ URL generici placeholder |

## 6. Problemi noti / gap (in ordine di priorità)

1. **Migrazione Supabase remota da applicare.** `supabase/schema.sql` ora include
   `category` e `alter table ... add column if not exists`, ma un progetto Supabase
   già creato va aggiornato eseguendo lo SQL. L'API fa retry senza metadati opzionali
   se le colonne mancano, così l'upload non si rompe durante una demo.

2. **Backfill dimensioni richiede Supabase raggiungibile.** L'admin ha il pulsante
   "Dimensioni mancanti" che chiama `/api/admin/artworks/backfill-dimensions`, ma in
   locale può fallire se il server non riesce a raggiungere Supabase/Storage.

3. **Minori**: social link generici (`instagram.com`, ecc.); `auth/callback/route.ts`
   non gestisce errori OTP; font caricati via `@import` CSS (render-blocking) invece di
   `next/font/google`.

## 7. Convenzioni & gotcha

- **TypeScript strict**, niente `any` se evitabile. Match dello stile circostante.
- **Apostrofi in JSX**: il testo usa `&apos;` per gli apostrofi letterali (es.
  `Ethan&apos;s`, `e&apos;`). NB: il sito usa l'apostrofo come finto accento
  (`e'`, `disponibilita'`) invece degli accenti veri (`è`, `disponibilità`) —
  è un debito tipografico, non correggerlo a tappeto senza accordo.
- **Immagini**: `next.config.ts` permette solo `**.supabase.co/storage/v1/object/public/artworks/**`.
  Se cambi sorgente immagini, aggiorna `remotePatterns`.
- **RLS**: la lettura pubblica vede solo `published = true`. L'admin legge tutto via
  service-role (`getAllArtworksForAdmin`).
- **Slug**: generati come `slugify(title) + "-" + base36(timestamp)` per unicità.
- **Pattern config opzionale**: usa sempre `getPublicSupabaseConfig()` /
  `getServiceSupabaseConfig()` e gestisci il `null` (non assumere che Supabase ci sia).
- **`server-only`**: `lib/artworks.ts` e `lib/admin.ts` sono server-only. Non importarli
  in componenti client. Per l'URL immagine lato client usa `lib/artworks-shared.ts`.
- **Font**: l'`@import` di `globals.css` carica solo Cormorant Garamond + Manrope.
  `--font-display` e `--font-serif` puntano entrambi a Cormorant; `Unbounded` è stato
  rimosso di proposito. Se aggiungi un font, mettilo nell'`@import` PRIMA di
  `@import "tailwindcss"` o il build dà warning.

## 8. Lavori completati di recente

- **2026-06-07 — Redesign completo tema chiaro ispirato a Victoria Rose Park**: passaggio da dark cinematico a light minimal.
  - Palette: sfondo `#faf9f7`, testo `#1a1a2e`, secondario `#676986`, accent oro `#c9a87c`, sezioni alternate su `#f4f4f6`.
  - Tipografia: titoli serif più leggeri (`font-medium` invece di `font-semibold`), body Manrope mantenuto.
  - Componenti pubblici ridisegnati: hero con overlay chiaro, plate con bordi sottili e ombre leggere, bottoni scuri o bordati.
  - Portfolio scroller: card su sfondo bianco con cornice leggera, scrollbar mantenuta.
  - Header trasparente che diventa bianco/traslucido allo scroll, menu mobile coerente.
  - Footer con bordi sottili e colori scuri.
  - Admin coerente con il tema chiaro (sfondo bianco, card su `#f4f4f6`, testo scuro).
  - Noise overlay aumentato a `0.025` per visibilità su sfondo chiaro.
  - `npm run lint` verde, `npm run build` verde.

- **2026-06-07 — Affinamenti home "Soft Contrast + Ritmo"**: migliorata leggibilità e ritmo della home nel tema chiaro.
  - Testi secondari più scuri: `/15`→`/25`, `/25`→`/40`, `/35`→`/45`, `/50`→`/60`.
  - Ritmo cromatico regolare: Hero (bianco), Featured (paper), Collections (bianco), About (paper), Process (bianco), Commission (paper).
  - Gradienti card Collections rinforzati (`from-pure-white/90 via-pure-white/50`) per leggibilità sempre garantita.
  - Bordi e linee più visibili: `border-ink/8` e `bg-ink/8` → `/12`.
  - Micro-interazioni: leggero `hover:-translate-y-1` su card Featured, Collections e Process.
  - Hero overlay più deciso (`bg-pure-white/45`, gradiente e vignetta rinforzati) per maggiore presenza del titolo.
  - `npm run lint` verde, `npm run build` verde.

- **2026-06-04 — Fix regressione font del redesign**: il redesign aveva tolto
  `Unbounded` dall'`@import` ma `--font-display` ci puntava ancora e diversi titoli
  usano `font-display` (home "Tavole"/"Process", numeri 01/02/03, admin, footer,
  empty-gallery) → cadevano sul sans di sistema, stonando col serif. Risolto puntando
  `--font-display` a `"Cormorant Garamond"` in `globals.css` (un'unica modifica copre
  tutti gli usi). `font-display` e `font-serif` ora coincidono — non re-introdurre Unbounded.

- **2026-06-03 — Redesign completo "Inchiostro & Carta"**:
  - Nuova palette dark warm: nero morbido `#0a0a0a`, bianco caldo `#f0ece6`, oro antico `#c9a87c`.
  - Tipografia ridisegnata: Cormorant Garamond per tutti i titoli editoriali (sentence case), Manrope per UI.
  - Eliminato `Unbounded` dai titoli pubblici; rimosso tilt 3D, pattern griglia 20px, drop-shadow testuali pesanti.
  - Header e footer coerenti: bordi sottili, social SVG reali (Instagram, X, ArtStation), cursor custom desktop-only.
  - Home rifatta: hero più raffinato, sezione featured su sfondo nero, about teaser, process su card scure, CTA oro.
  - PortfolioScroller ricostruito per matchare esattamente la richiesta cliente: sfondo carta `#f4f1ea`, passe-partout bianco, cornice grigia spessa, titoli serif, progress bar, prev/next cerchi sottili.
  - Pagine About, Contact e Dettaglio Opera uniformate al nuovo sistema cromatico e tipografico.
  - Aggiunto noise overlay fisso (grain sottile) su tutto il sito per texture carta.
  - `npm run lint` verde, `npm run build` verde.

- **2026-06-03 — Hero iniziale stile riferimento cliente**:
  - Rifatta la prima schermata della home come hero fotografica full-screen con titolo
    centrale serif, ampio spazio, pulsanti bianchi arrotondati "Chi sono" e
    "I miei lavori".
  - Header ridisegnato: nav testuale bianca a sinistra, logo/monogramma al centro,
    icone azione a destra (`portfolio`, `admin/login`, `contact`) e menu mobile.
  - Aggiunto font `Cormorant Garamond` all'import Google Fonts per il titolo serif.
  - L'immagine hero usa temporaneamente un asset locale (`Pagina-29.png`) in attesa
    degli scatti reali del cliente.
  - Verifiche: `npm run build` verde. `npm run lint` non rilanciato perché il sistema
    di approvazioni ha rifiutato il comando per limite d'uso.

- **2026-06-03 — Layout portfolio richiesto dal cliente**:
  - Sostituita la griglia masonry di `/portfolio` con `PortfolioScroller`: scroller
    orizzontale in stile gallery/print, sfondo chiaro, cornice grigia spessa attorno
    a ogni tavola e pulsanti prev/next in basso a destra.
  - Aggiunte utility scrollbar dedicate in `globals.css`.
  - Verifiche: `npm run lint` verde, `npm run build` verde, `/portfolio` risponde 200
    sul dev server. `agent-browser` non disponibile nel PATH, quindi niente screenshot
    automatico; se Supabase non risponde localmente si vede lo stato vuoto.

- **2026-06-03 — CRUD admin completo + backfill dimensioni**:
  - Aggiunto `AdminArtworkManager` con edit inline, delete, toggle `published`/
    `featured`, move up/down per `sort_order`, sostituzione immagine e backfill
    dimensioni mancanti.
  - Aggiunte route admin: `PATCH/DELETE /api/admin/artworks/[id]`,
    `POST /api/admin/artworks/reorder`,
    `POST /api/admin/artworks/backfill-dimensions`.
  - Delete prova a rimuovere anche il file da Storage; replace immagine carica il nuovo
    file via signed URL e poi rimuove il vecchio dopo update DB riuscito.
  - Backfill dimensioni supporta PNG/JPEG/WebP/GIF tramite parser server senza nuove
    dipendenze.
  - Verifiche: `npm run lint` verde; `npm run build` verde.

- **2026-06-03 — Demo readiness home + upload metadata**:
  - Home resa dinamica: `src/app/(site)/page.tsx` è tornata Server Component, carica
    `getPublicArtworks({ featured: true })` e passa i dati a `HomeExperience`.
    Se non ci sono featured, usa le ultime opere pubblicate; se Supabase non risponde,
    mostra uno stato vuoto visuale non tecnico.
  - Rimossi dalla home Stats/Testimonial/Blog inventati; sostituiti con sezione metodo
    e CTA commissioni.
  - Upload admin: aggiunto campo `category`, lettura client di `naturalWidth`/
    `naturalHeight`, salvataggio `image_width`/`image_height`.
  - API admin aggiornata con Zod per `category` e dimensioni; retry senza metadati
    opzionali se il DB remoto non ha ancora le colonne.
  - `supabase/schema.sql` ora aggiunge `category` e include `alter table ... if not exists`.
  - Lista admin mostra categoria e dimensioni quando disponibili.
  - Verifiche: `npm run lint` verde, `npm run build` verde; dev server avviato su
    `http://localhost:3000`; check HTTP locali `/`, `/portfolio`, `/admin/login` = 200.
    `agent-browser` non era disponibile nel PATH, quindi niente screenshot automatico.

- **2026-06-03 — Pulizia + setup** (branch `main`, modifiche non ancora committate):
  - Rimosso `backup-*.tar.gz` dalla root (ridondante con git, conteneva `.env.local`).
  - Rimossi i 5 SVG placeholder di create-next-app da `public/`.
  - Azzerati tutti i problemi ESLint (6 errori + 3 warning → 0): import inutilizzati,
    prop `variant` morto, apostrofi non-escaped, e i 2 errori `set-state-in-effect`
    di React 19 in `site-header.tsx` (entrata header ora pura CSS via
    `.site-header-enter` in `globals.css`; chiusura menu mobile via `onClick` invece
    di effetto su `pathname`).
  - Spostato `@import` Google Fonts sopra `@import "tailwindcss"` (warning build risolto).
  - `npm run lint` e `npm run build` verdi.

## 9. Prossimi step suggeriti

In ordine consigliato:
1. Applicare `supabase/schema.sql` al progetto Supabase remoto se esiste già (§6.1).
2. Usare il pulsante admin "Dimensioni mancanti" dopo la migrazione/remoto raggiungibile (§6.2).
3. Sostituire social link generici con URL reali (§6.3).
4. Valutare passaggio font da `@import` CSS a `next/font/google` (§6.3).
5. Aggiungere test browser/e2e quando `agent-browser` o Playwright sono disponibili.

Chiedi all'utente la priorità prima di iniziare blocchi grandi. Non committare/pushare
senza che l'utente lo chieda.
