# Studio Tavole

Portfolio editoriale per tavole manga, costruito con Next.js, Tailwind CSS,
Framer Motion e Supabase.

## Design

- Layout editoriali asimmetrici, con immagini dominanti e molto spazio bianco.
- Tipografia serif per titoli e sans minimale per UI e testi.
- Palette: bianco caldo, nero inchiostro, grigi morbidi e accento sage.
- Preview con crop artistici; dettaglio opera con immagine intera e scroll
  verticale.
- Admin panel coerente con il sito, senza estetica tecnica da dashboard.

## Sviluppo locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

Apri `http://localhost:3000`.

## Supabase

1. Crea un progetto su Supabase.
2. Vai in SQL Editor ed esegui `supabase/schema.sql`.
3. Copia in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAILS`, separando piu email con virgole.
4. In Authentication abilita Email OTP / Magic Link.
5. In URL Configuration aggiungi:
   - `http://localhost:3000/auth/callback`
   - il futuro dominio Vercel con `/auth/callback`.

Il bucket `artworks` viene creato dallo schema SQL come pubblico in lettura e
limitato a immagini fino a 20 MB.

## Admin

Vai su `/admin/login`, inserisci una email presente in `ADMIN_EMAILS`, apri il
magic link e carica le opere da `/admin`.

Il flusso upload:

1. il browser chiede a `/api/admin/upload-url` una signed upload URL;
2. Supabase Storage riceve direttamente il file;
3. `/api/admin/artworks` salva titolo, descrizione, anno e path immagine.

## Contatti

Il form `/contact` salva le richieste in `commission_requests`. Per ricevere
anche una email, configura:

```bash
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
```

Senza Resend, il messaggio viene comunque salvato su Supabase.

## GitHub

```bash
git init
git add .
git commit -m "Initial portfolio implementation"
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/TUO-REPO.git
git push -u origin main
```

## Vercel

1. Crea un nuovo progetto Vercel importando il repository GitHub.
2. Framework preset: Next.js.
3. Aggiungi le stesse variabili di `.env.local` in Project Settings >
   Environment Variables.
4. Deploy.
5. Copia il dominio Vercel in Supabase Authentication > URL Configuration:
   `https://tuo-dominio.vercel.app/auth/callback`.

Comandi CLI opzionali:

```bash
vercel link
vercel env pull .env.local
npm run build
vercel deploy
vercel deploy --prod
```

## Verifica

```bash
npm run lint
npm run build
```
