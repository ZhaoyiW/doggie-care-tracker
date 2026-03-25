import express from 'express'
import cors from 'cors'
import pg from 'pg'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IS_CLOUD = !!process.env.DATABASE_URL

// ─── Database setup ────────────────────────────────────────────────────────
let pool, sqliteDb

if (IS_CLOUD) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
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
  console.log('✅ 已连接 PostgreSQL')
} else {
  sqliteDb = new Database(join(__dirname, 'data.db'))
  sqliteDb.pragma('journal_mode = WAL')
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS dog_profile      (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS food_logs        (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS poop_logs        (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS symptom_logs     (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS vaccine_records  (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS vet_visits       (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS health_tests     (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS deworming_records(id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS bath_logs        (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  `)
  console.log('✅ 已连接本地 SQLite')
}

// ─── Helpers ───────────────────────────────────────────────────────────────
async function all(table) {
  if (IS_CLOUD) {
    const r = await pool.query(`SELECT data FROM ${table}`)
    return r.rows.map(r => r.data)
  }
  return sqliteDb.prepare(`SELECT data FROM ${table}`).all().map(r => JSON.parse(r.data))
}

async function upsert(table, record) {
  if (IS_CLOUD) {
    await pool.query(
      `INSERT INTO ${table} VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [record.id, record]
    )
  } else {
    sqliteDb.prepare(`INSERT OR REPLACE INTO ${table} VALUES (?, ?)`).run(record.id, JSON.stringify(record))
  }
}

async function update(table, id, patch) {
  if (IS_CLOUD) {
    const r = await pool.query(`SELECT data FROM ${table} WHERE id = $1`, [id])
    if (!r.rows.length) return null
    const updated = { ...r.rows[0].data, ...patch }
    await pool.query(`UPDATE ${table} SET data = $1 WHERE id = $2`, [updated, id])
    return updated
  }
  const row = sqliteDb.prepare(`SELECT data FROM ${table} WHERE id = ?`).get(id)
  if (!row) return null
  const updated = { ...JSON.parse(row.data), ...patch }
  sqliteDb.prepare(`UPDATE ${table} SET data = ? WHERE id = ?`).run(JSON.stringify(updated), id)
  return updated
}

async function del(table, id) {
  if (IS_CLOUD) {
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id])
  } else {
    sqliteDb.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id)
  }
}

// ─── Express ───────────────────────────────────────────────────────────────
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// GET /api/all
app.get('/api/all', async (_, res) => {
  try {
    const [profiles, foodLogs, poopLogs, symptomLogs, vaccineRecords, vetVisits, healthTests, dewormingRecords, bathLogs] = await Promise.all([
      all('dog_profile'), all('food_logs'), all('poop_logs'), all('symptom_logs'),
      all('vaccine_records'), all('vet_visits'), all('health_tests'), all('deworming_records'), all('bath_logs'),
    ])
    res.json({ dogProfile: profiles[0] ?? null, foodLogs, poopLogs, symptomLogs, vaccineRecords, vetVisits, healthTests, dewormingRecords, bathLogs })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Dog profile
app.put('/api/profile', async (req, res) => {
  try {
    await upsert('dog_profile', req.body)
    res.json(req.body)
  } catch (e) {
    console.error('profile save error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

// CRUD factory
function crudRoutes(router, path, table) {
  router.get(`/${path}`, async (_, res) => {
    try { res.json(await all(table)) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })
  router.post(`/${path}`, async (req, res) => {
    try { await upsert(table, req.body); res.json(req.body) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })
  router.put(`/${path}/:id`, async (req, res) => {
    try {
      const result = await update(table, req.params.id, req.body)
      result ? res.json(result) : res.status(404).json({ error: 'Not found' })
    } catch (e) { res.status(500).json({ error: e.message }) }
  })
  router.delete(`/${path}/:id`, async (req, res) => {
    try { await del(table, req.params.id); res.json({ ok: true }) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })
}

const router = express.Router()
crudRoutes(router, 'food-logs',         'food_logs')
crudRoutes(router, 'poop-logs',         'poop_logs')
crudRoutes(router, 'symptom-logs',      'symptom_logs')
crudRoutes(router, 'vaccine-records',   'vaccine_records')
crudRoutes(router, 'vet-visits',        'vet_visits')
crudRoutes(router, 'health-tests',      'health_tests')
crudRoutes(router, 'deworming-records', 'deworming_records')
crudRoutes(router, 'bath-logs',         'bath_logs')
app.use('/api', router)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`🐕 服务器运行在 http://localhost:${PORT}`))
