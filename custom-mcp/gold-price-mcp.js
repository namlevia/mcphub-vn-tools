#!/usr/bin/env node
const JSONRPC = '2.0';
let buffer = '';

function send(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }
function result(id, value) { send({ jsonrpc: JSONRPC, id, result: value }); }
function error(id, code, message) { send({ jsonrpc: JSONRPC, id, error: { code, message } }); }

const tools = [
  {
    name: 'gold-price-latest',
    description: 'Tra cứu giá vàng Việt Nam mới nhất từ nguồn công khai. Trả về bảng giá mua/bán nếu parse được.',
    inputSchema: { type: 'object', properties: { source: { type: 'string', enum: ['sjc','giavang','auto'], default: 'auto' } } }
  },
  {
    name: 'gold-price-sjc',
    description: 'Tra cứu giá vàng SJC mới nhất.',
    inputSchema: { type: 'object', properties: {} }
  }
];

function stripTags(s) { return s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim(); }
async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 MCPHub gold price checker', 'accept-language': 'vi,en;q=0.8' } });
  const text = await res.text();
  return { ok: res.ok, status: res.status, url: res.url, text };
}
function parseNumbersAround(text) {
  const clean = stripTags(text);
  const lines = clean.split(/(?=(?:SJC|DOJI|PNJ|Mi Hồng|Bảo Tín|9999|vàng|Vàng))/i).map(s=>s.trim()).filter(Boolean);
  const out=[];
  const moneyRe = /\b\d{1,3}(?:[.,]\d{3}){1,3}\b|\b\d{2,3}[.,]\d{1,3}\b/g;
  for (const line of lines) {
    if (!/(SJC|DOJI|PNJ|9999|vàng|Vàng|Mi Hồng|Bảo Tín)/i.test(line)) continue;
    const nums = line.match(moneyRe) || [];
    if (nums.length >= 2) out.push({ item: line.slice(0,180), numbers: nums.slice(0,6) });
    if (out.length >= 12) break;
  }
  return out;
}
async function getGold(source='auto') {
  const sources = source === 'sjc' ? ['https://sjc.com.vn/'] : source === 'giavang' ? ['https://www.giavang.org/'] : ['https://sjc.com.vn/','https://www.giavang.org/'];
  let lastErr = '';
  for (const url of sources) {
    try {
      const r = await fetchText(url);
      const rows = parseNumbersAround(r.text);
      const title = (r.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1];
      if (rows.length) return { source: url, status: r.status, title: title ? stripTags(title) : undefined, unit_hint: 'Thường là VND/lượng hoặc triệu đồng/lượng tùy nguồn; xem text nguồn.', rows, fetched_at: new Date().toISOString() };
      lastErr = `Không parse được bảng giá từ ${url} HTTP ${r.status}`;
    } catch(e) { lastErr = String(e && e.message || e); }
  }
  throw new Error(lastErr || 'Không lấy được giá vàng');
}

async function handle(msg) {
  const { id, method, params } = msg;
  if (method === 'initialize') return result(id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'gold-price-mcp', version: '0.1.0' } });
  if (method === 'notifications/initialized') return;
  if (method === 'tools/list') return result(id, { tools });
  if (method === 'tools/call') {
    const name = params?.name; const args = params?.arguments || {};
    try {
      if (name === 'gold-price-latest' || name === 'gold-price-sjc') {
        const data = await getGold(name === 'gold-price-sjc' ? 'sjc' : (args.source || 'auto'));
        return result(id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], isError: false });
      }
      return error(id, -32601, `Unknown tool: ${name}`);
    } catch(e) { return result(id, { content: [{ type: 'text', text: `Error: ${e.message || e}` }], isError: true }); }
  }
  if (id !== undefined) return error(id, -32601, `Unknown method: ${method}`);
}
process.stdin.on('data', chunk => {
  buffer += chunk.toString();
  let idx;
  while ((idx = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, idx).trim(); buffer = buffer.slice(idx+1);
    if (!line) continue;
    try { handle(JSON.parse(line)); } catch(e) { send({ jsonrpc: JSONRPC, error: { code: -32700, message: e.message } }); }
  }
});
