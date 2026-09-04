import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbgvkxkkawwadbudbfez.supabase.co';
// Usamos a chave anônima que já está pública no frontend
const supabaseKey = 'sb_publishable__zKSEYx8uTpBbNLBLwZzGA_b_kjl0p9';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Envie um POST.' });
  }

  try {
    const payload = req.body;
    
    // Transformamos o JSON recebido em string para inspecionar
    const payloadString = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
    
    // Inserimos um pedido FALSO apenas para que possamos ler a estrutura
    // de como o Anota AI manda o pedido (nome das variáveis, produtos, etc).
    const { data: pedido, error } = await supabase
      .from('orders')
      .insert({
        source: 'anota_ai',
        order_type: 'delivery',
        customer_name: '🔔 TESTE WEBHOOK ANOTA AI',
        subtotal: 0,
        delivery_fee: 0,
        total: 0,
        payment_status: 'pending',
        status: 'new',
        manual_delivery: true,
        // Salvamos os dados crus no endereço para o Arthur poder copiar e mandar no chat
        delivery_address: payloadString
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao salvar no banco.' });
    }

    // Criamos um item vazio só pro pedido aparecer direito
    await supabase.from('order_items').insert({
      order_id: pedido.id,
      product_name: 'Abra a edição deste pedido para copiar o Endereço',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    });

    return res.status(200).json({ message: 'Webhook recebido!', order_id: pedido.id });
  } catch (err) {
    console.error('Erro interno no webhook:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
