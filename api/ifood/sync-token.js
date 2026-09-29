export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token obrigatório' });

  try {
    const vpsResp = await fetch('http://2.24.93.166/api/store/ifood/sync-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(8000)
    });

    const data = await vpsResp.json().catch(() => ({}));
    return res.status(vpsResp.status).json({ ok: true, vps: data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
