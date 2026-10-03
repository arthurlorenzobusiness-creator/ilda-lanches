/**
 * Módulo de inteligência para Controle de Estoque & Relatórios de Produção
 * Classifica itens, calcula consumo de pães por tipo, totaliza lanches, combos, bebidas
 * e gera agregações por período (Hoje, 7 dias, 30 dias).
 */

export function classificarItemCardapio(nomeOriginal, quantidade = 1) {
  const nome = (nomeOriginal || '').trim().toLowerCase()
  const qty = Number(quantidade) || 1

  // 1. Combos
  if (nome.includes('combo')) {
    let lanchesPorCombo = 1
    if (nome.includes('casal') || nome.includes('duplo') || nome.includes('2 x') || nome.includes('2x')) {
      lanchesPorCombo = 2
    } else if (nome.includes('triplo') || nome.includes('3 x') || nome.includes('3x')) {
      lanchesPorCombo = 3
    } else if (nome.includes('amigos') || nome.includes('família') || nome.includes('familia') || nome.includes('4 x') || nome.includes('4x')) {
      lanchesPorCombo = 4
    }

    return {
      categoria: 'combos',
      nomeCategoria: 'Combos',
      isLanche: true,
      qtdLanches: lanchesPorCombo * qty,
      isCombo: true,
      qtdCombos: qty,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'tradicional',
      qtdPaes: lanchesPorCombo * qty
    }
  }

  // 2. Lanches Artesanais (150g, 300g, artesanal)
  if (nome.includes('artesanal') || nome.includes('150g') || nome.includes('300g')) {
    return {
      categoria: 'artesanais',
      nomeCategoria: 'Lanches Artesanais',
      isLanche: true,
      qtdLanches: qty,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'artesanal',
      qtdPaes: qty
    }
  }

  // 3. Cachorro-Quente & Variados
  const isHotdogOuVariado = ['cachorro', 'hot dog', 'hotdog', 'especial de', 'especial misto', 'misto quente', 'bauru', 'americano'].some(k => nome.includes(k))
  if (isHotdogOuVariado) {
    return {
      categoria: 'hotdog_variados',
      nomeCategoria: 'Cachorro-Quente / Hot Dog',
      isLanche: true,
      qtdLanches: qty,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hotdog_frances',
      qtdPaes: qty
    }
  }

  // 4. Lanches Tradicionais (X-Burguer, X-Salada, X-Egg, X-Bacon, X-Tudo, Peito, Lombo, Calabresa, Filé, Carga Pesada)
  const isLancheTradicional = nome.startsWith('x-') || nome.startsWith('x -') || nome.startsWith('x ') || nome.includes('burguer') || nome.includes('carga pesada') || nome.includes('peito') || nome.includes('lombo') || nome.includes('calabresa') || nome.includes('filé') || nome.includes('file')
  if (isLancheTradicional && !nome.includes('batata') && !nome.includes('porção') && !nome.includes('porcao')) {
    return {
      categoria: 'lanches_tradicionais',
      nomeCategoria: 'Lanches Tradicionais',
      isLanche: true,
      qtdLanches: qty,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'tradicional',
      qtdPaes: qty
    }
  }

  // 5. Bebidas e Cervejas
  const palavrasBebida = [
    'coca', 'guaraná', 'guarana', 'fanta', 'sprite', 'schweppes', 'água', 'agua',
    'tônica', 'tonica', 'del valle', 'suco', 'limoneto', 'h2o', 'poty', 'cotuba',
    'roller', 'brahma', 'antarctica', 'skol', 'heineken', 'cerveja', 'refrigerante', 'lata'
  ]
  if (palavrasBebida.some(k => nome.includes(k))) {
    return {
      categoria: 'bebidas',
      nomeCategoria: 'Bebidas & Cervejas',
      isLanche: false,
      qtdLanches: 0,
      isCombo: false,
      qtdCombos: 0,
      isBebida: true,
      qtdBebidas: qty,
      tipoPao: null,
      qtdPaes: 0
    }
  }

  // 6. Batatas e Porções
  if (['batata', 'cone', 'porção', 'porcao'].some(k => nome.includes(k))) {
    return {
      categoria: 'porcoes',
      nomeCategoria: 'Batatas & Porções',
      isLanche: false,
      qtdLanches: 0,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: null,
      qtdPaes: 0
    }
  }

  // 7. Outros / Balcão
  return {
    categoria: 'outros',
    nomeCategoria: 'Outros Itens',
    isLanche: false,
    qtdLanches: 0,
    isCombo: false,
    qtdCombos: 0,
    isBebida: false,
    qtdBebidas: 0,
    tipoPao: null,
    qtdPaes: 0
  }
}

/**
 * Agrega pedidos por período e calcula todas as métricas de pães, lanches, combos e bebidas
 * @param {Array} pedidos - Array de objetos de pedidos (cada um com order_items, created_at, status)
 * @param {string} periodo - 'hoje' | '7dias' | '30dias' | 'todos'
 */
export function calcularRelatorioControle(pedidos = [], periodo = 'hoje') {
  const agora = new Date()
  
  // Limites temporais
  let limiteData = new Date(agora)
  
  if (periodo === 'hoje') {
    limiteData.setHours(0, 0, 0, 0)
  } else if (periodo === '7dias') {
    limiteData.setDate(limiteData.getDate() - 7)
    limiteData.setHours(0, 0, 0, 0)
  } else if (periodo === '30dias') {
    limiteData.setDate(limiteData.getDate() - 30)
    limiteData.setHours(0, 0, 0, 0)
  } else {
    limiteData = new Date(0) // Todos
  }

  // Filtragem dos pedidos válidos do período
  const pedidosFiltrados = pedidos.filter(p => {
    if (!p) return false
    if (p.status === 'canceled' || p.status === 'cancelled') return false
    if (p.payment_method === 'archived') return false
    const d = new Date(p.created_at || Date.now())
    return d >= limiteData
  })

  let totalPaes = 0
  let paesTradicionais = 0
  let paesArtesanais = 0
  let paesHotdogFrances = 0

  let totalLanches = 0
  let totalCombos = 0
  let totalBebidas = 0
  let totalOutros = 0
  let totalItensFisicos = 0

  const categoriasQtd = {}
  const itensAgrupados = {}

  for (const pedido of pedidosFiltrados) {
    const itens = Array.isArray(pedido.order_items) ? pedido.order_items : []
    for (const item of itens) {
      const nomeProd = (item.product_name || item.name || 'Item sem nome').trim()
      const qtd = Number(item.quantity) || 1
      const valorTotal = Number(item.total_price) || (Number(item.unit_price || 0) * qtd) || 0

      totalItensFisicos += qtd
      const info = classificarItemCardapio(nomeProd, qtd)

      // Pães
      if (info.tipoPao === 'tradicional') {
        paesTradicionais += info.qtdPaes
        totalPaes += info.qtdPaes
      } else if (info.tipoPao === 'artesanal') {
        paesArtesanais += info.qtdPaes
        totalPaes += info.qtdPaes
      } else if (info.tipoPao === 'hotdog_frances') {
        paesHotdogFrances += info.qtdPaes
        totalPaes += info.qtdPaes
      }

      // Lanches, Combos, Bebidas
      totalLanches += info.qtdLanches
      totalCombos += info.qtdCombos
      totalBebidas += info.qtdBebidas

      if (!info.isLanche && !info.isCombo && !info.isBebida) {
        totalOutros += qtd
      }

      // Agrupamento por categoria
      categoriasQtd[info.nomeCategoria] = (categoriasQtd[info.nomeCategoria] || 0) + qtd

      // Agrupamento de itens detalhados
      const chave = nomeProd.toLowerCase()
      if (!itensAgrupados[chave]) {
        itensAgrupados[chave] = {
          nome: nomeProd,
          quantidade: 0,
          valorTotal: 0,
          categoria: info.nomeCategoria,
          categoriaSlug: info.categoria,
          tipoPao: info.tipoPao,
          paesPorUnidade: info.qtdPaes / (qtd || 1),
          totalPaes: 0
        }
      }
      itensAgrupados[chave].quantidade += qtd
      itensAgrupados[chave].valorTotal += valorTotal
      itensAgrupados[chave].totalPaes += info.qtdPaes
    }
  }

  // Lista ordenada de itens por quantidade decrescente
  const listaItens = Object.values(itensAgrupados).sort((a, b) => b.quantidade - a.quantidade)

  return {
    periodo,
    totalPedidos: pedidosFiltrados.length,
    metricasPaes: {
      totalPaes,
      paesTradicionais,
      paesArtesanais,
      paesHotdogFrances
    },
    metricasGerais: {
      totalLanches,
      totalCombos,
      totalBebidas,
      totalOutros,
      totalItens: totalItensFisicos
    },
    categoriasQtd,
    listaItens
  }
}
