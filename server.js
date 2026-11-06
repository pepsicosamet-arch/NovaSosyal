// NOVA Sosyal — sunucu
// Dış paket kullanmaz: yalnızca Node.js 22.13+ (node:sqlite, node:crypto, node:http).
'use strict';
process.removeAllListeners('warning'); // SQLite "experimental" uyarısını gizle

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------- Veritabanı ----------
const db = new DatabaseSync(path.join(DATA_DIR, 'nova.db'));
db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL COLLATE NOCASE,
  name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  avatar TEXT,
  pass_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  image TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS likes (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (post_id, user_id)
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS follows (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (follower_id, followee_id)
);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id, id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, id);
CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followee_id);
`);

const now = () => Date.now();

// ---------- Şifre ve oturum ----------
function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64);
  return salt.toString('hex') + ':' + hash.toString('hex');
}
function checkPassword(pw, stored) {
  const [saltHex, hashHex] = stored.split(':');
  const hash = crypto.scryptSync(pw, Buffer.from(saltHex, 'hex'), 64);
  return crypto.timingSafeEqual(hash, Buffer.from(hashHex, 'hex'));
}
function newSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)').run(token, userId, now());
  return token;
}
function currentUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const row = db.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?').get(token);
  return row ? { ...row, token } : null;
}

// Basit deneme sınırlayıcı (giriş/kayıt için)
const attempts = new Map();
function rateLimited(key, max = 10, windowMs = 10 * 60 * 1000) {
  const t = now();
  const list = (attempts.get(key) || []).filter(x => t - x < windowMs);
  list.push(t);
  attempts.set(key, list);
  return list.length > max;
}

// ---------- Görsel kaydetme ----------
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
function saveImage(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) throw httpError(400, 'Fotoğraf okunamadı. JPG, PNG veya WEBP seçin.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 4 * 1024 * 1024) throw httpError(413, 'Fotoğraf 4 MB’tan büyük olamaz.');
  const name = crypto.randomBytes(12).toString('hex') + '.' + IMAGE_TYPES[m[1]];
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return name;
}
function removeImage(name) {
  if (!name) return;
  fs.rm(path.join(UPLOAD_DIR, path.basename(name)), { force: true }, () => {});
}
const imgUrl = name => (name ? '/uploads/' + name : null);

// ---------- Yardımcılar ----------
function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}
function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(json);
}
function readJson(req, limit = 6 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(httpError(413, 'Gönderilen veri çok büyük.')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(httpError(400, 'Geçersiz istek.')); }
    });
    req.on('error', reject);
  });
}
const clean = (s, max) => String(s ?? '').trim().slice(0, max);

function publicUser(u, viewerId) {
  if (!u) return null;
  const counts = db.prepare(`SELECT
    (SELECT COUNT(*) FROM posts WHERE user_id = ?) AS posts,
    (SELECT COUNT(*) FROM follows WHERE followee_id = ?) AS followers,
    (SELECT COUNT(*) FROM follows WHERE follower_id = ?) AS following`).get(u.id, u.id, u.id);
  const isFollowing = viewerId
    ? !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(viewerId, u.id)
    : false;
  return {
    id: u.id, username: u.username, name: u.name, bio: u.bio,
    avatar: imgUrl(u.avatar), createdAt: u.created_at,
    posts: counts.posts, followers: counts.followers, following: counts.following,
    isMe: viewerId === u.id, isFollowing,
  };
}

const POST_SELECT = `
  SELECT p.id, p.text, p.image, p.created_at, p.user_id,
         u.username, u.name, u.avatar,
         (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
         (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
         EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = :viewer) AS liked
  FROM posts p JOIN users u ON u.id = p.user_id`;
function shapePost(r, viewerId) {
  return {
    id: r.id, text: r.text, image: imgUrl(r.image), createdAt: r.created_at,
    author: { id: r.user_id, username: r.username, name: r.name, avatar: imgUrl(r.avatar) },
    likes: r.like_count, comments: r.comment_count, liked: !!r.liked,
    mine: r.user_id === viewerId,
  };
}

// ---------- API ----------
const routes = [];
const route = (method, pattern, handler, opts = {}) =>
  routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler, auth: opts.auth !== false });

route('POST', '/api/register', async (req, res, ctx) => {
  if (rateLimited('reg:' + ctx.ip, 8)) throw httpError(429, 'Çok fazla deneme. Biraz sonra tekrar deneyin.');
  const b = await readJson(req);
  const username = clean(b.username, 20).toLowerCase();
  const name = clean(b.name, 40);
  const password = String(b.password ?? '');
  if (!/^[a-z0-9_.]{3,20}$/.test(username)) throw httpError(400, 'Kullanıcı adı 3–20 karakter olmalı; harf, rakam, nokta ve alt çizgi kullanılabilir.');
  if (!name) throw httpError(400, 'Adınızı yazın.');
  if (password.length < 6) throw httpError(400, 'Şifre en az 6 karakter olmalı.');
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) throw httpError(409, 'Bu kullanıcı adı alınmış. Başka bir tane deneyin.');
  const info = db.prepare('INSERT INTO users (username, name, pass_hash, created_at) VALUES (?,?,?,?)')
    .run(username, name, hashPassword(password), now());
  const id = Number(info.lastInsertRowid);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  send(res, 201, { token: newSession(id), user: publicUser(user, id) });
}, { auth: false });

route('POST', '/api/login', async (req, res, ctx) => {
  if (rateLimited('login:' + ctx.ip, 15)) throw httpError(429, 'Çok fazla deneme. 10 dakika sonra tekrar deneyin.');
  const b = await readJson(req);
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(clean(b.username, 20).toLowerCase());
  if (!user || !checkPassword(String(b.password ?? ''), user.pass_hash)) throw httpError(401, 'Kullanıcı adı veya şifre yanlış.');
  send(res, 200, { token: newSession(user.id), user: publicUser(user, user.id) });
}, { auth: false });

route('POST', '/api/logout', async (req, res, ctx) => {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(ctx.user.token);
  send(res, 200, { ok: true });
});

route('GET', '/api/me', async (req, res, ctx) => send(res, 200, { user: publicUser(ctx.user, ctx.user.id) }));

route('PUT', '/api/me', async (req, res, ctx) => {
  const b = await readJson(req);
  const u = ctx.user;
  const name = b.name !== undefined ? clean(b.name, 40) : u.name;
  const bio = b.bio !== undefined ? clean(b.bio, 160) : u.bio;
  if (!name) throw httpError(400, 'Ad boş olamaz.');
  let avatar = u.avatar;
  if (b.avatar) { avatar = saveImage(b.avatar); removeImage(u.avatar); }
  db.prepare('UPDATE users SET name = ?, bio = ?, avatar = ? WHERE id = ?').run(name, bio, avatar, u.id);
  if (b.newPassword) {
    if (!checkPassword(String(b.currentPassword ?? ''), u.pass_hash)) throw httpError(400, 'Mevcut şifre yanlış.');
    if (String(b.newPassword).length < 6) throw httpError(400, 'Yeni şifre en az 6 karakter olmalı.');
    db.prepare('UPDATE users SET pass_hash = ? WHERE id = ?').run(hashPassword(String(b.newPassword)), u.id);
  }
  send(res, 200, { user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(u.id), u.id) });
});

route('DELETE', '/api/me', async (req, res, ctx) => {
  const b = await readJson(req);
  if (!checkPassword(String(b.password ?? ''), ctx.user.pass_hash)) throw httpError(400, 'Şifre yanlış.');
  for (const p of db.prepare('SELECT image FROM posts WHERE user_id = ?').all(ctx.user.id)) removeImage(p.image);
  removeImage(ctx.user.avatar);
  db.prepare('DELETE FROM users WHERE id = ?').run(ctx.user.id);
  send(res, 200, { ok: true });
});

route('GET', '/api/feed', async (req, res, ctx) => {
  const before = Number(ctx.query.get('before')) || Number.MAX_SAFE_INTEGER;
  const following = ctx.query.get('tab') === 'following';
  const where = following
    ? 'WHERE p.id < :before AND (p.user_id = :viewer OR p.user_id IN (SELECT followee_id FROM follows WHERE follower_id = :viewer))'
    : 'WHERE p.id < :before';
  const rows = db.prepare(`${POST_SELECT} ${where} ORDER BY p.id DESC LIMIT 20`).all({ viewer: ctx.user.id, before });
  send(res, 200, { posts: rows.map(r => shapePost(r, ctx.user.id)) });
});

route('POST', '/api/posts', async (req, res, ctx) => {
  const b = await readJson(req);
  const text = clean(b.text, 1000);
  if (!text && !b.image) throw httpError(400, 'Bir şey yazın ya da fotoğraf ekleyin.');
  const image = b.image ? saveImage(b.image) : null;
  const info = db.prepare('INSERT INTO posts (user_id, text, image, created_at) VALUES (?,?,?,?)').run(ctx.user.id, text, image, now());
  const row = db.prepare(`${POST_SELECT} WHERE p.id = :id`).get({ viewer: ctx.user.id, id: Number(info.lastInsertRowid) });
  send(res, 201, { post: shapePost(row, ctx.user.id) });
});

route('DELETE', '/api/posts/:id', async (req, res, ctx) => {
  const p = db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(ctx.params.id));
  if (!p) throw httpError(404, 'Gönderi bulunamadı.');
  if (p.user_id !== ctx.user.id) throw httpError(403, 'Yalnızca kendi gönderinizi silebilirsiniz.');
  db.prepare('DELETE FROM posts WHERE id = ?').run(p.id);
  removeImage(p.image);
  send(res, 200, { ok: true });
});

route('POST', '/api/posts/:id/like', async (req, res, ctx) => {
  const id = Number(ctx.params.id);
  if (!db.prepare('SELECT 1 FROM posts WHERE id = ?').get(id)) throw httpError(404, 'Gönderi bulunamadı.');
  const had = db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(id, ctx.user.id).changes > 0;
  if (!had) db.prepare('INSERT INTO likes (post_id, user_id, created_at) VALUES (?,?,?)').run(id, ctx.user.id, now());
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM likes WHERE post_id = ?').get(id);
  send(res, 200, { liked: !had, likes: n });
});

route('GET', '/api/posts/:id/comments', async (req, res, ctx) => {
  const rows = db.prepare(`SELECT c.id, c.text, c.created_at, c.user_id, u.username, u.name, u.avatar
    FROM comments c JOIN users u ON u.id = c.user_id WHERE c.post_id = ? ORDER BY c.id ASC LIMIT 300`).all(Number(ctx.params.id));
  send(res, 200, { comments: rows.map(r => ({
    id: r.id, text: r.text, createdAt: r.created_at, mine: r.user_id === ctx.user.id,
    author: { id: r.user_id, username: r.username, name: r.name, avatar: imgUrl(r.avatar) },
  })) });
});

route('POST', '/api/posts/:id/comments', async (req, res, ctx) => {
  const id = Number(ctx.params.id);
  if (!db.prepare('SELECT 1 FROM posts WHERE id = ?').get(id)) throw httpError(404, 'Gönderi bulunamadı.');
  const text = clean((await readJson(req)).text, 500);
  if (!text) throw httpError(400, 'Yorum boş olamaz.');
  db.prepare('INSERT INTO comments (post_id, user_id, text, created_at) VALUES (?,?,?,?)').run(id, ctx.user.id, text, now());
  send(res, 201, { ok: true });
});

route('DELETE', '/api/comments/:id', async (req, res, ctx) => {
  const c = db.prepare('SELECT c.*, p.user_id AS post_owner FROM comments c JOIN posts p ON p.id = c.post_id WHERE c.id = ?').get(Number(ctx.params.id));
  if (!c) throw httpError(404, 'Yorum bulunamadı.');
  if (c.user_id !== ctx.user.id && c.post_owner !== ctx.user.id) throw httpError(403, 'Bu yorumu silemezsiniz.');
  db.prepare('DELETE FROM comments WHERE id = ?').run(c.id);
  send(res, 200, { ok: true });
});

route('GET', '/api/users/:username', async (req, res, ctx) => {
  const u = db.prepare('SELECT * FROM users WHERE username = ?').get(decodeURIComponent(ctx.params.username));
  if (!u) throw httpError(404, 'Kullanıcı bulunamadı.');
  const before = Number(ctx.query.get('before')) || Number.MAX_SAFE_INTEGER;
  const rows = db.prepare(`${POST_SELECT} WHERE p.user_id = :uid AND p.id < :before ORDER BY p.id DESC LIMIT 20`)
    .all({ viewer: ctx.user.id, uid: u.id, before });
  send(res, 200, { user: publicUser(u, ctx.user.id), posts: rows.map(r => shapePost(r, ctx.user.id)) });
});

route('POST', '/api/users/:username/follow', async (req, res, ctx) => {
  const u = db.prepare('SELECT * FROM users WHERE username = ?').get(decodeURIComponent(ctx.params.username));
  if (!u) throw httpError(404, 'Kullanıcı bulunamadı.');
  if (u.id === ctx.user.id) throw httpError(400, 'Kendinizi takip edemezsiniz.');
  const had = db.prepare('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?').run(ctx.user.id, u.id).changes > 0;
  if (!had) db.prepare('INSERT INTO follows (follower_id, followee_id, created_at) VALUES (?,?,?)').run(ctx.user.id, u.id, now());
  send(res, 200, { user: publicUser(u, ctx.user.id) });
});

route('GET', '/api/search', async (req, res, ctx) => {
  const q = clean(ctx.query.get('q'), 40).replace(/[%_]/g, '');
  const rows = q
    ? db.prepare(`SELECT * FROM users WHERE username LIKE ? OR name LIKE ? ORDER BY username LIMIT 30`).all(`%${q}%`, `%${q}%`)
    : db.prepare(`SELECT u.* FROM users u LEFT JOIN follows f ON f.followee_id = u.id
        WHERE u.id != ? GROUP BY u.id ORDER BY COUNT(f.follower_id) DESC, u.id DESC LIMIT 30`).all(ctx.user.id);
  send(res, 200, { users: rows.map(u => publicUser(u, ctx.user.id)) });
});

route('GET', '/api/notifications', async (req, res, ctx) => {
  const me = ctx.user.id;
  const rows = db.prepare(`
    SELECT 'like' AS type, l.created_at AS at, l.post_id AS post_id, NULL AS text, l.user_id AS actor
      FROM likes l JOIN posts p ON p.id = l.post_id WHERE p.user_id = :me AND l.user_id != :me
    UNION ALL
    SELECT 'comment', c.created_at, c.post_id, c.text, c.user_id
      FROM comments c JOIN posts p ON p.id = c.post_id WHERE p.user_id = :me AND c.user_id != :me
    UNION ALL
    SELECT 'follow', f.created_at, NULL, NULL, f.follower_id FROM follows f WHERE f.followee_id = :me
    ORDER BY at DESC LIMIT 60`).all({ me });
  const actors = {};
  for (const r of rows) {
    if (!actors[r.actor]) {
      const u = db.prepare('SELECT id, username, name, avatar FROM users WHERE id = ?').get(r.actor);
      actors[r.actor] = u && { id: u.id, username: u.username, name: u.name, avatar: imgUrl(u.avatar) };
    }
  }
  send(res, 200, { items: rows.filter(r => actors[r.actor]).map(r => ({
    type: r.type, at: r.at, postId: r.post_id, text: r.text, actor: actors[r.actor],
  })) });
});

// ---------- Statik dosyalar ----------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};
function serveFile(res, file, cache) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Bulunamadı'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': cache, 'Content-Length': st.size });
    fs.createReadStream(file).pipe(res);
  });
}

// ---------- Sunucu ----------
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const url = new URL(req.url, 'http://x');
  const pathname = decodeURI(url.pathname);
  try {
    if (pathname.startsWith('/api/')) {
      for (const r of routes) {
        if (r.method !== req.method) continue;
        const m = r.re.exec(pathname);
        if (!m) continue;
        const ctx = { params: m.groups || {}, query: url.searchParams, ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress };
        if (r.auth) {
          ctx.user = currentUser(req);
          if (!ctx.user) throw httpError(401, 'Oturumunuz kapandı. Lütfen tekrar giriş yapın.');
        }
        return await r.handler(req, res, ctx);
      }
      throw httpError(404, 'Böyle bir istek yok.');
    }
    if (pathname.startsWith('/uploads/')) {
      return serveFile(res, path.join(UPLOAD_DIR, path.basename(pathname)), 'public, max-age=31536000, immutable');
    }
    const safe = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    let file = path.join(PUBLIC_DIR, safe);
    if (!file.startsWith(PUBLIC_DIR) || pathname === '/' || !path.extname(file)) file = path.join(PUBLIC_DIR, 'index.html');
    const cache = file.endsWith('sw.js') || file.endsWith('.html') ? 'no-cache' : 'public, max-age=3600';
    serveFile(res, file, cache);
  } catch (e) {
    if (!e.status) console.error(e);
    send(res, e.status || 500, { error: e.status ? e.message : 'Sunucuda bir hata oluştu. Tekrar deneyin.' });
  }
});

server.listen(PORT, () => console.log(`NOVA Sosyal çalışıyor: http://localhost:${PORT}`));
