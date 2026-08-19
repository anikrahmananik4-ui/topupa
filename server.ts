import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads directory
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `img_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// --- In-Memory Database Stores ---
let games = [
  {
    id: 1,
    name: 'Free Fire',
    type: 'uid' as const,
    description: 'Instant Diamond Topup via Player ID. 100% Safe & Fast Delivery.',
    image: '/game_1764253427.jpg'
  },
  {
    id: 2,
    name: 'PUBG Mobile',
    type: 'uid' as const,
    description: 'UC Top Up via Player ID. Fast automated processing.',
    image: '/game_1764253586.jpg'
  },
  {
    id: 3,
    name: 'Mobile Legends',
    type: 'uid' as const,
    description: 'Diamonds & Weekly Pass. Enter User ID and Zone ID.',
    image: '/game_1764255258.jpg'
  },
  {
    id: 4,
    name: 'Unipin Voucher',
    type: 'voucher' as const,
    description: 'Redeem UniPin Credits Code instantly.',
    image: '/game_1764257627.jpg'
  }
];

let products = [
  { id: 1, game_id: 1, name: '115 Diamonds', price: 80 },
  { id: 2, game_id: 1, name: '240 Diamonds', price: 160 },
  { id: 3, game_id: 1, name: '610 Diamonds', price: 400 },
  { id: 4, game_id: 1, name: 'Weekly Membership', price: 170 },
  { id: 5, game_id: 1, name: 'Monthly Membership', price: 780 },
  { id: 6, game_id: 2, name: '60 UC', price: 95 },
  { id: 7, game_id: 2, name: '325 UC', price: 470 },
  { id: 8, game_id: 2, name: '660 UC', price: 920 },
  { id: 9, game_id: 3, name: '86 Diamonds', price: 140 },
  { id: 10, game_id: 3, name: '172 Diamonds', price: 275 },
  { id: 11, game_id: 4, name: '100 UC Voucher', price: 105 },
];

let paymentMethods = [
  {
    id: 1,
    name: 'bKash Personal',
    logo: '/pay_logo_1764254426.png',
    qr_image: '/pay_qr_1764254426.jpg',
    number: '01700000000',
    description: 'Send Money to the personal number above, then copy and paste the TrxID below.',
    short_desc: 'Instant bKash Deposit'
  },
  {
    id: 2,
    name: 'Nagad Personal',
    logo: '/pay_logo_1764254942.png',
    qr_image: '/pay_qr_1764254619.jpg',
    number: '01800000000',
    description: 'Send Money to Nagad Personal number, then enter your TrxID.',
    short_desc: 'Instant Nagad Deposit'
  },
  {
    id: 3,
    name: 'Rocket Personal',
    logo: '/pay_logo_1767713654.jpg',
    qr_image: '/pay_qr_1767713654.jpg',
    number: '01900000000',
    description: 'Send Money via Rocket then paste transaction reference.',
    short_desc: 'Instant Rocket Deposit'
  }
];

let sliders = [
  { id: 1, image: '/slider_1764253181.jpg', link: '#' },
  { id: 2, image: '/slider_1764253219.jpg', link: '#' },
  { id: 3, image: '/slider_1767714794.jpg', link: '#' }
];

let settings: Record<string, string> = {
  site_name: 'Prime Top Up',
  site_desc: 'Best Gaming Top Up Shop in Bangladesh',
  currency: '৳',
  marquee_text: '⚡ Welcome to Prime Top Up! Lowest prices for Free Fire Diamonds, PUBG UC & MLBB Diamonds!',
  marquee_active: '1',
  fab_link: 'https://t.me/Tha_perfect_provider',
  add_money_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  card1_title: 'Redeem Gift Voucher / Code',
  card1_desc: 'Got a promo or voucher code? Redeem it here for instant wallet credit.',
  card2_title: 'Wallet Instant Auto-Deposit',
  card2_desc: 'Add funds via bKash, Nagad, or Rocket to enjoy instant 1-click purchases anytime!',
  card3_title: 'Customer Support 24/7',
  card3_desc: 'Need assistance with an order or deposit? Connect directly with our admin support on Telegram.',
  card3_btn: 'Contact Support on Telegram'
};

let users = [
  {
    id: 1,
    name: 'Demo Gamer',
    phone: '01712345678',
    email: 'user@example.com',
    password: 'password123',
    balance: 1500.00,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Pro Player',
    phone: '01812345678',
    email: 'pro@example.com',
    password: 'password123',
    balance: 350.00,
    created_at: new Date().toISOString()
  }
];

let orders = [
  {
    id: 1001,
    user_id: 1,
    game_id: 1,
    product_id: 2,
    amount: 160,
    status: 'completed' as const,
    player_id: '123456789',
    transaction_id: '8N765TRX22',
    payment_method: 'bKash Personal',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 1002,
    user_id: 2,
    game_id: 2,
    product_id: 6,
    amount: 95,
    status: 'pending' as const,
    player_id: '554433221',
    transaction_id: '9B884TRX99',
    payment_method: 'Nagad Personal',
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
];

let deposits = [
  {
    id: 501,
    user_id: 1,
    amount: 500,
    method: 'bKash Personal',
    wallet_number: '01712345678',
    trx_id: 'TRX8899A1',
    status: 'approved' as const,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 502,
    user_id: 2,
    amount: 300,
    method: 'Nagad Personal',
    wallet_number: '01812345678',
    trx_id: 'TRX9900B2',
    status: 'pending' as const,
    created_at: new Date(Date.now() - 900000).toISOString()
  }
];

let redeemCodes = [
  { id: 1, game_id: 4, product_id: 11, code: 'UNIPIN-9876-1234', status: 'active' as const, order_id: 0 },
  { id: 2, game_id: 4, product_id: 11, code: 'UNIPIN-5544-3322', status: 'active' as const, order_id: 0 }
];

// --- API ENDPOINTS ---

// File Download Endpoints for Admin Code
app.get('/api/download/infinityfree-admin-dist', (_req, res) => {
  try {
    const zip = new AdmZip();
    const distDir = path.join(process.cwd(), 'src', 'standalone-admin', 'dist');

    if (fs.existsSync(distDir)) {
      zip.addLocalFolder(distDir, '');
    }

    const buffer = zip.toBuffer();
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=htdocs-ready-infinityfree.zip');
    res.send(buffer);
  } catch (err) {
    console.error('ZIP Creation Error:', err);
    res.status(500).send('Error generating dist ZIP file');
  }
});

app.get('/api/download/admin-zip', (_req, res) => {
  try {
    const zip = new AdmZip();
    const standaloneDir = path.join(process.cwd(), 'src', 'standalone-admin');

    if (fs.existsSync(standaloneDir)) {
      zip.addLocalFolder(standaloneDir, '');
    }

    const adminPanelPath = path.join(process.cwd(), 'src', 'components', 'AdminPanel.tsx');
    if (fs.existsSync(adminPanelPath)) {
      zip.addLocalFile(adminPanelPath, 'src');
    }

    const adminAppPath = path.join(process.cwd(), 'src', 'admin', 'AdminStandaloneApp.tsx');
    if (fs.existsSync(adminAppPath)) {
      zip.addLocalFile(adminAppPath, 'src', 'App.tsx');
    }

    const buffer = zip.toBuffer();
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=admin-panel-standalone.zip');
    res.send(buffer);
  } catch (err) {
    console.error('ZIP Creation Error:', err);
    res.status(500).send('Error generating ZIP file');
  }
});

app.get('/api/download/admin', (_req, res) => {
  const filePath = path.join(process.cwd(), 'src', 'admin', 'AdminStandaloneApp.tsx');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'AdminStandaloneApp.tsx');
  } else {
    res.status(404).send('File not found');
  }
});

app.get('/api/download/admin-panel', (_req, res) => {
  const filePath = path.join(process.cwd(), 'src', 'components', 'AdminPanel.tsx');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'AdminPanel.tsx');
  } else {
    res.status(404).send('File not found');
  }
});

// Auth Endpoints
app.post('/api/login', (req, res) => {
  const { email, password, isAdmin } = req.body;
  if (isAdmin) {
    if (usernameMatch(email) && password === 'khfmhf2007') {
      return res.json({
        status: true,
        message: 'Admin login successful',
        user: { id: 999, name: 'Admin', email: 'admin@primetopup.com', role: 'admin' }
      });
    } else if (email === 'admin' && password === 'admin') {
      return res.json({
        status: true,
        message: 'Admin login successful',
        user: { id: 999, name: 'Admin', email: 'admin@primetopup.com', role: 'admin' }
      });
    }
    return res.status(400).json({ status: false, message: 'Invalid Admin credentials' });
  }

  const user = users.find(u => (u.email === email || u.phone === email) && u.password === password);
  if (user) {
    return res.json({
      status: true,
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, balance: user.balance, role: 'user' }
    });
  }
  return res.status(400).json({ status: false, message: 'Invalid email/phone or password' });
});

function usernameMatch(input: string) {
  return input === 'Tha_perfect_provider' || input === 'admin';
}

app.post('/api/register', (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ status: false, message: 'Missing required fields' });
  }
  const existing = users.find(u => u.email === email || u.phone === phone);
  if (existing) {
    return res.status(400).json({ status: false, message: 'Email or Phone already registered' });
  }
  const newUser = {
    id: users.length + 1,
    name,
    phone: phone || '',
    email,
    password,
    balance: 0.0,
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  return res.json({
    status: true,
    message: 'Registration successful',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, balance: newUser.balance, role: 'user' }
  });
});

// Settings API
app.get('/api/settings', (_req, res) => {
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  res.json({ status: true, message: 'Settings updated successfully', settings });
});

// General Upload API
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    return res.json({ status: true, url: `/uploads/${req.file.filename}` });
  }
  res.status(400).json({ status: false, message: 'No file uploaded' });
});

// Games API
app.get('/api/games', (_req, res) => {
  res.json(games);
});

app.post('/api/games', upload.single('image'), (req, res) => {
  const { name, type, description, imageUrl } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : (imageUrl || '/game_1764253427.jpg');
  const newGame = {
    id: games.length ? Math.max(...games.map(g => g.id)) + 1 : 1,
    name: name || 'New Game',
    type: type || 'uid',
    description: description || '',
    image
  };
  games.push(newGame);
  res.json({ status: true, game: newGame });
});

app.put('/api/games/:id', upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id);
  const index = games.findIndex(g => g.id === id);
  if (index !== -1) {
    const { name, type, description, imageUrl } = req.body;
    let image = games[index].image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      image = imageUrl;
    }
    games[index] = {
      ...games[index],
      name: name !== undefined ? name : games[index].name,
      type: type ? type : games[index].type,
      description: description !== undefined ? description : games[index].description,
      image
    };
    return res.json({ status: true, game: games[index] });
  }
  res.status(404).json({ status: false, message: 'Game not found' });
});

app.delete('/api/games/:id', (req, res) => {
  const id = parseInt(req.params.id);
  games = games.filter(g => g.id !== id);
  products = products.filter(p => p.game_id !== id);
  res.json({ status: true, message: 'Game deleted' });
});

// Products API
app.get('/api/products', (req, res) => {
  const gameId = req.query.game_id ? parseInt(req.query.game_id as string) : null;
  if (gameId) {
    return res.json(products.filter(p => p.game_id === gameId));
  }
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { game_id, name, price } = req.body;
  const newProduct = {
    id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
    game_id: parseInt(game_id),
    name,
    price: parseFloat(price)
  };
  products.push(newProduct);
  res.json({ status: true, product: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    const { game_id, name, price } = req.body;
    products[index] = {
      ...products[index],
      game_id: game_id !== undefined ? parseInt(game_id) : products[index].game_id,
      name: name !== undefined ? name : products[index].name,
      price: price !== undefined ? parseFloat(price) : products[index].price
    };
    return res.json({ status: true, product: products[index] });
  }
  res.status(404).json({ status: false, message: 'Product not found' });
});

app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  products = products.filter(p => p.id !== id);
  res.json({ status: true, message: 'Product deleted' });
});

// Payment Methods API
app.get('/api/payment-methods', (_req, res) => {
  res.json(paymentMethods);
});

app.post('/api/payment-methods', upload.fields([{ name: 'logo' }, { name: 'qr_image' }]), (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const logo = files?.logo?.[0] ? `/uploads/${files.logo[0].filename}` : (req.body.logoUrl || '/pay_logo_1764254426.png');
  const qr_image = files?.qr_image?.[0] ? `/uploads/${files.qr_image[0].filename}` : (req.body.qrUrl || '/pay_qr_1764254426.jpg');

  const newPm = {
    id: paymentMethods.length ? Math.max(...paymentMethods.map(p => p.id)) + 1 : 1,
    name: req.body.name,
    number: req.body.number,
    description: req.body.description || '',
    short_desc: req.body.short_desc || '',
    logo,
    qr_image
  };
  paymentMethods.push(newPm);
  res.json({ status: true, paymentMethod: newPm });
});

app.delete('/api/payment-methods/:id', (req, res) => {
  const id = parseInt(req.params.id);
  paymentMethods = paymentMethods.filter(p => p.id !== id);
  res.json({ status: true, message: 'Payment method deleted' });
});

// Orders API
app.get('/api/orders', (req, res) => {
  const userId = req.query.user_id ? parseInt(req.query.user_id as string) : null;
  let resultList = userId ? orders.filter(o => o.user_id === userId) : orders;

  // Enrich with user name, game name, product name
  const enriched = resultList.map(o => {
    const user = users.find(u => u.id === o.user_id);
    const game = games.find(g => g.id === o.game_id);
    const prod = products.find(p => p.id === o.product_id);
    return {
      ...o,
      user_name: user?.name || 'Guest User',
      game_name: game?.name || 'Unknown Game',
      product_name: prod?.name || 'Topup Item'
    };
  });

  res.json(enriched);
});

app.post('/api/orders', (req, res) => {
  const { user_id, user_email, user: clientUser, game_id, product_id, amount, player_id, transaction_id, payment_method } = req.body;
  
  const targetUserId = parseInt(user_id) || (clientUser ? parseInt(clientUser.id) : 1);
  const orderAmount = parseFloat(amount) || 0;

  // Find target user in memory
  let u = users.find(usr => usr.id === targetUserId || (user_email && usr.email === user_email) || (clientUser && usr.email === clientUser.email));
  
  if (!u && clientUser) {
    u = {
      id: clientUser.id || users.length + 1,
      name: clientUser.name || 'User',
      phone: clientUser.phone || '',
      email: clientUser.email || 'user@example.com',
      password: clientUser.password || '123456',
      balance: parseFloat(clientUser.balance) || 0,
      created_at: new Date().toISOString()
    };
    users.push(u);
  }

  const isWalletPayment = Boolean(
    payment_method && (
      payment_method.toLowerCase().includes('wallet') ||
      payment_method === 'Wallet Balance'
    )
  );

  if (isWalletPayment) {
    if (!u) {
      return res.status(400).json({ status: false, message: 'User account not found' });
    }
    if (u.balance < orderAmount) {
      return res.status(400).json({ 
        status: false, 
        message: `Insufficient wallet balance. You have ৳${u.balance.toFixed(2)}, required: ৳${orderAmount.toFixed(2)}` 
      });
    }
    // Deduct exact order amount from user balance
    u.balance = Math.max(0, u.balance - orderAmount);
  }

  const newOrder = {
    id: 1000 + orders.length + 1,
    user_id: u ? u.id : targetUserId,
    game_id: parseInt(game_id),
    product_id: parseInt(product_id),
    amount: orderAmount,
    status: 'pending' as const,
    player_id: player_id || 'Wallet',
    transaction_id: transaction_id || `TRX${Date.now()}`,
    payment_method: payment_method || 'Wallet Balance',
    created_at: new Date().toISOString()
  };

  orders.unshift(newOrder);
  res.json({ 
    status: true, 
    message: 'Order placed successfully', 
    order: newOrder,
    newBalance: u ? u.balance : undefined 
  });
});

app.put('/api/orders/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    res.json({ status: true, message: `Order status updated to ${status}`, order });
  } else {
    res.status(404).json({ status: false, message: 'Order not found' });
  }
});

// Wallet Deposit Requests API
app.get('/api/deposits', (req, res) => {
  const userId = req.query.user_id ? parseInt(req.query.user_id as string) : null;
  let list = userId ? deposits.filter(d => d.user_id === userId) : deposits;

  const enriched = list.map(d => {
    const u = users.find(usr => usr.id === d.user_id);
    return {
      ...d,
      user_name: u?.name || 'User'
    };
  });
  res.json(enriched);
});

app.post('/api/deposits', (req, res) => {
  const { user_id, amount, method, wallet_number, trx_id } = req.body;
  const newDeposit = {
    id: 500 + deposits.length + 1,
    user_id: parseInt(user_id) || 1,
    amount: parseFloat(amount),
    method,
    wallet_number,
    trx_id,
    status: 'pending' as const,
    created_at: new Date().toISOString()
  };
  deposits.unshift(newDeposit);
  res.json({ status: true, message: 'Deposit request submitted', deposit: newDeposit });
});

app.put('/api/deposits/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const deposit = deposits.find(d => d.id === id);
  if (deposit) {
    const oldStatus = deposit.status;
    deposit.status = status;

    // Credit user balance if approved for the first time
    if (status === 'approved' && oldStatus !== 'approved') {
      const u = users.find(usr => usr.id === deposit.user_id);
      if (u) {
        u.balance += deposit.amount;
      }
    }
    res.json({ status: true, message: `Deposit request ${status}`, deposit });
  } else {
    res.status(404).json({ status: false, message: 'Deposit request not found' });
  }
});

// Users Management API
app.get('/api/users', (_req, res) => {
  res.json(users);
});

app.put('/api/users/:id/balance', (req, res) => {
  const id = parseInt(req.params.id);
  const { balance } = req.body;
  const user = users.find(u => u.id === id);
  if (user) {
    user.balance = parseFloat(balance);
    res.json({ status: true, message: 'User balance updated', user });
  } else {
    res.status(404).json({ status: false, message: 'User not found' });
  }
});

// Sliders API
app.get('/api/sliders', (_req, res) => {
  res.json(sliders);
});

app.post('/api/sliders', upload.single('image'), (req, res) => {
  const image = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '/slider_1764253181.jpg');
  const newSlider = {
    id: sliders.length ? Math.max(...sliders.map(s => s.id)) + 1 : 1,
    image,
    link: req.body.link || '#'
  };
  sliders.push(newSlider);
  res.json({ status: true, slider: newSlider });
});

app.delete('/api/sliders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  sliders = sliders.filter(s => s.id !== id);
  res.json({ status: true, message: 'Slider deleted' });
});

// Redeem Codes API
app.get('/api/redeem-codes', (_req, res) => {
  res.json(redeemCodes);
});

app.post('/api/redeem-codes', (req, res) => {
  const { game_id, product_id, code } = req.body;
  const newCode = {
    id: redeemCodes.length ? Math.max(...redeemCodes.map(r => r.id)) + 1 : 1,
    game_id: parseInt(game_id),
    product_id: parseInt(product_id),
    code: code || `CODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    status: 'active' as const,
    order_id: 0
  };
  redeemCodes.push(newCode);
  res.json({ status: true, redeemCode: newCode });
});

app.post('/api/redeem', (req, res) => {
  const { code, user_id } = req.body;
  const match = redeemCodes.find(r => r.code.trim().toUpperCase() === code.trim().toUpperCase() && r.status === 'active');
  if (match) {
    match.status = 'used';
    const prod = products.find(p => p.id === match.product_id);
    const u = users.find(usr => usr.id === parseInt(user_id));
    if (u && prod) {
      u.balance += prod.price;
    }
    return res.json({ status: true, message: `Voucher redeemed! Added ${settings.currency || '৳'}${prod?.price || 0} to your balance.` });
  }
  return res.status(400).json({ status: false, message: 'Invalid or already used voucher code' });
});

// --- SERVER INITIALIZATION & VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
