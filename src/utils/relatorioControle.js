/**
 * Módulo de inteligência para Controle de Estoque & Relatórios de Produção
 * Classifica itens, calcula consumo de pães por tipo, totaliza lanches, combos, bebidas
 * e gera agregações por período (Hoje, 7 dias, 30 dias).
 */

/**
 * Classificador Canônico Ultra Preciso para TODOS os itens do Cardápio & Histórico Multi-Canal
 */
export function classificarItemCardapio(nomeOriginal, quantidade = 1) {
  const raw = (nomeOriginal || '').trim()
  let nome = raw.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos para busca robusta
    .replace(/\s+/g, ' ')
    .trim()
  const qty = Number(quantidade) || 1

  // Normalização de grafias conhecidas de canais (ex: cheese -> x-)
  if (nome.startsWith('cheese ') || nome.startsWith('cheese-')) {
    nome = nome.replace(/^cheese[- ]/, 'x-')
  }

  // Registros genéricos de bebidas em testes antigos
  if (nome === '600ml' || nome === 'lata' || nome.startsWith('bebidas')) {
    return {
      nomeCanonico: raw,
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

  // =========================================================================
  // 1. COMBOS
  // =========================================================================
  if (nome.includes('sabor da liberdade')) {
    return {
      nomeCanonico: 'Combo Sabor da Liberdade',
      categoria: 'combos',
      nomeCategoria: 'Combos',
      isLanche: true,
      qtdLanches: 1 * qty,
      isCombo: true,
      qtdCombos: qty,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hamburguer',
      qtdPaes: 1 * qty
    }
  }

  if (nome.includes('1x- burguer artesanal') || nome.includes('1x - burguer artesanal') || (nome.includes('artesanal') && nome.includes('batata') && nome.includes('coca'))) {
    return {
      nomeCanonico: 'Combo Individual Artesanal',
      categoria: 'combos',
      nomeCategoria: 'Combos',
      isLanche: true,
      qtdLanches: 1 * qty,
      isCombo: true,
      qtdCombos: qty,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hamburguer',
      qtdPaes: 1 * qty
    }
  }

  if (nome.includes('combo') || nome.includes('ilda lanches coca')) {
    let lanchesPorCombo = 1
    let nomeCanonico = 'Combo'

    if (nome.includes('casal')) {
      lanchesPorCombo = 2
      nomeCanonico = 'Combo Casal (2 Lanches)'
    } else if (nome.includes('tudo duplo')) {
      lanchesPorCombo = 2
      nomeCanonico = 'Combo Tudo Duplo (2 Lanches)'
    } else if (nome.includes('triplo') || nome.includes('3 x') || nome.includes('3x')) {
      lanchesPorCombo = 3
      nomeCanonico = 'Combo Triplo (3 Lanches)'
    } else if (nome.includes('amigos')) {
      lanchesPorCombo = 4
      nomeCanonico = 'Combo Amigos (4 Lanches)'
    } else if (nome.includes('familia') || nome.includes('4 x') || nome.includes('4x')) {
      lanchesPorCombo = 4
      nomeCanonico = 'Combo Família (4 Lanches)'
    } else if (nome.includes('delas')) {
      lanchesPorCombo = 1
      nomeCanonico = 'Combo Delas'
    } else if (nome.includes('kids')) {
      lanchesPorCombo = 1
      nomeCanonico = 'Combo Kids'
    } else if (nome.includes('ilda lanches')) {
      lanchesPorCombo = 1
      nomeCanonico = 'Combo Ilda Lanches (Coca 600ml + Batata)'
    } else {
      nomeCanonico = raw
    }

    return {
      nomeCanonico,
      categoria: 'combos',
      nomeCategoria: 'Combos',
      isLanche: true,
      qtdLanches: lanchesPorCombo * qty,
      isCombo: true,
      qtdCombos: qty,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hamburguer',
      qtdPaes: lanchesPorCombo * qty
    }
  }

  // =========================================================================
  // 2. BATATAS & PORÇÕES
  // =========================================================================
  if (nome.includes('batata') || nome.includes('porcao') || nome.includes('cone')) {
    let nomeCanonico = 'Porção de Batata'
    if (nome.includes('cone')) {
      const g = nome.includes('300') ? ' 300g' : ''
      nomeCanonico = `Batata no Cone${g}`
    } else if (nome.includes('individual')) {
      nomeCanonico = 'Batata Individual'
    } else if (nome.includes('600')) {
      nomeCanonico = 'Porção de Batata 600g'
    } else if (nome.includes('300')) {
      nomeCanonico = 'Porção de Batata 300g'
    }

    return {
      nomeCanonico,
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

  // =========================================================================
  // 3. BEBIDAS & CERVEJAS
  // =========================================================================
  // Importante: Guaraná Antarctica ANTES de Cerveja Antarctica!
  if (nome.includes('guarana')) {
    let vol = '350ml'
    if (nome.includes('2l') || nome.includes('2 litros') || nome.includes('2000')) vol = '2L'
    else if (nome.includes('1l') || nome.includes('1 litro')) vol = '1L'
    else if (nome.includes('600')) vol = '600ml'
    return {
      nomeCanonico: `Guaraná Antarctica ${vol}`,
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

  // Cerveja Antarctica (sem guaraná)
  if (nome.includes('antarctica')) {
    return {
      nomeCanonico: 'Antarctica 350ml',
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

  if (nome.includes('coca')) {
    const isZero = nome.includes('zero')
    const zeroStr = isZero ? ' Zero' : ''
    let vol = '350ml'
    if (nome.includes('2l') || nome.includes('2 litros') || nome.includes('2000')) vol = '2L'
    else if (nome.includes('1l') || nome.includes('1 litro')) vol = '1L'
    else if (nome.includes('600')) vol = '600ml'
    else if (nome.includes('ks') || nome.includes('330')) vol = 'KS 330ml'
    else if (nome.includes('lata') || nome.includes('350')) vol = '350ml'

    return {
      nomeCanonico: `Coca-Cola${zeroStr} ${vol}`,
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

  if (nome.includes('heineken')) {
    return {
      nomeCanonico: 'Heineken 330ml',
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

  if (nome.includes('brahma')) {
    return {
      nomeCanonico: 'Brahma 350ml',
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

  if (nome.includes('skol')) {
    return {
      nomeCanonico: 'Skol 350ml',
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

  if (nome.includes('fanta')) {
    const sabor = nome.includes('uva') ? 'Uva' : 'Laranja'
    let vol = '350ml'
    if (nome.includes('2l') || nome.includes('2 litros')) vol = '2L'
    else if (nome.includes('600')) vol = '600ml'
    return {
      nomeCanonico: `Fanta ${sabor} ${vol}`,
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

  if (nome.includes('sprite')) {
    let vol = '350ml'
    if (nome.includes('600')) vol = '600ml'
    else if (nome.includes('2l')) vol = '2L'
    return {
      nomeCanonico: `Sprite ${vol}`,
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

  if (nome.includes('schweppes') || nome.includes('tonica')) {
    const tipo = nome.includes('schweppes') ? 'Schweppes 350ml' : 'Água Tônica 350ml'
    return {
      nomeCanonico: tipo,
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

  if (nome.includes('agua')) {
    const comGas = nome.includes('com') && (nome.includes('gas'))
    return {
      nomeCanonico: `Água ${comGas ? 'com Gás' : 'sem Gás'} 500ml`,
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

  if (nome.includes('del valle') || nome.includes('valle')) {
    let sabor = 'Uva'
    if (nome.includes('maracuja')) sabor = 'Maracujá'
    else if (nome.includes('manga')) sabor = 'Manga'
    else if (nome.includes('pessego')) sabor = 'Pêssego'

    let vol = '290ml'
    if (nome.includes('450')) vol = '450ml'

    return {
      nomeCanonico: `Del Valle ${sabor} ${vol}`,
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

  if (nome.includes('limoneto') || nome.includes('h2o')) {
    return {
      nomeCanonico: 'Limoneto (H2O) 500ml',
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

  if (nome.includes('poty')) {
    const vol = (nome.includes('2l') || nome.includes('2 litros')) ? '2L' : '600ml'
    return {
      nomeCanonico: `Poty ${vol}`,
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

  if (nome.includes('cotuba')) {
    const vol = (nome.includes('2l') || nome.includes('2 litros')) ? '2L' : '600ml'
    return {
      nomeCanonico: `Cotuba ${vol}`,
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

  if (nome.includes('roller')) {
    const vol = (nome.includes('2l') || nome.includes('2 litros')) ? '2L' : '600ml'
    return {
      nomeCanonico: `Roller ${vol}`,
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

  if (nome.includes('suco')) {
    return {
      nomeCanonico: 'Suco 1L',
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

  // =========================================================================
  // 4. CACHORRO-QUENTE / HOT DOG (PÃO HOT DOG)
  // =========================================================================
  const isHotDog = ['cachorro', 'hot dog', 'hotdog', 'hot-dog', 'dogao', 'dogão'].some(k => nome.includes(k))
  if (isHotDog) {
    let sabor = 'Misto'
    if (nome.includes('carne')) sabor = 'de Carne'
    else if (nome.includes('frango')) sabor = 'de Frango'
    else if (nome.includes('pizza')) sabor = 'de Pizza'
    else if (nome.includes('misto')) sabor = 'Misto'
    else if (nome.includes('especial')) sabor = 'Especial'

    return {
      nomeCanonico: `Cachorro-Quente ${sabor}`,
      categoria: 'hotdog_variados',
      nomeCategoria: 'Cachorro-Quente / Hot Dog',
      isLanche: true,
      qtdLanches: qty,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hotdog',
      qtdPaes: qty
    }
  }

  // =========================================================================
  // 5. LANCHES ARTESANAIS (150g ou 300g) - NO PÃO DE HAMBÚRGUER
  // =========================================================================
  const isArtesanal = nome.includes('artesanal') || nome.includes('150g') || nome.includes('300g') || nome.includes('150 g') || nome.includes('300 g')
  if (isArtesanal) {
    const gramas = nome.includes('300') ? '300g' : '150g'
    let base = 'X-Burguer'

    if (nome.includes('carga pesada')) base = 'X-Carga Pesada'
    else if (nome.includes('salada') && nome.includes('bacon')) base = 'X-Salada Bacon'
    else if (nome.includes('salada') && nome.includes('egg')) base = 'X-Salada Egg'
    else if (nome.includes('egg') && nome.includes('bacon')) base = 'X-Egg Bacon'
    else if (nome.includes('salada')) base = 'X-Salada'
    else if (nome.includes('bacon')) base = 'X-Bacon'
    else if (nome.includes('egg')) base = 'X-Egg'
    else if (nome.includes('tudo')) base = 'X-Tudo'

    return {
      nomeCanonico: `${base} Artesanal ${gramas}`,
      categoria: 'artesanais',
      nomeCategoria: 'Lanches Artesanais',
      isLanche: true,
      qtdLanches: qty,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hamburguer',
      qtdPaes: qty
    }
  }

  // =========================================================================
  // 6. LANCHES ESPECIAIS, BAURU, AMERICANO, MISTO QUENTE
  // =========================================================================
  if (nome.includes('bauru')) {
    const sabor = (nome.includes('file') || nome.includes('filé')) ? ' Filé' : ''
    return {
      nomeCanonico: `Bauru${sabor}`,
      categoria: 'lanches_tradicionais',
      nomeCategoria: 'Lanches Tradicionais',
      isLanche: true,
      qtdLanches: qty,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hamburguer',
      qtdPaes: qty
    }
  }

  if (nome.includes('especial')) {
    let sabor = 'Misto'
    if (nome.includes('carne')) sabor = 'de Carne'
    else if (nome.includes('frango')) sabor = 'de Frango'
    else if (nome.includes('pizza')) sabor = 'de Pizza'
    return {
      nomeCanonico: `Especial ${sabor}`,
      categoria: 'lanches_tradicionais',
      nomeCategoria: 'Lanches Tradicionais',
      isLanche: true,
      qtdLanches: qty,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hamburguer',
      qtdPaes: qty
    }
  }

  if (nome.includes('misto quente')) {
    return {
      nomeCanonico: 'Misto Quente',
      categoria: 'lanches_tradicionais',
      nomeCategoria: 'Lanches Tradicionais',
      isLanche: true,
      qtdLanches: qty,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hamburguer',
      qtdPaes: qty
    }
  }

  if (nome.includes('americano')) {
    return {
      nomeCanonico: 'Americano',
      categoria: 'lanches_tradicionais',
      nomeCategoria: 'Lanches Tradicionais',
      isLanche: true,
      qtdLanches: qty,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hamburguer',
      qtdPaes: qty
    }
  }

  // =========================================================================
  // 7. LANCHES TRADICIONAIS POR TIPO DE CARNE (CARNE, FRANGO/PEITO, LOMBO, CALABRESA, FILÉ)
  // Ordem estrita de sufixos:
  // carga pesada > salada egg bacon > salada bacon > salada egg > egg bacon > salada > bacon > egg > tudo > burguer
  // =========================================================================
  const isLanche = ['x-', 'x -', 'x ', 'burguer', 'burger', 'hamburguer', 'salada', 'bacon', 'tudo', 'egg', 
    'calabresa', 'peito', 'lombo', 'file', 'filé', 'carga pesada'].some(k => nome.includes(k))

  if (isLanche) {
    // Determinar a proteína/base
    let proteina = 'Hambúrguer' // padrão
    if (nome.includes('file') || nome.includes('filé')) proteina = 'Filé'
    else if (nome.includes('lombo')) proteina = 'Lombo'
    else if (nome.includes('peito')) proteina = 'Peito'
    else if (nome.includes('calabresa')) proteina = 'Calabresa'

    // Determinar o complemento (ordem estrita de especificidade decrescente)
    let complemento = ''
    if (nome.includes('carga pesada')) complemento = 'Carga Pesada'
    else if (nome.includes('salada') && nome.includes('egg') && nome.includes('bacon')) complemento = 'Salada Egg Bacon'
    else if (nome.includes('salada') && nome.includes('bacon')) complemento = 'Salada Bacon'
    else if (nome.includes('salada') && nome.includes('egg')) complemento = 'Salada Egg'
    else if (nome.includes('egg') && nome.includes('bacon')) complemento = 'Egg Bacon'
    else if (nome.includes('salada')) complemento = 'Salada'
    else if (nome.includes('bacon')) complemento = 'Bacon'
    else if (nome.includes('egg')) complemento = 'Egg'
    else if (nome.includes('tudo')) complemento = 'Tudo'

    let nomeCanonico = ''
    if (proteina === 'Hambúrguer') {
      nomeCanonico = complemento ? `X-${complemento}` : 'X-Burguer'
    } else {
      // Ex: X-Filé, X-Filé Salada, X-Calabresa Bacon, etc.
      nomeCanonico = complemento ? `X-${proteina} ${complemento}` : `X-${proteina}`
    }

    return {
      nomeCanonico,
      categoria: 'lanches_tradicionais',
      nomeCategoria: 'Lanches Tradicionais',
      isLanche: true,
      qtdLanches: qty,
      isCombo: false,
      qtdCombos: 0,
      isBebida: false,
      qtdBebidas: 0,
      tipoPao: 'hamburguer',
      qtdPaes: qty
    }
  }

  // =========================================================================
  // 8. OUTROS ITENS / BALCÃO (Pipoca Gourmet, Sal Grosso, etc.)
  // =========================================================================
  let nomeCanonico = raw
  if (nome.includes('pipoca')) nomeCanonico = 'Pipoca Gourmet'
  else if (nome.includes('sal grosso')) nomeCanonico = 'Sal Grosso'

  return {
    nomeCanonico,
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
export function calcularRelatorioControle(pedidos = [], periodo = '14horas') {
  const agora = new Date()
  
  // REGRA ESTRITA: Relatório de Controle soma EXCLUSIVAMENTE os pedidos das últimas 14 horas
  const limiteData = new Date(agora.getTime() - 14 * 60 * 60 * 1000)

  // Filtragem dos pedidos válidos do período
  const pedidosFiltrados = pedidos.filter(p => {
    if (!p) return false
    if (p.status === 'canceled' || p.status === 'cancelled') return false
    if (p.payment_method === 'archived') return false
    const d = new Date(p.created_at || Date.now())
    return d >= limiteData
  })

  let totalPaes = 0
  let paesHamburguer = 0
  let paesHotDog = 0

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

      // Pães: apenas Hambúrguer ou Hot Dog
      if (info.tipoPao === 'hamburguer') {
        paesHamburguer += info.qtdPaes
        totalPaes += info.qtdPaes
      } else if (info.tipoPao === 'hotdog') {
        paesHotDog += info.qtdPaes
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

      // Agrupamento de itens detalhados por Nome Canônico Padronizado
      const chave = (info.nomeCanonico || nomeProd).toLowerCase()
      if (!itensAgrupados[chave]) {
        itensAgrupados[chave] = {
          nome: info.nomeCanonico || nomeProd,
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
      paesHamburguer,
      paesHotDog,
      paesTradicionais: paesHamburguer,
      paesArtesanais: 0,
      paesHotdogFrances: paesHotDog
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
