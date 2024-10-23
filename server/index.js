import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const app = express();
const db = new Database('blackjack.db');
const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(express.json());

// Database initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    yaks INTEGER DEFAULT 1000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    bet INTEGER,
    result TEXT,
    yaks_change INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Authentication middleware
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(username, email, hashedPassword);
    
    const token = jwt.sign({ id: result.lastInsertRowid }, JWT_SECRET);
    res.json({ token, user: { id: result.lastInsertRowid, username, yaks: 1000 } });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, yaks: user.yaks } });
  } catch (error) {
    res.status(400).json({ message: 'Login failed' });
  }
});

// Game routes
app.post('/api/game/start', auth, (req, res) => {
  const { bet } = req.body;
  const user = db.prepare('SELECT yaks FROM users WHERE id = ?').get(req.user.id);
  
  if (bet > user.yaks) {
    return res.status(400).json({ message: 'Insufficient yaks' });
  }
  
  // Create initial hands
  const deck = createDeck();
  const playerHand = [drawCard(deck), drawCard(deck)];
  const dealerHand = [drawCard(deck)];
  
  res.json({ playerHand, dealerHand });
});

app.post('/api/game/hit', auth, (req, res) => {
  // Add card to player's hand logic
  const deck = createDeck();
  const newCard = drawCard(deck);
  res.json({ card: newCard });
});

app.post('/api/game/stand', auth, (req, res) => {
  // Dealer's turn logic
  const deck = createDeck();
  const dealerHand = [];
  while (calculateHandValue(dealerHand) < 17) {
    dealerHand.push(drawCard(deck));
  }
  res.json({ dealerHand });
});

// Leaderboard routes
app.get('/api/leaderboard/weekly', (req, res) => {
  const leaders = db.prepare(`
    SELECT username, yaks FROM users
    WHERE created_at >= datetime('now', '-7 days')
    ORDER BY yaks DESC LIMIT 10
  `).all();
  res.json(leaders);
});

app.get('/api/leaderboard/monthly', (req, res) => {
  const leaders = db.prepare(`
    SELECT username, yaks FROM users
    WHERE created_at >= datetime('now', '-30 days')
    ORDER BY yaks DESC LIMIT 10
  `).all();
  res.json(leaders);
});

// Helper functions
function createDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  
  return shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function drawCard(deck) {
  return deck.pop();
}

function calculateHandValue(hand) {
  let value = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.value === 'A') {
      aces += 1;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }
  
  for (let i = 0; i < aces; i++) {
    if (value + 11 <= 21) {
      value += 11;
    } else {
      value += 1;
    }
  }
  
  return value;
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});