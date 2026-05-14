const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'submissions.json');

// ── Middleware ──────────────────────────────────────────────
app.use(cors());                        // allow requests from your HTML page
app.use(express.json());                // parse JSON request bodies
app.use(express.static(path.join(__dirname, '..')));     // serve index.html from the same folder

// ── Helpers ─────────────────────────────────────────────────
function loadSubmissions() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveSubmissions(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── Routes ───────────────────────────────────────────────────

// POST /api/apply — receive a new application
app.post('/api/apply', (req, res) => {
  const { first_name, last_name, email, phone, onlyfans, earnings, message } = req.body;

  // Basic validation
  if (!first_name || !last_name || !email || !phone || !onlyfans || !message) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  const submission = {
    id: Date.now(),
    submitted_at: new Date().toISOString(),
    first_name,
    last_name,
    email,
    phone,
    onlyfans,
    earnings: earnings || 'Not provided',
    message
  };

  const all = loadSubmissions();
  all.push(submission);
  saveSubmissions(all);

  console.log(`✅ New application from ${first_name} ${last_name} (${email})`);
  res.status(200).json({ success: true, message: 'Application received!' });
});

// GET /api/submissions — view all submissions (open in browser to check)
app.get('/api/submissions', (req, res) => {
  res.json(loadSubmissions());
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 KeaAgency backend running at http://localhost:${PORT}`);
  console.log(`📋 View submissions at http://localhost:${PORT}/api/submissions`);
  console.log(`🌐 Open your site at http://localhost:${PORT}/index.html\n`);
});
