import http from 'http'
import { Hono } from 'hono'

const app = new Hono()

// Simple in-memory user store (demo)
const users = []
let nextUserId = 1

// Basic CORS for local dev
app.use('*', async (c, next) => {
  await next()
  const origin = c.req.header('origin') || '*'
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
})

app.options('*', (c) => {
  return new Response(null, { status: 204 })
})

app.get('/api/health', (c) => c.json({ status: 'ok', name: 'Quizda Hono Dev' }))

app.post('/api/register', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { username, email, password, role } = body || {}
  if (!username || !email || !password) {
    return c.json({ success: false, message: 'username, email and password are required' }, 400)
  }
  if (users.find((u) => u.username === username))
    return c.json({ success: false, message: 'username already exists' }, 409)
  if (users.find((u) => u.email === email))
    return c.json({ success: false, message: 'email already registered' }, 409)

  const newUser = {
    id: nextUserId++,
    username,
    email,
    password,
    role: role || 'attempter',
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  const safeUser = { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
  return c.json({ success: true, message: 'registered', user: safeUser }, 201)
})

// Use Node http server to adapt incoming requests to the Hono fetch handler
async function readRequestBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks)
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    let body = undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const buf = await readRequestBody(req)
      // If there's no body, leave it undefined
      if (buf && buf.length) body = buf
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body,
    })

    const response = await app.fetch(request)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    const bufOut = await response.arrayBuffer()
    res.end(Buffer.from(bufOut))
  } catch (err) {
    console.error('Dev server error:', err)
    res.writeHead(500)
    res.end('Internal Server Error')
  }
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Hono dev server listening on http://localhost:${PORT}`)
})
