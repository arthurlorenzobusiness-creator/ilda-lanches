export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;
  const pathSuffix = Array.isArray(action) ? action.join('/') : (action || '');
  const url = `http://2.24.93.166/api/ifood/${pathSuffix}`;

  try {
    const vpsResp = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: req.method !== 'GET' ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})) : undefined,
      signal: AbortSignal.timeout(10000)
    });

    const text = await vpsResp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, error: text };
    }
    return res.status(vpsResp.status).json(data);
  } catch (err) {
    console.error('Erro proxy ifood VPS:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
