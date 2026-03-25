import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

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

function send(res, status, data) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.statusCode = status
  res.end(JSON.stringify(data))
}

async function readBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => resolve(body ? JSON.parse(body) : {}))
  })
}

const TABLES = {
  'food-logs': 'food_logs', 'poop-logs': 'poop_logs', 'symptom-logs': 'symptom_logs',
  'vaccine-records': 'vaccine_records', 'vet-visits': 'vet_visits', 'health-tests': 'health_tests',
  'deworming-records': 'deworming_records', 'bath-logs': 'bath_logs',
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, {})
  try {
    await ensureSchema().catch(e => { throw new Error('DB error: ' + e.message + ' | URL starts with: ' + (process.env.DATABASE_URL || 'MISSING').slice(0, 40)) })
    const pathname = (req.url || '').split('?')[0]
    const parts = pathname.replace(/^\/api\//, '').split('/')
    const [resource, id] = parts
    const table = TABLES[resource]
    const body = ['POST', 'PUT'].includes(req.method) ? await readBody(req) : null

    if (pathname === '/api/all' || resource === 'all') {
      const [profiles, foodLogs, poopLogs, symptomLogs, vaccineRecords, vetVisits, healthTests, dewormingRecords, bathLogs] = await Promise.all([
        all('dog_profile'), all('food_logs'), all('poop_logs'), all('symptom_logs'),
        all('vaccine_records'), all('vet_visits'), all('health_tests'), all('deworming_records'), all('bath_logs'),
      ])
      return send(res, 200, { dogProfile: profiles[0] ?? null, foodLogs, poopLogs, symptomLogs, vaccineRecords, vetVisits, healthTests, dewormingRecords, bathLogs })
    }

    if ((pathname === '/api/profile' || resource === 'profile') && req.method === 'PUT') {
      await upsert('dog_profile', body)
      return send(res, 200, body)
    }

    if (!table) return send(res, 404, { error: 'Not found' })

    if (req.method === 'GET')    return send(res, 200, await all(table))
    if (req.method === 'POST')   { await upsert(table, body); return send(res, 200, body) }
    if (req.method === 'PUT')    { const r = await update(table, id, body); return send(res, r ? 200 : 404, r ?? { error: 'Not found' }) }
    if (req.method === 'DELETE') { await del(table, id); return send(res, 200, { ok: true }) }

    send(res, 405, { error: 'Method not allowed' })
  } catch (e) {
    send(res, 500, { error: e.message })
  }
}
