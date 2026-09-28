export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método não permitido' });
  }

  try {
    const vpsResp = await fetch('http://2.24.93.166/api/store/close', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}),
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
    console.error('Erro proxy close VPS:', err);
    return res.status(500).json({ ok: false, error: 'Erro de comunicação com o servidor: ' + err.message });
  }
}
