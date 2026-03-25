export default function handler(req, res) {
  res.json({ ok: true, env: !!process.env.DATABASE_URL })
}
