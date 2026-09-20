function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import IADashboard from './IADashboard'

const categorias = [
  {
    nome: 'Hambúrgueres',
    produtos: [
      ['X - BURGUER', 27],
      ['X - EGG', 28],
      ['X - SALADA', 28],
      ['X - BACON', 31],
      ['X - SALADA BACON', 32],
      ['X - SALADA EGG', 30],
      ['X - EGG BACON', 34],
      ['X - TUDO', 35],
      ['X - CARGA PESADA', 63],
    ],
  },
  {
    nome: 'Hambúrgueres Artesanais',
    produtos: [
      ['X - BURGUER 150g', 34],
      ['X - BURGUER 300g', 42],
      ['X - EGG 150g', 35],
      ['X - EGG 300g', 43],
      ['X - BACON 150g', 37],
      ['X - BACON 300g', 45],
      ['X - SALADA 150g', 35],
      ['X - SALADA 300g', 43],
      ['X - TUDO 150g', 41],
      ['X - TUDO 300g', 48],
    ],
  },
  {
    nome: 'Peito de Frango',
    produtos: [
      ['X - PEITO', 30],
      ['X - PEITO EGG', 31],
      ['X - PEITO SALADA', 31],
      ['X - PEITO BACON', 33],
      ['X - PEITO SALADA BACON', 36],
      ['X - PEITO SALADA EGG', 35],
      ['X - PEITO EGG BACON', 36],
      ['X - PEITO TUDO', 38],
      ['X - PEITO CARGA PESADA', 67],
    ],
  },
  {
    nome: 'Lombo',
    produtos: [
      ['X - LOMBO', 30],
      ['X - LOMBO EGG', 31],
      ['X - LOMBO SALADA', 31],
      ['X - LOMBO BACON', 33],
      ['X - LOMBO SALADA BACON', 35],
      ['X - LOMBO SALADA EGG', 33],
      ['X - LOMBO EGG BACON', 36],
      ['X - LOMBO TUDO', 38],
      ['X - LOMBO CARGA PESADA', 67],
    ],
  },
  {
    nome: 'Calabresa',
    produtos: [
      ['X - CALABRESA', 28],
      ['X - CALABRESA EGG', 30],
      ['X - CALABRESA SALADA', 30],
      ['X - CALABRESA BACON', 32],
      ['X - CALABRESA SALADA BACON', 34],
      ['X - CALABRESA SALADA EGG', 33],
      ['X - CALABRESA EGG BACON', 35],
      ['X - CALABRESA TUDO', 36],
      ['X - CALABRESA CARGA PESADA', 66],
    ],
  },
  {
    nome: 'Filé',
    produtos: [
      ['X - FILÉ', 45],
      ['X - FILÉ EGG', 46],
      ['X - FILÉ SALADA', 46],
      ['X - FILÉ BACON', 48],
      ['X - FILÉ SALADA BACON', 50],
      ['X - FILÉ SALADA EGG', 48],
      ['X - FILÉ EGG BACON', 52],
      ['X - FILÉ TUDO', 54],
      ['X - FILÉ CARGA PESADA', 91],
    ],
  },
  {
    nome: 'Cachorro-Quente',
    produtos: [
      ['CACHORRO QUENTE DE CARNE', 27],
      ['CACHORRO QUENTE DE FRANGO', 27],
      ['CACHORRO QUENTE DE PIZZA', 27],
      ['CACHORRO QUENTE MISTO', 27],
    ],
  },
  {
    nome: 'Cachorro-Quente Especial',
    produtos: [
      ['ESPECIAL DE CARNE', 42],
      ['ESPECIAL DE FRANGO', 42],
      ['ESPECIAL DE PIZZA', 42],
      ['ESPECIAL MISTO', 42],
    ],
  },
  {
    nome: 'Combos',
    produtos: [
      ['Combo Delas', 44],
      ['Combo Casal', 74.99],
      ['Combo Tudo Duplo', 67],
      ['Combo Amigos', 136],
      ['Combo TRIPLO', 120],
      ['Combo família', 169.99],
      ['Combo Kids', 34],
    ],
  },
  {
    nome: 'Variados',
    produtos: [
      ['BAURU FILÉ', 49],
      ['MISTO QUENTE', 21],
      ['AMERICANO', 22],
    ],
  },
  {
    nome: 'Batatas',
    produtos: [
      ['BATATA NO CONE 300g', 18],
      ['PORÇÃO DE BATATA 600g', 35],
    ],
  },
  {
    nome: 'Bebidas',
    produtos: [
      ['Coca-Cola Original lata 350 ml', 7],
      ['Coca-Cola 600 ml', 9],
      ['Coca-Cola 1L', 12],
      ['Guaraná Antarctica lata 350 ml', 7],
      ['Schweppes lata 350 ml', 7],
      ['Sprite 600 ml', 9],
      ['Coca-Cola Original 2 litros', 16],
      ['Del Valle', 7],
      ['Fanta 600ml', 9],
      ['Água Tônica Lata', 7],
      ['Água com Gás 500ml', 4],
    ],
  },
  {
    nome: 'Cervejas',
    produtos: [
      ['Brahma lata 350 ml', 7],
      ['Antarctica lata 350 ml', 7],
      ['Skol lata 350 ml', 7],
      ['Heineken long neck 330 ml', 9],
    ],
  },
  {
    nome: 'Itens de Balcão',
    produtos: [
      ['Pipoca Gourmet', 10],
      ['Sal Grosso', 20],
    ],
  },
]

// Emails dos entregadores
const EMAILS_ENTREGADORES = ['renan@central.com', 'felipe@central.com']
const EMAILS_DONOS = ['renandono@central.com', 'luan@central.com', 'lucas@central.com']

// Lista de adicionais disponíveis para autocomplete: [nome, valor]
const ADICIONAIS = [
  ['Alface', 1],
  ['Tomate', 1],
  ['Batata palha', 1.5],
  ['Presunto', 2],
  ['Cebola', 2.5],
  ['Salsicha', 2.5],
  ['Ovo', 3],
  ['Bacon', 5],
  ['Catupiry', 5],
  ['Queijo', 5],
  ['Carne moída 100g', 6],
  ['Cheddar', 6],
  ['Frango desfiado 100g', 6],
  ['Hamburguer industrializado', 7],
  ['Calabresa 250g', 10],
  ['Hamburguer artesanal 150g', 10],
  ['Peito frango 250g', 10],
  ['Lombo 250g', 12],
  ['Filé mignon 250g', 20],
]

// Decompõe um order_item separando o valor do lanche base dos adicionais
function decomporItemEAdicionais(item) {
  const notes = (item.notes || '').trim()
  const qty = Number(item.quantity || 1)
  const totalItem = Number(item.total_price || (Number(item.unit_price || 0) * qty) || 0)
  
  let listaAdicionais = []
  let restantes = []
  
  if (item.adicionais && Array.isArray(item.adicionais) && item.adicionais.length > 0) {
    listaAdicionais = item.adicionais.map(ad => ({
      nome: ad.nome,
      quantidade: Number(ad.quantidade || 1),
      valorUnit: Number(ad.valor || 0),
      total: Number(ad.valor || 0) * Number(ad.quantidade || 1)
    }))
    const obsLimpa = notes.replace(/\n?Adicionais:[\s\S]*$/, '').trim()
    if (obsLimpa) restantes.push(obsLimpa)
  } else if (notes.includes('Adicionais:')) {
    const parts = notes.split(/\n?Adicionais:\s*\n?/)
    if (parts[0] && parts[0].trim()) {
      restantes.push(parts[0].trim())
    }
    const adLines = (parts[1] || '').split('\n')
    for (const linha of adLines) {
      const l = linha.trim()
      if (!l) continue
      
      const matchQtd = l.match(/^\+?\s*(\d+)x\s+(.+)$/i)
      let q = 1
      let nomeCompleto = l.replace(/^\+\s*/, '').trim()
      if (matchQtd) {
        q = Number(matchQtd[1])
        nomeCompleto = matchQtd[2].trim()
      }
      
      let valUnit = null
      let nomeLimpo = nomeCompleto
      const matchVal = nomeCompleto.match(/\(\+?R?\$?\s*(\d+(?:[.,]\d+)?)\)/i)
      if (matchVal) {
        valUnit = parseFloat(matchVal[1].replace(',', '.'))
        nomeLimpo = nomeCompleto.replace(matchVal[0], '').trim()
      } else {
        const adInfo = ADICIONAIS.find(a => a[0].toLowerCase() === nomeCompleto.toLowerCase())
        if (adInfo) valUnit = adInfo[1]
      }
      
      const valFinal = valUnit !== null ? valUnit : 0
      listaAdicionais.push({
        nome: nomeLimpo,
        quantidade: q,
        valorUnit: valFinal,
        total: valFinal * q
      })
    }
  } else if (notes) {
    const sections = notes.split(/[|\n]/).map(s => s.trim()).filter(Boolean)
    for (const sec of sections) {
      // Divide por vírgula que não esteja dentro de número decimal (ex: divide "Salsicha (+2.50), Tomate (+1)")
      const chunks = sec.split(/,\s*(?!\d)/).map(c => c.trim()).filter(Boolean)
      for (const chunk of chunks) {
        // Verifica se é observação negativa / de remoção (ex: "sem alface", "não colocar cebola", "tira o tomate")
        const isNegativo = /^(sem|não|nao|tira|tirar|remover|remove|pouco|pouca)\b/i.test(chunk) || /\b(sem|não|nao)\s+/i.test(chunk)
        if (isNegativo) {
          restantes.push(chunk)
          continue
        }

        // Verifica formato com valor explícito: "Salsicha (+2.50)" ou "(+R$ 2,50)"
        const matchVal = chunk.match(/(.+?)\s*\(\+?R?\$?\s*(\d+(?:[.,]\d+)?)\)/i)
        if (matchVal) {
          let nomeAd = matchVal[1].replace(/^\+\s*/, '').trim()
          const valUnit = parseFloat(matchVal[2].replace(',', '.'))
          const matchQtd = nomeAd.match(/^(\d+)x\s+(.+)$/i)
          let q = qty
          if (matchQtd) {
            q = Number(matchQtd[1])
            nomeAd = matchQtd[2].trim()
          }
          listaAdicionais.push({
            nome: nomeAd,
            quantidade: q,
            valorUnit: valUnit,
            total: valUnit * q
          })
        } else {
          // Verifica se bate exatamente com um dos adicionais da lanchonete (sem ser observação de remoção)
          let chunkLimpo = chunk.replace(/^\+\s*/, '').trim()
          const matchQtd = chunkLimpo.match(/^(\d+)x\s+(.+)$/i)
          let q = qty
          if (matchQtd) {
            q = Number(matchQtd[1])
            chunkLimpo = matchQtd[2].trim()
          }
          const adInfo = ADICIONAIS.find(a => 
            a[0].toLowerCase() === chunkLimpo.toLowerCase() ||
            chunkLimpo.toLowerCase() === ('adicional de ' + a[0].toLowerCase())
          )
          if (adInfo) {
            listaAdicionais.push({
              nome: adInfo[0],
              quantidade: q,
              valorUnit: adInfo[1],
              total: adInfo[1] * q
            })
          } else {
            restantes.push(chunk)
          }
        }
      }
    }
  }

  const somaAdicionais = listaAdicionais.reduce((s, a) => s + a.total, 0)
  const totalLanchePuro = Math.max(0, totalItem - somaAdicionais)

  return {
    totalLanchePuro,
    listaAdicionais,
    observacaoLimpa: restantes.join(' | ').trim()
  }
}

// Toca aviso sonoro cristalino de novo pedido estilo campainha (Ding-Dong)
function tocarSomNovoPedido() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    
    // Função para emitir cada tom de sino com decay exponencial suave
    const emitirSino = (freq, inicio, duracao, vol = 0.3) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + inicio)
      
      gain.gain.setValueAtTime(0.001, ctx.currentTime + inicio)
      gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + inicio + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + duracao)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(ctx.currentTime + inicio)
      osc.stop(ctx.currentTime + inicio + duracao)
    }

    // Primeiro tom: E5 (659.25 Hz)
    emitirSino(659.25, 0, 0.5, 0.35)
    // Harmônico suave
    emitirSino(1318.5, 0, 0.4, 0.15)
    
    // Segundo tom: A5 (880 Hz) - clássico Ding-Dong de restaurante
    emitirSino(880, 0.22, 0.8, 0.4)
    // Harmônico suave
    emitirSino(1760, 0.22, 0.6, 0.15)
  } catch (err) {
    console.warn('Erro ao reproduzir som de novo pedido:', err)
  }
}

function App() {
  const [session, setSession] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [somAtivado, setSomAtivado] = useState(() => localStorage.getItem('som_notificacao_ilda') !== 'false')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)
  // Impressão automática apenas em Desktop (Notebook/PC)
  // Detecta se é dispositivo móvel (celular/tablet)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const autoPrint = !isMobile

  const [novoPedido, setNovoPedido] = useState(false)
  const [origem, setOrigem] = useState('mesa')
  const [tipoRecebimentoCriacao, setTipoRecebimentoCriacao] = useState('retirada')
  const [mesa, setMesa] = useState('')
  const [nomeCliente, setNomeCliente] = useState('')
  const [enderecoEntrega, setEnderecoEntrega] = useState('')
  const [numeroEntrega, setNumeroEntrega] = useState('')
  const [taxaEntrega, setTaxaEntrega] = useState('')
  const [observacaoSemMesa, setObservacaoSemMesa] = useState('')
  const [observacaoGeral, setObservacaoGeral] = useState('')
  const [autocompleteItemAberto, setAutocompleteItemAberto] = useState(null)
  const [autocompleteEdicaoAberto, setAutocompleteEdicaoAberto] = useState(null)
  const [foiPago, setFoiPago] = useState(false)
  const [calculandoDistancia, setCalculandoDistancia] = useState(false)
  const [infoDistancia, setInfoDistancia] = useState(null) // { distancia, taxa }

  const [categoriaAtiva, setCategoriaAtiva] = useState('Hambúrgueres')
  const [categoriaEdicao, setCategoriaEdicao] = useState('Hambúrgueres')
  const [buscaProduto, setBuscaProduto] = useState('')
  const [buscaProdutoEdicao, setBuscaProdutoEdicao] = useState('')

  const [enderecoEdicao, setEnderecoEdicao] = useState('')
  const [numeroEdicao, setNumeroEdicao] = useState('')
  const [infoDistanciaEdicao, setInfoDistanciaEdicao] = useState(null)
  const [calculandoDistanciaEdicao, setCalculandoDistanciaEdicao] = useState(false)

  const [tipoRecebimento, setTipoRecebimento] = useState('retirada')
  const [foiPagoEdicao, setFoiPagoEdicao] = useState(false)
  
  // Forma de pagamento e cálculo de troco para dinheiro
  const [formaPagamentoCriacao, setFormaPagamentoCriacao] = useState('pix')
  const [valorPagoDinheiroCriacao, setValorPagoDinheiroCriacao] = useState('')
  const [formaPagamentoEdicao, setFormaPagamentoEdicao] = useState('pix')
  const [valorPagoDinheiroEdicao, setValorPagoDinheiroEdicao] = useState('')

  const [carrinho, setCarrinho] = useState([])

  const [pedidos, setPedidos] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [pedidoParaImprimir, setPedidoParaImprimir] = useState(null)

  const [carregandoPedidos, setCarregandoPedidos] = useState(true)
  const [filtroOrigem, setFiltroOrigem] = useState('todos')

  const [nomeUsuario, setNomeUsuario] = useState('')
  const [emailUsuario, setEmailUsuario] = useState('')
  const [isDriver, setIsDriver] = useState(false)

  function alternarSom() {
    setSomAtivado((anterior) => {
      const novo = !anterior
      localStorage.setItem('som_notificacao_ilda', String(novo))
      if (novo) {
        tocarSomNovoPedido()
      }
      return novo
    })
  }

  // =========================================================
  // HELPERS
  // =========================================================

  // Evitar impressão dupla pelo Realtime
  const [pedidosImpressos] = useState(() => new Set())

  function imprimirCupom(pedido) {
    if (!pedido || !pedido.id) return
    pedidosImpressos.add(pedido.id)
    setPedidoParaImprimir(pedido)
    setTimeout(() => {
      // Usa iframe oculto para imprimir sem diálogo de confirmação
      // Funciona em qualquer dispositivo/browser sem precisar de configuração
      const iframePrint = document.createElement('iframe')
      iframePrint.style.position = 'fixed'
      iframePrint.style.top = '-9999px'
      iframePrint.style.left = '-9999px'
      iframePrint.style.width = '0'
      iframePrint.style.height = '0'
      iframePrint.style.border = 'none'
      document.body.appendChild(iframePrint)

      // Copia todos os estilos da página atual para o iframe
      const estilos = Array.from(document.styleSheets)
        .map(s => {
          try {
            return Array.from(s.cssRules).map(r => r.cssText).join('\n')
          } catch {
            return ''
          }
        })
        .join('\n')

      // Copia o conteúdo que seria impresso (o recibo)
      const conteudoImpressao = document.querySelector('.thermal-receipt')
      if (!conteudoImpressao) {
        // Fallback: usa window.print normal se não achar o elemento
        document.body.removeChild(iframePrint)
        window.print()
        return
      }

      const iframeDoc = iframePrint.contentDocument || iframePrint.contentWindow.document
      iframeDoc.open()
      iframeDoc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        ${estilos}
        @page { size: 80mm auto; margin: 0; }
        body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
        #thermal-receipt-area, .thermal-receipt {
          display: block !important;
          visibility: visible !important;
          margin: 0 !important;
          margin-left: 4mm !important;
          padding: 2mm 3mm 2mm 2mm !important;
          width: 72mm !important;
          box-sizing: border-box !important;
          font-family: 'Courier New', Courier, monospace !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          line-height: 1.35 !important;
          color: #000 !important;
        }
        #thermal-receipt-area * {
          visibility: visible !important;
          font-weight: 700 !important;
        }
      </style></head><body class="printing">${conteudoImpressao.outerHTML}</body></html>`)
      iframeDoc.close()

      iframePrint.contentWindow.focus()
      iframePrint.contentWindow.print()

      // Remove o iframe após a impressão
      setTimeout(() => {
        document.body.removeChild(iframePrint)
      }, 2000)
    }, 150)
  }

  // Busca flexível: ignora traços, espaços, acentos e tolera letras faltando
  function buscaFuzzy(nomeProduto, termoBusca) {
    // Normaliza: minúsculo, sem acento, sem traço/espaço/ponto
    function normalizar(str) {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/[-\s.]/g, '')           // remove traços, espaços, pontos
    }

    const nome = normalizar(nomeProduto)
    const busca = normalizar(termoBusca)

    if (!busca) return true
    if (nome.includes(busca)) return true  // match exato (sem acento/traço)

    // Match de subsequência: cada letra digitada precisa aparecer em ordem
    let pos = 0
    for (let i = 0; i < nome.length && pos < busca.length; i++) {
      if (nome[i] === busca[pos]) pos++
    }
    return pos === busca.length
  }

  function resolverNomeDoEmail(emailStr) {
    const NOMES_CUSTOMIZADOS = {
      'renandono@central.com': 'Renan',
      'renan@central.com': 'Renan',
      'felipe@central.com': 'Felipe',
      'luan@central.com': 'Luan',
      'lucas@central.com': 'Lucas',
      'wesley@central.com': 'Wesley',
      'mari@central.com': 'Mariana',
      'lara@central.com': 'Lara',
    }
    const emailLower = (emailStr || '').toLowerCase()
    if (NOMES_CUSTOMIZADOS[emailLower]) {
      return NOMES_CUSTOMIZADOS[emailLower]
    }
    const parte = emailLower.split('@')[0]
    return parte.charAt(0).toUpperCase() + parte.slice(1)
  }

  function aplicarSessao(sessao) {
    if (sessao) {
      const emailAtual = sessao.user.email || ''
      setEmailUsuario(emailAtual)
      setNomeUsuario(resolverNomeDoEmail(emailAtual))
      const driver = EMAILS_ENTREGADORES.includes(emailAtual.toLowerCase())
      setIsDriver(driver)
      // Entregador começa no filtro de entregas pendentes
      if (driver) setFiltroOrigem('delivery')
      else setFiltroOrigem('todos')
    } else {
      setEmailUsuario('')
      setNomeUsuario('')
      setIsDriver(false)
      setFiltroOrigem('todos')
    }
  }

  // =========================================================
  // CÁLCULO DE DISTÂNCIA E TAXA DE ENTREGA
  // =========================================================

  // Coordenadas fixas da lanchonete (R. Castro Alves, 1667 - Bady Bassitt/SP)
  const LANCHONETE_LAT = -20.9183560
  const LANCHONETE_LON = -49.4458598

  // Fórmula de Haversine — distância em metros entre dois pontos
  function haversineMetros(lat1, lon1, lat2, lon2) {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // Tabela de taxas por distância
  function calcularTaxaPorDistancia(metros) {
    if (metros <= 500) return 5.00
    if (metros <= 600) return 6.00
    if (metros <= 700) return 7.00
    if (metros <= 800) return 8.00
    if (metros <= 900) return 9.00
    if (metros <= 1000) return 10.00
    if (metros <= 1100) return 11.00
    if (metros <= 1200) return 12.00
    if (metros <= 1300) return 13.00
    if (metros <= 5000) return 14.00
    return null // fora da área de entrega
  }

  // Geocodificar endereço e calcular taxa automaticamente
  let _geocodeTimer = null
  function calcularTaxaAutomatica(rua, numero) {
    setInfoDistancia(null)
    if (_geocodeTimer) clearTimeout(_geocodeTimer)

    const ruaTrim = (rua || '').trim()
    const numTrim = (numero || '').trim()

    // Só dispara se tiver pelo menos o nome da rua com 5+ caracteres
    if (ruaTrim.length < 5) return

    // Monta a query: "Rua Flores, 123, Bady Bassitt SP" ou só "Rua Flores, Bady Bassitt SP"
    const enderecoCompleto = numTrim
      ? `${ruaTrim}, ${numTrim}, Bady Bassitt SP`
      : `${ruaTrim}, Bady Bassitt SP`

    _geocodeTimer = setTimeout(async () => {
      setCalculandoDistancia(true)
      try {
        // Photon (komoot.io) — gratuito, sem API key, sem CORS
        // location_bias força prioridade para Bady Bassitt
        const query = encodeURIComponent(enderecoCompleto)
        const url = `https://photon.komoot.io/api/?q=${query}&limit=5&lon=${LANCHONETE_LON}&lat=${LANCHONETE_LAT}&zoom=14`
        const resp = await fetch(url)
        const json = await resp.json()

        if (!json.features || !json.features.length) {
          setInfoDistancia({ erro: 'Endereço não encontrado. Verifique o nome da rua e número.' })
          return
        }

        // Pega o primeiro resultado dentro de Bady Bassitt / SP
        const resultado = json.features.find(f =>
          f.properties.country === 'Brasil' &&
          (f.properties.city === 'Bady Bassitt' || f.properties.state === 'São Paulo')
        ) || json.features[0]

        const [lon, lat] = resultado.geometry.coordinates
        const metros = haversineMetros(LANCHONETE_LAT, LANCHONETE_LON, lat, lon)
        const taxa = calcularTaxaPorDistancia(metros)

        if (taxa === null) {
          setInfoDistancia({ erro: `Endereço muito longe (${(metros / 1000).toFixed(1)} km). Área máxima: 5 km.` })
          return
        }

        setInfoDistancia({ distancia: metros, taxa })
        setTaxaEntrega(String(taxa))
      } catch (e) {
        setInfoDistancia({ erro: 'Não foi possível calcular. Insira a taxa manualmente.' })
      } finally {
        setCalculandoDistancia(false)
      }
    }, 1000) // debounce: espera 1s após parar de digitar
  }

  // Versão para a tela de EDIÇÃO DE PEDIDO
  let _geocodeTimerEdicao = null
  function calcularTaxaAutomaticaEdicao(rua, numero) {
    setInfoDistanciaEdicao(null)
    if (_geocodeTimerEdicao) clearTimeout(_geocodeTimerEdicao)

    const ruaTrim = (rua || '').trim()
    const numTrim = (numero || '').trim()
    if (ruaTrim.length < 5) return

    const enderecoCompleto = numTrim
      ? `${ruaTrim}, ${numTrim}, Bady Bassitt SP`
      : `${ruaTrim}, Bady Bassitt SP`

    _geocodeTimerEdicao = setTimeout(async () => {
      setCalculandoDistanciaEdicao(true)
      try {
        const query = encodeURIComponent(enderecoCompleto)
        const url = `https://photon.komoot.io/api/?q=${query}&limit=5&lon=${LANCHONETE_LON}&lat=${LANCHONETE_LAT}&zoom=14`
        const resp = await fetch(url)
        const json = await resp.json()

        if (!json.features || !json.features.length) {
          setInfoDistanciaEdicao({ erro: 'Endereço não encontrado. Verifique o nome da rua.' })
          return
        }

        const resultado = json.features.find(f =>
          f.properties.country === 'Brasil' &&
          (f.properties.city === 'Bady Bassitt' || f.properties.state === 'São Paulo')
        ) || json.features[0]

        const [lon, lat] = resultado.geometry.coordinates
        const metros = haversineMetros(LANCHONETE_LAT, LANCHONETE_LON, lat, lon)
        const taxa = calcularTaxaPorDistancia(metros)

        if (taxa === null) {
          setInfoDistanciaEdicao({ erro: `Endereço muito longe (${(metros / 1000).toFixed(1)} km). Área máxima: 5 km.` })
          return
        }

        setInfoDistanciaEdicao({ distancia: metros, taxa })
        setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: String(taxa) }))
      } catch (e) {
        setInfoDistanciaEdicao({ erro: 'Não foi possível calcular. Insira a taxa manualmente.' })
      } finally {
        setCalculandoDistanciaEdicao(false)
      }
    }, 1000)
  }

  // =========================================================
  // CARREGAR PEDIDOS
  // =========================================================

  async function carregarPedidos() {
    try {
      setCarregandoPedidos(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items (*), tables_restaurant (number)`)
        .order('created_at', { ascending: false })
        .limit(150)
      if (error) throw error
      setPedidos(data || [])
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setCarregandoPedidos(false)
    }
  }

  // =========================================================
  // TEMPO REAL
  // =========================================================

  useEffect(() => {
    const canal = supabase
      .channel('pedidos-em-tempo-real')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload) => {
        // Toca alerta sonoro de campainha imediatamente ao receber novo pedido
        if (localStorage.getItem('som_notificacao_ilda') !== 'false') {
          tocarSomNovoPedido()
        }
        setTimeout(async () => {
          carregarPedidos()
        if (payload.new && !pedidosImpressos.has(payload.new.id)) {
          // Busca os itens do pedido recém-criado para imprimir o cupom completo
          const { data } = await supabase
            .from('orders')
            .select('*, order_items(*), tables_restaurant(number)')
            .eq('id', payload.new.id)
            .single()
          
          if (data) {
            // Verifica se é mobile dinamicamente
            const m = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            if (!m) {
              imprimirCupom(data)
            }
          }
        }
              }, 1500)
})
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        carregarPedidos()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, () => {
        carregarPedidos()
      })
      .subscribe()
    return () => { supabase.removeChannel(canal) }
  }, [])

  // =========================================================
  // AUTENTICAÇÃO
  // =========================================================

  useEffect(() => {
    async function verificarSessao() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      aplicarSessao(data.session)
      setCarregando(false)
    }

    verificarSessao()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sessionAtual) => {
      setSession(sessionAtual)
      aplicarSessao(sessionAtual)
    })

    return () => { subscription.unsubscribe() }
  }, [])

  // Dispara o carregamento dos pedidos sempre que a sessão for iniciada/restaurada
  useEffect(() => {
    if (session) {
      carregarPedidos()
    } else {
      setPedidos([])
    }
  }, [session])

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setEntrando(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
    } else {
      setSession(data.session)
      aplicarSessao(data.session)
    }
    setEntrando(false)
  }

  async function sair() {
    await supabase.auth.signOut()
    setSession(null)
    aplicarSessao(null)
  }

  // =========================================================
  // NOVO PEDIDO
  // =========================================================

  function adicionarProduto(produto, preco) {
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.nome === produto)
      if (existente) {
        return atual.map((item) =>
          item.nome === produto ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      }
      return [...atual, { nome: produto, preco, quantidade: 1, notes: '', adicionais: [] }]
    })
  }

  function alterarQuantidade(nome, quantidade) {
    if (quantidade <= 0) {
      setCarrinho((atual) => atual.filter((item) => item.nome !== nome))
      return
    }
    setCarrinho((atual) =>
      atual.map((item) => item.nome === nome ? { ...item, quantidade } : item)
    )
  }

  function alterarObservacaoProduto(nome, notes) {
    setCarrinho((atual) =>
      atual.map((item) => item.nome === nome ? { ...item, notes } : item)
    )
  }

  function adicionarAdicionalProduto(nome, nomeAd, valorAd) {
    setCarrinho((atual) =>
      atual.map((item) =>
        item.nome === nome
          ? { ...item, adicionais: [...(item.adicionais || []), { nome: nomeAd, valor: valorAd, quantidade: 1 }] }
          : item
      )
    )
  }

  function alterarQuantidadeAdicionalProduto(nome, idx, delta) {
    setCarrinho((atual) =>
      atual.map((item) => {
        if (item.nome !== nome) return item;
        const novasAds = [...(item.adicionais || [])];
        if (novasAds[idx]) {
          novasAds[idx] = { ...novasAds[idx], quantidade: Math.max(1, (novasAds[idx].quantidade || 1) + delta) };
        }
        return { ...item, adicionais: novasAds };
      })
    )
  }

  function removerAdicionalProduto(nome, idx) {
    setCarrinho((atual) =>
      atual.map((item) =>
        item.nome === nome
          ? { ...item, adicionais: (item.adicionais || []).filter((_, i) => i !== idx) }
          : item
      )
    )
  }

  function abrirNovoPedido() {
    setCarrinho([])
    setOrigem('mesa')
    setTipoRecebimentoCriacao('retirada')
    setMesa('')
    setNomeCliente('')
    setEnderecoEntrega('')
    setNumeroEntrega('')
    setTaxaEntrega('')
    setObservacaoSemMesa('')
    setObservacaoGeral('')
    setFoiPago(false)
    setFormaPagamentoCriacao('pix')
    setValorPagoDinheiroCriacao('')
    setInfoDistancia(null)
    setCalculandoDistancia(false)
    setCategoriaAtiva('Hambúrgueres')
    setBuscaProduto('')
    setNovoPedido(true)
  }

  function voltarPainel() {
    setNovoPedido(false)
  }

  // =========================================================
  // ENVIAR NOVO PEDIDO
  // =========================================================

  async function enviarPedido() {
    if (carrinho.length === 0) {
      alert('Adicione pelo menos um produto ao pedido.')
      return
    }
    if (origem === 'mesa' && tipoRecebimentoCriacao === 'comer_no_local' && !mesa) {
      alert('Selecione uma mesa.')
      return
    }

    try {
      const subtotal = carrinho.reduce((soma, item) => {
        const acrescimos = (item.adicionais || []).reduce((s, ad) => s + (ad.valor * (ad.quantidade || 1)), 0)
        return soma + (item.preco * item.quantidade) + acrescimos
      }, 0)
      const taxaEntregaValor = tipoRecebimentoCriacao === 'entrega' ? Number(taxaEntrega) || 0 : 0
      const totalFinalCalc = subtotal + taxaEntregaValor

      let tableId = null
      if (origem === 'mesa' && tipoRecebimentoCriacao === 'comer_no_local' && mesa !== 'sem_mesa') {
        const { data: mesaData, error: erroMesa } = await supabase
          .from('tables_restaurant')
          .select('id')
          .eq('number', Number(mesa))
          .maybeSingle()
        if (erroMesa) throw erroMesa
        if (!mesaData) throw new Error('Mesa não encontrada no banco de dados.')
        tableId = mesaData.id
      }

      let sourceValor, orderTypeValor, manualDeliveryValor, deliveryAddressValor
      const enderecoCompletoFormatado = [enderecoEntrega.trim(), numeroEntrega.trim()].filter(Boolean).join(', ') || null

      if (tipoRecebimentoCriacao === 'entrega') {
        sourceValor = origem === 'mesa' ? 'table' : origem
        orderTypeValor = 'delivery'
        manualDeliveryValor = true
        deliveryAddressValor = enderecoCompletoFormatado
      } else if (tipoRecebimentoCriacao === 'comer_no_local' || (origem === 'mesa' && tipoRecebimentoCriacao !== 'retirada')) {
        sourceValor = origem === 'mesa' ? 'table' : origem
        orderTypeValor = 'dine_in'
        manualDeliveryValor = false
        deliveryAddressValor = (origem === 'mesa' && mesa === 'sem_mesa') ? (observacaoSemMesa.trim() || null) : null
      } else {
        sourceValor = origem === 'mesa' ? 'table' : origem
        orderTypeValor = 'pickup'
        manualDeliveryValor = false
        deliveryAddressValor = null
      }

      // Prepara observação final incluindo troco em dinheiro se for o caso
      let observacaoGeralFinal = observacaoGeral.trim() || null
      const valorNotaNum = Number(valorPagoDinheiroCriacao.replace(',', '.')) || 0

      if (formaPagamentoCriacao === 'dinheiro') {
        const trocoVal = valorNotaNum > totalFinalCalc ? (valorNotaNum - totalFinalCalc) : 0
        const txtTroco = `💰 DINHEIRO (Paga com R$ ${formatarMoeda(valorNotaNum)} | Levar Troco: R$ ${formatarMoeda(trocoVal)})`
        observacaoGeralFinal = observacaoGeralFinal ? `${observacaoGeralFinal} | ${txtTroco}` : txtTroco
      }

      // Captura snapshots dos estados antes de fechar a tela
      const carrinhoSnapshot = [...carrinho]
      const mesaSnapshot = mesa
      const nomeClienteSnapshot = nomeCliente.trim() || null
      const observacaoGeralSnapshot = observacaoGeralFinal
      const foiPagoSnapshot = foiPago
      const paymentMethodSnapshot = formaPagamentoCriacao

      // FECHA A TELA IMEDIATAMENTE — não espera o banco
      setCarrinho([])
      setBuscaProduto('')
      setNovoPedido(false)

      // Operações de banco rodam em background (não bloqueia a UI)
      ;(async () => {
        try {
          const { data: pedido, error: erroPedido } = await supabase
            .from('orders')
            .insert({
              source: sourceValor,
              order_type: orderTypeValor,
              table_id: tableId,
              customer_name: nomeClienteSnapshot,
              subtotal,
              delivery_fee: taxaEntregaValor,
              discount: 0,
              total: subtotal + taxaEntregaValor,
              payment_method: paymentMethodSnapshot,
              payment_status: foiPagoSnapshot ? 'paid' : 'pending',
              status: 'new',
              manual_delivery: manualDeliveryValor,
              delivery_address: deliveryAddressValor,
              notes: observacaoGeralSnapshot,
            })
            .select()
            .single()

          if (erroPedido) throw erroPedido

          const itens = carrinhoSnapshot.map((item) => {
            const acrescimos = (item.adicionais || []).reduce((s, ad) => s + (ad.valor * (ad.quantidade || 1)), 0)
            let adicionaisLinhas = (item.adicionais || []).map(ad => `+ ${ad.quantidade || 1}x ${ad.nome}`).join('\n')
            if (adicionaisLinhas) adicionaisLinhas = '\nAdicionais:\n' + adicionaisLinhas
            const notesCompleto = (item.notes || '') + adicionaisLinhas
            return {
              order_id: pedido.id,
              product_name: item.nome,
              variant_name: null,
              quantity: item.quantidade,
              unit_price: item.preco,
              total_price: (item.preco * item.quantidade) + acrescimos,
              notes: notesCompleto.trim() || null,
            }
          })

          const { error: erroItens } = await supabase.from('order_items').insert(itens)
          if (erroItens) {
            await supabase.from('orders').delete().eq('id', pedido.id)
            throw erroItens
          }

          const pedidoCompleto = {
            ...pedido,
            order_items: itens,
            tables_restaurant: mesaSnapshot && mesaSnapshot !== 'sem_mesa' ? { number: Number(mesaSnapshot) } : null
          }

          carregarPedidos()

          if (autoPrint) {
            imprimirCupom(pedidoCompleto)
          }
        } catch (error) {
          console.error('Erro ao criar pedido em background:', error)
          alert(`Atenção: houve um erro ao salvar o pedido no banco.\n\n${error.message}`)
        }
      })()

    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      alert(`Não foi possível criar o pedido.\n\n${error.message}`)
    }
  }

  // =========================================================
  // EDIÇÃO DE PEDIDO
  // =========================================================

  function adicionarProdutoEdicao(produto, preco) {
    setPedidoSelecionado((atual) => {
      if (!atual) return atual
      const itemExistente = atual.order_items?.find((item) => item.product_name === produto)
      if (itemExistente) {
        return {
          ...atual,
          order_items: atual.order_items.map((item) => {
            if (item.id === itemExistente.id) {
              const uBase = item.unit_price_base ?? Number(item.unit_price)
              const tAds = (item.adicionais || []).reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
              return { ...item, quantity: item.quantity + 1, total_price: ((item.quantity + 1) * uBase) + tAds }
            }
            return item
          }),
        }
      }
      const novoItem = {
        id: `novo-${Date.now()}-${Math.random()}`,
        product_name: produto,
        variant_name: null,
        quantity: 1,
        unit_price: preco,
        total_price: preco,
        notes: null,
        novo: true,
      }
      return { ...atual, order_items: [...(atual.order_items || []), novoItem] }
    })
  }

  // =========================================================
  // CANCELAR PEDIDO
  // =========================================================

  async function cancelarPedido() {
    if (!pedidoSelecionado) return
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', pedidoSelecionado.id)
      if (error) throw error
      await carregarPedidos()
      setPedidoSelecionado(null)
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
      alert(`Não foi possível cancelar o pedido.\n\n${error.message}`)
    }
  }

  async function cancelarPedidoDireto(pedido) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', pedido.id)

      if (error) throw error

      await carregarPedidos()
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
      alert(`Não foi possível cancelar o pedido.\n\n${error.message}`)
    }
  }

  // =========================================================
  // SALVAR EDIÇÃO DO PEDIDO
  // =========================================================

  async function salvarEdicaoPedido() {
    if (!pedidoSelecionado) return
    try {
      const itens = pedidoSelecionado.order_items || []
      if (itens.length === 0) {
        alert('O pedido precisa ter pelo menos um produto.')
        return
      }

      const tipoAtual = tipoRecebimento
      const subtotal = itens.reduce((soma, item) => soma + Number(item.total_price || (item.unit_price * item.quantity)), 0)
      const delivery_fee = tipoAtual === 'entrega' ? Number(pedidoSelecionado.delivery_fee) || 0 : 0
      const novoTotal = subtotal + delivery_fee
      const manualDelivery = tipoAtual === 'entrega'
      const deliveryAddress = tipoAtual === 'entrega'
        ? (pedidoSelecionado.delivery_address || '').trim() || null
        : null
      const orderType = tipoAtual === 'entrega' ? 'delivery'
        : tipoAtual === 'comer_no_local' ? 'dine_in'
        : tipoAtual === 'retirada' ? 'pickup'
        : pedidoSelecionado.source === 'table' ? 'dine_in'
        : 'pickup'

      let tableId = null
      if (pedidoSelecionado.source === 'table' && pedidoSelecionado.tables_restaurant?.number) {
        const { data: mesaData, error: erroMesa } = await supabase
          .from('tables_restaurant')
          .select('id')
          .eq('number', Number(pedidoSelecionado.tables_restaurant.number))
          .maybeSingle()
        if (erroMesa) throw erroMesa
        if (!mesaData && pedidoSelecionado.tables_restaurant.number !== 'sem_mesa') {
          throw new Error('Mesa não encontrada no banco de dados.')
        }
        if (mesaData) tableId = mesaData.id
      }

      // Snapshot antes de fechar a tela com notes completo montado com todos os adicionais
      const pedidoSnapshot = { ...pedidoSelecionado }
      const itensSnapshot = itens.map((item) => {
        let adicionaisLinhas = (item.adicionais || []).map(ad => `+ ${ad.quantidade || 1}x ${ad.nome}`).join('\n')
        if (adicionaisLinhas) adicionaisLinhas = '\nAdicionais:\n' + adicionaisLinhas
        const obsLimpa = (item.notes || '').replace(/\n?Adicionais:[\s\S]*$/, '').trim()
        const notesCompleto = (obsLimpa + adicionaisLinhas).trim() || null
        return {
          ...item,
          notes: notesCompleto
        }
      })
      const foiPagoSnapshot = foiPagoEdicao

      const pedidoAtualizadoCompleto = {
        ...pedidoSnapshot,
        manual_delivery: manualDelivery,
        delivery_address: deliveryAddress,
        order_type: orderType,
        subtotal,
        delivery_fee,
        total: novoTotal,
        payment_status: foiPagoSnapshot ? 'paid' : 'pending',
        order_items: itensSnapshot,
      }

      // FECHA A TELA IMEDIATAMENTE
      setPedidoSelecionado(null)
      if (autoPrint) {
        imprimirCupom(pedidoAtualizadoCompleto)
      }

      // DB em background
      ;(async () => {
        try {
          const { error: erroPedido } = await supabase
            .from('orders')
            .update({
              source: pedidoSnapshot.source,
              customer_name: pedidoSnapshot.customer_name || null,
              table_id: tableId,
              manual_delivery: manualDelivery,
              delivery_address: deliveryAddress,
              order_type: orderType,
              subtotal,
              delivery_fee,
              total: novoTotal,
              payment_status: foiPagoSnapshot ? 'paid' : 'pending',
            })
            .eq('id', pedidoSnapshot.id)
          if (erroPedido) throw erroPedido

          const idsExistentes = itensSnapshot.filter((item) => !item.novo).map((item) => item.id)
          const { data: itensBanco, error: erroBuscaItens } = await supabase
            .from('order_items').select('id').eq('order_id', pedidoSnapshot.id)
          if (erroBuscaItens) throw erroBuscaItens

          const idsParaExcluir = (itensBanco || []).map((item) => item.id).filter((id) => !idsExistentes.includes(id))

          // Monta todas as operações para rodar em paralelo
          const operacoes = []

          if (idsParaExcluir.length > 0) {
            operacoes.push(supabase.from('order_items').delete().in('id', idsParaExcluir))
          }

          for (const item of itensSnapshot.filter((item) => !item.novo)) {
            let adicionaisLinhas = (item.adicionais || []).map(ad => `+ ${ad.quantidade || 1}x ${ad.nome}`).join('\n')
            if (adicionaisLinhas) adicionaisLinhas = '\nAdicionais:\n' + adicionaisLinhas
            const notesCompleto = ((item.notes || '') + adicionaisLinhas).trim() || null
            operacoes.push(
              supabase.from('order_items').update({
                product_name: item.product_name,
                variant_name: item.variant_name || null,
                quantity: item.quantity,
                unit_price: Number(item.unit_price_base ?? item.unit_price),
                total_price: Number(item.total_price),
                notes: notesCompleto,
              }).eq('id', item.id)
            )
          }

          // Executa delete + updates em paralelo
          const resultados = await Promise.all(operacoes)
          for (const r of resultados) {
            if (r.error) throw r.error
          }

          // Insere itens novos em batch único
          const itensNovos = itensSnapshot.filter((item) => item.novo).map((item) => {
            let adicionaisLinhas = (item.adicionais || []).map(ad => `+ ${ad.quantidade || 1}x ${ad.nome}`).join('\n')
            if (adicionaisLinhas) adicionaisLinhas = '\nAdicionais:\n' + adicionaisLinhas
            const notesCompleto = ((item.notes || '') + adicionaisLinhas).trim() || null
            return {
              order_id: pedidoSnapshot.id,
              product_name: item.product_name,
              variant_name: item.variant_name || null,
              quantity: item.quantity,
              unit_price: Number(item.unit_price_base ?? item.unit_price),
              total_price: Number(item.total_price),
              notes: notesCompleto,
            }
          })

          if (itensNovos.length > 0) {
            const { error: erroInsert } = await supabase.from('order_items').insert(itensNovos)
            if (erroInsert) throw erroInsert
          }

          carregarPedidos()
        } catch (error) {
          console.error('Erro ao salvar pedido em background:', error)
          alert(`Atenção: houve um erro ao salvar as alterações no banco.\n\n${error.message}`)
        }
      })()

    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      alert(`Não foi possível salvar o pedido.\n\n${error.message}`)
    }
  }

  // =========================================================
  // REALIZAR ENTREGA
  // =========================================================

  async function realizarEntrega(pedido) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: session.user.id,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', pedido.id)

      if (error) throw error

      await carregarPedidos()
    } catch (error) {
      console.error('Erro ao registrar entrega:', error)
      alert(`Não foi possível registrar a entrega.\n\n${error.message}`)
    }
  }

  async function realizarEntregaDono(pedido, driverId, driverName) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: driverId,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', pedido.id)

      if (error) throw error

      await carregarPedidos()
    } catch (error) {
      console.error('Erro ao registrar entrega pelo dono:', error)
      alert(`Não foi possível registrar a entrega.\n\n${error.message}`)
    }
  }

  // =========================================================
  // RESETAR TELA
  // =========================================================

  async function resetarPedidosTela() {
    try {
      const idsParaArquivar = pedidos
        .filter(p => p.payment_method !== 'archived')
        .map(p => p.id)

      if (idsParaArquivar.length === 0) {
        return
      }

      const { error } = await supabase
        .from('orders')
        .update({ payment_method: 'archived' })
        .in('id', idsParaArquivar)
        
      if (error) throw error

      await carregarPedidos()
    } catch (error) {
      console.error("Erro ao resetar tela:", error)
      alert(`Não foi possível limpar a tela.\n\n${error.message}`)
    }
  }

  // =========================================================
  // PEDIDOS FILTRADOS
  // =========================================================

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (pedido.payment_method === 'archived') return false
    if (pedido.status === 'cancelled') return false

    // Para entregadores: filtro especial
    if (isDriver) {
      if (filtroOrigem === 'entregues') {
        return pedido.status === 'completed' && pedido.driver_id === session?.user?.id
      }
      // filtro padrão do entregador: só pedidos de entrega pendentes
      return pedido.manual_delivery === true && pedido.status !== 'completed'
    }

    // Para donos e funcionários: se clicar na aba 'Entregues', mostra os pedidos entregues
    if (filtroOrigem === 'entregues') {
      return pedido.status === 'completed'
    }

    // Para outros filtros: comportamento normal (não mostra pedidos já finalizados)
    if (pedido.status === 'completed') return false
    if (filtroOrigem === 'todos') return true
    if (filtroOrigem === 'delivery') return pedido.manual_delivery === true
    return pedido.source === filtroOrigem
  })

  // =========================================================
  // TEMPORALIDADE PARA ESTATÍSTICAS
  // =========================================================

  const agoraParaStats = new Date()

  function isHoje(dateString) {
    if (!dateString) return false
    const diffHoras = (agoraParaStats - new Date(dateString)) / (1000 * 60 * 60)
    return diffHoras >= 0 && diffHoras <= 12
  }

  function isSemana(dateString) {
    if (!dateString) return false
    const diffDias = (agoraParaStats - new Date(dateString)) / (1000 * 60 * 60 * 24)
    return diffDias >= 0 && diffDias <= 7
  }

  function isMes(dateString) {
    if (!dateString) return false
    const diffDias = (agoraParaStats - new Date(dateString)) / (1000 * 60 * 60 * 24)
    return diffDias >= 0 && diffDias <= 30
  }

  // =========================================================
  // ESTATÍSTICAS DO ENTREGADOR E FATURAMENTO
  // =========================================================

  const entregasHoje = pedidos.filter((p) => p.driver_id === session?.user?.id && p.status === 'completed' && isHoje(p.completed_at))
  const entregasSemana = pedidos.filter((p) => p.driver_id === session?.user?.id && p.status === 'completed' && isSemana(p.completed_at))
  const entregasMes = pedidos.filter((p) => p.driver_id === session?.user?.id && p.status === 'completed' && isMes(p.completed_at))

  const totalTaxasHoje = entregasHoje.reduce((soma, p) => soma + Number(p.delivery_fee || 0), 0)
  const totalTaxasSemana = entregasSemana.reduce((soma, p) => soma + Number(p.delivery_fee || 0), 0)
  const totalTaxasMes = entregasMes.reduce((soma, p) => soma + Number(p.delivery_fee || 0), 0)

  const isOwner = EMAILS_DONOS.includes((emailUsuario || '').toLowerCase())

  const faturamentoHoje = pedidos.filter(p => p.status !== 'cancelled' && isHoje(p.created_at))
    .reduce((soma, p) => soma + Number(p.total || 0), 0)

  const faturamentoSemana = pedidos.filter(p => p.status !== 'cancelled' && isSemana(p.created_at))
    .reduce((soma, p) => soma + Number(p.total || 0), 0)

  const faturamentoMes = pedidos.filter(p => p.status !== 'cancelled' && isMes(p.created_at))
    .reduce((soma, p) => soma + Number(p.total || 0), 0)

  const pedidosHoje = pedidos.filter(p => p.status !== 'cancelled' && isHoje(p.created_at)).length
  const pedidosSemana = pedidos.filter(p => p.status !== 'cancelled' && isSemana(p.created_at)).length
  const pedidosMes = pedidos.filter(p => p.status !== 'cancelled' && isMes(p.created_at)).length

  const canceladosHoje = pedidos.filter(p => p.status === 'cancelled' && isHoje(p.created_at)).length
  const canceladosSemana = pedidos.filter(p => p.status === 'cancelled' && isSemana(p.created_at)).length
  const canceladosMes = pedidos.filter(p => p.status === 'cancelled' && isMes(p.created_at)).length

  // =========================================================
  // TOTAL DO CARRINHO
  // =========================================================

  const total = carrinho.reduce((soma, item) => {
    const acrescimos = (item.adicionais || []).reduce((s, ad) => s + (ad.valor * (ad.quantidade || 1)), 0)
    return soma + (item.preco * item.quantidade) + acrescimos
  }, 0)
  const taxaEntregaNum = tipoRecebimentoCriacao === 'entrega' ? Number(taxaEntrega) || 0 : 0
  const totalComEntrega = total + taxaEntregaNum

  // =========================================================
  // CARREGANDO
  // =========================================================

  if (carregando) {
    return (
      <div className="login-loading">
        <img src="https://i.postimg.cc/LXwNTH7z/images.png" alt="Ilda Lanches" style={{ width: '80px', borderRadius: '12px', marginBottom: '16px' }} />
        <strong>Ilda Lanches</strong>
        <span>Carregando...</span>
      </div>
    )
  }

  // =========================================================
  // LOGIN
  // =========================================================

  if (!session) {
    return (
      <div className="login-page">
        <div className="login-card">
          <img src="https://i.postimg.cc/LXwNTH7z/images.png" alt="Ilda Lanches" style={{ width: '80px', borderRadius: '12px', marginBottom: '16px', display: 'block' }} />
          <h1>Ilda Lanches</h1>
          <p>Entre para acessar o sistema</p>
          <form onSubmit={entrar}>
            <div className="login-field">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="login-field">
              <label>Senha</label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            {erro && <div className="login-error">{erro}</div>}
            <button className="login-button" type="submit" disabled={entrando}>
              {entrando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // =========================================================
  // EDITAR PEDIDO
  // =========================================================

  if (pedidoSelecionado) {
    return (
      <div className="app">
        <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="https://i.postimg.cc/LXwNTH7z/images.png" alt="Ilda Lanches" style={{ height: '48px', width: '48px', borderRadius: '8px', objectFit: 'cover' }} />
          <div>
            <h1>Ilda Lanches</h1>
            <span>Editar pedido</span>
          </div>
        </div>
          <button className="back-button" onClick={() => setPedidoSelecionado(null)}>
            ← Voltar
          </button>
        </header>

        <main className="content">
          <div className="page-header">
            <div>
              <h2>Pedido #{pedidoSelecionado.order_number}</h2>
              <p>Confira e edite as informações do pedido.</p>
            </div>
          </div>

          <div className="edit-order-card">
            <div className="edit-order-info" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <div className="field" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'block', fontWeight: 700 }}>
                  Origem do Pedido
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    value={pedidoSelecionado.source}
                    onChange={(e) => setPedidoSelecionado((atual) => ({
                      ...atual, 
                      source: e.target.value,
                      tables_restaurant: e.target.value === 'table' ? atual.tables_restaurant || { number: 'sem_mesa' } : null
                    }))}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
                  >
                    <option value="table">Mesa</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="anota_ai">Anota Aí</option>
                    <option value="ifood">iFood</option>
                    <option value="retirada">Balcão / Retirada</option>
                    <option value="delivery">Entrega</option>
                  </select>

                  {pedidoSelecionado.source === 'table' && (
                    <select
                      value={pedidoSelecionado.tables_restaurant?.number || 'sem_mesa'}
                      onChange={(e) => setPedidoSelecionado((atual) => ({
                        ...atual,
                        tables_restaurant: { number: e.target.value }
                      }))}
                      style={{ width: '120px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
                    >
                      <option value="sem_mesa">S/ Mesa</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>Mesa {n}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'block', fontWeight: 700 }}>
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  placeholder="Nome do cliente (opcional)"
                  value={pedidoSelecionado.customer_name || ''}
                  onChange={(e) => setPedidoSelecionado((atual) => ({ ...atual, customer_name: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
                />
              </div>
            </div>

            {/* ITENS DO PEDIDO */}
            <div className="edit-order-section">
              <h3>Itens do pedido</h3>
              {pedidoSelecionado.order_items?.map((item) => (
                <div key={item.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div className="edit-order-item" style={{ marginBottom: '6px' }}>
                    <div>
                      <strong>{item.quantity}x {item.product_name}</strong>
                      <span>R$ {((Number(item.unit_price_base ?? item.unit_price)) * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="quantity">
                      <button onClick={() => {
                        const novaQuantidade = item.quantity - 1
                        setPedidoSelecionado((atual) => ({
                          ...atual,
                          order_items: novaQuantidade <= 0
                            ? atual.order_items.filter((p) => p.id !== item.id)
                            : atual.order_items.map((p) => {
                                if (p.id === item.id) {
                                  const uBase = p.unit_price_base ?? Number(p.unit_price)
                                  const tAds = (p.adicionais || []).reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                                  return { ...p, quantity: novaQuantidade, total_price: (novaQuantidade * uBase) + tAds }
                                }
                                return p
                              }),
                        }))
                      }}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => {
                        const novaQuantidade = item.quantity + 1
                        setPedidoSelecionado((atual) => ({
                          ...atual,
                          order_items: atual.order_items.map((p) => {
                            if (p.id === item.id) {
                              const uBase = p.unit_price_base ?? Number(p.unit_price)
                              const tAds = (p.adicionais || []).reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                              return { ...p, quantity: novaQuantidade, total_price: (novaQuantidade * uBase) + tAds }
                            }
                            return p
                          }),
                        }))
                      }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Observação (ex: sem cebola)"
                      value={item.notes || ''}
                      onChange={(e) => {
                        const v = e.target.value
                        setPedidoSelecionado((atual) => ({
                          ...atual,
                          order_items: atual.order_items.map((p) => p.id === item.id ? { ...p, notes: v } : p)
                        }))
                      }}
                      style={{ flex: 1, minWidth: '140px', fontSize: '13px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <div style={{ position: 'relative', width: '130px' }}>
                      <input
                        type="text"
                        placeholder="+ Adicional"
                        value={autocompleteEdicaoAberto === item.id ? (item._buscaAdicional || '') : ''}
                        onChange={(e) => {
                          const v = e.target.value
                          setPedidoSelecionado((atual) => ({
                            ...atual,
                            order_items: atual.order_items.map((p) => p.id === item.id ? { ...p, _buscaAdicional: v } : p)
                          }))
                          setAutocompleteEdicaoAberto(item.id)
                        }}
                        onFocus={() => setAutocompleteEdicaoAberto(item.id)}
                        onBlur={() => setTimeout(() => {
                          setAutocompleteEdicaoAberto(null)
                          setPedidoSelecionado((atual) => ({
                            ...atual,
                            order_items: atual.order_items.map((p) => p.id === item.id ? { ...p, _buscaAdicional: '' } : p)
                          }))
                        }, 150)}
                        style={{ width: '100%', fontSize: '13px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #10b981', boxSizing: 'border-box' }}
                      />
                      {autocompleteEdicaoAberto === item.id && (() => {
                        const digitado = (item._buscaAdicional || '').toLowerCase()
                        const sugestoes = ADICIONAIS.filter(([nome]) => nome.toLowerCase().includes(digitado))
                        if (sugestoes.length === 0) return null
                        return (
                          <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
                            background: 'white', border: '1px solid #ddd', borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '180px', overflowY: 'auto'
                          }}>
                            {sugestoes.map(([nomeAd, valorAd]) => (
                              <div
                                key={nomeAd}
                                onMouseDown={() => {
                                  setPedidoSelecionado((atual) => {
                                    return {
                                      ...atual,
                                      order_items: atual.order_items.map((p) => {
                                        if (p.id !== item.id) return p
                                        
                                        const novaLista = [...(p.adicionais || []), { nome: nomeAd, valor: valorAd, quantidade: 1 }]
                                        const precoBase = p.unit_price_base ?? Number(p.unit_price)
                                        const totalAdicionais = novaLista.reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                                        
                                        return {
                                          ...p,
                                          adicionais: novaLista,
                                          unit_price_base: precoBase,
                                          unit_price: precoBase,
                                          total_price: (precoBase * p.quantity) + totalAdicionais,
                                          _buscaAdicional: ''
                                        }
                                      })
                                    }
                                  })
                                  setAutocompleteEdicaoAberto(null)
                                }}
                                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f0f0f0' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                              >
                                {nomeAd} <span style={{ color: '#6b7280', fontSize: '12px' }}>+R${valorAd},00</span>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  {/* Tags dos adicionais já adicionados */}
                  {(item.adicionais || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {(item.adicionais || []).map((ad, idx) => (
                        <span key={idx} style={{
                          background: '#dcfce7', color: '#166534', fontSize: '12px',
                          padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <button type="button" onClick={() => {
                            setPedidoSelecionado(atual => ({
                              ...atual,
                              order_items: atual.order_items.map(p => {
                                if (p.id !== item.id) return p
                                const novasAds = [...(p.adicionais || [])]
                                novasAds[idx] = { ...novasAds[idx], quantidade: Math.max(1, (novasAds[idx].quantidade || 1) - 1) }
                                const totalAdicionais = novasAds.reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                                const pBase = p.unit_price_base ?? Number(p.unit_price)
                                return {
                                  ...p, adicionais: novasAds, unit_price_base: pBase, unit_price: pBase, total_price: (pBase * p.quantity) + totalAdicionais
                                }
                              })
                            }))
                          }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', padding: '0 2px', fontWeight: 'bold' }}>−</button>
                          {ad.quantidade || 1}x {ad.nome} +R${ad.valor}
                          <button type="button" onClick={() => {
                            setPedidoSelecionado(atual => ({
                              ...atual,
                              order_items: atual.order_items.map(p => {
                                if (p.id !== item.id) return p
                                const novasAds = [...(p.adicionais || [])]
                                novasAds[idx] = { ...novasAds[idx], quantidade: (novasAds[idx].quantidade || 1) + 1 }
                                const totalAdicionais = novasAds.reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                                const pBase = p.unit_price_base ?? Number(p.unit_price)
                                return {
                                  ...p, adicionais: novasAds, unit_price_base: pBase, unit_price: pBase, total_price: (pBase * p.quantity) + totalAdicionais
                                }
                              })
                            }))
                          }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', padding: '0 2px', fontWeight: 'bold' }}>+</button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setPedidoSelecionado((atual) => {
                                return {
                                  ...atual,
                                  order_items: atual.order_items.map((p) => {
                                    if (p.id !== item.id) return p
                                    
                                    const novaLista = (p.adicionais || []).filter((_, i) => i !== idx)
                                    const precoBase = p.unit_price_base ?? Number(p.unit_price)
                                    const totalAdicionais = novaLista.reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                                    
                                    return {
                                      ...p,
                                      adicionais: novaLista,
                                      unit_price_base: precoBase,
                                      unit_price: precoBase,
                                      total_price: (precoBase * p.quantity) + totalAdicionais
                                    }
                                  })
                                }
                              })
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 'bold', padding: 0, fontSize: '14px', lineHeight: 1 }}
                          >×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ADICIONAR PRODUTOS */}
            <div className="edit-order-section edit-menu-section">
              <h3>Adicionar produtos</h3>

              <div className="field" style={{ marginBottom: '15px' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '11px', left: '12px', fontSize: '15px' }}>🔍</span>
                  <input 
                    type="text" 
                    placeholder="Pesquisar produto (lanche, bebida, combo...)" 
                    value={buscaProdutoEdicao}
                    onChange={(e) => setBuscaProdutoEdicao(e.target.value)}
                    style={{ paddingLeft: '34px' }}
                  />
                </div>
              </div>

              {!buscaProdutoEdicao && (
                <div className="category-list">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria.nome}
                      className={categoriaEdicao === categoria.nome ? 'category active' : 'category'}
                      onClick={() => setCategoriaEdicao(categoria.nome)}
                    >
                      {categoria.nome}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="product-grid">
                {(() => {
                  if (buscaProdutoEdicao) {
                    const searchLower = buscaProdutoEdicao.toLowerCase()
                    const allProducts = categorias.flatMap(c => c.produtos)
                    const filtered = allProducts.filter(([nome]) => buscaFuzzy(nome, searchLower))
                    
                    if (filtered.length === 0) {
                      return <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280', padding: '20px' }}>Nenhum produto encontrado.</p>
                    }

                    return filtered.map(([produto, preco]) => (
                      <button className="product-card" key={produto} onClick={() => adicionarProdutoEdicao(produto, preco)}>
                        <strong>{produto}</strong>
                        <span>R$ {preco.toFixed(2).replace('.', ',')}</span>
                      </button>
                    ))
                  } else {
                    return categorias.find((c) => c.nome === categoriaEdicao)?.produtos.map(([produto, preco]) => (
                      <button className="product-card" key={produto} onClick={() => adicionarProdutoEdicao(produto, preco)}>
                        <strong>{produto}</strong>
                        <span>R$ {preco.toFixed(2).replace('.', ',')}</span>
                      </button>
                    ))
                  }
                })()}
              </div>
            </div>

            {/* TIPO DE RECEBIMENTO */}
            <div className="edit-order-section">
              <h3>Tipo de recebimento</h3>
              <div className="source-buttons">
                <button
                  type="button"
                  className={tipoRecebimento === 'comer_no_local' ? 'source active' : 'source'}
                  onClick={() => {
                    setTipoRecebimento('comer_no_local')
                    setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: 0, delivery_address: null, order_type: 'dine_in' }))
                    setInfoDistanciaEdicao(null)
                    setEnderecoEdicao('')
                    setNumeroEdicao('')
                  }}
                >
                  Comer no local
                </button>
                <button
                  type="button"
                  className={tipoRecebimento === 'retirada' ? 'source active' : 'source'}
                  onClick={() => {
                    setTipoRecebimento('retirada')
                    setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: 0, delivery_address: null, order_type: 'pickup' }))
                    setInfoDistanciaEdicao(null)
                    setEnderecoEdicao('')
                    setNumeroEdicao('')
                  }}
                >
                  Retirada
                </button>
                <button
                  type="button"
                  className={tipoRecebimento === 'entrega' ? 'source active' : 'source'}
                  onClick={() => {
                    setTipoRecebimento('entrega')
                    setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: 0, delivery_address: null, order_type: 'delivery' }))
                  }}
                >
                  Entrega
                </button>
              </div>

              {tipoRecebimento === 'entrega' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '16px' }}>
                    <div className="field" style={{ margin: 0 }}>
                      <label>Rua / Logradouro / Bairro</label>
                      <input
                        type="text"
                        placeholder="Ex: Rua Castro Alves"
                        value={enderecoEdicao}
                        onChange={(e) => {
                          setEnderecoEdicao(e.target.value)
                          setPedidoSelecionado((atual) => ({ ...atual, delivery_address: e.target.value + (numeroEdicao ? ', ' + numeroEdicao : '') }))
                          calcularTaxaAutomaticaEdicao(e.target.value, numeroEdicao)
                        }}
                      />
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                      <label>Número</label>
                      <input
                        type="text"
                        placeholder="Ex: 123"
                        value={numeroEdicao}
                        onChange={(e) => {
                          setNumeroEdicao(e.target.value)
                          setPedidoSelecionado((atual) => ({ ...atual, delivery_address: enderecoEdicao + (e.target.value ? ', ' + e.target.value : '') }))
                          calcularTaxaAutomaticaEdicao(enderecoEdicao, e.target.value)
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '4px', marginBottom: '8px' }}>
                    {calculandoDistanciaEdicao && (
                      <small style={{ color: '#6b7280', display: 'block' }}>📍 Calculando distância...</small>
                    )}
                    {infoDistanciaEdicao && !calculandoDistanciaEdicao && !infoDistanciaEdicao.erro && (
                      <small style={{ color: '#16a34a', display: 'block', fontWeight: 600 }}>
                        ✓ {infoDistanciaEdicao.distancia < 1000
                          ? `${Math.round(infoDistanciaEdicao.distancia)} m`
                          : `${(infoDistanciaEdicao.distancia / 1000).toFixed(1)} km`} — Taxa: R$ {infoDistanciaEdicao.taxa.toFixed(2).replace('.', ',')}
                      </small>
                    )}
                    {infoDistanciaEdicao && !calculandoDistanciaEdicao && infoDistanciaEdicao.erro && (
                      <small style={{ color: '#ef4444', display: 'block' }}>⚠️ {infoDistanciaEdicao.erro}</small>
                    )}
                  </div>

                  <div className="field" style={{ marginTop: '0' }}>
                    <label>
                      Taxa de entrega
                      {infoDistanciaEdicao && !infoDistanciaEdicao.erro && (
                        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '6px', fontWeight: 400 }}>(calculada automaticamente)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={pedidoSelecionado.delivery_fee || ''}
                      onChange={(e) => setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>

            {/* FOI PAGO? */}
            <div className="edit-order-section">
              <h3>Foi pago?</h3>
              <div className="source-buttons">
                <button type="button" className={!foiPagoEdicao ? 'source active' : 'source'} onClick={() => setFoiPagoEdicao(false)}>Não</button>
                <button type="button" className={foiPagoEdicao ? 'source active' : 'source'} onClick={() => setFoiPagoEdicao(true)}>Sim</button>
              </div>
            </div>

            {/* TOTAL + SALVAR */}
            <div className="edit-order-footer">
              <div>
                <span>Total do pedido</span>
                <strong>
                  R$ {Number(
                    (pedidoSelecionado.order_items || []).reduce(
                      (soma, item) => soma + Number(item.total_price || (item.unit_price * item.quantity)), 0
                    ) + Number(pedidoSelecionado.delivery_fee || 0)
                  ).toFixed(2).replace('.', ',')}
                </strong>
              </div>
              <div className="edit-order-footer-buttons">
                <button className="cancel-order-button" onClick={cancelarPedido}>Cancelar pedido</button>
                <button className="save-order-button" onClick={salvarEdicaoPedido}>Salvar pedido</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // =========================================================
  // NOVO PEDIDO
  // =========================================================

  if (novoPedido) {
    const categoria = categorias.find((item) => item.nome === categoriaAtiva)

    return (
      <div className="app">
        <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="https://i.postimg.cc/LXwNTH7z/images.png" alt="Ilda Lanches" style={{ height: '48px', width: '48px', borderRadius: '8px', objectFit: 'cover' }} />
          <div>
            <h1>Ilda Lanches</h1>
            <span>Novo pedido</span>
          </div>
        </div>
          <button className="back-button" onClick={voltarPainel}>← Voltar</button>
        </header>

        <main className="order-page">
          <div className="order-header">
            <div>
              <h2>Novo pedido</h2>
              <p>Monte o pedido e envie para a cozinha.</p>
            </div>
          </div>

          <div className="order-layout">
            <section className="products-area">
              <div className="order-settings" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '20px' }}>
                <div className="order-settings-grid">
                  <div className="field">
                    <label>Nome do cliente</label>
                    <input
                      type="text"
                      placeholder="Digite o nome (opcional)"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Observação geral do pedido</label>
                    <input
                      type="text"
                      placeholder="Ex: Ponto de referência, observações gerais"
                      value={observacaoGeral}
                      onChange={(e) => setObservacaoGeral(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Foi pago?</label>
                    <div className="source-buttons">
                      <button type="button" className={!foiPago ? 'source active' : 'source'} onClick={() => setFoiPago(false)}>Não</button>
                      <button type="button" className={foiPago ? 'source active' : 'source'} onClick={() => setFoiPago(true)}>Sim</button>
                    </div>
                  </div>

                  <div className="field">
                    <label>Origem do pedido</label>
                    <div className="source-buttons origem-grid">
                      {['mesa', 'whatsapp', 'anota_ai', 'ifood'].map((item) => (
                        <button
                          type="button"
                          key={item}
                          className={origem === item ? 'source active' : 'source'}
                          onClick={() => {
                            setOrigem(item)
                            setMesa('')
                            setEnderecoEntrega('')
                            setTaxaEntrega('')
                            setObservacaoSemMesa('')
                            setTipoRecebimentoCriacao(item === 'mesa' ? 'comer_no_local' : 'retirada')
                            setInfoDistancia(null)
                          }}
                        >
                          {item === 'mesa' && 'Mesa'}
                          {item === 'whatsapp' && 'WhatsApp'}
                          {item === 'ifood' && 'iFood'}
                          {item === 'anota_ai' && 'Anota Aí'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Tipo de recebimento</label>
                    <div className="source-buttons">
                      <button
                        type="button"
                        className={tipoRecebimentoCriacao === 'comer_no_local' ? 'source active' : 'source'}
                        onClick={() => {
                          setTipoRecebimentoCriacao('comer_no_local')
                          setEnderecoEntrega('')
                          setTaxaEntrega('')
                          setInfoDistancia(null)
                        }}
                      >
                        {origem === 'mesa' ? 'Comer no local' : 'Comer aqui'}
                      </button>
                      <button
                        type="button"
                        className={tipoRecebimentoCriacao === 'retirada' ? 'source active' : 'source'}
                        onClick={() => {
                          setTipoRecebimentoCriacao('retirada')
                          setEnderecoEntrega('')
                          setTaxaEntrega('')
                          setInfoDistancia(null)
                          if (origem === 'mesa') setMesa('')
                        }}
                      >
                        {origem === 'mesa' ? 'Levar' : 'Retirada'}
                      </button>
                      <button
                        type="button"
                        className={tipoRecebimentoCriacao === 'entrega' ? 'source active' : 'source'}
                        onClick={() => {
                          setTipoRecebimentoCriacao('entrega')
                          setMesa('')
                          setObservacaoSemMesa('')
                        }}
                      >
                        Entrega
                      </button>
                    </div>
                  </div>

                  {origem === 'mesa' && tipoRecebimentoCriacao === 'comer_no_local' && (
                    <div className="field">
                      <label>Mesa</label>
                      <select value={mesa} onChange={(e) => { setMesa(e.target.value); setObservacaoSemMesa('') }}>
                        <option value="">Selecione a mesa</option>
                        <option value="sem_mesa">Sem mesa</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((numero) => (
                          <option key={numero} value={numero}>Mesa {numero}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {origem === 'mesa' && mesa === 'sem_mesa' && tipoRecebimentoCriacao === 'comer_no_local' && (
                    <div className="field">
                      <label>Observação</label>
                      <input
                        type="text"
                        placeholder="Ex: Civic branco, camisa preta na esquina..."
                        value={observacaoSemMesa}
                        onChange={(e) => setObservacaoSemMesa(e.target.value)}
                      />
                    </div>
                  )}

                  {tipoRecebimentoCriacao === 'entrega' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                        <div className="field" style={{ margin: 0 }}>
                          <label>Rua / Logradouro / Bairro</label>
                          <input
                            type="text"
                            placeholder="Ex: Rua Castro Alves"
                            value={enderecoEntrega}
                            onChange={(e) => {
                              setEnderecoEntrega(e.target.value)
                              setTaxaEntrega('')
                              calcularTaxaAutomatica(e.target.value, numeroEntrega)
                            }}
                          />
                        </div>
                        <div className="field" style={{ margin: 0 }}>
                          <label>Número</label>
                          <input
                            type="text"
                            placeholder="Ex: 123"
                            value={numeroEntrega}
                            onChange={(e) => {
                              setNumeroEntrega(e.target.value)
                              setTaxaEntrega('')
                              calcularTaxaAutomatica(enderecoEntrega, e.target.value)
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: '4px', marginBottom: '8px' }}>
                        {calculandoDistancia && (
                          <small style={{ color: '#6b7280', display: 'block' }}>
                            📍 Calculando distância...
                          </small>
                        )}
                        {infoDistancia && !calculandoDistancia && !infoDistancia.erro && (
                          <small style={{ color: '#16a34a', display: 'block', fontWeight: 600 }}>
                            ✓ {infoDistancia.distancia < 1000
                              ? `${Math.round(infoDistancia.distancia)} m`
                              : `${(infoDistancia.distancia / 1000).toFixed(1)} km`} — Taxa: R$ {infoDistancia.taxa.toFixed(2).replace('.', ',')}
                          </small>
                        )}
                        {infoDistancia && !calculandoDistancia && infoDistancia.erro && (
                          <small style={{ color: '#ef4444', display: 'block' }}>
                            ⚠️ {infoDistancia.erro}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {tipoRecebimentoCriacao === 'entrega' && (
                    <div className="field">
                      <label>Forma de pagamento (Entrega)</label>
                      <div className="source-buttons">
                        <button
                          type="button"
                          className={formaPagamentoCriacao === 'pix' ? 'source active' : 'source'}
                          onClick={() => setFormaPagamentoCriacao('pix')}
                        >
                          🟢 Pix
                        </button>
                        <button
                          type="button"
                          className={formaPagamentoCriacao === 'cartao' ? 'source active' : 'source'}
                          onClick={() => setFormaPagamentoCriacao('cartao')}
                        >
                          💳 Cartão
                        </button>
                        <button
                          type="button"
                          className={formaPagamentoCriacao === 'dinheiro' ? 'source active' : 'source'}
                          onClick={() => setFormaPagamentoCriacao('dinheiro')}
                        >
                          💵 Dinheiro
                        </button>
                      </div>
                    </div>
                  )}

                  {tipoRecebimentoCriacao === 'entrega' && formaPagamentoCriacao === 'dinheiro' && (
                    <div className="field" style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', border: '1px solid #f59e0b', marginTop: '8px' }}>
                      <label style={{ color: '#92400e', fontWeight: 700 }}>
                        💵 Valor da nota que o cliente vai pagar (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ex: 50,00"
                        value={valorPagoDinheiroCriacao}
                        onChange={(e) => setValorPagoDinheiroCriacao(e.target.value)}
                        style={{ background: '#fff', border: '1px solid #f59e0b', marginTop: '4px' }}
                      />
                      {(() => {
                        const valNota = Number(valorPagoDinheiroCriacao.replace(',', '.')) || 0
                        const subtotalCalc = carrinho.reduce((s, it) => s + (it.preco * it.quantidade) + (it.adicionais || []).reduce((sa, a) => sa + (a.valor * (a.quantidade || 1)), 0), 0)
                        const totalCalc = subtotalCalc + (Number(taxaEntrega) || 0)
                        const trocoCalc = valNota > totalCalc ? (valNota - totalCalc) : 0
                        if (valNota > 0) {
                          return (
                            <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 700, color: '#b45309' }}>
                              🪙 LEVAR DE TROCO: R$ {formatarMoeda(trocoCalc)} (Cliente vai pagar com R$ {formatarMoeda(valNota)})
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )}

                  {tipoRecebimentoCriacao === 'entrega' && (
                    <div className="field">
                      <label>
                        Taxa de entrega
                        {infoDistancia && !infoDistancia.erro && (
                          <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '6px', fontWeight: 400 }}>
                            (calculada automaticamente)
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={taxaEntrega}
                        onChange={(e) => setTaxaEntrega(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="field" style={{ marginBottom: '15px' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '11px', left: '12px', fontSize: '15px' }}>🔍</span>
                  <input 
                    type="text" 
                    placeholder="Pesquisar produto (lanche, bebida, combo...)" 
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    style={{ paddingLeft: '34px' }}
                  />
                </div>
              </div>

              {!buscaProduto && (
                <div className="category-list">
                  {categorias.map((categoria) => (
                    <button
                      type="button"
                      key={categoria.nome}
                      className={categoriaAtiva === categoria.nome ? 'category active' : 'category'}
                      onClick={() => setCategoriaAtiva(categoria.nome)}
                    >
                      {categoria.nome}
                    </button>
                  ))}
                </div>
              )}

              <div className="product-grid">
                {(() => {
                  if (buscaProduto) {
                    const searchLower = buscaProduto.toLowerCase()
                    const allProducts = categorias.flatMap(c => c.produtos)
                    const filtered = allProducts.filter(([nome]) => buscaFuzzy(nome, searchLower))
                    
                    if (filtered.length === 0) {
                      return <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280', padding: '20px' }}>Nenhum produto encontrado.</p>
                    }

                    return filtered.map(([produto, preco]) => (
                      <button type="button" className="product-card" key={produto} onClick={() => adicionarProduto(produto, preco)}>
                        <strong>{produto}</strong>
                        <span>R$ {preco.toFixed(2).replace('.', ',')}</span>
                      </button>
                    ))
                  } else {
                    return categoria?.produtos.map(([produto, preco]) => (
                      <button type="button" className="product-card" key={produto} onClick={() => adicionarProduto(produto, preco)}>
                        <strong>{produto}</strong>
                        <span>R$ {preco.toFixed(2).replace('.', ',')}</span>
                      </button>
                    ))
                  }
                })()}
              </div>
            </section>

            <aside className="cart">
              <div className="cart-header">
                <h3>Pedido</h3>
                <span>{carrinho.reduce((soma, item) => soma + item.quantidade, 0)} itens</span>
              </div>

              {carrinho.length === 0 ? (
                <div className="cart-empty">
                  <div>🛒</div>
                  <p>Nenhum produto adicionado.</p>
                  <small>Clique em um produto para adicionar.</small>
                </div>
              ) : (
                <div className="cart-items">
                  {carrinho.map((item) => (
                    <div className="cart-item-container" key={item.nome} style={{display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>
                      <div className="cart-item" style={{borderBottom: 'none', paddingBottom: 0, marginBottom: 0}}>
                        <div>
                          <strong>{item.nome}</strong>
                          <span>R$ {((item.preco * item.quantidade) + (item.adicionais || []).reduce((s, ad) => s + (ad.valor * (ad.quantidade || 1)), 0)).toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="quantity">
                          <button type="button" onClick={() => alterarQuantidade(item.nome, item.quantidade - 1)}>−</button>
                          <span>{item.quantidade}</span>
                          <button type="button" onClick={() => alterarQuantidade(item.nome, item.quantidade + 1)}>+</button>
                        </div>
                      </div>
                      {/* Linha de observação e adicional */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <input 
                          type="text" 
                          placeholder="Observação (ex: sem cebola)" 
                          value={item.notes || ''}
                          onChange={(e) => alterarObservacaoProduto(item.nome, e.target.value)}
                          style={{ flex: 1, minWidth: '140px', fontSize: '13px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <div style={{ position: 'relative', width: '130px' }}>
                          <input
                            type="text"
                            placeholder="+ Adicional"
                            value={autocompleteItemAberto === item.nome ? (item._buscaAdicional || '') : ''}
                            onChange={(e) => {
                              setCarrinho(a => a.map(it => it.nome === item.nome ? { ...it, _buscaAdicional: e.target.value } : it))
                              setAutocompleteItemAberto(item.nome)
                            }}
                            onFocus={() => setAutocompleteItemAberto(item.nome)}
                            onBlur={() => setTimeout(() => {
                              setAutocompleteItemAberto(null)
                              setCarrinho(a => a.map(it => it.nome === item.nome ? { ...it, _buscaAdicional: '' } : it))
                            }, 150)}
                            style={{ width: '100%', fontSize: '13px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #10b981', boxSizing: 'border-box' }}
                            title="Clique para ver adicionais disponíveis"
                          />
                          {autocompleteItemAberto === item.nome && (() => {
                            const digitado = (item._buscaAdicional || '').toLowerCase()
                            const sugestoes = ADICIONAIS.filter(([nome]) => nome.toLowerCase().includes(digitado))
                            if (sugestoes.length === 0) return null
                            return (
                              <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
                                background: 'white', border: '1px solid #ddd', borderRadius: '4px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '180px', overflowY: 'auto'
                              }}>
                                {sugestoes.map(([nomeAd, valorAd]) => (
                                  <div
                                    key={nomeAd}
                                    onMouseDown={() => {
                                      adicionarAdicionalProduto(item.nome, nomeAd, valorAd)
                                      setAutocompleteItemAberto(null)
                                      setCarrinho(a => a.map(it => it.nome === item.nome ? { ...it, _buscaAdicional: '' } : it))
                                    }}
                                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f0f0f0' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                  >
                                    {nomeAd} <span style={{ color: '#6b7280', fontSize: '12px' }}>+R${valorAd},00</span>
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      {/* Tags dos adicionais já adicionados */}
                      {(item.adicionais || []).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {(item.adicionais || []).map((ad, idx) => (
                            <span key={idx} style={{
                              background: '#dcfce7', color: '#166534', fontSize: '12px',
                              padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                              <button type="button" onClick={() => alterarQuantidadeAdicionalProduto(item.nome, idx, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', padding: '0 2px', fontWeight: 'bold' }}>−</button>
                              {ad.quantidade || 1}x {ad.nome} +R${ad.valor}
                              <button type="button" onClick={() => alterarQuantidadeAdicionalProduto(item.nome, idx, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', padding: '0 2px', fontWeight: 'bold' }}>+</button>
                              
                              <button
                                type="button"
                                onClick={() => removerAdicionalProduto(item.nome, idx)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 'bold', padding: 0, fontSize: '14px', lineHeight: 1 }}
                              >×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {taxaEntregaNum > 0 && (
                    <div className="cart-item cart-item-taxa">
                      <div><strong>Taxa de entrega</strong></div>
                      <span className="cart-taxa-valor">R$ {taxaEntregaNum.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="cart-footer">
                <div className="total">
                  <span>Total</span>
                  <strong>R$ {totalComEntrega.toFixed(2).replace('.', ',')}</strong>
                </div>
                <button
                  className="send-order"
                  disabled={carrinho.length === 0 || (origem === 'mesa' && tipoRecebimentoCriacao === 'comer_no_local' && !mesa)}
                  onClick={enviarPedido}
                >
                  Enviar pedido
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    )
  }

  // =========================================================
  // PAINEL PRINCIPAL
  // =========================================================

  return (
    <div className="app">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="https://i.postimg.cc/LXwNTH7z/images.png" 
            alt="Ilda Lanches" 
            style={{ height: '48px', width: '48px', borderRadius: '8px', objectFit: 'cover' }} 
          />
          <div>
            <h1>Ilda Lanches</h1>
            <span>Painel de pedidos</span>
          </div>
        </div>
        <div className="user" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={alternarSom}
            title={somAtivado ? "Alerta sonoro ativado (clique para silenciar)" : "Alerta sonoro silenciado (clique para ativar)"}
            style={{
              background: somAtivado ? '#ecfdf5' : '#fef2f2',
              border: somAtivado ? '1px solid #10b981' : '1px solid #ef4444',
              color: somAtivado ? '#065f46' : '#991b1b',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}
          >
            {somAtivado ? '🔊' : '🔇'}
          </button>
          <div className="avatar">{nomeUsuario[0]}</div>
          <div>
            <strong>{nomeUsuario}</strong>
            <small>{isOwner ? 'Dono' : isDriver ? 'Entregador' : 'Funcionário'}</small>
          </div>
          <button className="logout-button" onClick={sair}>Sair</button>
        </div>
      </header>

      <main className="content">
        <div className="page-header">
          <div>
            <h2>Pedidos</h2>
            <p>Acompanhe todos os pedidos da lanchonete.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isOwner && (
              <button 
                className="new-order" 
                style={{ background: '#ef4444' }}
                onClick={resetarPedidosTela}
              >
                Resetar tela
              </button>
            )}
            {!isDriver && (
              <button className="new-order" onClick={abrirNovoPedido}>+ Novo pedido</button>
            )}
          </div>
        </div>

        {/* ESTATÍSTICAS DO ENTREGADOR */}
        {isDriver && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', color: '#111827', marginBottom: '16px' }}>
              Minhas entregas — {nomeUsuario}
            </h2>
            <div className="stats">
              <div className="stat-card">
                <span>Hoje</span>
                <strong>{entregasHoje.length}</strong>
                <small style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                  R$ {totalTaxasHoje.toFixed(2).replace('.', ',')}
                </small>
              </div>
              <div className="stat-card">
                <span>Esta semana</span>
                <strong>{entregasSemana.length}</strong>
                <small style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                  R$ {totalTaxasSemana.toFixed(2).replace('.', ',')}
                </small>
              </div>
              <div className="stat-card">
                <span>Este mês</span>
                <strong>{entregasMes.length}</strong>
                <small style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                  R$ {totalTaxasMes.toFixed(2).replace('.', ',')}
                </small>
              </div>
            </div>
          </div>
        )}

                {/* ESTATÍSTICAS GERAIS — só para funcionários comuns */}
        {!isDriver && !isOwner && (
          <div className="stats">
            <div className="stat-card">
              <span>Pedidos Ativos</span>
              <strong>{pedidos.filter((p) => p.payment_method !== 'archived' && p.status !== 'cancelled' && p.status !== 'completed').length}</strong>
            </div>
            <div className="stat-card">
              <span>Pedidos Cancelados</span>
              <strong>{pedidos.filter((p) => p.status === 'cancelled').length}</strong>
            </div>
          </div>
        )}

        {/* FATURAMENTO OU ENTREGAS — só para donos */}
        {isOwner && (
          filtroOrigem === 'entregues' ? (
            <div className="stats">
              {(() => {
                const entregasHoje = pedidos.filter(p => p.status === 'completed' && isHoje(p.completed_at));
                const totalTaxas = entregasHoje.reduce((soma, p) => soma + Number(p.delivery_fee || 0), 0);
                return (
                  <div className="stat-card">
                    <span>Todas Entregas (Últimas 12h)</span>
                    <strong>{entregasHoje.length}</strong>
                    <small style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                      R$ {totalTaxas.toFixed(2).replace('.', ',')}
                    </small>
                  </div>
                );
              })()}
              {Object.entries(
                pedidos.filter(p => p.status === 'completed' && isHoje(p.completed_at))
                  .reduce((acc, p) => {
                    const id = p.driver_id || 'Desconhecido'
                    if (!acc[id]) acc[id] = { qtd: 0, taxa: 0 }
                    acc[id].qtd += 1
                    acc[id].taxa += Number(p.delivery_fee || 0)
                    return acc
                  }, {})
              ).map(([id, data]) => {
                const nomes = {
                  '7794e927-ae46-4a74-a75b-31fdf1e5ce66': 'Renan',
                  'e47a1bf2-3b93-4010-92e0-dfd3fd49a73c': 'Felipe'
                }
                const nomeExibicao = nomes[id] || (id === 'Desconhecido' ? 'Desconhecido' : `Entregador (${id.substring(0,4)})`)
                return (
                  <div className="stat-card" key={id}>
                    <span>{nomeExibicao} (12h)</span>
                    <strong>{data.qtd}</strong>
                    <small style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                      R$ {data.taxa.toFixed(2).replace('.', ',')}
                    </small>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="stats">
              <div className="stat-card">
                <span>Faturamento Hoje</span>
                <strong style={{ color: '#16a34a' }}>R$ {formatarMoeda(faturamentoHoje)}</strong>
                <small style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  🧾 {pedidosHoje} {pedidosHoje === 1 ? 'pedido' : 'pedidos'}
                </small>
                {canceladosHoje > 0 && (
                  <small style={{ fontSize: '12px', color: '#ef4444', display: 'block' }}>
                    ✕ {canceladosHoje} {canceladosHoje === 1 ? 'cancelado' : 'cancelados'}
                  </small>
                )}
              </div>
              <div className="stat-card">
                <span>Esta Semana</span>
                <strong style={{ color: '#16a34a' }}>R$ {formatarMoeda(faturamentoSemana)}</strong>
                <small style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  🧾 {pedidosSemana} {pedidosSemana === 1 ? 'pedido' : 'pedidos'}
                </small>
                {canceladosSemana > 0 && (
                  <small style={{ fontSize: '12px', color: '#ef4444', display: 'block' }}>
                    ✕ {canceladosSemana} {canceladosSemana === 1 ? 'cancelado' : 'cancelados'}
                  </small>
                )}
              </div>
              <div className="stat-card">
                <span>Este Mês</span>
                <strong style={{ color: '#16a34a' }}>R$ {formatarMoeda(faturamentoMes)}</strong>
                <small style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  🧾 {pedidosMes} {pedidosMes === 1 ? 'pedido' : 'pedidos'}
                </small>
                {canceladosMes > 0 && (
                  <small style={{ fontSize: '12px', color: '#ef4444', display: 'block' }}>
                    ✕ {canceladosMes} {canceladosMes === 1 ? 'cancelado' : 'cancelados'}
                  </small>
                )}
              </div>
            </div>
          )
        )}

        {/* FILTROS */}
        <div className="order-filters">
          {isDriver ? (
            <>
              <button className={filtroOrigem !== 'entregues' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('delivery')}>Entregar</button>
              <button className={filtroOrigem === 'entregues' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('entregues')}>Entregues</button>
            </>
                    ) : (
            <>
              <button className={filtroOrigem === 'todos' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('todos')}>Todos</button>
              <button className={filtroOrigem === 'table' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('table')}>Mesa</button>
              <button className={filtroOrigem === 'whatsapp' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('whatsapp')}>WhatsApp</button>
              <button className={filtroOrigem === 'anota_ai' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('anota_ai')}>Anota Aí</button>
              <button className={filtroOrigem === 'ifood' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('ifood')}>iFood</button>
              <button className={filtroOrigem === 'retirada' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('retirada')}>Retirada</button>
              <button className={filtroOrigem === 'delivery' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('delivery')}>Entregar</button>
              {isOwner && (
                <>
                  <button className={filtroOrigem === 'entregues' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('entregues')}>Entregues</button>
                  <button className={filtroOrigem === 'ia' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('ia')} style={{background: filtroOrigem === 'ia' ? '#6366f1' : 'transparent', color: filtroOrigem === 'ia' ? 'white' : '#6366f1', borderColor: '#6366f1'}}>Painel IA</button>
                </>
              )}
            </>
          )}
        </div>

        {/* LISTA DE PEDIDOS OU PAINEL IA */}
        {filtroOrigem === 'ia' ? (
          <IADashboard />
        ) : (
          <div className="orders-list">
          {carregandoPedidos ? (
            <div className="empty">
              <div className="empty-icon">🧾</div>
              <h3>Carregando pedidos...</h3>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🧾</div>
              <h3>Nenhum pedido no momento</h3>
              <p>Quando um pedido entrar, ele aparecerá aqui.</p>
            </div>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <div className="order-card" key={pedido.id}>
                <div className="order-card-header">
                  <div>
                    <strong>Pedido #{pedido.order_number}</strong>
                    {pedido.customer_name && <span>{pedido.customer_name}</span>}
                    {!pedido.table_id && pedido.source === 'table' && pedido.delivery_address && (
                      <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                        📍 {pedido.delivery_address}
                      </span>
                    )}
                  </div>
                  <div className="order-status-area">
                    <span className={`order-type-badge ${
                      pedido.order_type === 'delivery' || pedido.manual_delivery ? 'badge-delivery'
                      : pedido.order_type === 'dine_in' || pedido.source === 'table' ? 'badge-dinein'
                      : 'badge-pickup'
                    }`}>
                      {pedido.order_type === 'delivery' || pedido.manual_delivery ? '🛵 Entrega'
                        : pedido.order_type === 'dine_in' || pedido.source === 'table' ? (pedido.tables_restaurant?.number ? `🍽️ Comer no local (Mesa ${pedido.tables_restaurant.number})` : '🍽️ Comer no local')
                        : '🛍️ Retirada'}
                    </span>
                    <span className={`order-source ${
                      pedido.source === 'table' ? 'source-table'
                      : pedido.source === 'whatsapp' ? 'source-whatsapp'
                      : pedido.source === 'anota_ai' ? 'source-anota'
                      : pedido.source === 'delivery' ? 'source-delivery'
                      : pedido.source === 'retirada' ? 'source-retirada'
                      : 'source-ifood'
                    }`}>
                      {pedido.source === 'table'
                        ? pedido.table_id ? `Mesa ${pedido.tables_restaurant?.number ?? '-'}` : 'Sem mesa'
                        : pedido.source === 'whatsapp' ? 'WhatsApp'
                        : pedido.source === 'anota_ai' ? 'Anota Aí'
                        : pedido.source === 'ifood' ? 'iFood'
                        : pedido.source === 'delivery' ? 'Entrega'
                        : pedido.source === 'retirada' ? 'Retirada'
                        : pedido.source}
                    </span>
                    <small className="order-time">
                      {(() => {
                        const dataPedido = new Date(pedido.created_at)
                        const diffHoras = (agoraParaStats - dataPedido) / (1000 * 60 * 60)
                        
                        const horaString = dataPedido.toLocaleTimeString('pt-BR', {
                          timeZone: 'America/Sao_Paulo',
                          hour: '2-digit',
                          minute: '2-digit',
                        })

                        if (diffHoras > 16) {
                          const diaString = dataPedido.toLocaleDateString('pt-BR', {
                            timeZone: 'America/Sao_Paulo',
                            day: '2-digit',
                            month: '2-digit'
                          })
                          return `${diaString} às ${horaString}`
                        }
                        
                        return horaString
                      })()}
                    </small>
                  </div>
                </div>

                <div className="order-items">
                  {pedido.order_items?.map((item) => {
                    const info = decomporItemEAdicionais(item)
                    return (
                      <div key={item.id} style={{ marginBottom: '4px' }}>
                        <div className="order-item">
                          <span>{item.quantity}x {item.product_name}</span>
                          <strong>R$ {info.totalLanchePuro.toFixed(2).replace('.', ',')}</strong>
                        </div>
                        {info.listaAdicionais.map((ad, adIdx) => (
                          <div key={adIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#166534', paddingLeft: '12px' }}>
                            <span>+ {ad.quantidade}x {ad.nome}</span>
                            <span>R$ {ad.total.toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                        {info.observacaoLimpa && (
                          <div style={{ fontSize: '11px', color: '#6b7280', paddingLeft: '12px', fontStyle: 'italic' }}>
                            Obs: {info.observacaoLimpa}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {Number(pedido.delivery_fee) > 0 && (
                    <div className="order-item order-item-taxa">
                      <span>Taxa de entrega</span>
                      <strong>R$ {Number(pedido.delivery_fee).toFixed(2).replace('.', ',')}</strong>
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <div>
                    <span>Total</span>
                    <strong>R$ {Number(pedido.total).toFixed(2).replace('.', ',')}</strong>
                  </div>
                  <div className="order-card-actions">
                    {/* Badge de pedido entregue */}
                    {pedido.status === 'completed' && (
                      <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        ✓ Entregue {pedido.driver_id ? `por ${pedido.driver_id === '7794e927-ae46-4a74-a75b-31fdf1e5ce66' ? 'Renan' : pedido.driver_id === 'e47a1bf2-3b93-4010-92e0-dfd3fd49a73c' ? 'Felipe' : 'Entregador'}` : ''}
                      </span>
                    )}

                    {/* Botão cancelar pedido entregue — só para donos */}
                    {isOwner && pedido.status === 'completed' && (
                      <button
                        className="cancel-order-button"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                        onClick={() => cancelarPedidoDireto(pedido)}
                      >
                        Cancelar pedido
                      </button>
                    )}

                    {/* Botão realizar entrega — só para entregadores, só em pedidos de entrega sem entregador */}
                    {isDriver && pedido.manual_delivery && !pedido.driver_id && pedido.status !== 'completed' && (
                      <button
                        className="deliver-order-button"
                        onClick={() => realizarEntrega(pedido)}
                      >
                        ✓ Realizar entrega
                      </button>
                    )}
                    {/* Select + Botão realizar entrega — para todos exceto entregadores */}
                    {!isDriver && pedido.manual_delivery && !pedido.driver_id && pedido.status !== 'completed' && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select 
                          id={`entregador-${pedido.id}`}
                          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', flex: 1 }}
                        >
                          <option value="7794e927-ae46-4a74-a75b-31fdf1e5ce66">Renan</option>
                          <option value="e47a1bf2-3b93-4010-92e0-dfd3fd49a73c">Felipe</option>
                        </select>
                        <button
                          className="deliver-order-button"
                          onClick={() => {
                            const select = document.getElementById(`entregador-${pedido.id}`);
                            const driverId = select.value;
                            const driverName = select.options[select.selectedIndex].text;
                            realizarEntregaDono(pedido, driverId, driverName);
                          }}
                        >
                          ✓ Realizar entrega
                        </button>
                      </div>
                    )}
                    {/* Botão imprimir cupom térmico */}
                    <button
                      className="print-order-button"
                      onClick={() => imprimirCupom(pedido)}
                      title="Imprimir cupom"
                    >
                      🖨️ Imprimir
                    </button>

                    {/* Botão editar — só para não entregadores em pedidos não finalizados */}
                    {!isDriver && pedido.status !== 'completed' && (
                      <button
                        className="edit-order-button"
                        onClick={() => {
                          setPedidoSelecionado({
                            ...pedido,
                            order_items: (pedido.order_items || []).map(it => {
                              const decomposto = decomporItemEAdicionais(it)
                              const parsedAdicionais = decomposto.listaAdicionais.map(ad => ({
                                nome: ad.nome,
                                valor: ad.valorUnit,
                                quantidade: ad.quantidade
                              }))
                              
                              const unitBase = it.quantity > 0 ? (decomposto.totalLanchePuro / it.quantity) : Number(it.unit_price)

                              return {
                                ...it,
                                notes: decomposto.observacaoLimpa,
                                adicionais: parsedAdicionais,
                                unit_price_base: unitBase,
                                unit_price: unitBase,
                                total_price: Number(it.total_price)
                              }
                            })
                          })
                          setTipoRecebimento(pedido.manual_delivery === true ? 'entrega' : (pedido.order_type === 'dine_in' || pedido.source === 'table' ? 'comer_no_local' : 'retirada'))
                          setFoiPagoEdicao(pedido.payment_status === 'paid')
                          setCategoriaEdicao('Hambúrgueres')
                          setBuscaProdutoEdicao('')
                          // Reseta estados do geocoding da edição
                          // Tenta separar o número do endereço automaticamente
                          const endAtual = pedido.delivery_address || ''
                          const partesEnd = endAtual.split(',').map(p => p.trim())
                          const numIdx = partesEnd.findLastIndex(p => /^\d+$/.test(p))
                          if (numIdx > -1) {
                            const numero = partesEnd[numIdx]
                            const rua = partesEnd.filter((_, i) => i !== numIdx).join(', ')
                            setEnderecoEdicao(rua)
                            setNumeroEdicao(numero)
                          } else {
                            setEnderecoEdicao(endAtual)
                            setNumeroEdicao('')
                          }
                          setInfoDistanciaEdicao(null)
                          setCalculandoDistanciaEdicao(false)
                        }}
                      >
                        Editar pedido
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </main>

      {/* ÁREA DE IMPRESSÃO TÉRMICA (80mm EPSON) */}
      <div id="thermal-receipt-area" className="thermal-receipt" style={{ marginLeft: '4mm', paddingLeft: '2mm', paddingRight: '3mm', width: '72mm', boxSizing: 'border-box' }}>
        {pedidoParaImprimir && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            {/* TIPO DE PEDIDO */}
            <div style={{ fontSize: '17px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
              {(() => {
                if (pedidoParaImprimir.order_type === 'delivery' || pedidoParaImprimir.manual_delivery) {
                  return 'PARA ENTREGA'
                }
                if (pedidoParaImprimir.order_type === 'dine_in' || pedidoParaImprimir.source === 'table') {
                  const mesaNum = pedidoParaImprimir.tables_restaurant?.number
                  return mesaNum ? `COMER NO LOCAL (MESA ${mesaNum})` : 'COMER NO LOCAL'
                }
                return 'RETIRADA NO LOCAL'
              })()}
            </div>
            <div style={{ fontSize: '11px', marginBottom: '2px' }}>
              {new Date(pedidoParaImprimir.created_at || Date.now()).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              Ilda Lanche
            </div>
            <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />
            
            {/* NÚMERO DO PEDIDO */}
            <div style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0' }}>
              Pedido #{pedidoParaImprimir.order_number}
            </div>
            <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

            {/* ITENS */}
            <div style={{ textAlign: 'left', margin: '8px 0' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>Itens:</div>
              {(pedidoParaImprimir.order_items || []).map((item, idx) => {
                const info = decomporItemEAdicionais(item)
                return (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    {/* Linha do lanche com apenas o valor do lanche puro */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>({item.quantity}) {item.product_name}</span>
                      <span style={{ fontWeight: 'bold' }}>
                        R$ {info.totalLanchePuro.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Adicionais com seus respectivos valores ao lado */}
                    {info.listaAdicionais.length > 0 && (
                      <div style={{ fontSize: '12px', paddingLeft: '12px', marginTop: '2px' }}>
                        <div style={{ fontWeight: '600', color: '#111' }}>* Adicionais:</div>
                        {info.listaAdicionais.map((ad, adIdx) => (
                          <div key={adIdx} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px' }}>
                            <span>+ {ad.quantidade}x {ad.nome}</span>
                            <span style={{ fontWeight: 'bold' }}>R$ {ad.total.toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Observação de preparo */}
                    {info.observacaoLimpa && (
                      <div style={{ fontSize: '12px', paddingLeft: '12px', marginTop: '2px', fontStyle: 'italic' }}>
                        * Obs: {info.observacaoLimpa}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

            {/* CLIENTE & LOCALIZAÇÃO */}
            <div style={{ textAlign: 'left', fontSize: '12px', margin: '6px 0', lineHeight: 1.4 }}>
              <div><strong>Cliente:</strong> {pedidoParaImprimir.customer_name || 'Não informado'}</div>
              {pedidoParaImprimir.table_id && (
                <div><strong>Mesa:</strong> {pedidoParaImprimir.tables_restaurant?.number ? `Mesa ${pedidoParaImprimir.tables_restaurant.number}` : 'Mesa'}</div>
              )}
              {pedidoParaImprimir.delivery_address && (
                <div style={{ marginTop: '2px' }}>
                  <strong>Entrega:</strong> {pedidoParaImprimir.delivery_address}
                </div>
              )}
              {pedidoParaImprimir.notes && (
                <div style={{ marginTop: '4px', padding: '4px', border: '1px dotted #000' }}>
                  <strong>Obs:</strong> {pedidoParaImprimir.notes}
                </div>
              )}
              <div>
                <strong>Origem:</strong> {
                  pedidoParaImprimir.source === 'table' ? 'Mesa' :
                  pedidoParaImprimir.source === 'whatsapp' ? 'WhatsApp' :
                  pedidoParaImprimir.source === 'anota_ai' ? 'Anota Aí' :
                  pedidoParaImprimir.source === 'ifood' ? 'iFood' :
                  pedidoParaImprimir.source === 'delivery' ? 'Entrega' :
                  pedidoParaImprimir.source === 'retirada' ? 'Retirada' : pedidoParaImprimir.source
                }
              </div>
            </div>
            <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

            {/* PAGAMENTO */}
            <div style={{ textAlign: 'left', fontSize: '12px', margin: '6px 0', lineHeight: 1.4 }}>
              <div>
                <strong>Forma de Pagamento:</strong> {
                  (pedidoParaImprimir.payment_method || '').toLowerCase() === 'dinheiro' ? '💰 DINHEIRO' :
                  (pedidoParaImprimir.payment_method || '').toLowerCase() === 'pix' ? '🟢 PIX' :
                  (pedidoParaImprimir.payment_method || '').toLowerCase() === 'cartao' ? '💳 CARTÃO' :
                  (pedidoParaImprimir.payment_method || 'Não informada').toUpperCase()
                }
              </div>
              <div><strong>Status:</strong> {pedidoParaImprimir.payment_status === 'paid' ? 'Pagamento já realizado' : 'Cobrar do cliente'}</div>
            </div>
            <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

            {/* TOTAIS */}
            <div style={{ textAlign: 'right', fontSize: '13px', margin: '6px 0', lineHeight: 1.4 }}>
              <div>Subtotal: R$ {Number(pedidoParaImprimir.subtotal || 0).toFixed(2).replace('.', ',')}</div>
              {Number(pedidoParaImprimir.delivery_fee || 0) > 0 && (
                <div>Taxa de entrega: R$ {Number(pedidoParaImprimir.delivery_fee).toFixed(2).replace('.', ',')}</div>
              )}
              <div style={{ fontSize: '17px', fontWeight: 'bold', marginTop: '4px' }}>
                Total: R$ {Number(pedidoParaImprimir.total || 0).toFixed(2).replace('.', ',')}
              </div>
            </div>
            <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

            {/* RODAPÉ */}
            <div style={{ fontSize: '11px', color: '#444' }}>
              Central de Pedidos • Ilda Lanche
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App