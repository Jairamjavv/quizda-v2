const path = require('path');
const fs = require('fs');

// Load environment variables from project root .env for local dev
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  // ignore if dotenv not available
}

const db = require('./services/d1/d1');
const { R2Client } = require('./services/r2');

// Small launcher to run the built Node bundle (dist/index.js) for local dev.
// This avoids depending on Express in the source code and keeps the local
// development entrypoint consistent with the worker/Node build output.
const distPath = path.join(__dirname, 'dist', 'index.js');
if (fs.existsSync(distPath)) {
  require(distPath);
} else {
  console.error('Built server not found. Run `npm run build:node` before starting the server.');
  process.exit(1);
}

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API is healthy
 */

// Example endpoint: return a set of quizzes
app.get('/api/quizzes', (req, res) => {
  // Seed a set of mock quizzes across many categories for end-to-end testing
  const categories = [
    "General Knowledge",
    "Science",
    "Mathematics & Logic",
    "Technology & Computing",
    "History",
    "Geography",
    "Culture & Society",
    "Literature & Language",
    "Arts & Entertainment",
    "Sports & Games",
    "Business & Economics",
    "Politics & Governance",
    "Philosophy & Psychology",
    "Health & Medicine",
    "Nature & Environment",
    "Food & Culinary",
    "Religion & Mythology",
    "Pop Culture",
    "Education & Careers",
    "Automotive & Transportation",
    "Home & Lifestyle",
    "Mythos & Fictional Universes",
    "Ethics & Law",
    "Personal Development",
    "Special Topics / Custom"
  ]

  let idCounter = 1
  const quizzes = categories.flatMap((cat) => {
    // create one or two quizzes per category
    const count = Math.random() > 0.6 ? 2 : 1
    return Array.from({ length: count }).map((_, idx) => {
      const title = `${cat} Quiz ${idx + 1}`
      const totalTimeMinutes = [5, 10, 15, 20, 30][Math.floor(Math.random() * 5)]
      const tags = [cat.split(' ')[0].toLowerCase(), 'sample']
      const subcategory = idx === 0 ? `${cat} Basics` : `${cat} Advanced`
      const questions = Array.from({ length: 6 + Math.floor(Math.random() * 6) }).map((__, qIdx) => ({
        id: `q_${idCounter}_${qIdx}`,
        text: `Sample question ${qIdx + 1} for ${title}`,
        choices: ['A', 'B', 'C', 'D'],
        answerIndex: Math.floor(Math.random() * 4)
      }))
      return {
        id: idCounter++,
        title,
        category: cat,
        subcategory,
        tags,
        totalTimeMinutes,
        questionsCount: questions.length,
        questions
      }
    })
  })

  res.json(quizzes)
});

/**
 * @openapi
 * /api/quizzes:
 *   get:
 *     summary: Get sample quizzes
 *     responses:
 *       200:
 *         description: A list of quizzes
 */

// Simple in-memory user store (for demo only)
const users = []
let nextUserId = 1

function findUserByUsername(username) {
  return users.find((u) => u.username === username)
}

function findUserByEmail(email) {
  return users.find((u) => u.email === email)
}

app.post('/api/register', (req, res) => {
  const { username, email, password, role } = req.body || {}
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'username, email and password are required' })
  }

  if (findUserByUsername(username)) {
    return res.status(409).json({ success: false, message: 'username already exists' })
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ success: false, message: 'email already registered' })
  }

  const newUser = {
    id: nextUserId++,
    username,
    email,
    // NOTE: storing plain passwords is insecure; for demo only
    password,
    role: role || 'attempter',
    createdAt: new Date().toISOString()
  }
  users.push(newUser)

  const safeUser = { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
  return res.status(201).json({ success: true, message: 'registered', user: safeUser })
})

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'username and password required' })
  }
  const user = findUserByUsername(username)
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'invalid credentials' })
  }

  // mock token
  const token = `mock-token-${user.id}`
  return res.json({ success: true, message: 'ok', token, user: { id: user.id, username: user.username, role: user.role } })
})

app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ success: false, message: 'email required' })
  // In real app send email. Here always return success for privacy.
  return res.json({ success: true, message: 'If the email exists, a reset link was sent (mock).' })
})

// Firebase Authentication Routes
app.post('/api/register', async (req, res) => {
  const { email, password, username, role } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
    });

    // Additional metadata can be stored in D1 (if configured)
    try {
      if (db && typeof db.prepare === 'function') {
        await db.prepare(
          'INSERT INTO users (firebase_uid, username, role) VALUES (?, ?, ?)'
        ).bind(userRecord.uid, username, role).run();
      } else {
        console.warn('D1 database not available; skipping user metadata insert');
      }
    } catch (e) {
      console.error('Failed to write user metadata to D1:', e && e.message ? e.message : e);
    }

    res.status(201).json({ message: 'User registered successfully', user: userRecord });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(user.uid);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(401).json({ message: 'Login failed', error: error.message });
  }
});

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Example protected route
app.get('/api/protected', verifyFirebaseToken, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

// Example route to fetch quizzes from D1
app.get('/api/quizzes', async (req, res) => {
  try {
    const result = await db.prepare('SELECT * FROM quizzes').all();
    res.json(result);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Quiz Routes
app.post('/api/quizzes', async (req, res) => {
  const { title, category, questions } = req.body;

  try {
    // Upload questions to R2 as a JSON chunk
    const jsonKey = `quizzes/${Date.now()}-${title}.json`;
    await R2Client.put(jsonKey, JSON.stringify(questions), {
      httpMetadata: { contentType: 'application/json' },
    });

    // Store quiz metadata in D1
    const metadataUrl = `https://<your-r2-bucket>.r2.dev/${jsonKey}`;
    await db.prepare(
      'INSERT INTO quizzes (title, category, metadata_url) VALUES (?, ?, ?)'
    ).bind(title, category, metadataUrl).run();

    res.status(201).json({ message: 'Quiz created successfully', metadataUrl });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Quiz creation failed', error: error.message });
  }
});
