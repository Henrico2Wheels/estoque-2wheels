// Banco compartilhado do Estoque 2Wheels, em cima do Vercel Blob.
// Um arquivo por lançamento (append-only, sem corrida entre pessoas) e um arquivo
// para cada configuração. O token do Blob fica só aqui no servidor, nunca no navegador.
import { put, list, del, head, get } from '@vercel/blob';

const RAIZ = 'estoque/';
const OPTS = { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' };

async function lerJson(pathname) {
  // caminho normal: get() já resolve autenticação de blob privado
  try {
    if (typeof get === 'function') {
      const r = await get(pathname, { access: 'private', useCache: false });
      if (r && r.statusCode === 200 && r.stream) return JSON.parse(await new Response(r.stream).text());
      if (r && r.statusCode === 200 && !r.stream) return null;
    }
  } catch (e) { /* cai no plano B */ }
  // plano B: metadados + download autenticado
  try {
    const h = await head(pathname);
    const url = (h && (h.downloadUrl || h.url)) || null;
    if (!url) return null;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }, cache: 'no-store' });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) { return null; }
}

async function listar(prefix) {
  const out = []; let cursor;
  do {
    const r = await list({ prefix, limit: 1000, cursor });
    out.push(...(r.blobs || []));
    cursor = r.cursor;
  } while (cursor);
  return out;
}

const lote = async (itens, n, fn) => { const out = []; for (let i = 0; i < itens.length; i += n) out.push(...await Promise.all(itens.slice(i, i + n).map(fn))); return out; };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const blobs = await listar(RAIZ);
      const nomes = blobs.map(b => b.pathname);
      const dados = await lote(nomes, 25, p => lerJson(p));
      const movs = {}, arqs = {}, cfg = {}; let cnt = {};
      nomes.forEach((p, i) => {
        const d = dados[i]; if (!d) return;
        if (p.startsWith(RAIZ + 'mov/') && d.id) movs[d.id] = d;
        else if (p.startsWith(RAIZ + 'arq/') && d.id) arqs[d.id] = d;
        else if (p.startsWith(RAIZ + 'cfg/')) cfg[p.split('/').pop().replace(/\.json$/, '')] = d;
        else if (p.startsWith(RAIZ + 'cnt/')) cnt = d;
      });
      return res.status(200).json({ ok: true, movs, arqs, cfg, cnt, arquivos: nomes.length });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const op = body.op;
      const grava = (p, d) => put(RAIZ + p, JSON.stringify(d), OPTS);

      if (op === 'mov') {
        if (!body.mov || !body.mov.id) return res.status(400).json({ ok: false, erro: 'lançamento sem id' });
        await grava('mov/' + body.mov.id + '.json', body.mov);
        return res.status(200).json({ ok: true });
      }
      if (op === 'patchMov') {
        const cur = await lerJson(RAIZ + 'mov/' + body.id + '.json');
        if (!cur) return res.status(404).json({ ok: false, erro: 'lançamento não encontrado' });
        await grava('mov/' + body.id + '.json', { ...cur, ...(body.patch || {}) });
        return res.status(200).json({ ok: true });
      }
      if (op === 'cfg') {
        if (!/^[a-z]+$/.test(String(body.nome || ''))) return res.status(400).json({ ok: false, erro: 'nome inválido' });
        await grava('cfg/' + body.nome + '.json', body.data || {});
        return res.status(200).json({ ok: true });
      }
      if (op === 'cnt') {
        await grava('cnt/atual.json', body.data || {});
        return res.status(200).json({ ok: true });
      }
      if (op === 'arq') {
        if (!body.arq || !body.arq.id) return res.status(400).json({ ok: false, erro: 'arquivo sem id' });
        await grava('arq/' + body.arq.id + '.json', body.arq);
        const sobras = [];
        for (const id of body.apagar || []) { try { await del(RAIZ + 'mov/' + id + '.json'); } catch (e) { sobras.push(id); } }
        return res.status(200).json({ ok: true, sobras });
      }
      if (op === 'zerar') {
        const bs = await listar(RAIZ);
        if (bs.length) await del(bs.map(b => b.url));
        return res.status(200).json({ ok: true, apagados: bs.length });
      }
      return res.status(400).json({ ok: false, erro: 'operação desconhecida' });
    }

    return res.status(405).json({ ok: false, erro: 'método não suportado' });
  } catch (e) {
    return res.status(500).json({ ok: false, erro: String((e && e.message) || e) });
  }
}
