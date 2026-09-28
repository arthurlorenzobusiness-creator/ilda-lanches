export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const vpsResp = await fetch('http://2.24.93.166/api/store/status', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });

    if (vpsResp.ok) {
      const data = await vpsResp.json();
      return res.status(200).json(data);
    }
  } catch (err) {
    console.error('Erro proxy status VPS:', err);
  }

  // Fallback caso a VPS demore a responder
  return res.status(200).json({
    isOpen: false,
    closedChannels: ['anota_ai', 'ifood'],
    closedUntil: null,
    remainingSeconds: 0,
    reason: 'Fora do horário de expediente'
  });
}
