import { neon } from '@neondatabase/serverless';

async function setupDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log('Creating fields table...');
    await sql`
      CREATE TABLE IF NOT EXISTS fields (
        id VARCHAR(50) PRIMARY KEY,
        farmer_id VARCHAR(50) NOT NULL,
        name TEXT NOT NULL,
        area_ha DECIMAL(8, 3),
        coordinates JSONB NOT NULL,
        center_lat DECIMAL(10, 7),
        center_lng DECIMAL(10, 7),
        state TEXT,
        district TEXT,
        village TEXT,
        soil_type TEXT,
        irrigation_type TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    console.log('Creating crop_seasons table...');
    await sql`
      CREATE TABLE IF NOT EXISTS crop_seasons (
        id VARCHAR(50) PRIMARY KEY,
        field_id VARCHAR(50) REFERENCES fields(id) ON DELETE CASCADE,
        crop TEXT NOT NULL,
        variety TEXT,
        sowing_date DATE,
        expected_harvest_date DATE,
        current_stage TEXT,
        season TEXT,
        year INT,
        last_fertilizer_date DATE,
        fertilizer_n_kg_ha DECIMAL(7, 2),
        fertilizer_p_kg_ha DECIMAL(7, 2),
        fertilizer_k_kg_ha DECIMAL(7, 2),
        observed_problems TEXT,
        previous_yield_qtl_ha DECIMAL(6, 2),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    console.log('Database schema created successfully.');
  } catch (err) {
    console.error('Failed to create schema:', err);
  }
}

setupDb();
