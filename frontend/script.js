const API = '/api'; // Funciona no Vercel/local
let token = localStorage.getItem('amorToken');
let signed = localStorage.getItem('signed') === 'true';

const music = document.getElementById('music');
music.volume = 0.25;
window.addEventListener('click', () => music.play().catch(() => {}), { once: true });

if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem('amorToken', data.token);
      localStorage.setItem('signed', data.signed);
      location.href = 'dashboard.html';
    } else {
      alert(data.erro || 'Erro ao entrar');
    }
  });
}

if (document.getElementById('canvas')) {
  if (!token) location.href = 'index.html';

  if (!signed) {
    document.getElementById('signature').style.display = 'block';
    initCanvas();
  } else {
    loadMoments();
    startCounter('2024-06-15'); // ← MUDE PARA A DATA DE VOCÊS!
  }
}

function initCanvas() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let drawing = false;

  const begin = e => { drawing = true; draw(e); };
  const stop = () => { drawing = false; ctx.beginPath(); };
  const draw = e => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#c41e3a';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  ['mousedown', 'touchstart'].forEach(ev => canvas.addEventListener(ev, begin));
  ['mouseup', 'mouseout', 'touchend'].forEach(ev => canvas.addEventListener(ev, stop));
  ['mousemove', 'touchmove'].forEach(ev => canvas.addEventListener(ev, draw));
}

async function saveSignature() {
  const canvas = document.getElementById('canvas');
  const data = canvas.toDataURL();
  await fetch(`${API}/signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ image: data })
  });
  localStorage.setItem('signed', 'true');
  location.reload();
}

function clearSignature() {
  const canvas = document.getElementById('canvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function toggleMenu() {
  document.getElementById('menu').classList.toggle('open');
}

function show(id) {
  document.querySelectorAll('section').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  if (id === 'surprise') document.getElementById('surpriseModal').style.display = 'flex';
  toggleMenu();
}

async function add(type) {
  const formData = new FormData();
  formData.append('type', type);

  if (type === 'foto') formData.append('file', document.getElementById('fileFoto').files[0]);
  else if (type === 'comida') formData.append('file', document.getElementById('fileComida').files[0]);
  else formData.append('content', document.getElementById('textMomento').value);

  await fetch(`${API}/moments`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  loadMoments();
}

async function loadMoments() {
  const res = await fetch(`${API}/moments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();

  const boxes = {
    foto: 'galleryBox',
    comida: 'foodsBox',
    momento: 'momentsBox'
  };

  Object.values(boxes).forEach(id => document.getElementById(id).innerHTML = '');
  document.getElementById('timeline').innerHTML = '';

  data.forEach(m => {
    const el = document.createElement('div');
    el.innerHTML = `<small>${new Date(m.date).toLocaleString('pt-BR')}</small>`;
    
    if (m.type === 'foto' || m.type === 'comida') {
      el.innerHTML += `<img src="${m.content}" alt="${m.type}">`;
      document.getElementById(boxes[m.type]).appendChild(el.cloneNode(true));
    } else {
      el.innerHTML += `<p>${m.content}</p>`;
      document.getElementById(boxes[m.type]).appendChild(el.cloneNode(true));
    }

    const timeEl = document.createElement('div');
    timeEl.className = 'timeline-item';
    timeEl.innerHTML = el.innerHTML;
    document.getElementById('timeline').appendChild(timeEl);
  });
}

function startCounter(startDate) {
  const inicio = new Date(startDate);
  setInterval(() => {
    const diffMs = Date.now() - inicio;
    const dias = Math.floor(diffMs / 86400000);
    const horas = Math.floor((diffMs % 86400000) / 3600000);
    document.getElementById('counter').textContent = `Juntos há ${dias} dias e ${horas} horas ❤️`;
  }, 1000);
}