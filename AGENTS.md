# AGENTS.md — Guida per agenti IA

> File di onboarding + stato lavori per agenti IA che lavorano su questo progetto.
> **Non è il README** (quello è per umani / deploy). Qui c'è il contesto operativo,
> cosa funziona davvero, cosa è finto, e i prossimi passi.
> Aggiorna questo file quando completi un blocco di lavoro.

Ultimo aggiornamento: 2026-07-05

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
      page.tsx              # HOME — DINAMICA: più visti + teaser tavole/illustrazioni + hero da site_settings
      portfolio/page.tsx    # "I miei lavori" — tab Tavole|Illustrazioni con swipe, collezioni dentro
      portfolio/[slug]/     # dettaglio opera — DINAMICO (prev/next nello stesso kind + beacon visite)
      about/page.tsx        # statica: foto / storia / perché disegno / metodo e strumenti
      contact/page.tsx      # pagina Contatti (form commissioni invariato)
    admin/
      page.tsx              # pannello admin (server component, gated)
      login/page.tsx        # magic link login
    api/
      search-index/route.ts # GET pubblico: indice opere per la ricerca (ISR 60s)
      views/route.ts        # POST pubblico: incrementa view_count via RPC
      admin/
        upload-url/route.ts   # crea signed upload URL per Storage
        artworks/route.ts     # POST: salva metadati opera (Zod, incl. kind)
        artworks/[id]/route.ts # PATCH/DELETE: modifica/elimina opera + cleanup Storage
        artworks/reorder/route.ts # POST: aggiorna sort_order
        artworks/backfill-dimensions/route.ts # POST: legge dimensioni mancanti
        settings/route.ts     # PATCH: upsert site_settings + revalidatePath("/", "layout")
    auth/callback/route.ts  # scambio code->session (magic link)
    actions/contact.ts      # server action: salva commission_requests + email
  lib/
    env.ts                  # lettura/validazione env (config opzionale)
    admin.ts                # sessione admin, allowlist, requireAdminForMutation
    artworks.ts             # query pubbliche (server-only, righe normalizzate)
    artworks-shared.ts      # getArtworkImageUrl (URL pubblico Storage)
    artwork-kinds.ts        # KIND_LABELS, normalizeKind/Artworks, splitByKind, tabSlugToKind (client-safe)
    settings.ts             # getSiteSettings (server-only, client SENZA cookie)
    settings-shared.ts      # chiavi/tipi/default site_settings (client-safe)
    search-index.ts         # SearchIndexItem + filterSearchIndex (client-safe)
    email.ts                # Resend (no-op se non configurato)
    slug.ts                 # slugify
    supabase/{server,browser,types}.ts
  components/               # header (barra annuncio + ricerca), tabs, scroller, admin manager, ecc.
supabase/schema.sql         # tabelle, RLS, bucket Storage, RPC increment_artwork_view
```

### Flusso dati chiave
- **Lettura pubblica**: `getPublicArtworks()` / `getArtworkBySlug()` → tabella
  `artworks` con `published = true` (RLS lo impone). Pagine con `export const revalidate = 60`.
  Le righe passano da `normalizeArtworks` (default `kind`/`view_count` per DB pre-migrazione).
- **Impostazioni sito**: tabella `site_settings` (key/value: `announcement_text`,
  `hero_title`, `hero_subtitle`, `contact_email`, `instagram_url`, `twitter_url`,
  `artstation_url`). Lettura via `getSiteSettings()` in `SiteShell` col client
  **cookieless** (`createSupabaseStaticClient`) per non rendere dinamiche
  /about e /contact; la pagina /contact la rilegge per email/social. Scrittura via
  `PATCH /api/admin/settings` (service role) che fa `revalidatePath("/", "layout")`.
  Regola: valore vuoto = elemento nascosto (barra, testi hero, icone social, email).
  Footer e /contact rendono i social con `components/social-links.tsx`.
- **Tavole vs illustrazioni**: colonna `artworks.kind` (`'tavola' | 'illustrazione'`,
  default tavola). È ortogonale a `category` (= collezione/serie). Il portfolio divide
  per kind (tab con swipe), il dettaglio naviga prev/next solo nello stesso kind.
- **Visite**: colonna `artworks.view_count` + RPC `increment_artwork_view(slug)`
  (security definer, solo opere pubblicate). Beacon client `ArtworkViewTracker` sul
  dettaglio (dedupe sessionStorage) → `POST /api/views`. La home ordina i "più visti"
  per view_count (fallback featured/recenti quando è tutto a 0).
- **Ricerca**: overlay nell'header che scarica una volta `/api/search-index`
  (ISR 60s + revalidate dalle mutazioni admin) e filtra client-side.
- **Upload admin**: browser chiede signed URL a `/api/admin/upload-url` → carica il file
  diretto su Storage bucket `artworks` → `POST /api/admin/artworks` salva i metadati e
  fa `revalidatePath` su `/`, `/portfolio` e `/api/search-index`.
- **CRUD admin**: `PATCH /api/admin/artworks/[id]` modifica metadati/toggle/immagine/kind,
  `DELETE /api/admin/artworks/[id]` elimina record e prova a rimuovere il file Storage,
  `/reorder` aggiorna `sort_order`, `/backfill-dimensions` legge dimensioni mancanti.
- **Sicurezza mutazioni**: ogni mutazione passa da `requireAdminForMutation()` (verifica
  sessione + email in `ADMIN_EMAILS`). La service-role key è usata solo lato server.

## 5. Stato attuale (cosa è REALE vs FINTO)

| Area | Stato |
|------|-------|
| `/portfolio` "I miei lavori" (tab Tavole\|Illustrazioni con swipe + collezioni) | ✅ Reale |
| `/portfolio/[slug]` (dettaglio) | ✅ Reale (prev/next nello stesso kind, chip tipo, beacon visite, metadata OG) |
| `/contact` pagina Contatti (form commissioni) | ✅ Reale (salva su DB + email opzionale) |
| `/about` Chi sono (foto/storia/perché disegno/metodo+strumenti) | ✅ Struttura reale, copy "Perché disegno" e strumenti PLACEHOLDER in attesa del cliente |
| Barra annuncio header (modificabile da admin) | ✅ Reale (`site_settings.announcement_text`, vuoto = nascosta) |
| Hero home titolo/sottotitolo da admin | ✅ Reale (`hero_title`/`hero_subtitle`, vuoti di default = nascosti, in attesa testi del cliente) |
| Ricerca opere (overlay header) | ✅ Reale (indice precaricato + filtro client) |
| Home "I più visti" | ✅ Reale su `view_count` (fallback featured/recenti finché non ci sono visite) |
| Campo `kind` tavola/illustrazione | ✅ Codice/schema/form pronti; le opere esistenti nascono 'tavola', riclassificare da admin |
| Admin: upload opere | ✅ Reale (drag&drop, anteprima, dimensioni live, tipo, step di stato) |
| Admin: gestione opere (edit/delete/toggle/riordino/switch tipo) | ✅ Reale |
| Admin: contenuti sito (annuncio + testi hero) | ✅ Reale |
| Admin: richieste commissione (lista/filtri/letta/archivia/elimina) | ✅ Reale (service role) |
| Larghezza/altezza immagini | ✅ Salvate sui nuovi upload admin |
| Social links (IG/Twitter/ArtStation) | ✅ Da `site_settings` (default vuoti → icone nascoste finché l'admin non inserisce gli URL veri; niente più placeholder) |
| Email pubblica | ✅ Da `site_settings.contact_email` (footer + /contact) |
| Categoria opere | ✅ Select delle categorie esistenti + "nuova" in upload/modifica (niente collezioni duplicate per case diverso) |
| Visite per opera in admin | ✅ Mostrate nel riepilogo di ogni opera ("N visite") |

## 6. Problemi noti / gap (in ordine di priorità)

1. **Migrazione Supabase remota da applicare.** `supabase/schema.sql` ora include
   `kind`, `view_count`, la tabella `site_settings` e la RPC `increment_artwork_view`:
   un progetto Supabase già creato va aggiornato eseguendo lo SQL (file idempotente).
   L'API fa retry senza metadati opzionali se le colonne mancano e le letture
   normalizzano i default, così il sito non si rompe durante una demo.

2. **Backfill dimensioni richiede Supabase raggiungibile.** L'admin ha il pulsante
   "Dimensioni mancanti" che chiama `/api/admin/artworks/backfill-dimensions`, ma in
   locale può fallire se il server non riesce a raggiungere Supabase/Storage.

3. **Minori**: `auth/callback/route.ts` non gestisce errori OTP. I social ora vengono
   da `site_settings` (vuoti = nascosti): vanno inseriti gli URL reali dal pannello
   admin quando il cliente li fornisce.

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
- **Font**: caricati via `next/font/google` in `src/app/layout.tsx` (self-hosted, niente
  render-blocking). Cormorant Garamond → var `--font-cormorant`, Manrope → `--font-manrope`,
  applicate su `<html>`. In `globals.css` `--font-display`/`--font-serif` puntano a
  `var(--font-cormorant)` e `--font-sans` a `var(--font-manrope)`. `Unbounded` rimosso di
  proposito. Se aggiungi un font, importalo da `next/font/google`, NON con `@import` CSS.

## 8. Lavori completati di recente

- **2026-07-05 — Redesign richiesto dal cliente: annuncio, ricerca, più visti, tavole/illustrazioni, chi sono, contatti**:
  - DB (`supabase/schema.sql`, DA ESEGUIRE SUL REMOTO): `artworks.kind`
    ('tavola'|'illustrazione', default tavola) + `view_count`, tabella `site_settings`
    (key/value, lettura anon, scrittura service-role), RPC `increment_artwork_view`
    (security definer, solo pubblicate).
  - Header: barra annuncio sopra il menu (da `site_settings`, vuota = nascosta);
    layout unico su tutti i breakpoint: ricerca a sinistra (overlay), logo centro,
    hamburger a destra; menu overlay full-screen anche desktop; label "Contatti".
  - Ricerca: `SearchOverlay` + `GET /api/search-index` (ISR 60s, revalidate dalle
    mutazioni admin), filtro client accent-insensitive su titolo/categoria/tipo.
  - Home: Hero senza titoli hardcoded (da `hero_title`/`hero_subtitle`, sr-only
    fallback per SEO) → "I più visti" (PortfolioScroller con badge tipo, fallback
    featured/recenti) → teaser "I miei lavori" (due card Tavole/Illustrazioni,
    swipe CSS su mobile) → Chi sono (invariato) → CTA Contatti. Rimosse
    FeaturedSection/Collections/Process (metodo migrato in /about).
  - Portfolio: tab Tavole|Illustrazioni con swipe nativo scroll-snap
    (`PortfolioKindTabs`: sync scroll↔tab, deep-link `?tab=`, replaceState,
    pannello inattivo cappato a 100svh + inert). Caroselli interni con
    `overscroll-x-contain` per non rubare lo swipe dei tab.
  - Dettaglio: prev/next solo stesso kind, chip tipo, back-link al tab giusto,
    `ArtworkViewTracker` (sessionStorage dedupe) → `POST /api/views` → RPC.
  - About ristrutturata: Foto / La mia storia / Perché disegno (copy placeholder) /
    Metodo di lavoro e strumenti (step migrati dalla home + chip strumenti placeholder) / CTA.
  - Contact riorientata a "Contatti" (metadata/heading/copy); form e backend invariati.
  - Admin: sezione "Contenuti sito" (`AdminSettingsManager` + `PATCH /api/admin/settings`),
    campo Tipo nell'upload e nell'edit, switch rapido tipo nella riga opera.
  - Nota visite: dedupe solo per sessione browser, nessun rate-limit server, conta
    anche le visite dell'artista — accettato per un portfolio.
  - Secondo giro (stesso giorno): email pubblica + social in `site_settings`
    (`contact_email`, `instagram_url`, `twitter_url`, `artstation_url`; vuoto =
    nascosto, social partono vuoti → risolti i placeholder; nuovo
    `components/social-links.tsx` usato da footer e /contact, form admin esteso
    con validazione email/URL); categoria come select delle categorie esistenti
    + "nuova" in upload e modifica (`components/admin-category-field.tsx` +
    `lib/categories.ts`, evita collezioni duplicate per maiuscole diverse);
    `view_count` visibile nel riepilogo opere dell'admin.

- **2026-06-29 — Hardening SEO/routing + pannello commissioni admin + UX upload**:
  - SEO: aggiunti `src/app/sitemap.ts` (statiche + opere da Supabase via client cookieless
    `getPublicArtworksStatic`), `robots.ts` (disallow `/admin /api /auth` + sitemap),
    `icon.svg`, `opengraph-image.tsx` (OG 1200×630 dinamica), twitter card + JSON-LD
    (WebSite/Person) in `layout.tsx`, `robots: noindex` su `/admin` e `/admin/login`,
    `generateStaticParams` su `/portfolio/[slug]`, fix 404 (usava classi tema vecchio).
  - Font: migrati da `@import` CSS a `next/font/google` (self-hosted, no render-blocking).
  - Admin commissioni: `getCommissionRequests()` in `lib/admin.ts`,
    route `PATCH/DELETE /api/admin/commission-requests/[id]`, componente
    `AdminCommissionManager` (filtri per stato, segna letta/archivia/ripristina,
    rispondi via mailto, elimina) e sezione in `admin/page.tsx` con badge "nuove".
  - Upload: `AdminUploadForm` con drag&drop, validazione tipo/peso (max 20MB), anteprima
    con info file + dimensioni live, rimozione, indicatore di stato a step.
  - `npm run lint` verde, `npm run build` verde.

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
