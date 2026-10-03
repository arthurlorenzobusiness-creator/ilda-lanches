/**
 * Mapeamento completo de composição e ingredientes do cardápio Ilda Lanches
 * Suporta Combos, Lanches Tradicionais, Artesanais, Cachorro-Quente, Especiais, Filé, Lombo, Calabresa e Variados.
 */

export const COMPOSICAO_COMBOS = {
  casal: {
    nome: 'Combo Casal',
    itens: [
      { tipo: 'lanche', texto: '2x X-Salada Bacon' },
      { tipo: 'batata', texto: 'Batata Frita' },
      { tipo: 'bebida', texto: '1x Refrigerante 600ml' }
    ],
    temBatata: true,
    descricao: '2x X-Salada Bacon + Batata Frita + 1x Refri 600ml'
  },
  tudo_duplo: {
    nome: 'Combo Tudo Duplo',
    itens: [
      { tipo: 'lanche', texto: '2x X-Tudo' },
      { tipo: 'batata', texto: 'Batata Frita' },
      { tipo: 'bebida', texto: '1x Refrigerante 600ml' }
    ],
    temBatata: true,
    descricao: '2x X-Tudo + Batata Frita + 1x Refri 600ml'
  },
  triplo: {
    nome: 'Combo TRIPLO',
    itens: [
      { tipo: 'lanche', texto: '3x X-Salada Bacon' },
      { tipo: 'batata', texto: 'Batata Frita 300g' },
      { tipo: 'bebida', texto: '1x Coca-Cola 2 Litros' }
    ],
    temBatata: true,
    descricao: '3x X-Salada Bacon + Batata 300g + 1x Coca-Cola 2L'
  },
  delas: {
    nome: 'Combo Delas',
    itens: [
      { tipo: 'lanche', texto: '1x X-Tudo' },
      { tipo: 'batata', texto: 'Batata Frita 100g' },
      { tipo: 'bebida', texto: '1x Refrigerante Lata 350ml' }
    ],
    temBatata: true,
    descricao: '1x X-Tudo + Batata 100g + 1x Refri Lata'
  },
  kids: {
    nome: 'Combo Kids',
    itens: [
      { tipo: 'lanche', texto: '1x X-Burguer' },
      { tipo: 'batata', texto: 'Batata Frita pequena' },
      { tipo: 'bebida', texto: '1x Suco ou Refrigerante Lata' }
    ],
    temBatata: true,
    descricao: '1x X-Burguer + Batata Frita + 1x Bebida'
  },
  amigos: {
    nome: 'Combo Amigos',
    itens: [
      { tipo: 'lanche', texto: '4x X-Salada Bacon' },
      { tipo: 'batata', texto: 'Batata Frita' },
      { tipo: 'bebida', texto: '1x Refrigerante 2 Litros' }
    ],
    temBatata: true,
    descricao: '4x X-Salada Bacon + Batata Frita + 1x Refri 2L'
  },
  familia: {
    nome: 'Combo Família',
    itens: [
      { tipo: 'lanche', texto: '4x X-Tudo' },
      { tipo: 'batata', texto: 'Porção de Batata Grande' },
      { tipo: 'bebida', texto: '1x Refrigerante 2 Litros' }
    ],
    temBatata: true,
    descricao: '4x X-Tudo + Porção de Batata Grande + 1x Refri 2L'
  },
  liberdade: {
    nome: 'Combo Sabor da Liberdade',
    itens: [
      { tipo: 'lanche', texto: '1x X-Tudo' },
      { tipo: 'batata', texto: 'Batata Frita 100g' },
      { tipo: 'bebida', texto: '1x Coca-Cola Lata 350ml' }
    ],
    temBatata: true,
    descricao: '1x X-Tudo + Batata Frita 100g + 1x Coca Lata 350ml'
  }
}

/**
 * Ingredientes básicos por família de lanches
 */
export function obterComposicaoItem(nomeProduto) {
  if (!nomeProduto) return null
  const raw = String(nomeProduto).trim()
  const nomeLower = raw.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // 1. COMBOS
  if (nomeLower.includes('combo') || nomeLower.includes('sabor da liberdade') || nomeLower.includes('delas')) {
    if (nomeLower.includes('casal')) {
      return { tipo: 'combo', ...COMPOSICAO_COMBOS.casal }
    }
    if (nomeLower.includes('tudo duplo')) {
      return { tipo: 'combo', ...COMPOSICAO_COMBOS.tudo_duplo }
    }
    if (nomeLower.includes('triplo') || nomeLower.includes('3 x') || nomeLower.includes('3x')) {
      return { tipo: 'combo', ...COMPOSICAO_COMBOS.triplo }
    }
    if (nomeLower.includes('delas')) {
      return { tipo: 'combo', ...COMPOSICAO_COMBOS.delas }
    }
    if (nomeLower.includes('kids')) {
      return { tipo: 'combo', ...COMPOSICAO_COMBOS.kids }
    }
    if (nomeLower.includes('amigo')) {
      return { tipo: 'combo', ...COMPOSICAO_COMBOS.amigos }
    }
    if (nomeLower.includes('familia')) {
      return { tipo: 'combo', ...COMPOSICAO_COMBOS.familia }
    }
    if (nomeLower.includes('liberdade')) {
      return { tipo: 'combo', ...COMPOSICAO_COMBOS.liberdade }
    }
    // Combo genérico ou com texto embutido
    return {
      tipo: 'combo',
      nome: raw,
      itens: [{ tipo: 'combo', texto: raw }],
      temBatata: nomeLower.includes('batata'),
      descricao: 'Combo especial Ilda Lanches'
    }
  }

  // 2. CACHORRO QUENTE ESPECIAL
  if (nomeLower.includes('especial')) {
    let carne = 'hambúrguer'
    if (nomeLower.includes('carne')) carne = 'hambúrguer e carne moída'
    else if (nomeLower.includes('frango')) carne = 'hambúrguer e frango desfiado'
    else if (nomeLower.includes('pizza')) carne = 'hambúrguer, presunto e tomate'
    else if (nomeLower.includes('misto')) carne = 'hambúrguer, carne moída e frango desfiado'

    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: `Pão de hambúrguer, ${carne}, salsicha, queijo, bacon, presunto, ovo, maionese, batata palha e catupiry.`
    }
  }

  // 3. CACHORRO QUENTE TRADICIONAL
  if (nomeLower.includes('cachorro') || nomeLower.includes('hot dog') || nomeLower.includes('hotdog')) {
    let recheio = 'salsicha'
    if (nomeLower.includes('carne')) recheio = 'carne moída e salsicha'
    else if (nomeLower.includes('frango')) recheio = 'frango desfiado e salsicha'
    else if (nomeLower.includes('pizza')) recheio = 'presunto, salsicha e tomate'
    else if (nomeLower.includes('misto')) recheio = 'carne moída, frango desfiado e salsicha'

    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: `Pão de hot dog, ${recheio}, queijo, bacon, maionese, batata palha e catupiry.`
    }
  }

  // 4. VARIADOS (BAURU, MISTO, AMERICANO)
  if (nomeLower.includes('bauru')) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: 'Pão francês, 250g filé mignon, cebola, tomate, presunto, queijo, maionese, batata palha e catupiry.'
    }
  }
  if (nomeLower.includes('misto quente')) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: 'Pão francês (ou hambúrguer), presunto, queijo, batata palha e catupiry.'
    }
  }
  if (nomeLower.includes('americano')) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: 'Pão francês (ou hambúrguer), presunto, queijo, ovo, batata palha e catupiry.'
    }
  }

  // 5. BATATAS & PORÇÕES
  if (nomeLower.includes('batata')) {
    if (nomeLower.includes('cone') || nomeLower.includes('300')) {
      return {
        tipo: 'porcao',
        nome: raw,
        ingredientes: '300g de batata frita sequinha e crocante no cone.'
      }
    }
    return {
      tipo: 'porcao',
      nome: raw,
      ingredientes: '600g de porção generosa de batata frita crocante.'
    }
  }

  // 6. CARGAS PESADAS
  if (nomeLower.includes('carga pesada')) {
    let proteina = '2 hambúrgueres'
    if (nomeLower.includes('file')) proteina = '500g de filé mignon'
    else if (nomeLower.includes('lombo')) proteina = '500g de lombo'
    else if (nomeLower.includes('calabresa')) proteina = '500g de calabresa'
    else if (nomeLower.includes('peito')) proteina = '500g de peito de frango'
    else if (nomeLower.includes('300g')) proteina = '2 hambúrgueres artesanais (300g)'
    else if (nomeLower.includes('150g')) proteina = '2 hambúrgueres artesanais (150g)'

    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: `Pão, ${proteina}, 2 queijos, 2 presuntos, 2 ovos, 2 bacons, alface, tomate, maionese, batata palha e catupiry.`
    }
  }

  // 7. HAMBÚRGUERES, ARTESANAIS, FILÉ, LOMBO, CALABRESA, PEITO DE FRANGO
  // Identifica a carne principal
  let carne = 'hambúrguer'
  if (nomeLower.includes('artesanal') || nomeLower.includes('150g') || nomeLower.includes('300g')) {
    carne = 'hambúrguer artesanal'
    if (nomeLower.includes('300g')) carne += ' (300g)'
    else if (nomeLower.includes('150g')) carne += ' (150g)'
  } else if (nomeLower.includes('file') || nomeLower.includes('filé')) {
    carne = '250g de filé mignon'
  } else if (nomeLower.includes('lombo')) {
    carne = '250g de lombo'
  } else if (nomeLower.includes('calabresa')) {
    carne = '250g de calabresa'
  } else if (nomeLower.includes('peito') || nomeLower.includes('frango')) {
    carne = '250g de peito de frango'
  }

  // Identifica complementos
  const temOvo = nomeLower.includes('egg') || nomeLower.includes('tudo')
  const temSalada = nomeLower.includes('salada') || nomeLower.includes('tudo')
  const temBacon = nomeLower.includes('bacon') || nomeLower.includes('tudo')

  let partes = ['Pão', carne, 'presunto', 'queijo']
  if (temOvo) partes.push('ovo')
  if (temBacon) partes.push('bacon')
  if (temSalada) partes.push('alface', 'tomate')
  partes.push('maionese', 'batata palha', 'catupiry')

  return {
    tipo: 'lanche',
    nome: raw,
    ingredientes: partes.join(', ') + '.'
  }
}
