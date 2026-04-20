/* ==========================================================================
   SISTEMA M — Servidor local
   Node.js vanilla, zero dependências externas.
   Roda em http://localhost:3737 e pela rede LAN.
   ========================================================================== */

const http = require('http');
const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { exec } = require('child_process');

const PORT        = 3737;
const ROOT        = __dirname;
const PUBLIC_DIR  = ROOT;
const DATA_DIR    = path.join(ROOT, 'dados');
const DATA_FILE   = path.join(DATA_DIR, 'sistema-m.json');
const BACKUP_DIR  = path.join(DATA_DIR, 'backups');
const MAX_BACKUPS = 60;

fs.mkdirSync(DATA_DIR,   { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });

function isoToday() { return new Date().toISOString().slice(0, 10); }

const DEFAULT_DATA = {
  version: 3,
  createdAt: isoToday(),
  user: { name: '', location: '' },
  season: {
    startDate: isoToday(),
    focusNote: "Defina aqui o foco desta temporada. Qual o seu pilar de crescimento atual? Por que esse? Escreva para si como lembrete diário."
  },
  projects: [],
  captures: [
    {
      id: 'c-welcome-1',
      text: 'Bem-vindo. Primeiro: vá em Pilares (tecla 2) e cadastre 1 projeto de estabilidade (o que paga as contas) e 1 projeto de crescimento (seu mergulho de 3-6 meses). Outros interesses vão pro laboratório.',
      tag: 'comecar',
      createdAt: isoToday()
    },
    {
      id: 'c-welcome-2',
      text: 'Dentro de cada projeto, crie tarefas. Tarefas DIÁRIAS (ex: "estudar 30min") aparecem automaticamente em Hoje todo dia. Marcar "+10%" vale quando você faz pelo menos um pouco mesmo sem vontade — isso treina o córtex singular anterior.',
      tag: 'comecar',
      createdAt: isoToday()
    },
    {
      id: 'c-welcome-3',
      text: 'A regra dos 10%: quando bater vontade de parar, faça só mais 10%. Neurociência: o CCA (córtex cingulado anterior) ativa quando você faz algo que não quer — se desiste toda vez, ele atrofia.',
      tag: 'metodo',
      createdAt: isoToday()
    }
  ],
  focus: {
    date: isoToday(),
    items: []
  },
  tenPercent: { today: 0, total: 0, streak: 0, lastDate: null },
  history: {}
};

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    return structuredClone(DEFAULT_DATA);
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error('[ERRO] Falha ao ler dados:', e.message);
    const corruptFile = path.join(BACKUP_DIR, `CORROMPIDO-${Date.now()}.json`);
    try { fs.copyFileSync(DATA_FILE, corruptFile); } catch(_){}
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    return structuredClone(DEFAULT_DATA);
  }
}

function writeData(data) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DATA_FILE);
  ensureDailyBackup();
}

function ensureDailyBackup() {
  const today = isoToday();
  const backupFile = path.join(BACKUP_DIR, `sistema-m-${today}.json`);
  if (!fs.existsSync(backupFile)) {
    try {
      fs.copyFileSync(DATA_FILE, backupFile);
      console.log(`[backup] ${path.basename(backupFile)}`);
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => /^sistema-m-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
      while (files.length > MAX_BACKUPS) {
        fs.unlinkSync(path.join(BACKUP_DIR, files.shift()));
      }
    } catch (e) { console.error('[backup] Falha:', e.message); }
  }
}

function getLocalIPs() {
  const ips = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

function isLocalNetworkAddr(addr) {
  if (!addr) return false;
  if (addr.startsWith('::ffff:')) addr = addr.slice(7);
  if (addr === '127.0.0.1' || addr === '::1') return true;
  if (/^10\./.test(addr)) return true;
  if (/^192\.168\./.test(addr)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(addr)) return true;
  return false;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.png':  'image/png'
};

const server = http.createServer((req, res) => {
  const remote = req.socket.remoteAddress;
  if (!isLocalNetworkAddr(remote)) {
    res.writeHead(403); res.end('Acesso restrito a rede local.'); return;
  }
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.url === '/api/data' && req.method === 'GET') {
    try {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(readData()));
    } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    return;
  }

  if (req.url === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 20*1024*1024) req.destroy(); });
    req.on('end', () => {
      try {
        writeData(JSON.parse(body));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, savedAt: new Date().toISOString() }));
      } catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: e.message })); }
    });
    return;
  }

  if (req.url === '/api/reset' && req.method === 'POST') {
    try {
      if (fs.existsSync(DATA_FILE)) {
        fs.copyFileSync(DATA_FILE, path.join(BACKUP_DIR, `ANTES-DO-RESET-${Date.now()}.json`));
        fs.unlinkSync(DATA_FILE);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(readData()));
    } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    return;
  }

  if (req.url === '/api/backups' && req.method === 'GET') {
    try {
      const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).sort().reverse();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ backups: files, dir: BACKUP_DIR }));
    } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    return;
  }

  if (req.url === '/api/ping' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, port: PORT }));
    return;
  }

  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.normalize(path.join(PUBLIC_DIR, reqPath));
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + reqPath); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  readData();
  ensureDailyBackup();
  const ips = getLocalIPs();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   SISTEMA M · servidor local');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Nesta máquina:   http://localhost:${PORT}`);
  if (ips.length) {
    console.log(`   Pela rede LAN:   http://${ips[0]}:${PORT}`);
    ips.slice(1).forEach(ip => console.log(`                    http://${ip}:${PORT}`));
    console.log(`                    (use este endereço do notebook)`);
  }
  console.log(`   Dados:           ${DATA_FILE}`);
  console.log(`   Backups:         ${BACKUP_DIR}`);
  console.log('   >>> NAO FECHE ESTA JANELA <<<');
  console.log('═══════════════════════════════════════════════════════\n');

  if (process.platform === 'win32') exec(`start "" http://localhost:${PORT}`);
  else if (process.platform === 'darwin') exec(`open http://localhost:${PORT}`);
  else exec(`xdg-open http://localhost:${PORT}`).on('error', () => {});
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n[ERRO] Porta ${PORT} ja em uso. O Sistema M provavelmente ja esta rodando.`);
    console.error(`       Acesse:  http://localhost:${PORT}\n`);
    if (process.platform === 'win32') exec(`start "" http://localhost:${PORT}`);
    setTimeout(() => process.exit(0), 3000);
  } else {
    console.error('[ERRO]', e);
    process.exit(1);
  }
});
