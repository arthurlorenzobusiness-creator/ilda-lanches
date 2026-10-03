/**
 * Mapeamento completo e fidedigno de composição e ingredientes do cardápio Ilda Lanches.
 * Alinhado 100% com o cardápio oficial da central.
 */

// Combos oficiais e seus itens inclusos
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
    descricao: '3x X-Salada Bacon + Batata Frita 300g + 1x Coca-Cola 2L'
  },
  delas: {
    nome: 'Combo Delas',
    itens: [
      { tipo: 'lanche', texto: '1x X-Tudo' },
      { tipo: 'batata', texto: 'Batata Frita 100g' },
      { tipo: 'bebida', texto: '1x Refrigerante Lata 350ml' }
    ],
    temBatata: true,
    descricao: '1x X-Tudo + Batata Frita 100g + 1x Refri Lata'
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
    descricao: '1x X-Tudo + Batata Frita 100g + 1x Coca-Cola Lata 350ml'
  }
}

// Lista de palavras que identificam Bebidas para NUNCA exibir a lupa
const TERMOS_BEBIDAS = [
  'coca', 'coca-cola', 'guarana', 'guaraná', 'fanta', 'sprite', 'schweppes',
  'tonica', 'tônica', 'agua', 'água', 'del valle', 'suco', 'limoneto',
  'h2o', 'poty', 'cotuba', 'roller', 'brahma', 'antarctica', 'skol',
  'heineken', 'cerveja', 'chopp', 'refrigerante', 'energetico', 'red bull',
  'monster', 'ice'
]

/**
 * Verifica se um produto é bebida (não deve ter lupa)
 */
export function ehBebida(nome) {
  if (!nome) return false
  const nomeLower = String(nome).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim()

  // Se for combo, não é apenas bebida
  if (nomeLower.includes('combo') || nomeLower.includes('sabor da liberdade') || nomeLower.includes('delas')) {
    return false
  }

  return TERMOS_BEBIDAS.some(termo => {
    const termoNorm = termo.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const regex = new RegExp(`\\b${termoNorm}\\b`, 'i')
    return regex.test(nomeLower)
  })
}

/**
 * Retorna os dados de inspeção (ingredientes ou composição do combo).
 * Se for bebida ou item sem receita definida, retorna null (sem lupa).
 */
export function obterComposicaoItem(nomeProduto) {
  if (!nomeProduto) return null
  const raw = String(nomeProduto).trim()
  const nomeLower = raw.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // 1. BEBIDAS -> NUNCA EXIBE LUPA (Retorna null)
  if (ehBebida(raw)) {
    return null
  }

  // 2. COMBOS
  if (nomeLower.includes('combo') || nomeLower.includes('sabor da liberdade') || (nomeLower.includes('delas') && !nomeLower.includes('x -'))) {
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
    return {
      tipo: 'combo',
      nome: raw,
      itens: [{ tipo: 'lanche', texto: raw }],
      temBatata: nomeLower.includes('batata'),
      descricao: 'Combo Ilda Lanches'
    }
  }

  // 3. CACHORRO QUENTE ESPECIAL
  if (nomeLower.includes('especial')) {
    if (nomeLower.includes('carne')) {
      return {
        tipo: 'lanche',
        nome: raw,
        ingredientes: 'Pão, hambúrguer, carne, salsicha, queijo, bacon, presunto, ovo, maionese, batata palha e catupiry.'
      }
    }
    if (nomeLower.includes('frango')) {
      return {
        tipo: 'lanche',
        nome: raw,
        ingredientes: 'Pão, hambúrguer, frango, salsicha, queijo, bacon, presunto, ovo, maionese, batata palha e catupiry.'
      }
    }
    if (nomeLower.includes('pizza')) {
      return {
        tipo: 'lanche',
        nome: raw,
        ingredientes: 'Pão, hambúrguer, presunto, salsicha, queijo, bacon, ovo, tomate, maionese, batata palha e catupiry.'
      }
    }
    if (nomeLower.includes('misto')) {
      return {
        tipo: 'lanche',
        nome: raw,
        ingredientes: 'Pão, hambúrguer, carne, frango, salsicha, ovo, presunto, queijo, bacon, maionese, batata palha e catupiry.'
      }
    }
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: 'Pão, hambúrguer, carne, salsicha, queijo, bacon, presunto, ovo, maionese, batata palha e catupiry.'
    }
  }

  // 4. CACHORRO QUENTE TRADICIONAL
  if (nomeLower.includes('cachorro') || nomeLower.includes('hot dog') || nomeLower.includes('hotdog')) {
    if (nomeLower.includes('carne')) {
      return {
        tipo: 'lanche',
        nome: raw,
        ingredientes: 'Pão, carne, salsicha, queijo, bacon, maionese, batata palha e catupiry.'
      }
    }
    if (nomeLower.includes('frango')) {
      return {
        tipo: 'lanche',
        nome: raw,
        ingredientes: 'Pão, frango, salsicha, queijo, bacon, maionese, batata palha e catupiry.'
      }
    }
    if (nomeLower.includes('pizza')) {
      return {
        tipo: 'lanche',
        nome: raw,
        ingredientes: 'Pão, presunto, salsicha, queijo, bacon, tomate, maionese, batata palha e catupiry.'
      }
    }
    if (nomeLower.includes('misto')) {
      return {
        tipo: 'lanche',
        nome: raw,
        ingredientes: 'Pão, carne, frango, salsicha, queijo, bacon, maionese, batata palha e catupiry.'
      }
    }
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: 'Pão, carne, salsicha, queijo, bacon, maionese, batata palha e catupiry.'
    }
  }

  // 5. VARIADOS / LANCHES (BAURU, MISTO, AMERICANO)
  if (nomeLower.includes('bauru')) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: 'Pão francês, 250g filé, cebola, tomate, presunto, queijo, maionese, batata palha e catupiry.'
    }
  }
  if (nomeLower.includes('misto quente')) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: 'Pão francês, presunto, queijo, batata palha e catupiry.'
    }
  }
  if (nomeLower.includes('americano')) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: 'Pão francês, presunto, queijo, ovo, batata palha e catupiry.'
    }
  }

  // 6. BATATAS
  if (nomeLower.includes('batata')) {
    if (nomeLower.includes('cone') || nomeLower.includes('300')) {
      return {
        tipo: 'porcao',
        nome: raw,
        ingredientes: '300g de batata no cone sequinha e crocante. (Adicionais disponíveis: cheddar, catupiry, bacon ou mussarela).'
      }
    }
    if (nomeLower.includes('porcao') || nomeLower.includes('porção') || nomeLower.includes('600')) {
      return {
        tipo: 'porcao',
        nome: raw,
        ingredientes: '600g de porção generosa de batata frita. (Adicionais disponíveis: cheddar, catupiry, bacon, mussarela, maionese, katchup, mostarda e 3 em 1).'
      }
    }
    return {
      tipo: 'porcao',
      nome: raw,
      ingredientes: 'Batata frita crocante e sequinha.'
    }
  }

  // 7. CARGA PESADA (HAMBÚRGUER, ARTESANAL, FILÉ, LOMBO, CALABRESA, PEITO)
  if (nomeLower.includes('carga pesada')) {
    let carne = '2 hambúrgueres'
    if (nomeLower.includes('file') || nomeLower.includes('filé')) carne = '500g filé'
    else if (nomeLower.includes('calabresa')) carne = '500g calabresa'
    else if (nomeLower.includes('lombo')) carne = '500g lombo'
    else if (nomeLower.includes('peito')) carne = '500g peito'
    else if (nomeLower.includes('artesanal') || nomeLower.includes('150g') || nomeLower.includes('300g')) {
      carne = nomeLower.includes('300g') ? '2 hambúrgueres artesanais (300g)' : '2 hambúrgueres artesanais (150g)'
    }

    // Se for carne especial (filé, calabresa, lombo, peito), leva maionese
    const comMaionese = nomeLower.includes('file') || nomeLower.includes('filé') ||
                        nomeLower.includes('calabresa') || nomeLower.includes('lombo') ||
                        nomeLower.includes('peito')

    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: comMaionese
        ? `Pão, ${carne}, 2 presunto, 2 queijo, 2 ovo, maionese, alface, tomate, 2 bacon, batata palha e catupiry.`
        : `Pão, ${carne}, 2 queijo, 2 presunto, 2 bacon, alface, tomate, batata palha e catupiry.`
    }
  }

  // 8. IDENTIFICAÇÃO DE LANCHES TRADICIONAIS E ARTESANAIS
  // Proteína base
  let proteina = null
  let ehArtesanal = false

  if (nomeLower.includes('file') || nomeLower.includes('filé')) {
    proteina = '250g filé'
  } else if (nomeLower.includes('calabresa')) {
    proteina = '250g calabresa'
  } else if (nomeLower.includes('lombo')) {
    proteina = '250g lombo'
  } else if (nomeLower.includes('peito')) {
    proteina = '250g peito'
  } else if (nomeLower.includes('artesanal') || nomeLower.includes('150g') || nomeLower.includes('300g')) {
    ehArtesanal = true
    proteina = nomeLower.includes('300g') ? 'hambúrguer artesanal 300g' : 'hambúrguer artesanal 150g'
  } else if (
    nomeLower.startsWith('x -') || nomeLower.startsWith('x-') ||
    nomeLower.includes('burguer') || nomeLower.includes('burger') ||
    nomeLower.includes('tudo') || nomeLower.includes('salada') ||
    nomeLower.includes('bacon') || nomeLower.includes('egg')
  ) {
    proteina = 'hambúrguer'
  }

  // Se não foi identificado como nenhuma proteína nem lanche conhecido, não é lanche -> retorna null (sem lupa)
  if (!proteina) {
    return null
  }

  // COMPOSIÇÕES ESPECÍFICAS CONFORME CARDÁPIO OFICIAL:
  const isEgg = nomeLower.includes('egg')
  const isSalada = nomeLower.includes('salada')
  const isBacon = nomeLower.includes('bacon')
  const isTudo = nomeLower.includes('tudo')

  // A) X - TUDO
  if (isTudo) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: `Pão, ${proteina}, queijo, ovo, bacon, presunto, alface, tomate, batata palha e catupiry.`
    }
  }

  // B) X - SALADA BACON
  if (isSalada && isBacon) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: `Pão, ${proteina}, queijo, presunto, maionese, bacon, alface, tomate, batata palha e catupiry.`
    }
  }

  // C) X - SALADA EGG
  if (isSalada && isEgg) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: `Pão, ${proteina}, presunto, maionese, alface, tomate, queijo, ovo, batata palha e catupiry.`
    }
  }

  // D) X - EGG BACON
  if (isEgg && isBacon) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: `Pão, ${proteina}, presunto, maionese, queijo, ovo, bacon, batata palha e catupiry.`
    }
  }

  // E) X - SALADA
  if (isSalada) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: `Pão, ${proteina}, queijo, presunto, alface, maionese, tomate, batata palha e catupiry.`
    }
  }

  // F) X - BACON
  if (isBacon) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: `Pão, ${proteina}, presunto, queijo, maionese, bacon, batata palha e catupiry.`
    }
  }

  // G) X - EGG
  if (isEgg) {
    return {
      tipo: 'lanche',
      nome: raw,
      ingredientes: `Pão, ${proteina}, presunto, maionese, queijo, ovo, batata palha e catupiry.`
    }
  }

  // H) X - BURGUER / SIMPLES
  return {
    tipo: 'lanche',
    nome: raw,
    ingredientes: `Pão, ${proteina}, queijo, presunto, maionese, batata palha e catupiry.`
  }
}
