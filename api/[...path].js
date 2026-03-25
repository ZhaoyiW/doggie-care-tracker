import express from 'express'
import cors from 'cors'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Create tables on first request
let ready = false
async function ensureSchema() {
  if (ready) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dog_profile      (id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS food_logs        (id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS poop_logs        (id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS symptom_logs     (id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS vaccine_records  (id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS vet_visits       (id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS health_tests     (id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS deworming_records(id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS bath_logs        (id TEXT PRIMARY KEY, data JSONB NOT NULL);
  `)
  ready = true
}

async function all(table) {
  const r = await pool.query(`SELECT data FROM ${table}`)
  return r.rows.map(r => r.data)
}
async function upsert(table, record) {
  await pool.query(
    `INSERT INTO ${table} VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
    [record.id, record]
  )
}
async function update(table, id, patch) {
  const r = await pool.query(`SELECT data FROM ${table} WHERE id = $1`, [id])
  if (!r.rows.length) return null
  const updated = { ...r.rows[0].data, ...patch }
  await pool.query(`UPDATE ${table} SET data = $1 WHERE id = $2`, [updated, id])
  return updated
}
async function del(table, id) {
  await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id])
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(async (_, __, next) => { await ensureSchema(); next() })

app.get('/api/debug', (req, res) => {
  res.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPreview: process.env.DATABASE_URL ? process.env.DATABASE_URL.slice(0, 30) + '...' : 'NOT SET',
  })
})

app.get('/api/all', async (_, res) => {
  try {
    const [profiles, foodLogs, poopLogs, symptomLogs, vaccineRecords, vetVisits, healthTests, dewormingRecords, bathLogs] = await Promise.all([
      all('dog_profile'), all('food_logs'), all('poop_logs'), all('symptom_logs'),
      all('vaccine_records'), all('vet_visits'), all('health_tests'), all('deworming_records'), all('bath_logs'),
    ])
    res.json({ dogProfile: profiles[0] ?? null, foodLogs, poopLogs, symptomLogs, vaccineRecords, vetVisits, healthTests, dewormingRecords, bathLogs })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/profile', async (req, res) => {
  try { await upsert('dog_profile', req.body); res.json(req.body) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

function crud(path, table) {
  app.get(`/api/${path}`, async (_, res) => {
    try { res.json(await all(table)) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })
  app.post(`/api/${path}`, async (req, res) => {
    try { await upsert(table, req.body); res.json(req.body) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })
  app.put(`/api/${path}/:id`, async (req, res) => {
    try {
      const result = await update(table, req.params.id, req.body)
      result ? res.json(result) : res.status(404).json({ error: 'Not found' })
    } catch (e) { res.status(500).json({ error: e.message }) }
  })
  app.delete(`/api/${path}/:id`, async (req, res) => {
    try { await del(table, req.params.id); res.json({ ok: true }) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })
}

crud('food-logs',         'food_logs')
crud('poop-logs',         'poop_logs')
crud('symptom-logs',      'symptom_logs')
crud('vaccine-records',   'vaccine_records')
crud('vet-visits',        'vet_visits')
crud('health-tests',      'health_tests')
crud('deworming-records', 'deworming_records')
crud('bath-logs',         'bath_logs')

export default function handler(req, res) {
  return app(req, res)
}
