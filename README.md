# IEEE RAS JSSATEB Website

React/Vite public site with an Express.js API running as a Vercel serverless function. It uses PostgreSQL for published content and contact requests, Vercel Blob for persistent images, and a private, signed administrator session.

## Backend configuration

The `ieee-ras-jssateb-media` Vercel Blob store and `ieee-ras-content-db` Neon PostgreSQL database are connected to the production project. All backend credentials, including the administrator password hash, are configured as server-only production variables.

The Express API is routed through `api/[...path].js`; its endpoint handlers are in `api/_handlers/`. It creates or migrates its PostgreSQL tables/indexes on first use, validates public contact submissions, applies a per-IP hourly limit, limits admin sign-in attempts, and accepts only image/png, image/jpeg, or image/webp uploads. The database connection string, Blob token, password hash, and session signing secret must never be exposed in client-side code or `VITE_*` variables.

The protected Admin dashboard has section tabs for Chapter details, Boards, Societies, Team, Gallery, Events, and Announcements. Administrators can add, edit, publish/unpublish, and delete entries in each section, including image replacement and removal. Published entries appear in the matching public page; Chapter details are shown on About.

### Set the administrator password

Run `npm run admin:password-hash` in an interactive terminal and enter a strong password at the hidden prompt. Add the emitted `ADMIN_PASSWORD_HASH` value to the Vercel Production environment. Generate a separate session secret with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Set that output as `ADMIN_SESSION_SECRET` in Vercel. Do not paste the plain password into source files or commit it. The configured `ADMIN_EMAIL` is the only account authorized by this standalone backend.

Add the hash with `vercel env add ADMIN_PASSWORD_HASH production --project ieee-ras-jssateb --type secret`, then redeploy so the production functions receive it. The backend endpoints are under `/api`: `/api/health`, `/api/content`, `/api/contact`, `/api/branding`, and `/api/admin/{login,logout,session}`. Admin mutations require the signed HttpOnly session cookie and same-origin requests. Content tables are created automatically; uploaded images persist in Vercel Blob. Use `vercel dev` to run the Vercel project locally with the Express function.

## Deploy to Vercel

The production project is `ieee-ras-jssateb`, at <https://ieee-ras-jssateb.vercel.app>. Use `npm run build` and output directory `dist`. `vercel.json` rewrites public client-side routes to the React app; the Express function handles `/api/*`.

After attaching PostgreSQL, configuring the administrator credentials, and confirming `/api/health` reports all three configuration flags as true, deploy with:

```powershell
vercel --yes --prod --project ieee-ras-jssateb
```

Use `/api/health` to confirm configuration flags. Never publish real content or accept admin credentials until `databaseConfigured`, `storageConfigured`, and `adminConfigured` are all true.

## Current limitations

- Administrator login is provisioned through server-only environment variables. There is no public signup, email-verification, or password-reset flow; no email delivery is configured.
- Password rotation is owner-managed: generate a new hash and replace the Vercel environment variable.
- Historical office-bearer pages, event detail routes, and gallery albums/multi-image entries are not implemented; gallery currently supports one image per entry.
