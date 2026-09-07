const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataPath = process.env.VOCAB_DATA_PATH || path.join(__dirname, 'data', 'vocabulary.json');
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET;

if (!adminPassword || !sessionSecret) {
  console.error('ADMIN_PASSWORD and SESSION_SECRET environment variables are required.');
  process.exit(1);
}

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function readData() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}
function writeData(data) {
  const temporaryPath = `${dataPath}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(temporaryPath, dataPath);
}
function sign(value) {
  return crypto.createHmac('sha256', sessionSecret).update(value).digest('base64url');
}
function isAdmin(req) {
  const item = (req.headers.cookie || '').split('; ').find(c => c.startsWith('vocab_admin='));
  if (!item) return false;
  const [timestamp, signature] = decodeURIComponent(item.slice('vocab_admin='.length)).split('.');
  const age = Date.now() - Number(timestamp);
  const expected = sign(timestamp || '');
  return Number.isFinite(Number(timestamp)) && age >= 0 && age < 8 * 60 * 60 * 1000 &&
    signature && signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Administrator login required.' });
  next();
}
function cleanWord(input) {
  const word = String(input.word || '').trim();
  const definition = String(input.definition || '').trim();
  const acceptedAnswers = Array.isArray(input.acceptedAnswers)
    ? input.acceptedAnswers.map(x => String(x).trim()).filter(Boolean).slice(0, 20)
    : [];
  if (!word || !definition || word.length > 100 || definition.length > 500) return null;
  return { id: input.id || crypto.randomUUID(), word, definition, acceptedAnswers };
}

app.get('/api/settings', (req, res) => {
  const data = readData();
  res.json({ setLength: data.setLength, wordCount: data.words.length });
});
app.get('/api/questions', (req, res) => {
  const data = readData();
  if (!data.words.length) return res.status(400).json({ error: 'The vocabulary list is empty.' });
  const shuffled = [...data.words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const questions = shuffled.slice(0, data.setLength)
    .map(({ id, word }) => ({ id, word }));
  // Reuse words only when a set is longer than the list.
  while (questions.length < data.setLength) {
    const word = data.words[crypto.randomInt(data.words.length)];
    questions.push({ id: word.id, word: word.word });
  }
  res.json({ questions, setLength: data.setLength });
});
app.post('/api/check-answer', (req, res) => {
  const data = readData();
  const entry = data.words.find(w => w.id === req.body.id);
  if (!entry) return res.status(404).json({ error: 'That word no longer exists.' });
  const answer = String(req.body.answer || '').trim().toLocaleLowerCase();
  const accepted = [entry.definition, ...(entry.acceptedAnswers || [])].map(x => x.trim().toLocaleLowerCase());
  res.json({ correct: accepted.includes(answer), definition: entry.definition });
});

app.post('/api/admin/login', (req, res) => {
  const candidate = String(req.body.password || '');
  if (candidate.length !== adminPassword.length || !crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(adminPassword))) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  const timestamp = String(Date.now());
  const value = `${timestamp}.${sign(timestamp)}`;
  res.setHeader('Set-Cookie', `vocab_admin=${encodeURIComponent(value)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  res.json({ ok: true });
});
app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'vocab_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ ok: true });
});
app.get('/api/admin/data', requireAdmin, (req, res) => res.json(readData()));
app.put('/api/admin/data', requireAdmin, (req, res) => {
  const setLength = Number(req.body.setLength);
  if (!Number.isInteger(setLength) || setLength < 1 || setLength > 100) return res.status(400).json({ error: 'Set length must be a whole number from 1 to 100.' });
  if (!Array.isArray(req.body.words)) return res.status(400).json({ error: 'Words must be a list.' });
  const words = req.body.words.map(cleanWord);
  if (words.some(x => !x) || !words.length) return res.status(400).json({ error: 'Every word needs a term and definition; keep at least one word.' });
  writeData({ setLength, words });
  res.json({ ok: true });
});

app.listen(port, () => console.log(`Vocabulary Steps is running at http://localhost:${port}`));
