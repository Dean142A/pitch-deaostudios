// utils/migrate.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrations = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Decks
CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  style VARCHAR(100) DEFAULT 'modern-tech',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  num_slides INT DEFAULT 15,
  status VARCHAR(50) DEFAULT 'drafting',
  input_data JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Deck Versions (for revision history, max 3)
CREATE TABLE IF NOT EXISTS deck_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  version_num INT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Slides
CREATE TABLE IF NOT EXISTS slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  slide_type VARCHAR(50),
  slide_order INT,
  content JSONB,
  chart_data JSONB,
  layout VARCHAR(50) DEFAULT 'single_column',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- AI Logs
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  slide_id UUID REFERENCES slides(id) ON DELETE CASCADE,
  ai_model VARCHAR(100),
  action VARCHAR(100),
  prompt_summary TEXT,
  suggestion JSONB,
  chosen BOOLEAN DEFAULT false,
  duration_ms INT,
  timestamp TIMESTAMP DEFAULT now()
);

-- Metrics
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  action VARCHAR(100),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  value JSONB,
  timestamp TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_slides_deck_id ON slides(deck_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_deck_id ON ai_logs(deck_id);
CREATE INDEX IF NOT EXISTS idx_metrics_deck_id ON metrics(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_versions_deck_id ON deck_versions(deck_id);
`;

async function seedDefaultUsers() {
  const defaultUsers = [
    { name: 'Admin User', email: 'admin@pitchdeck.com', pass: 'PitchDeck2026!', role: 'admin' },
    { name: 'Alex Morgan', email: 'alex@pitchdeck.com', pass: 'PitchDeck2026!', role: 'editor' },
    { name: 'Sarah Chen', email: 'sarah@pitchdeck.com', pass: 'PitchDeck2026!', role: 'editor' },
  ];

  for (const u of defaultUsers) {
    const hash = await bcrypt.hash(u.pass, 12);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET password_hash = $3, name = $1, role = $4`,
      [u.name, u.email, hash, u.role]
    );
    console.log(`👤 Seeded user: ${u.email} (${u.role})`);
  }
}

async function migrate() {
  console.log('🔄 Running database migrations...');
  try {
    await pool.query(migrations);
    console.log('✅ Migrations complete!');
    await seedDefaultUsers();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
