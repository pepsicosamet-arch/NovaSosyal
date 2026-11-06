// NOVA Sosyal — istemci (tek dosya, kütüphane yok)
'use strict';

// ---------- Simgeler ----------
const I = {
  star: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 1c1 8.5 6.5 14 15 15-8.5 1-14 6.5-15 15-1-8.5-6.5-14-15-15 8.5-1 14-6.5 15-15z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v13M7 8l5-5 5 5M5 14v6h14v-6"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" width="22" height="22"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="22" height="22"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="24" height="24"><path d="M15 5l-7 7 7 7"/></svg>',
};

// ---------- Durum ----------
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} },
};
const state = { token: store.get('nova.token'), me: null, feedTab: 'all', unread: 0, installEvt: null };

// ---------- Yardımcılar ----------
const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const linkify = s => esc(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
  .replace(/(^|\s)@([a-z0-9_.]{3,20})/gi, '$1<a href="#/u/$2">@$2</a>');
function ago(t) {
  const s = Math.max(1, Math.round((Date.now() - t) / 1000));
  if (s < 60) return 'şimdi';
  if (s < 3600) return Math.floor(s / 60) + ' dk';
  if (s < 86400) return Math.floor(s / 3600) + ' sa';
  if (s < 604800) return Math.floor(s / 86400) + ' g';
  return new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: new Date(t).getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}
function avatar(u, size = '') {
  const initial = esc((u.name || u.username || '?').trim().charAt(0).toLocaleUpperCase('tr-TR'));
  return `<span class="avatar ${size}">${u.avatar ? `<img src="${esc(u.avatar)}" alt="" loading="lazy">` : initial}</span>`;
}
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(state.token ? { Authorization: 'Bearer ' + state.token } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).catch(() => { throw new Error('İnternet bağlantısı yok gibi görünüyor.'); });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && state.token && !path.startsWith('/login')) { logoutLocal(); throw new Error(data.error || 'Oturum kapandı.'); }
  if (!res.ok) throw new Error(data.error || 'Bir şeyler ters gitti.');
  return data;
}

// Fotoğrafı telefonda küçült (hızlı yükleme için)
function compressImage(file, max = 1440, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Lütfen bir fotoğraf seçin.'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Fotoğraf açılamadı.')); };
    img.src = url;
  });
}

// ---------- Oturum ----------
function logoutLocal() {
  state.token = null; state.me = null; store.set('nova.token', null);
  location.hash = '#/';
  render();
}

function renderAuth() {
  let mode = 'login';
  const app = $('#app');
  const draw = () => {
    app.innerHTML = `
    <main class="auth">
      <div class="auth-hero">
        ${I.star}
        <h1>NOVA Sosyal</h1>
        <p>Anını paylaş, arkadaşlarını takip et, sohbete katıl.</p>
      </div>
      <div class="seg" role="tablist">
        <button role="tab" aria-selected="${mode === 'login'}" data-mode="login">Giriş yap</button>
        <button role="tab" aria-selected="${mode === 'register'}" data-mode="register">Üye ol</button>
      </div>
      <form id="authForm" novalidate>
        ${mode === 'register' ? `
        <div class="field"><label for="f-name">Adın</label>
          <input class="input" id="f-name" name="name" autocomplete="name" maxlength="40" placeholder="Örn. Samet Şahin" required></div>` : ''}
        <div class="field"><label for="f-user">Kullanıcı adı</label>
          <div class="handle-wrap"><span>@</span><input class="input" id="f-user" name="username" autocomplete="username"
            autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="20" placeholder="kullaniciadi" required></div>
          ${mode === 'register' ? '<span class="hint">3–20 karakter: harf, rakam, nokta, alt çizgi.</span>' : ''}</div>
        <div class="field"><label for="f-pass">Şifre</label>
          <input class="input" id="f-pass" name="password" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" minlength="6" required>
          ${mode === 'register' ? '<span class="hint">En az 6 karakter.</span>' : ''}</div>
        <p class="error" id="authErr"></p>
        <button class="btn block" type="submit">${mode === 'login' ? 'Giriş yap' : 'Hesabımı oluştur'}</button>
      </form>
    </main>`;
    app.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { mode = b.dataset.mode; draw(); });
    $('#authForm').onsubmit = async e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const btn = e.target.querySelector('button[type=submit]');
      btn.disabled = true; $('#authErr').textContent = '';
      try {
        const body = Object.fromEntries(f);
        const data = await api(mode === 'login' ? '/login' : '/register', { method: 'POST', body });
        state.token = data.token; state.me = data.user; store.set('nova.token', data.token);
        location.hash = mode === 'register' ? '#/kesfet' : '#/';
        if (mode === 'register') toast('Hoş geldin! Takip edecek kişiler bul.');
        render();
      } catch (err) { $('#authErr').textContent = err.message; btn.disabled = false; }
    };
  };
  draw();
}

// ---------- Kabuk ----------
function shell(view, { title, tabs, back } = {}) {
  const route = location.hash.split('/')[1] || '';
  const isMe = route === 'u' && decodeURIComponent(location.hash.split('/')[2] || '') === state.me.username;
  const cur = r => (r === route && !(r === 'u' && !isMe) ? 'aria-current="page"' : '');
  $('#app').innerHTML = `
  <div class="shell">
    <header class="topbar">
      <div class="topbar-row">
        ${back ? `<button class="icon-btn" id="backBtn" aria-label="Geri" style="color:var(--ink);margin-left:-8px">${I.back}</button>` : ''}
        ${title ? `<h1 class="page-title" style="flex:1">${esc(title)}</h1>` : `<div class="brand">${I.star}NOVA</div>`}
        <span id="topRight"></span>
      </div>
      ${tabs || '<div style="height:10px"></div>'}
    </header>
    <div id="offline" class="offline" ${navigator.onLine ? 'hidden' : ''}>Çevrimdışısın. Bağlantı gelince yenilenecek.</div>
    <main class="content" id="view"></main>
  </div>
  <nav class="nav" aria-label="Ana menü"><div class="nav-inner">
    <button data-go="#/" ${cur('')}>${I.home}<span>Akış</span></button>
    <button data-go="#/kesfet" ${cur('kesfet')}>${I.search}<span>Keşfet</span></button>
    <button data-go="#/paylas" class="post-btn" aria-label="Paylaş" ${cur('paylas')}><span class="plus">${I.plus}</span></button>
    <button data-go="#/bildirimler" ${cur('bildirimler')}>${I.bell}<span>Bildirimler</span>${state.unread ? `<span class="badge">${state.unread > 9 ? '9+' : state.unread}</span>` : ''}</button>
    <button data-go="#/u/${esc(state.me.username)}" ${isMe ? 'aria-current="page"' : ''}>${I.user}<span>Profil</span></button>
  </div></nav>`;
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => {
    if (location.hash === b.dataset.go) { window.scrollTo({ top: 0, behavior: 'smooth' }); render(); }
    else location.hash = b.dataset.go;
  });
  if (back) $('#backBtn').onclick = () => history.length > 1 ? history.back() : (location.hash = '#/');
  return $('#view');
}

// ---------- Gönderi kartı ----------
function postHtml(p) {
  return `
  <article class="post" data-id="${p.id}">
    <button class="avatar" data-user="${esc(p.author.username)}" aria-label="${esc(p.author.name)} profili">${avatar(p.author).replace(/^<span class="avatar ">|<\/span>$/g, '')}</button>
    <div style="min-width:0">
      <div class="post-head">
        <button class="post-name" data-user="${esc(p.author.username)}">${esc(p.author.name)}</button>
        <span class="post-meta">@${esc(p.author.username)} · <time datetime="${new Date(p.createdAt).toISOString()}">${ago(p.createdAt)}</time></span>
      </div>
      ${p.text ? `<p class="post-text">${linkify(p.text)}</p>` : ''}
      ${p.image ? `<img class="post-img" src="${esc(p.image)}" alt="" loading="lazy">` : ''}
      <div class="post-actions">
        <button class="act like ${p.liked ? 'liked' : ''}" aria-pressed="${p.liked}" aria-label="Beğen">${I.heart}<span>${p.likes || ''}</span></button>
        <button class="act comment" aria-label="Yorumlar">${I.chat}<span>${p.comments || ''}</span></button>
        <button class="act share" aria-label="Paylaş">${I.share}</button>
        ${p.mine ? `<button class="act more" aria-label="Seçenekler">${I.dots}</button>` : ''}
      </div>
    </div>
  </article>`;
}

function bindPosts(container, posts, onRemoved) {
  container.addEventListener('click', async e => {
    const uBtn = e.target.closest('[data-user]');
    if (uBtn) { location.hash = '#/u/' + uBtn.dataset.user; return; }
    const art = e.target.closest('.post');
    if (!art) return;
    const p = posts.get(Number(art.dataset.id));
    if (!p) return;
    if (e.target.closest('.like')) {
      const btn = art.querySelector('.like');
      // anında göster, sonra sunucuyla eşitle
      p.liked = !p.liked; p.likes += p.liked ? 1 : -1;
      btn.classList.toggle('liked', p.liked); btn.setAttribute('aria-pressed', p.liked);
      btn.querySelector('span').textContent = p.likes || '';
      if (p.liked) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
      try {
        const r = await api(`/posts/${p.id}/like`, { method: 'POST' });
        p.liked = r.liked; p.likes = r.likes;
        btn.classList.toggle('liked', p.liked); btn.querySelector('span').textContent = p.likes || '';
      } catch (err) { toast(err.message); }
    } else if (e.target.closest('.comment')) {
      openComments(p, n => { p.comments = n; art.querySelector('.comment span').textContent = n || ''; });
    } else if (e.target.closest('.share')) {
      const text = `${p.author.name} NOVA Sosyal'de paylaştı${p.text ? ': ' + p.text.slice(0, 120) : ''}`;
      const url = location.origin + '/#/u/' + p.author.username;
      if (window.NovaAndroid) window.NovaAndroid.share(text + '\n' + url);
      else if (navigator.share) navigator.share({ title: 'NOVA Sosyal', text, url }).catch(() => {});
      else { navigator.clipboard?.writeText(url).then(() => toast('Bağlantı kopyalandı.'), () => toast(url)); }
    } else if (e.target.closest('.more')) {
      sheet('Gönderi', `<div class="menu"><button class="danger" id="delPost">Gönderiyi sil</button><button id="cancel">Vazgeç</button></div>`, s => {
        $('#cancel', s.el).onclick = s.close;
        $('#delPost', s.el).onclick = async () => {
          try { await api('/posts/' + p.id, { method: 'DELETE' }); art.remove(); posts.delete(p.id); s.close(); toast('Gönderi silindi.'); onRemoved?.(); }
          catch (err) { toast(err.message); }
        };
      });
    }
  });
}

// Sayfalı gönderi listesi
async function postList(view, loader, emptyHtml) {
  const list = document.createElement('div');
  list.className = 'feed';
  view.appendChild(list);
  const posts = new Map();
  const more = document.createElement('div');
  view.appendChild(more);
  let before = null, done = false, busy = false;
  bindPosts(list, posts, () => { if (!posts.size) list.innerHTML = emptyHtml; });
  async function load() {
    if (busy || done) return;
    busy = true;
    more.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const data = await loader(before);
      for (const p of data.posts) posts.set(p.id, p);
      list.insertAdjacentHTML('beforeend', data.posts.map(postHtml).join(''));
      if (data.posts.length < 20) done = true; else before = data.posts.at(-1).id;
      more.innerHTML = done ? '' : '<button class="btn ghost sm more-btn">Daha fazla göster</button>';
      if (!posts.size) list.innerHTML = emptyHtml;
      const mb = more.querySelector('button'); if (mb) mb.onclick = load;
      return data;
    } catch (err) {
      more.innerHTML = `<div class="empty"><b>Yüklenemedi</b><span>${esc(err.message)}</span><button class="btn ghost sm" id="retry">Tekrar dene</button></div>`;
      more.querySelector('#retry').onclick = load;
    } finally { busy = false; }
  }
  // sayfa sonuna yaklaşınca otomatik yükle
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) load(); }, { rootMargin: '600px' });
  io.observe(more);
  await load();
}

// ---------- Görünümler ----------
async function viewFeed() {
  const tabs = `<div class="tabs" role="tablist">
    <button role="tab" data-tab="all" aria-selected="${state.feedTab === 'all'}">Herkes</button>
    <button role="tab" data-tab="following" aria-selected="${state.feedTab === 'following'}">Takip ettiklerim</button></div>`;
  const view = shell(null, { tabs });
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { state.feedTab = b.dataset.tab; render(); });
  installCard(view);
  const empty = state.feedTab === 'following'
    ? `<div class="empty">${I.user}<b>Akışın henüz sessiz</b><span>Takip ettiğin kişilerin gönderileri burada görünür.</span><a class="btn sm" href="#/kesfet">Kişi bul</a></div>`
    : `<div class="empty">${I.star}<b>İlk gönderiyi sen paylaş</b><span>Burada herkesin paylaşımları görünecek.</span><a class="btn sm" href="#/paylas">Paylaş</a></div>`;
  await postList(view, before => api(`/feed?tab=${state.feedTab}${before ? '&before=' + before : ''}`), empty);
}

function viewCompose() {
  const view = shell('Yeni gönderi');
  let image = null;
  view.innerHTML = `
  <form class="composer" id="composer">
    <div class="composer-row">
      ${avatar(state.me)}
      <label class="sr" style="min-width:0"><span hidden>Gönderi metni</span>
        <textarea class="textarea" id="c-text" maxlength="1000" placeholder="Neler oluyor?"></textarea></label>
    </div>
    <div class="preview" id="preview" hidden><img alt="Seçilen fotoğraf"><button type="button" aria-label="Fotoğrafı kaldır">${I.close}</button></div>
    <div class="composer-bar">
      <label class="icon-btn" for="c-file">${I.image}<span>Fotoğraf</span></label>
      <input type="file" id="c-file" accept="image/*" hidden>
      <span class="count" id="c-count">0 / 1000</span>
      <button class="btn sm" type="submit" id="c-send" disabled>Paylaş</button>
    </div>
    <p class="error" id="c-err"></p>
  </form>`;
  const text = $('#c-text'), send = $('#c-send');
  const sync = () => { $('#c-count').textContent = `${text.value.length} / 1000`; send.disabled = !text.value.trim() && !image; };
  text.oninput = () => { text.style.height = 'auto'; text.style.height = text.scrollHeight + 'px'; sync(); };
  const draft = store.get('nova.draft'); if (draft) { text.value = draft; sync(); }
  text.addEventListener('input', () => store.set('nova.draft', text.value || null));
  $('#c-file').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { image = await compressImage(f); $('#preview img').src = image; $('#preview').hidden = false; sync(); }
    catch (err) { toast(err.message); }
    e.target.value = '';
  };
  $('#preview button').onclick = () => { image = null; $('#preview').hidden = true; sync(); };
  $('#composer').onsubmit = async e => {
    e.preventDefault();
    send.disabled = true; send.textContent = 'Paylaşılıyor…'; $('#c-err').textContent = '';
    try {
      await api('/posts', { method: 'POST', body: { text: text.value, image } });
      store.set('nova.draft', null);
      state.feedTab = 'all';
      toast('Paylaşıldı.');
      location.hash = '#/';
    } catch (err) { $('#c-err').textContent = err.message; send.disabled = false; send.textContent = 'Paylaş'; }
  };
  setTimeout(() => text.focus(), 50);
}

function userRow(u) {
  return `<div class="row">
    <button class="row-main" data-user="${esc(u.username)}">${avatar(u)}
      <span class="row-text"><b>${esc(u.name)}</b><small>@${esc(u.username)}${u.bio ? ' · ' + esc(u.bio) : ''}</small></span></button>
    ${u.isMe ? '' : `<button class="btn sm ${u.isFollowing ? 'outline' : ''}" data-follow="${esc(u.username)}">${u.isFollowing ? 'Takiptesin' : 'Takip et'}</button>`}
  </div>`;
}
function bindUserRows(el) {
  el.addEventListener('click', async e => {
    const f = e.target.closest('[data-follow]');
    if (f) {
      f.disabled = true;
      try {
        const { user } = await api(`/users/${encodeURIComponent(f.dataset.follow)}/follow`, { method: 'POST' });
        f.textContent = user.isFollowing ? 'Takiptesin' : 'Takip et';
        f.classList.toggle('outline', user.isFollowing);
      } catch (err) { toast(err.message); }
      f.disabled = false; return;
    }
    const u = e.target.closest('[data-user]');
    if (u) location.hash = '#/u/' + u.dataset.user;
  });
}

function viewExplore() {
  const view = shell('Keşfet');
  view.innerHTML = `
    <div class="search">${I.search}<input class="input" id="q" type="search" placeholder="Kişi ara" autocapitalize="none" aria-label="Kişi ara"></div>
    <p class="section-label" id="q-label">Önerilen kişiler</p>
    <div id="results"><div class="loading"><div class="spinner"></div></div></div>`;
  const results = $('#results');
  bindUserRows(results);
  let timer, seq = 0;
  const run = async q => {
    const my = ++seq;
    try {
      const { users } = await api('/search?q=' + encodeURIComponent(q));
      if (my !== seq) return;
      $('#q-label').textContent = q ? 'Sonuçlar' : 'Önerilen kişiler';
      results.innerHTML = users.length ? users.map(userRow).join('')
        : `<div class="empty">${I.search}<b>${q ? 'Kimse bulunamadı' : 'Henüz başka üye yok'}</b><span>${q ? 'Farklı bir ad ya da kullanıcı adı dene.' : 'Arkadaşlarını davet et; burada görünecekler.'}</span></div>`;
    } catch (err) { results.innerHTML = `<div class="empty"><b>Yüklenemedi</b><span>${esc(err.message)}</span></div>`; }
  };
  $('#q').oninput = e => { clearTimeout(timer); timer = setTimeout(() => run(e.target.value.trim()), 250); };
  run('');
}

async function viewNotifications() {
  const view = shell('Bildirimler');
  view.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const { items } = await api('/notifications');
    store.set('nova.seen', String(Date.now())); state.unread = 0;
    const badge = document.querySelector('.nav .badge'); if (badge) badge.remove();
    if (!items.length) {
      view.innerHTML = `<div class="empty">${I.bell}<b>Henüz bildirim yok</b><span>Biri gönderini beğendiğinde, yorum yaptığında ya da seni takip ettiğinde burada görürsün.</span></div>`;
      return;
    }
    const label = { like: 'gönderini beğendi', comment: 'yorum yaptı', follow: 'seni takip etmeye başladı' };
    const icon = { like: I.heart, comment: I.chat, follow: I.user };
    view.innerHTML = items.map(n => `
      <div class="row">
        <button class="row-main" style="flex:none" data-user="${esc(n.actor.username)}">${avatar(n.actor)}</button>
        <button class="notif-text" data-user="${esc(n.actor.username)}">
          <b>${esc(n.actor.name)}</b> ${label[n.type]}
          ${n.text ? `<q>${esc(n.text)}</q>` : ''}<small>${ago(n.at)}</small></button>
        ${icon[n.type].replace('<svg', `<svg class="notif-icon ${n.type}"`)}
      </div>`).join('');
    view.addEventListener('click', e => { const u = e.target.closest('[data-user]'); if (u) location.hash = '#/u/' + u.dataset.user; });
  } catch (err) { view.innerHTML = `<div class="empty"><b>Yüklenemedi</b><span>${esc(err.message)}</span></div>`; }
}

async function viewProfile(username) {
  const isMe = username === state.me.username;
  const view = shell(isMe ? 'Profil' : '@' + username, { back: !isMe });
  view.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  let first;
  try { first = await api(`/users/${encodeURIComponent(username)}`); }
  catch (err) { view.innerHTML = `<div class="empty">${I.user}<b>${esc(err.message)}</b><a class="btn sm" href="#/kesfet">Kişi ara</a></div>`; return; }
  const u = first.user;
  if (isMe) { state.me = u; $('#topRight').innerHTML = `<button class="icon-btn" id="settingsBtn" aria-label="Ayarlar" style="color:var(--ink)">${I.gear}</button>`; $('#settingsBtn').onclick = openSettings; }
  else { const t = document.querySelector('.page-title'); if (t) t.textContent = u.name; }
  const head = document.createElement('section');
  head.className = 'profile';
  const drawHead = () => {
    head.innerHTML = `
      <div class="profile-top">${avatar(u, 'lg')}
        <div class="profile-btns">${isMe
          ? '<button class="btn outline sm" id="editBtn">Profili düzenle</button>'
          : `<button class="btn sm ${u.isFollowing ? 'outline' : ''}" id="followBtn">${u.isFollowing ? 'Takiptesin' : 'Takip et'}</button>`}</div></div>
      <div><h2>${esc(u.name)}</h2><span class="handle">@${esc(u.username)}</span></div>
      ${u.bio ? `<p class="bio">${linkify(u.bio)}</p>` : ''}
      <div class="stats"><span><b>${u.posts}</b> gönderi</span><span><b>${u.followers}</b> takipçi</span><span><b>${u.following}</b> takip</span>
        <span>${new Date(u.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} katıldı</span></div>`;
    if (isMe) $('#editBtn', head).onclick = openSettings;
    else $('#followBtn', head).onclick = async () => {
      try { Object.assign(u, (await api(`/users/${encodeURIComponent(u.username)}/follow`, { method: 'POST' })).user); drawHead(); }
      catch (err) { toast(err.message); }
    };
  };
  drawHead();
  view.innerHTML = ''; view.appendChild(head);
  let used = false;
  await postList(view, async before => {
    if (!used && !before) { used = true; return first; }
    return api(`/users/${encodeURIComponent(username)}${before ? '?before=' + before : ''}`);
  }, `<div class="empty">${I.image}<b>${isMe ? 'Henüz paylaşım yapmadın' : 'Henüz gönderi yok'}</b>${isMe ? '<a class="btn sm" href="#/paylas">İlk gönderini paylaş</a>' : ''}</div>`);
}

// ---------- Alt sayfalar ----------
function sheet(title, body, setup, foot = '') {
  const back = document.createElement('div');
  back.className = 'sheet-backdrop';
  back.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-head"><h3>${esc(title)}</h3><button class="icon-btn" data-close aria-label="Kapat" style="color:var(--ink)">${I.close}</button></div>
    <div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}</div>`;
  document.body.appendChild(back);
  document.body.style.overflow = 'hidden';
  const s = { el: back, close() { back.remove(); document.body.style.overflow = ''; window.removeEventListener('hashchange', s.close); } };
  back.addEventListener('click', e => { if (e.target === back || e.target.closest('[data-close]')) s.close(); });
  window.addEventListener('hashchange', s.close);
  setup?.(s);
  return s;
}

function openComments(post, onCount) {
  sheet('Yorumlar', '<div id="cm-list"><div class="loading"><div class="spinner"></div></div></div>', async s => {
    const list = $('#cm-list', s.el);
    const load = async () => {
      try {
        const { comments } = await api(`/posts/${post.id}/comments`);
        onCount(comments.length);
        list.innerHTML = comments.length ? comments.map(c => `
          <div class="comment">${avatar(c.author, 'sm')}
            <div style="min-width:0"><div class="post-head"><button class="post-name" data-user="${esc(c.author.username)}">${esc(c.author.name)}</button>
              <span class="post-meta">${ago(c.createdAt)}</span></div>
              <p>${linkify(c.text)}</p>
              ${c.mine || post.mine ? `<button class="del" data-del="${c.id}">Sil</button>` : ''}</div></div>`).join('')
          : `<div class="empty">${I.chat}<b>İlk yorumu sen yaz</b></div>`;
        list.scrollTop = list.scrollHeight;
      } catch (err) { list.innerHTML = `<div class="empty"><b>Yüklenemedi</b><span>${esc(err.message)}</span></div>`; }
    };
    list.addEventListener('click', async e => {
      const u = e.target.closest('[data-user]'); if (u) { location.hash = '#/u/' + u.dataset.user; return; }
      const d = e.target.closest('[data-del]');
      if (d) { try { await api('/comments/' + d.dataset.del, { method: 'DELETE' }); load(); } catch (err) { toast(err.message); } }
    });
    const form = $('#cm-form', s.el);
    form.onsubmit = async e => {
      e.preventDefault();
      const input = $('#cm-input', s.el); const text = input.value.trim(); if (!text) return;
      input.disabled = true;
      try { await api(`/posts/${post.id}/comments`, { method: 'POST', body: { text } }); input.value = ''; await load(); }
      catch (err) { toast(err.message); }
      input.disabled = false; input.focus();
    };
    load();
  }, `<form id="cm-form" style="display:flex;gap:8px;width:100%"><input class="input" id="cm-input" maxlength="500" placeholder="Yorum yaz…" aria-label="Yorum yaz" autocomplete="off"><button class="btn sm" type="submit">Gönder</button></form>`);
}

function openSettings() {
  const me = state.me;
  let avatarData = null;
  sheet('Profili düzenle', `
    <form class="settings" id="st-form">
      <div class="avatar-pick"><span id="st-av">${avatar(me, 'lg')}</span>
        <label class="btn ghost sm" for="st-file">Fotoğraf değiştir</label><input type="file" id="st-file" accept="image/*" hidden></div>
      <div class="field"><label for="st-name">Ad</label><input class="input" id="st-name" maxlength="40" value="${esc(me.name)}"></div>
      <div class="field"><label for="st-bio">Hakkında</label><textarea class="input" id="st-bio" maxlength="160" rows="3" style="resize:none">${esc(me.bio)}</textarea></div>
      <p class="section-label">Şifre değiştir</p>
      <div class="field"><label for="st-cur">Mevcut şifre</label><input class="input" id="st-cur" type="password" autocomplete="current-password"></div>
      <div class="field"><label for="st-new">Yeni şifre</label><input class="input" id="st-new" type="password" autocomplete="new-password" minlength="6"></div>
      <p class="error" id="st-err"></p>
      <button class="btn block" type="submit">Kaydet</button>
      ${isStandalone() ? '' : '<button class="btn outline block" type="button" id="st-install">Uygulamayı telefona kur</button>'}
      <button class="btn outline block" type="button" id="st-logout">Çıkış yap</button>
      <button class="btn danger block" type="button" id="st-delete">Hesabımı sil</button>
    </form>`, s => {
    $('#st-file', s.el).onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { avatarData = await compressImage(f, 512, 0.85); $('#st-av', s.el).innerHTML = avatar({ ...me, avatar: avatarData }, 'lg'); }
      catch (err) { toast(err.message); }
    };
    $('#st-form', s.el).onsubmit = async e => {
      e.preventDefault();
      const btn = e.target.querySelector('[type=submit]'); btn.disabled = true; $('#st-err', s.el).textContent = '';
      try {
        const body = { name: $('#st-name', s.el).value, bio: $('#st-bio', s.el).value };
        if (avatarData) body.avatar = avatarData;
        if ($('#st-new', s.el).value) { body.newPassword = $('#st-new', s.el).value; body.currentPassword = $('#st-cur', s.el).value; }
        state.me = (await api('/me', { method: 'PUT', body })).user;
        s.close(); toast('Kaydedildi.'); render();
      } catch (err) { $('#st-err', s.el).textContent = err.message; btn.disabled = false; }
    };
    const inst = $('#st-install', s.el); if (inst) inst.onclick = () => { s.close(); promptInstall(true); };
    $('#st-logout', s.el).onclick = async () => { try { await api('/logout', { method: 'POST' }); } catch {} s.close(); logoutLocal(); };
    $('#st-delete', s.el).onclick = () => {
      s.close();
      sheet('Hesabı sil', `<form class="settings" id="del-form"><p style="margin:0">Hesabın, tüm gönderilerin, yorumların ve beğenilerin kalıcı olarak silinir. Bu işlem geri alınamaz.</p>
        <div class="field"><label for="del-pass">Onaylamak için şifreni yaz</label><input class="input" id="del-pass" type="password" autocomplete="current-password"></div>
        <p class="error" id="del-err"></p><button class="btn block" style="background:var(--danger)" type="submit">Hesabımı kalıcı olarak sil</button></form>`, d => {
        $('#del-form', d.el).onsubmit = async e => {
          e.preventDefault();
          try { await api('/me', { method: 'DELETE', body: { password: $('#del-pass', d.el).value } }); d.close(); logoutLocal(); toast('Hesabın silindi.'); }
          catch (err) { $('#del-err', d.el).textContent = err.message; }
        };
      });
    };
  });
}

// ---------- Telefona kurulum ----------
const inAndroidApp = /NovaSosyalApp/.test(navigator.userAgent);
const isStandalone = () => inAndroidApp || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); state.installEvt = e; if ((location.hash || '#/') === '#/') { const v = $('#view'); if (v && !$('.install', v)) installCard(v); } });
window.addEventListener('appinstalled', () => { state.installEvt = null; document.querySelector('.install')?.remove(); toast('NOVA Sosyal kuruldu.'); });

function installCard(view) {
  if (isStandalone() || store.get('nova.installDismissed')) return;
  if (!state.installEvt && !isIOS()) return;
  const card = document.createElement('div');
  card.className = 'install';
  card.innerHTML = `<img src="/icons/icon-192.png" alt=""><div><strong>NOVA Sosyal'i telefonuna kur</strong><small>Ana ekrandan tek dokunuşla aç.</small></div>
    <div style="display:flex;align-items:center"><button class="btn sm" id="inst">Kur</button><button class="x" aria-label="Kapat">${I.close}</button></div>`;
  view.prepend(card);
  $('#inst', card).onclick = () => promptInstall();
  $('.x', card).onclick = () => { store.set('nova.installDismissed', '1'); card.remove(); };
}
async function promptInstall(fromSettings) {
  if (isStandalone()) { toast('Uygulama zaten kurulu.'); return; }
  if (state.installEvt) {
    state.installEvt.prompt();
    const { outcome } = await state.installEvt.userChoice;
    if (outcome === 'accepted') state.installEvt = null;
    return;
  }
  const ios = isIOS();
  sheet('Telefona kur', `<div class="settings">
    ${ios ? `<p style="margin:0"><b>iPhone / iPad (Safari):</b></p>
      <p style="margin:0">1. Alttaki <b>Paylaş</b> düğmesine dokun (kare ve yukarı ok).</p>
      <p style="margin:0">2. <b>Ana Ekrana Ekle</b>’yi seç.</p><p style="margin:0">3. Sağ üstte <b>Ekle</b>’ye dokun.</p>`
    : `<p style="margin:0"><b>Android (Chrome):</b></p>
      <p style="margin:0">1. Sağ üstteki <b>⋮</b> menüsüne dokun.</p>
      <p style="margin:0">2. <b>Uygulamayı yükle</b> ya da <b>Ana ekrana ekle</b>’yi seç.</p><p style="margin:0">3. <b>Yükle</b>’ye dokun.</p>`}
    <p class="hint" style="margin:0">Kurulumdan sonra NOVA Sosyal ana ekranında kendi simgesiyle, tam ekran açılır.</p></div>`);
}

// ---------- Bildirim sayacı ----------
async function pollUnread() {
  if (!state.token || document.hidden) return;
  try {
    const { items } = await api('/notifications');
    const seen = Number(store.get('nova.seen')) || 0;
    const n = items.filter(i => i.at > seen).length;
    if (n !== state.unread) {
      state.unread = n;
      const btn = document.querySelector('[data-go="#/bildirimler"]');
      if (btn) { btn.querySelector('.badge')?.remove(); if (n) btn.insertAdjacentHTML('beforeend', `<span class="badge">${n > 9 ? '9+' : n}</span>`); }
    }
  } catch {}
}
setInterval(pollUnread, 45000);
document.addEventListener('visibilitychange', pollUnread);
addEventListener('online', () => { $('#offline')?.setAttribute('hidden', ''); render(); });
addEventListener('offline', () => $('#offline')?.removeAttribute('hidden'));

// ---------- Yönlendirme ----------
async function render() {
  if (!state.token) return renderAuth();
  if (!state.me) {
    $('#app').innerHTML = `<div class="auth" style="justify-items:center">${I.star.replace('<svg', '<svg style="width:56px;height:56px;color:var(--accent)"')}</div>`;
    try { state.me = (await api('/me')).user; pollUnread(); }
    catch (err) { if (state.token) { $('#app').innerHTML = `<div class="empty" style="padding-top:30vh"><b>Bağlanılamadı</b><span>${esc(err.message)}</span><button class="btn sm" onclick="location.reload()">Tekrar dene</button></div>`; } return; }
  }
  const parts = (location.hash || '#/').slice(2).split('/');
  window.scrollTo(0, 0);
  switch (parts[0]) {
    case 'kesfet': return viewExplore();
    case 'paylas': return viewCompose();
    case 'bildirimler': return viewNotifications();
    case 'u': return viewProfile(decodeURIComponent(parts[1] || state.me.username));
    default: return viewFeed();
  }
}
addEventListener('hashchange', render);
render();

if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
