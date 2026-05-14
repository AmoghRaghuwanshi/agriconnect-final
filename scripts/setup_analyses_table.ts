import { neon } from '@neondatabase/serverless';

async function setup() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    CREATE TABLE IF NOT EXISTS field_analyses (
      id VARCHAR(50) PRIMARY KEY,
      field_id VARCHAR(50) REFERENCES fields(id) ON DELETE CASCADE,
      analysis JSONB NOT NULL,
      soil_data JSONB,
      weather_data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('field_analyses table created');
}
setup();
