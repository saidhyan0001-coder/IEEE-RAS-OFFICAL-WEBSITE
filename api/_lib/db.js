import { neon } from '@neondatabase/serverless';

let schemaSetup;

export function database() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('Backend database is not configured. Add DATABASE_URL to the Vercel project.');
    error.statusCode = 503;
    throw error;
  }
  return neon(process.env.DATABASE_URL);
}

export async function ensureSchema(sql) {
  if (!schemaSetup) {
    schemaSetup = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS site_content (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        category text NOT NULL CONSTRAINT site_content_category_check CHECK (category IN ('about','boards','societies','team','gallery','events','announcements')),
        title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 180),
        summary text NOT NULL DEFAULT '' CHECK (char_length(summary) <= 1000),
        body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 10000),
        role text NOT NULL DEFAULT '' CHECK (char_length(role) <= 120),
        image_path text,
        event_date date,
        display_order integer NOT NULL DEFAULT 0,
        published boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'site_content_category_check'
              AND conrelid = 'site_content'::regclass
              AND pg_get_constraintdef(oid) NOT LIKE '%about%'
          ) THEN
            ALTER TABLE site_content DROP CONSTRAINT site_content_category_check;
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'site_content_category_check'
              AND conrelid = 'site_content'::regclass
          ) THEN
            ALTER TABLE site_content ADD CONSTRAINT site_content_category_check
              CHECK (category IN ('about','boards','societies','team','gallery','events','announcements'));
          END IF;
        END
      $$`;
      await sql`CREATE INDEX IF NOT EXISTS site_content_public_order_idx
        ON site_content (category, published, display_order, created_at DESC)`;
      await sql`CREATE TABLE IF NOT EXISTS branding_assets (
        asset_key text PRIMARY KEY CHECK (asset_key IN ('jssateb','ieee','ieeeRas')),
        public_url text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS join_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
        email text NOT NULL CHECK (char_length(trim(email)) BETWEEN 3 AND 254),
        message text NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 5000),
        status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','closed')),
        ip_hash text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS api_rate_limits (
        bucket_key text PRIMARY KEY,
        window_started_at timestamptz NOT NULL,
        request_count integer NOT NULL DEFAULT 0
      )`;
    })().catch((error) => {
      schemaSetup = undefined;
      throw error;
    });
  }
  return schemaSetup;
}

export async function allowRequest(sql, bucketKey, maxCount, windowMinutes) {
  const rows = await sql`
    INSERT INTO api_rate_limits (bucket_key, window_started_at, request_count)
    VALUES (${bucketKey}, now(), 1)
    ON CONFLICT (bucket_key) DO UPDATE SET
      request_count = CASE
        WHEN api_rate_limits.window_started_at < now() - (${windowMinutes} * interval '1 minute') THEN 1
        ELSE api_rate_limits.request_count + 1
      END,
      window_started_at = CASE
        WHEN api_rate_limits.window_started_at < now() - (${windowMinutes} * interval '1 minute') THEN now()
        ELSE api_rate_limits.window_started_at
      END
    RETURNING request_count`;
  return rows[0].request_count <= maxCount;
}
