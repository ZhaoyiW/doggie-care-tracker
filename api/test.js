import pg from 'pg'
import express from 'express'

export default function handler(req, res) {
  try {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    res.json({ ok: true, pgOk: !!pool, expressOk: !!express })
  } catch (e) {
    res.json({ error: e.message })
  }
}
