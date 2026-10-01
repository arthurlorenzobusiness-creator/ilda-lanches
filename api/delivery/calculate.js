export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const isPost = req.method === 'POST';
    const vpsResp = await fetch('http://2.24.93.166/api/delivery/calculate', {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: isPost ? JSON.stringify(req.body) : undefined,
      signal: AbortSignal.timeout(8000)
    });

    const data = await vpsResp.json();
    return res.status(vpsResp.status).json(data);
  } catch (err) {
    console.error('Erro proxy delivery calculate VPS:', err);
    return res.status(500).json({ error: 'Erro de conexão com o servidor de entrega' });
  }
}
