import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const PORT = Number(process.env.PORT || process.env.AI_SERVER_PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_BODY = 300_000;
const DATA_DIR = path.join(__dirname, 'data');
const KNOWLEDGE_FILE = path.join(DATA_DIR, 'approved-knowledge.json');
const DIST_DIR = path.join(__dirname, 'dist');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const readKnowledge = () => { try { const v = JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, 'utf8')); return Array.isArray(v) ? v : []; } catch { return []; } };
const writeKnowledge = (items) => { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(items, null, 2), 'utf8'); };
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://127.0.0.1:5173,http://localhost:5173').split(',').map(x => x.trim()).filter(Boolean);
const rateBuckets = new Map();

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}
function json(req, res, status, data) {
  setCors(req, res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
function rateLimited(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = rateBuckets.get(ip) || { start: now, count: 0 };
  if (now - current.start > 60_000) { current.start = now; current.count = 0; }
  current.count += 1;
  rateBuckets.set(ip, current);
  return current.count > 35;
}
function serveStatic(req, res) {
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) return json(req, res, 404, { error: 'نسخهٔ ساخته‌شدهٔ سایت پیدا نشد. ابتدا npm run build را اجرا کن.' });
  const rawPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let requested = path.resolve(DIST_DIR, `.${rawPath === '/' ? '/index.html' : rawPath}`);
  if (!requested.startsWith(DIST_DIR + path.sep) && requested !== path.join(DIST_DIR, 'index.html')) return json(req, res, 403, { error: 'مسیر نامعتبر است.' });
  if (!fs.existsSync(requested) || fs.statSync(requested).isDirectory()) requested = path.join(DIST_DIR, 'index.html');
  const ext = path.extname(requested).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable' });
  fs.createReadStream(requested).pipe(res);
}

const server = http.createServer(async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/health') return json(req, res, 200, { ok: true, service: 'Chemistry Lab AI', configured: Boolean(process.env.AI_API_KEY) });
  if (req.method === 'GET' && url.pathname === '/api/knowledge') return json(req, res, 200, { items: readKnowledge() });
  if (req.method === 'DELETE' && url.pathname.startsWith('/api/knowledge/')) {
    const id = decodeURIComponent(url.pathname.slice('/api/knowledge/'.length));
    const updated = readKnowledge().filter(item => item.id !== id);
    writeKnowledge(updated);
    return json(req, res, 200, { items: updated });
  }

  if (req.method === 'GET' && !url.pathname.startsWith('/api/')) return serveStatic(req, res);
  if (req.method !== 'POST' || !['/api/chat', '/api/knowledge'].includes(url.pathname)) return json(req, res, 404, { error: 'مسیر درخواست پیدا نشد.' });
  if (rateLimited(req)) return json(req, res, 429, { error: 'تعداد درخواست‌ها زیاد است؛ یک دقیقه بعد دوباره تلاش کن.' });

  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
    if (raw.length > MAX_BODY) { json(req, res, 413, { error: 'درخواست بیش از حد بزرگ است.' }); req.destroy(); }
  });
  req.on('end', async () => {
    try {
      const body = JSON.parse(raw || '{}');
      if (url.pathname === '/api/knowledge') {
        const item = body.item;
        if (!item || typeof item.title !== 'string' || typeof item.content !== 'string') return json(req, res, 400, { error: 'ساختار دانش ارسالی معتبر نیست.' });
        const current = readKnowledge();
        if (!current.some(x => x.id === item.id)) current.push(item);
        writeKnowledge(current.slice(-300));
        return json(req, res, 200, { items: current });
      }
      if (!process.env.AI_API_KEY) return json(req, res, 503, { error: 'کلید API تنظیم نشده است. متغیر AI_API_KEY را در تنظیمات سرور وارد کن.' });
      const mode = body.mode === 'audit' ? 'audit' : 'chat';
      const language = body.language === 'English' ? 'English' : 'Persian';
      const context = JSON.stringify(body.siteContext || {}).slice(0, 180_000);
      const history = Array.isArray(body.messages) ? body.messages.slice(-12).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 6000) })) : [];
      const system = `You are Chemistry Lab AI, the scientific assistant embedded in a chemistry learning website. Respond in ${language}.\n\nSTUDY AND USE THIS WEBSITE KNOWLEDGE SNAPSHOT as your primary reference for questions about the site. It includes the actual records, lessons, compounds, reactions, equipment, and user-approved additions currently available.\n${context}\n\nRules: Distinguish facts present in the site from your general chemistry knowledge. Never claim the site contains a page, experiment, element record, or feature unless the snapshot confirms it. Some periodic table tiles are placeholders and must not be treated as verified scientific records. Be scientifically careful, explain uncertainty, use SI units, and correct misconceptions politely. Do not invent citations, measurements, or source URLs. When suggesting new content, name reputable sources to verify it (for example PubChem, NIST Chemistry WebBook, IUPAC Gold Book, OpenStax). Do not give actionable procedures, quantities, conditions, or troubleshooting for hazardous synthesis, toxic gases, explosives, highly corrosive mixtures, or other dangerous real-world chemistry; keep such topics conceptual and simulation-only. Do not recommend mixing unknown chemicals. The site is educational and intended for students.\n\n${mode === 'audit' ? `TASK: Audit the current site snapshot and identify high-value missing knowledge. Return ONLY valid JSON, no markdown fences, using this exact shape: {"proposals":[{"title":"...","category":"...","summary":"...","content":"...","source_url":"https://...","confidence":"high|medium|needs verification"}]}. Provide at most 8 proposals. Prefer missing fundamentals, missing verified element/compound records, missing safe educational experiments, and missing equipment explanations. Each proposal must be self-contained and concise. Only include source_url if you are confident the URL is a real stable source; otherwise use an empty string. Never invent chemical facts. Do not propose hazardous operational procedures.` : 'TASK: Answer the user using the site snapshot first. If the question is outside the site, answer from general chemistry knowledge while clearly saying it is additional knowledge, not currently in the site. If the user asks to add content, explain how it can be proposed and reviewed.'}`;
      const base = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
      const model = process.env.AI_MODEL || 'gpt-4o-mini';
      const upstream = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, temperature: mode === 'audit' ? 0.2 : 0.35, messages: [{ role: 'system', content: system }, ...history] })
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) return json(req, res, upstream.status, { error: data?.error?.message || `خطای سرویس هوش مصنوعی (${upstream.status})` });
      const answer = data?.choices?.[0]?.message?.content;
      if (!answer) return json(req, res, 502, { error: 'سرویس هوش مصنوعی پاسخ متنی برنگرداند.' });
      return json(req, res, 200, { answer, model });
    } catch (error) {
      return json(req, res, 500, { error: error.message || 'خطای داخلی سرور.' });
    }
  });
});

server.listen(PORT, HOST, () => console.log(`Chemistry Lab server listening on http://${HOST}:${PORT}`));
