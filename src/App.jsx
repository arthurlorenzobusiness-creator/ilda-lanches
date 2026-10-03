function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function calcularDiscriminacaoPagamento(listaPedidos, subtrairTaxa = false, apenasTaxas = false) {
  if (!Array.isArray(listaPedidos)) listaPedidos = []

  const obterValor = (p) => {
    if (apenasTaxas) {
      return Number(p.delivery_fee || 0)
    }
    return Math.max(0, Number(p.total || 0) - (subtrairTaxa ? Number(p.delivery_fee || 0) : 0))
  }

  const pix = listaPedidos.filter(p => (p.payment_method || '').toLowerCase().includes('pix'))
  const totalPix = pix.reduce((sum, p) => sum + obterValor(p), 0)
  const totalPedidosPix = pix.reduce((sum, p) => sum + Number(p.total || 0), 0)
  const qtdPix = pix.length

  const cartao = listaPedidos.filter(p => {
    const m = (p.payment_method || '').toLowerCase()
    return m.includes('cartao') || m.includes('cartão') || m.includes('credit') || m.includes('debit') || m.includes('crédito') || m.includes('débito') || m.includes('mastercard') || m.includes('visa') || m.includes('elo')
  })
  const totalCartao = cartao.reduce((sum, p) => sum + obterValor(p), 0)
  const totalPedidosCartao = cartao.reduce((sum, p) => sum + Number(p.total || 0), 0)
  const qtdCartao = cartao.length

  const dinheiro = listaPedidos.filter(p => {
    const m = (p.payment_method || '').toLowerCase()
    return m.includes('dinheiro') || m.includes('cash')
  })
  const totalDinheiro = dinheiro.reduce((sum, p) => sum + obterValor(p), 0)
  const totalPedidosDinheiro = dinheiro.reduce((sum, p) => sum + Number(p.total || 0), 0)
  const qtdDinheiro = dinheiro.length

  // Pedidos sem forma de pagamento selecionada (não é pix, cartão nem dinheiro)
  const naoSelecionado = listaPedidos.filter(p => {
    const m = (p.payment_method || '').toLowerCase().trim()
    const isPix = m.includes('pix')
    const isCartao = m.includes('cartao') || m.includes('cartão') || m.includes('credit') || m.includes('debit') || m.includes('crédito') || m.includes('débito') || m.includes('mastercard') || m.includes('visa') || m.includes('elo')
    const isDinheiro = m.includes('dinheiro') || m.includes('cash')
    return !isPix && !isCartao && !isDinheiro
  })
  const totalNaoSelecionado = naoSelecionado.reduce((sum, p) => sum + obterValor(p), 0)
  const totalPedidosNaoSelecionado = naoSelecionado.reduce((sum, p) => sum + Number(p.total || 0), 0)
  const qtdNaoSelecionado = naoSelecionado.length

  const totalGeral = totalPix + totalCartao + totalDinheiro + totalNaoSelecionado

  return {
    pix: { total: totalPix, totalPedidosValor: totalPedidosPix, qtd: qtdPix, perc: totalGeral > 0 ? Math.round((totalPix / totalGeral) * 100) : 0, pedidos: pix },
    cartao: { total: totalCartao, totalPedidosValor: totalPedidosCartao, qtd: qtdCartao, perc: totalGeral > 0 ? Math.round((totalCartao / totalGeral) * 100) : 0, pedidos: cartao },
    dinheiro: { total: totalDinheiro, totalPedidosValor: totalPedidosDinheiro, qtd: qtdDinheiro, perc: totalGeral > 0 ? Math.round((totalDinheiro / totalGeral) * 100) : 0, pedidos: dinheiro },
    naoSelecionado: { total: totalNaoSelecionado, totalPedidosValor: totalPedidosNaoSelecionado, qtd: qtdNaoSelecionado, perc: totalGeral > 0 ? Math.round((totalNaoSelecionado / totalGeral) * 100) : 0, pedidos: naoSelecionado },
    totalGeral,
    totalPedidos: listaPedidos.length,
    todosPedidos: listaPedidos
  }
}



function formatarNumero(valor) {
  return Number(valor || 0).toLocaleString('pt-BR')
}

function calcularTempoDecorrido(dataCriacao, agora = Date.now(), isDelivery = false) {
  if (!dataCriacao) return { texto: 'Novo', status: 'recente', minutos: 0 }
  const criacao = new Date(dataCriacao).getTime()
  const minutosTotais = Math.max(0, Math.floor((agora - criacao) / 60000))
  
  let texto = ''
  if (minutosTotais < 1) {
    texto = 'Agora'
  } else if (minutosTotais < 60) {
    texto = `${minutosTotais} min`
  } else if (minutosTotais < 1440) {
    const horas = Math.floor(minutosTotais / 60)
    const restoMin = minutosTotais % 60
    if (restoMin === 0) {
      texto = `${horas}h`
    } else {
      texto = `${horas}h ${restoMin}min`
    }
  } else {
    const dias = Math.floor(minutosTotais / 1440)
    texto = dias === 1 ? '1 dia' : `${dias} dias`
  }

  const limiteAtraso = isDelivery ? 40 : 30
  let status = 'recente'
  if (minutosTotais > limiteAtraso) {
    status = 'atrasado'
  } else if (minutosTotais >= limiteAtraso - 10) {
    status = 'atencao'
  }

  return { texto, status, minutos: minutosTotais }
}

function verificarAtrasoPedido(pedido, coluna, minutosTotais) {
  if (!pedido) return { emAtraso: false, limiteMinutos: 30, diferencaAtraso: 0 }
  if (coluna === 'entregue' || pedido.status === 'completed' || pedido.status === 'delivered') {
    return { emAtraso: false, limiteMinutos: 30, diferencaAtraso: 0 }
  }
  const isDelivery = pedido.order_type === 'delivery' || pedido.manual_delivery || Boolean(pedido.delivery_address)
  const limiteMinutos = isDelivery ? 40 : 30
  const emAtraso = (coluna === 'producao' || !coluna || ['in_preparation', 'preparing', 'confirmed', 'accepted', 'new'].includes(pedido.status)) && minutosTotais > limiteMinutos
  const diferencaAtraso = emAtraso ? minutosTotais - limiteMinutos : 0

  return { emAtraso, limiteMinutos, diferencaAtraso }
}

function pedidoNoPeriodo(pedido, periodo) {
  if (!pedido) return false

  const agora = new Date()

  if (periodo === 'hoje') {
    // Para o filtro 'hoje', o pedido deve ter ocorrido nas últimas 14 horas (cobre o turno completo da lanchonete)
    const dataRef = pedido.created_at || pedido.completed_at
    if (!dataRef) return false
    let d = new Date(dataRef)
    if (isNaN(d.getTime()) && typeof dataRef === 'string') {
      d = new Date(dataRef.replace(' ', 'T'))
    }
    if (isNaN(d.getTime())) return false
    const diffHoras = (agora.getTime() - d.getTime()) / (1000 * 60 * 60)
    return diffHoras <= 14 && diffHoras >= -0.1
  }

  const dataRef = pedido.completed_at || pedido.created_at
  if (!dataRef) return false
  let d = new Date(dataRef)
  if (isNaN(d.getTime()) && typeof dataRef === 'string') {
    d = new Date(dataRef.replace(' ', 'T'))
  }
  if (isNaN(d.getTime())) return false

  if (periodo === '7dias') {
    const diffDias = (agora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diffDias >= -0.05 && diffDias <= 7
  }

  if (periodo === '30dias') {
    const diffDias = (agora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diffDias >= -0.05 && diffDias <= 30
  }

  return true
}

function isPedidoLocalOuRetirada(pedido) {
  if (!pedido) return false
  if (pedido.order_type === 'delivery' || pedido.manual_delivery || Boolean(pedido.delivery_address)) return false
  if (pedido.order_type === 'pickup' || pedido.order_type === 'dine_in') return true
  if (pedido.source === 'retirada' || pedido.source === 'table') return true
  if (pedido.tables_restaurant || pedido.table_id) return true
  return true
}

import { useEffect, useLayoutEffect, useState, useMemo, useTransition, useRef } from 'react'
import { supabase } from './supabase'
import IADashboard from './IADashboard'
import logoWhatsapp from './assets/logo-whatsapp-green.png'
import logoIfood from './assets/logo-ifood-red.png'
import logoAnotaai from './assets/logo-anotaai-blue.png'
import logoIlda from './assets/logo-ilda.png'
import { calcularRelatorioControle, classificarItemCardapio } from './utils/relatorioControle'
import { obterComposicaoItem } from './utils/composicaoCardapio'
import NovoPedidoPage from './pages/NovoPedidoPage'
import EditarPedidoPage from './pages/EditarPedidoPage'
import RelatoriosPage from './pages/RelatoriosPage'
import ConfiguracoesPage from './pages/ConfiguracoesPage'
import EntreguesPage from './pages/EntreguesPage'
import ErrorBoundary from './components/ErrorBoundary'

function CanalLogo({ canal, size = 15, style = {} }) {
  let src = null
  let alt = ''
  if (canal === 'whatsapp') {
    src = logoWhatsapp
    alt = 'WhatsApp'
  } else if (canal === 'anota_ai' || canal === 'anota') {
    src = logoAnotaai
    alt = 'Anota Aí'
  } else if (canal === 'ifood') {
    src = logoIfood
    alt = 'iFood'
  }

  if (!src) return null

  return (
    <img
      src={src}
      alt={alt}
      className="channel-logo-img"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    />
  )
}
import {
  ClipboardList,
  CheckCheck,
  CheckCircle2,
  UtensilsCrossed,
  Sparkles,
  Plus,
  Volume2,
  VolumeX,
  Trash2,
  LogOut,
  Search,
  X,
  Bike,
  ShoppingBag,
  Printer,
  Pencil,
  ChefHat,
  Clock,
  MapPin,
  Menu,
  Radio,
  Check,
  Flame,
  UserCheck,
  Calendar,
  ArrowLeft,
  Settings,
  KeyRound,
  Camera,
  History,
  User,
  ShieldCheck,
  Lock,
  Save,
  Mail,
  Eye,
  EyeOff,
  TrendingUp,
  Phone,
  RotateCcw,
  Store,
  AlertTriangle,
  CreditCard,
  QrCode,
  Banknote,
  HelpCircle,
  Package
} from 'lucide-react'

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
      ['X - SALADA BACON 150g', 38],
      ['X - SALADA BACON 300g', 46],
      ['X - SALADA EGG 150g', 37],
      ['X - SALADA EGG 300g', 45],
      ['X - EGG BACON 150g', 39],
      ['X - EGG BACON 300g', 47],
      ['X - TUDO 150g', 41],
      ['X - TUDO 300g', 48],
      ['X - CARGA PESADA 150g', 75],
      ['X - CARGA PESADA 300g', 89],
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
      ['Coca-Cola 350ml', 7],
      ['Coca-Cola Zero 350ml', 7],
      ['Coca-Cola KS 330ml', 5],
      ['Coca-Cola 600ml', 9],
      ['Coca-Cola Zero 600ml', 9],
      ['Coca-Cola 1L', 12],
      ['Coca-Cola Zero 1L', 12],
      ['Coca-Cola 2L', 16],
      ['Coca-Cola Zero 2L', 16],
      ['Guaraná Antarctica 350ml', 7],
      ['Fanta Laranja 350ml', 7],
      ['Fanta Uva 350ml', 7],
      ['Fanta Laranja 600ml', 9],
      ['Fanta Laranja 2L', 13],
      ['Sprite 350ml', 7],
      ['Sprite 600ml', 9],
      ['Schweppes 350ml', 7],
      ['Água Tônica 350ml', 7],
      ['Água sem Gás 500ml', 4],
      ['Água com Gás 500ml', 4],
      ['Del Valle Uva 290ml', 7],
      ['Del Valle Maracujá 290ml', 7],
      ['Del Valle Manga 290ml', 7],
      ['Del Valle Pêssego 290ml', 7],
      ['Del Valle Uva 450ml', 9],
      ['Suco 1L', 21],
      ['Limoneto (H2O) 500ml', 8],
      ['Poty 600ml', 8],
      ['Poty 2L', 9],
      ['Cotuba 600ml', 8],
      ['Roller 600ml', 8],
      ['Roller 2L', 13],
    ],
  },
  {
    nome: 'Cervejas',
    produtos: [
      ['Brahma 350ml', 7],
      ['Antarctica 350ml', 7],
      ['Skol 350ml', 7],
      ['Heineken 330ml', 9],
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

// Identifica se o produto é bebida/cerveja para não exibir opções de adicionais
function isProdutoBebida(nomeProduto) {
  if (!nomeProduto) return false
  const nomeLower = nomeProduto.toLowerCase().trim()
  const catsBebidas = ['Bebidas', 'Cervejas']
  for (const cat of categorias) {
    if (catsBebidas.includes(cat.nome)) {
      if (cat.produtos.some(([pNome]) => pNome.toLowerCase().trim() === nomeLower)) {
        return true
      }
    }
  }
  const keywordsBebidas = [
    'coca', 'guaraná', 'guarana', 'fanta', 'sprite', 'schweppes', 
    'del valle', 'suco', 'água', 'agua', 'cerveja', 'brahma', 
    'antarctica', 'skol', 'heineken', 'refrigerante', 'tônica', 'tonica',
    '350ml', '600ml', '330ml', '450ml', '290ml', '2l', '1l', '500ml',
    'poty', 'roller', 'cotuba', 'limoneto', 'h2o', 'ks'
  ]
  return keywordsBebidas.some(kw => nomeLower.includes(kw))
}

// Emails e IDs dos entregadores
const EMAILS_ENTREGADORES = ['renan@central.com', 'felipe@central.com']
const DRIVER_RENAN_ID = '7794e927-ae46-4a74-a75b-31fdf1e5ce66'
const DRIVER_FELIPE_ID = 'e47a1bf2-3b93-4010-92e0-dfd3fd49a73c'
const EMAILS_DONOS = ['renandono@central.com', 'luan@central.com', 'lucas@central.com', 'arthur@central.com', 'ilda@central.com']

// Mapeamento oficial dos UUIDs das 12 mesas da tabela tables_restaurant
const MESAS_MAPA_ID = {
  1: 'd1740070-683c-4f78-b845-a982da723ba3',
  2: 'a730f1c1-cfcd-42f4-8adf-5a2645c07573',
  3: 'c8689ba7-a7d9-4c75-813c-d9bbcd338292',
  4: '331a667a-24be-4992-b6a6-45a1d2daa92c',
  5: '0bf41fe4-bf71-40d3-b371-2b5d7217b10b',
  6: 'd969cd23-1176-49cb-a7a2-e04beb2ffb09',
  7: '2d2dd0d5-3308-4357-a51c-65dadf01d12d',
  8: 'dafe536c-3d9e-45bf-96c6-37857432c391',
  9: 'eb3696de-8eb7-4335-afdb-bdfc14907428',
  10: '7822980e-9c92-4407-a5d3-2ec3726223bf',
  11: '33232258-a87c-4d4c-8cc6-954b5496254b',
  12: 'b7f73bfa-5bd0-4cfe-9ede-e32dbb4b8650'
}

const MESAS_MAPA_REVERSO = Object.fromEntries(
  Object.entries(MESAS_MAPA_ID).map(([num, id]) => [id, Number(num)])
)

function extrairNumeroMesaPedido(pedido) {
  if (!pedido) return null
  const num = pedido.tables_restaurant?.number ||
              MESAS_MAPA_REVERSO[pedido.table_id] ||
              pedido.mesa ||
              pedido.table_number ||
              (typeof pedido.notes === 'string' ? (pedido.notes.match(/\[MESA\s*(\d+)\]/i)?.[1] || pedido.notes.match(/Mesa\s*[:#]?\s*(\d+)/i)?.[1]) : null) ||
              null
  if (num === null || num === undefined || num === '') return null
  return String(num).trim()
}

function isPedidoDeMesa(pedido) {
  if (!pedido) return false
  if (pedido.order_type === 'dine_in') return true
  if (pedido.source === 'table') return true
  if (Boolean(pedido.table_id)) return true
  if (Boolean(pedido.tables_restaurant?.number)) return true
  if (Boolean(MESAS_MAPA_REVERSO[pedido.table_id])) return true
  if (Boolean(extrairNumeroMesaPedido(pedido))) return true
  if (typeof pedido.notes === 'string') {
    if (pedido.notes.match(/\[MESA\s*\d+\]/i)) return true
    if (pedido.notes.match(/\[SEM MESA\]/i)) return true
    if (pedido.notes.match(/\[LEVAR\]/i) && (pedido.source === 'table' || !pedido.delivery_address)) return true
  }
  return false
}

function obterNumeroExibicaoPedido(pedido) {
  if (!pedido) return ''
  const notes = typeof pedido.notes === 'string' ? pedido.notes : ''
  const matchOficial = notes.match(/\[PEDIDO\s*#?([A-Za-z0-9_-]+)\]/i)
  if (matchOficial && matchOficial[1]) {
    return matchOficial[1].trim()
  }
  return pedido.order_number !== undefined && pedido.order_number !== null
    ? String(pedido.order_number)
    : (pedido.id ? String(pedido.id) : '')
}

function obterRotaAtual() {
  if (typeof window === 'undefined') return { pagina: 'pedidos', id: null }
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
  if (path === '/mesas') return { pagina: 'mesas', id: null }
  if (path === '/entregues') return { pagina: 'entregues', id: null }
  if (path === '/relatorios' || path === '/faturamento') return { pagina: 'relatorios', id: null }
  if (path === '/configuracoes' || path === '/ajustes') return { pagina: 'configuracoes', id: null }
  if (path === '/novo-pedido') return { pagina: 'novo_pedido', id: null }
  if (path.startsWith('/editar-pedido')) {
    const partes = path.split('/')
    const id = partes[2] || null
    return { pagina: 'editar_pedido', id }
  }
  return { pagina: 'pedidos', id: null }
}

function extrairTokensBuscaMultipla(termoBusca) {
  if (!termoBusca || !termoBusca.trim()) return []
  const raw = termoBusca.trim()

  // 1. Separadores explícitos: vírgula, ponto e vírgula, pipe, barra ou quebra de linha
  if (/[,;|/\n]/.test(raw)) {
    return raw
      .split(/[,;|/\n]+/)
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)
  }

  // 2. Múltiplos números ou códigos de pedidos (ex: '6070 6071 6072' ou '#6070 #6071')
  const palavras = raw.split(/\s+/).map(p => p.trim()).filter(Boolean)
  const saoMultiplosNumerosOuTags = palavras.length > 1 && palavras.every(p => /^#?\d+[a-z0-9_-]*$/i.test(p))
  if (saoMultiplosNumerosOuTags) {
    return palavras.map(p => p.toLowerCase())
  }

  // 3. Múltiplas mesas (ex: 'mesa 3 mesa 7' ou 'mesa 2 mesa 5')
  if (/\bmesa\b/i.test(raw)) {
    const matchesMesa = raw.match(/\bmesa\s*[:#\-]?\s*\d+\b/gi)
    if (matchesMesa && matchesMesa.length > 1) {
      return matchesMesa.map(m => m.trim().toLowerCase())
    }
  }

  // 4. Caso contrário, retorna o termo completo
  return [raw.toLowerCase()]
}

function atendeTermoBuscaIndividual(pedido, termo, isAbaMesas = false) {
  if (!termo) return true
  const termoLower = termo.toLowerCase().trim()
  if (!termoLower) return true

  // 1. Número do pedido (oficial iFood / Anota Aí / WhatsApp ou interno)
  const numExibicao = String(obterNumeroExibicaoPedido(pedido) || '').toLowerCase()
  const orderNumStr = String(pedido.order_number || '').toLowerCase()
  const idStr = String(pedido.id || '').toLowerCase()
  const dailyStr = String(pedido.daily_order_number || '').toLowerCase()

  if (numExibicao === termoLower || numExibicao.includes(termoLower)) return true
  if (orderNumStr === termoLower || orderNumStr.includes(termoLower)) return true
  if (idStr === termoLower || idStr.includes(termoLower)) return true
  if (dailyStr === termoLower || dailyStr.includes(termoLower)) return true

  if (termoLower.startsWith('#')) {
    const semHash = termoLower.slice(1)
    if (numExibicao.includes(semHash) || orderNumStr.includes(semHash) || idStr.includes(semHash) || dailyStr.includes(semHash)) {
      return true
    }
  }

  // 2. Nome do cliente
  const nomeCliente = (pedido.customer_name || (typeof pedido.notes === 'string' && pedido.notes.match(/Nome:\s*([^\n|]+)/i)?.[1]) || '').toLowerCase()
  if (nomeCliente.includes(termoLower)) return true

  // 3. Endereço e bairro
  const end = (pedido.delivery_address || pedido.customer_address || '').toLowerCase()
  const bairro = (pedido.bairro || '').toLowerCase()
  if (end.includes(termoLower) || bairro.includes(termoLower)) return true

  // 4. Telefone
  const telDigits = (pedido.customer_phone || pedido.phone || '').replace(/\D/g, '')
  const termoDigits = termoLower.replace(/\D/g, '')
  if (termoDigits.length >= 4 && telDigits.includes(termoDigits)) return true

  // 5. Itens do pedido (lanches, bebidas, etc.)
  if (pedido.order_items && Array.isArray(pedido.order_items)) {
    if (pedido.order_items.some(it => {
      const prodName = (it.product_name || it.item_name || it.name || '').toLowerCase()
      return prodName.includes(termoLower)
    })) {
      return true
    }
  }

  // 6. Busca por Mesa (ex: "mesa 3", "mesa 03", "mesa3", "#3", "3", etc.)
  const numMesaStr = extrairNumeroMesaPedido(pedido)
  if (numMesaStr) {
    const numLimpo = numMesaStr.replace(/\D/g, '') // ex: "3"
    const numPad = numLimpo ? numLimpo.padStart(2, '0') : '' // ex: "03"

    if (termoLower === 'mesa' || termoLower === 'mesas') return true

    if (numLimpo) {
      if (
        termoLower === `mesa ${numLimpo}` ||
        termoLower === `mesa ${numPad}` ||
        termoLower === `mesa${numLimpo}` ||
        termoLower === `mesa#${numLimpo}` ||
        termoLower === `mesa #${numLimpo}` ||
        termoLower === `m${numLimpo}` ||
        termoLower === `m ${numLimpo}`
      ) {
        return true
      }

      const matchMesaRegex = termoLower.match(/mesa\s*[:#\-]?\s*(\d+)/i)
      if (matchMesaRegex) {
        const numBuscado = matchMesaRegex[1].replace(/^0+/, '') || '0'
        const numAtual = numLimpo.replace(/^0+/, '') || '0'
        if (numBuscado === numAtual) return true
      }

      if (isAbaMesas) {
        if (termoLower === numLimpo || termoLower === numPad || termoLower === `#${numLimpo}`) return true
      }
    }
  }

  // 7. Observações gerais
  if (typeof pedido.notes === 'string' && pedido.notes.toLowerCase().includes(termoLower)) {
    return true
  }

  return false
}

function atendeTermoBuscaPedido(pedido, termoBusca, isAbaMesas = false) {
  if (!termoBusca || !termoBusca.trim()) return true
  const rawLower = termoBusca.toLowerCase().trim()

  // 1. Testa primeiro o termo completo (garante que buscas com frases exatas funcionem 100%)
  if (atendeTermoBuscaIndividual(pedido, rawLower, isAbaMesas)) {
    return true
  }

  // 2. Extrai múltiplos tokens (ex: múltiplos pedidos "6070 6071 6072" ou listas com vírgula)
  const tokens = extrairTokensBuscaMultipla(termoBusca)
  if (tokens.length <= 1) {
    return false
  }

  // 3. Se houver múltiplos termos, exibe o pedido se atender a QUALQUER UM dos termos (lógica OU)
  for (const token of tokens) {
    if (atendeTermoBuscaIndividual(pedido, token, isAbaMesas)) {
      return true
    }
  }

  return false
}


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

// Retorna rigorosamente os ingredientes que compõem o lanche ou combo para permitir a remoção (sem alterar o valor do pedido)
function adicionarOpcaoSaladaSeAplicavel(lista) {
  if (!lista || lista.length === 0) return []
  const temAlfaceOuTomate = lista.some(([nome]) => {
    const n = nome.toLowerCase()
    return n.includes('alface') || n.includes('tomate')
  })
  const jaTemSalada = lista.some(([nome]) => nome.toLowerCase() === 'salada')
  if (temAlfaceOuTomate && !jaTemSalada) {
    return [...lista, ['Salada', 0]]
  }
  return lista
}

function obterIngredientesDoProduto(nomeProduto) {
  const raw = obterIngredientesRaw(nomeProduto)
  const formatado = raw.map(([ing]) => [ing, 0])
  return adicionarOpcaoSaladaSeAplicavel(formatado)
}

function obterIngredientesRaw(nomeProduto) {
  if (!nomeProduto) return []
  if (isProdutoBebida(nomeProduto)) return []
  
  const nome = nomeProduto.toUpperCase().trim()
  if (nome.includes('PIPOCA') || nome.includes('SAL GROSSO')) return []

  // 1. Cachorro-Quente / Hot Dog
  if (nome.includes('CACHORRO') || nome.includes('HOT DOG') || nome.includes('ESPECIAL DE') || nome.includes('ESPECIAL MISTO')) {
    const list = [
      ['Catupiry', 5],
      ['Bacon', 5],
      ['Queijo', 5],
      ['Salsicha', 2.5],
      ['Batata palha', 1.5],
      ['Maionese', 0],
    ]
    if (nome.includes('CARNE')) list.unshift(['Carne moída 100g', 6])
    else if (nome.includes('FRANGO')) list.unshift(['Frango desfiado 100g', 6])
    else if (nome.includes('PIZZA')) {
      list.unshift(['Presunto', 2])
      list.push(['Tomate', 1])
    } else if (nome.includes('MISTO')) {
      list.unshift(['Carne moída 100g', 6])
      list.unshift(['Frango desfiado 100g', 6])
    }
    return list
  }

  // 2. Variados
  if (nome === 'MISTO QUENTE') {
    return [
      ['Queijo', 5],
      ['Presunto', 2],
    ]
  }
  if (nome === 'AMERICANO') {
    return [
      ['Queijo', 5],
      ['Presunto', 2],
      ['Ovo', 3],
      ['Alface', 1],
      ['Tomate', 1],
      ['Maionese', 0],
    ]
  }
  if (nome === 'BAURU FILÉ') {
    return [
      ['Filé mignon 250g', 20],
      ['Queijo', 5],
      ['Presunto', 2],
      ['Tomate', 1],
      ['Maionese', 0],
    ]
  }

  // 3. Batatas simples (sem recheios para remover)
  if (nome.includes('BATATA NO CONE') || nome.includes('PORÇÃO DE BATATA') || nome.includes('PORCAO DE BATATA')) {
    return []
  }

  // 4. Combos
  if (nome.startsWith('COMBO')) {
    if (nome.includes('DELAS') || nome.includes('TUDO DUPLO') || nome.includes('FAMÍLIA') || nome.includes('FAMILIA')) {
      return [
        ['Catupiry', 5],
        ['Bacon', 5],
        ['Queijo', 5],
        ['Ovo', 3],
        ['Presunto', 2],
        ['Batata palha', 1.5],
        ['Alface', 1],
        ['Tomate', 1],
        ['Hamburguer industrializado', 7],
        ['Maionese', 0],
      ]
    }
    if (nome.includes('CASAL') || nome.includes('TRIPLO')) {
      return [
        ['Catupiry', 5],
        ['Bacon', 5],
        ['Queijo', 5],
        ['Presunto', 2],
        ['Batata palha', 1.5],
        ['Alface', 1],
        ['Tomate', 1],
        ['Hamburguer industrializado', 7],
        ['Maionese', 0],
      ]
    }
    if (nome.includes('KIDS') || nome.includes('AMIGOS')) {
      return [
        ['Catupiry', 5],
        ['Queijo', 5],
        ['Presunto', 2],
        ['Batata palha', 1.5],
        ['Alface', 1],
        ['Tomate', 1],
        ['Hamburguer industrializado', 7],
        ['Maionese', 0],
      ]
    }
    return [
      ['Catupiry', 5],
      ['Bacon', 5],
      ['Queijo', 5],
      ['Ovo', 3],
      ['Presunto', 2],
      ['Batata palha', 1.5],
      ['Alface', 1],
      ['Tomate', 1],
      ['Hamburguer industrializado', 7],
      ['Maionese', 0],
    ]
  }

  // 5. Lanches de carne (Hambúrguer tradicional, artesanal, filé, peito, lombo, calabresa)
  const itens = []

  // Proteína
  if (nome.includes('FILÉ') || nome.includes('FILE')) {
    itens.push(['Filé mignon 250g', 20])
  } else if (nome.includes('PEITO')) {
    itens.push(['Peito frango 250g', 10])
  } else if (nome.includes('LOMBO')) {
    itens.push(['Lombo 250g', 12])
  } else if (nome.includes('CALABRESA')) {
    itens.push(['Calabresa 250g', 10])
  } else if (nome.includes('150G') || nome.includes('300G') || nome.includes('ARTESANAL')) {
    itens.push(['Hamburguer artesanal 150g', 10])
  } else {
    itens.push(['Hamburguer industrializado', 7])
  }

  // Base comum de todos os lanches na Ilda Lanches
  itens.push(['Queijo', 5])
  itens.push(['Presunto', 2])
  itens.push(['Batata palha', 1.5])
  itens.push(['Catupiry', 5])
  itens.push(['Maionese', 0])

  // Ingredientes adicionados conforme o tipo do lanche
  const temSalada = nome.includes('SALADA') || nome.includes('TUDO') || nome.includes('CARGA PESADA')
  const temEgg = nome.includes('EGG') || nome.includes('TUDO') || nome.includes('CARGA PESADA')
  const temBacon = nome.includes('BACON') || nome.includes('TUDO') || nome.includes('CARGA PESADA')

  if (temEgg) {
    itens.push(['Ovo', 3])
  }
  if (temBacon) {
    itens.push(['Bacon', 5])
  }
  if (temSalada) {
    itens.push(['Alface', 1])
    itens.push(['Tomate', 1])
  }

  return itens
}

// Decompõe um order_item separando o valor do lanche base dos adicionais
function decomporItemEAdicionais(item) {
  if (!item) {
    return {
      totalLanchePuro: 0,
      listaAdicionais: [],
      listaRemocoes: [],
      observacaoLimpa: ''
    }
  }
  const notes = (item.notes || '').trim()
  const qty = Number(item.quantity || 1)
  const totalItem = Number(item.total_price || (Number(item.unit_price || 0) * qty) || 0)
  
  let listaAdicionais = []
  let listaRemocoes = []
  let restantes = []

  const ingredientesProd = obterIngredientesDoProduto(item.product_name || item.nome)

  if (item.remocoes && Array.isArray(item.remocoes) && item.remocoes.length > 0) {
    listaRemocoes = item.remocoes.map(r => ({
      nome: r.nome,
      valor: 0
    }))
  }

  let notesParaAdicionais = notes
  if (notes) {
    const linhas = notes.split('\n')
    const linhasSemRemocoes = []
    for (const linha of linhas) {
      const l = linha.trim()
      if (!l) continue
      const matchRem = l.match(/^(?:-\s*)?Sem\s+(.+)$/i)
      if (matchRem) {
        if (!item.remocoes || !item.remocoes.length) {
          let textoRem = matchRem[1].trim()
          const matchVal = textoRem.match(/\(\s*-?\s*R?\$?\s*([\d.,]+)\s*\)/i)
          if (matchVal) {
            textoRem = textoRem.replace(matchVal[0], '').trim()
          }
          listaRemocoes.push({
            nome: textoRem,
            valor: 0
          })
        }
      } else {
        linhasSemRemocoes.push(linha)
      }
    }
    notesParaAdicionais = linhasSemRemocoes.join('\n').trim()
  }
  
  if (item.adicionais && Array.isArray(item.adicionais) && item.adicionais.length > 0) {
    listaAdicionais = item.adicionais.map(ad => ({
      nome: ad.nome,
      quantidade: Number(ad.quantidade || 1),
      valorUnit: Number(ad.valor || 0),
      total: Number(ad.valor || 0) * Number(ad.quantidade || 1)
    }))
    const obsLimpa = notesParaAdicionais.replace(/\n?Adicionais:[\s\S]*$/, '').trim()
    if (obsLimpa) restantes.push(obsLimpa)
  } else if (notesParaAdicionais.includes('Adicionais:')) {
    const parts = notesParaAdicionais.split(/\n?Adicionais:\s*\n?/)
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
  } else if (notesParaAdicionais) {
    const sections = notesParaAdicionais.split(/[|\n]/).map(s => s.trim()).filter(Boolean)
    for (const sec of sections) {
      const chunks = sec.split(/,\s*(?!\d)/).map(c => c.trim()).filter(Boolean)
      for (const chunk of chunks) {
        const isNegativo = /^(sem|não|nao|tira|tirar|remover|remove|pouco|pouca)\b/i.test(chunk) || /\b(sem|não|nao)\s+/i.test(chunk)
        if (isNegativo) {
          const chunkTexto = chunk.replace(/^(?:sem|não|nao|tira|tirar|remover|remove)\s+/i, '').trim()
          const achouIng = ingredientesProd.find(([ing]) => ing.toLowerCase() === chunkTexto.toLowerCase())
          if (achouIng && !listaRemocoes.some(r => r.nome.toLowerCase() === achouIng[0].toLowerCase())) {
            listaRemocoes.push({ nome: achouIng[0], valor: 0 })
          } else {
            restantes.push(chunk)
          }
          continue
        }

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
    listaRemocoes,
    observacaoLimpa: restantes.join(' | ').trim()
  }
}

// Extrai valor pago em dinheiro e troco do pedido (seja pelo notes ou campos de sistema)
function extrairDadosDinheiroETroco(pedido) {
  if (!pedido) return null
  const method = (pedido.payment_method || '').toLowerCase()
  const isDinheiro = method === 'dinheiro' || method.includes('dinheiro')
  const notes = pedido.notes || ''
  const total = Number(pedido.total) || 0

  // 1. Padrão oficial Central: "Paga com R$ 100,00 | Levar Troco: R$ 18,01"
  const matchCentral = notes.match(/Paga(?:ndo)?\s+com\s+R\$\s*([\d.,]+)\s*\|\s*Levar\s+Troco:\s*R\$\s*([\d.,]+)/i)
  if (matchCentral) {
    const valorPago = Number(matchCentral[1].replace(/\./g, '').replace(',', '.')) || 0
    const troco = Number(matchCentral[2].replace(/\./g, '').replace(',', '.')) || 0
    return { isDinheiro: true, valorPago, troco }
  }

  // 2. Padrão "Paga com R$ X" / "Paga com X" / "Vai pagar com X"
  const matchPagaCom = notes.match(/(?:paga(?:ndo)?|vai pagar)\s+com\s+(?:R\$\s*)?([\d.,]+)/i)
  if (matchPagaCom) {
    const valorPago = Number(matchPagaCom[1].replace(/\./g, '').replace(',', '.')) || 0
    const troco = valorPago > total ? valorPago - total : 0
    return { isDinheiro: true, valorPago, troco }
  }

  // 3. Padrão "Troco para R$ X" / "Troco p/ X" / "Troco pra X"
  const matchTrocoPara = notes.match(/troco\s+(?:para|p\/|pra)\s+(?:R\$\s*)?([\d.,]+)/i)
  if (matchTrocoPara) {
    const valorPago = Number(matchTrocoPara[1].replace(/\./g, '').replace(',', '.')) || 0
    const troco = valorPago > total ? valorPago - total : 0
    return { isDinheiro: true, valorPago, troco }
  }

  // 4. Padrão "Levar Troco: R$ Y" / "Troco: R$ Y" / "Troco de R$ Y"
  const matchTroco = notes.match(/(?:levar\s+)?troco(?:\s+de)?:\s*(?:R\$\s*)?([\d.,]+)/i)
  if (matchTroco) {
    const troco = Number(matchTroco[1].replace(/\./g, '').replace(',', '.')) || 0
    const valorPago = total + troco
    return { isDinheiro: true, valorPago, troco }
  }

  if (isDinheiro) {
    return { isDinheiro: true, valorPago: null, troco: null }
  }

  return null
}

// Extrai informações do cliente formatadas para a notinha térmica estilo Anota AI e iFood
function extrairDadosCliente(pedido) {
  if (!pedido) return { temDados: false }

  const nome = (pedido.customer_name || '').trim()
  let telefone = (pedido.customer_phone || pedido.phone || '').trim()
  const telDigits = telefone.replace(/\D/g, '')

  // Identifica código/ramal localizer do iFood se existir
  const matchCod = telefone.match(/\(C[oó]d:?\s*([^\)]+)\)/i) || (pedido.notes || '').match(/\(C[oó]d:?\s*([^\)]+)\)/i)
  const codRamal = matchCod ? matchCod[1].trim() : ''

  if (telDigits.startsWith('0800') || telDigits.startsWith('800')) {
    const ramalExtraido = codRamal || (telDigits.length > 11 ? telDigits.slice(11) : '')
    telefone = `0800 007 0110${ramalExtraido ? ` (Cód: ${ramalExtraido})` : ''}`
  } else if (telDigits.length === 13 && telDigits.startsWith('55')) {
    telefone = `(${telDigits.slice(2, 4)}) ${telDigits.slice(4, 9)}-${telDigits.slice(9)}`
  } else if (telDigits.length === 12 && telDigits.startsWith('55')) {
    telefone = `(${telDigits.slice(2, 4)}) ${telDigits.slice(4, 8)}-${telDigits.slice(8)}`
  } else if (telDigits.length === 11) {
    telefone = `(${telDigits.slice(0, 2)}) ${telDigits.slice(2, 7)}-${telDigits.slice(7)}`
  } else if (telDigits.length === 10) {
    telefone = `(${telDigits.slice(0, 2)}) ${telDigits.slice(2, 6)}-${telDigits.slice(6)}`
  }

  let enderecoBruto = (pedido.delivery_address || pedido.customer_address || '').trim()
  let bairro = (pedido.bairro || '').trim()
  let complemento = ''
  let referencia = ''

  // Extrai complemento se houver (ex: "(Apto 102)" ou "(Fundos)")
  const matchComp = enderecoBruto.match(/\(([^)]+)\)/)
  if (matchComp && matchComp[1]) {
    complemento = matchComp[1].trim()
    enderecoBruto = enderecoBruto.replace(matchComp[0], '').trim()
  }

  // Extrai referência se houver (ex: "Ref: Perto do mercado")
  const matchRef = enderecoBruto.match(/(?:Ref|Ponto de Refer[êe]ncia):\s*([^,]+)/i)
  if (matchRef && matchRef[1]) {
    referencia = matchRef[1].trim()
    enderecoBruto = enderecoBruto.replace(matchRef[0], '').trim()
  }

  // Extrai bairro se estiver anexado ao endereço (ex: "Rua X, 123 - Centro" ou "Rua X, 123 - Bairro Centro")
  if (!bairro && enderecoBruto) {
    const matchExplicit = enderecoBruto.match(/[-,\s]*Bairro:\s*([^,-]+)/i)
    if (matchExplicit && matchExplicit[1]) {
      bairro = matchExplicit[1].trim()
      enderecoBruto = enderecoBruto.replace(/[-,\s]*Bairro:\s*[^,-]+/i, '').trim()
    } else {
      const matchDash = enderecoBruto.match(/\s*-\s*([^,-]+?)(?:,\s*Bady Bassitt|$)/i)
      if (matchDash && matchDash[1]) {
        bairro = matchDash[1].trim()
        enderecoBruto = enderecoBruto.replace(/\s*-\s*[^,-]+?(?:,\s*Bady Bassitt|$)/i, '').trim()
      }
    }
  } else if (bairro && enderecoBruto) {
    enderecoBruto = enderecoBruto.replace(/[-,\s]*Bairro:\s*[^,-]+/i, '').trim()
  }

  // Se ainda não achou bairro e o endereço tem 3 partes separadas por vírgula (ex: "Rua Castro Alves, 123, Centro")
  if (!bairro && enderecoBruto) {
    const partes = enderecoBruto.split(',').map(p => p.trim()).filter(Boolean)
    if (partes.length >= 3) {
      bairro = partes[partes.length - 1]
      enderecoBruto = partes.slice(0, partes.length - 1).join(', ')
    }
  }

  // Limpa cidade de sobra e vírgulas soltas
  enderecoBruto = enderecoBruto
    .replace(/,\s*Bady Bassitt/i, '')
    .replace(/(?:,\s*)+/g, ', ')
    .replace(/^(?:,\s*)+|(?:,\s*)+$/g, '')
    .trim()

  if (!enderecoBruto && !bairro && pedido.delivery_address) {
    enderecoBruto = pedido.delivery_address.trim()
  }

  let obs = (pedido.notes || '')
    .replace(/\|?\s*💰\s*DINHEIRO\s*\([^)]*\)/gi, '')
    .replace(/\|?\s*troco\s+(?:para|p\/|pra|de)?\s*[^|]+/gi, '')
    .replace(/\|?\s*recebedor:\s*[^|]+/gi, '')
    .replace(/\[MESA\s*\d+\]/gi, '')
    .replace(/\[SEM MESA\]/gi, '')
    .replace(/\[PEDIDO\s*#?[A-Za-z0-9_-]+\]/gi, '')
    .replace(/^Obs:\s*/i, '')
    .trim()
    .replace(/\|\s*\|/g, '|')
    .replace(/^[\s|]+|[\s|]+$/g, '')
    .trim()

  if (
    obs.toLowerCase() === 'none' ||
    obs.toLowerCase() === 'null' ||
    obs.toLowerCase() === 'undefined' ||
    obs === '-' ||
    obs.toLowerCase() === 'nenhum' ||
    obs.toLowerCase() === 'nenhuma'
  ) {
    obs = ''
  }

  const isDelivery = pedido.order_type === 'delivery' || Boolean(pedido.manual_delivery) || Boolean(enderecoBruto)
  const mesaNum = extrairNumeroMesaPedido(pedido)
  const isMesa = pedido.order_type === 'dine_in' || pedido.source === 'table' || Boolean(pedido.table_id) || Boolean(mesaNum)

  const isLevar = pedido.order_type === 'pickup' || 
                  pedido.source === 'retirada' ||
                  String(pedido.order_type || '').toLowerCase().includes('pickup') ||
                  String(pedido.source || '').toLowerCase().includes('retirada')

  const temDados = Boolean(nome || telefone || enderecoBruto || bairro || complemento || referencia || obs || mesaNum || (isMesa && mesaNum) || isDelivery)

  return {
    nome,
    telefone,
    endereco: enderecoBruto,
    entrega: enderecoBruto,
    bairro,
    complemento,
    referencia,
    obs,
    mesa: mesaNum ? `Mesa ${mesaNum}` : null,
    isDelivery,
    isLevar,
    temDados
  }
}

// Componente isolado para impressão térmica ultra rápida
// Desacoplado do componente App para disparar window.print() em < 20ms sem re-renderizar 12.000 linhas de código
function ThermalReceiptArea() {
  const [pedidoParaImprimir, setPedidoParaImprimir] = useState(null)
  const filaImpressaoRef = useRef([])

  useEffect(() => {
    const handleDispararImpressao = (evt) => {
      const pedido = evt.detail?.pedido || evt.detail
      if (!pedido) return
      setPedidoParaImprimir(atual => {
        if (atual) {
          filaImpressaoRef.current.push(pedido)
          return atual
        }
        return pedido
      })
    }

    const handleLimparImpressao = () => {
      if (filaImpressaoRef.current.length > 0) {
        const proximo = filaImpressaoRef.current.shift()
        setPedidoParaImprimir(proximo)
      } else {
        setPedidoParaImprimir(null)
      }
    }

    window.addEventListener('__executarImpressaoCupom', handleDispararImpressao)
    window.addEventListener('afterprint', handleLimparImpressao)

    return () => {
      window.removeEventListener('__executarImpressaoCupom', handleDispararImpressao)
      window.removeEventListener('afterprint', handleLimparImpressao)
    }
  }, [])

  useLayoutEffect(() => {
    if (!pedidoParaImprimir) return

    let rafId = null
    const executarImpressao = () => {
      try {
        window.print()
      } catch (err) {
        console.error('[ERRO WINDOW.PRINT]', err)
      }
    }

    // Com useLayoutEffect neste componente isolado, o DOM do cupom já está 100% montado sincronicamente!
    // requestAnimationFrame executa no frame de tela mais imediato (~16ms)
    rafId = requestAnimationFrame(executarImpressao)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [pedidoParaImprimir])

  return (
    <div id="thermal-receipt-area" className="thermal-receipt" style={{ marginLeft: '0', paddingLeft: '2mm', paddingRight: '2mm', width: '71mm', boxSizing: 'border-box', fontFamily: "Arial, Helvetica, 'Segoe UI', Roboto, sans-serif", fontSize: '13px', color: '#000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      {pedidoParaImprimir && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          {/* LINHAS DUPLAS E MODALIDADE DE PEDIDO COM DESTAQUE CLARO DA MESA E CANAL */}
          <div style={{ borderTop: '3px double #000', borderBottom: '3px double #000', padding: '5px 0', margin: '4px 0 6px 0', fontSize: '17px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {(() => {
              const src = String(pedidoParaImprimir.source || '').toLowerCase()
              if (src === 'ifood' || src.includes('ifood')) {
                return pedidoParaImprimir.order_type === 'pickup' ? 'IFOOD (RETIRADA)' : 'IFOOD (ENTREGA)'
              }
              if (src === 'anota_ai' || src.includes('anota')) {
                return pedidoParaImprimir.order_type === 'pickup' ? 'ANOTA AI (RETIRADA)' : 'ANOTA AI (ENTREGA)'
              }
              if (pedidoParaImprimir.order_type === 'delivery' || pedidoParaImprimir.manual_delivery) {
                return 'PARA ENTREGA'
              }

              const isLevar = pedidoParaImprimir.order_type === 'pickup' || 
                              pedidoParaImprimir.source === 'retirada' ||
                              String(pedidoParaImprimir.order_type || '').toLowerCase().includes('pickup') ||
                              String(pedidoParaImprimir.source || '').toLowerCase().includes('retirada')

              const mesaNum = pedidoParaImprimir.tables_restaurant?.number || 
                              pedidoParaImprimir.mesa || 
                              (pedidoParaImprimir.notes?.match(/\[MESA\s*(\d+)\]/i)?.[1]) ||
                              (pedidoParaImprimir.notes?.match(/Mesa\s*[:#]?\s*(\d+)/i)?.[1]) || null

              if (isLevar) {
                return mesaNum ? `MESA ${mesaNum} (LEVAR)` : 'LEVAR'
              }

              if (mesaNum) {
                return `MESA ${mesaNum} (LOCAL)`
              }
              if (pedidoParaImprimir.order_type === 'dine_in' || pedidoParaImprimir.source === 'table') {
                return 'CONSUMO NO LOCAL'
              }
              return 'LEVAR'
            })()}
          </div>

          {/* DATA, HORA E NOME DO ESTABELECIMENTO */}
          <div style={{ fontSize: '12px', margin: '3px 0 1px 0' }}>
            {new Date(pedidoParaImprimir.created_at || Date.now()).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}{' '}
            {new Date(pedidoParaImprimir.created_at || Date.now()).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', margin: '2px 0 6px 0' }}>
            Ilda Lanche
          </div>

          {/* LINHA DUPLA */}
          <div style={{ borderBottom: '3px double #000', margin: '6px 0' }} />

          {/* NÚMERO DO PEDIDO */}
          <div style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0' }}>
            {(() => {
              const tagPedido = pedidoParaImprimir.notes?.match(/\[PEDIDO\s*#?([A-Za-z0-9_-]+)\]/i)?.[1]
              if (tagPedido) {
                return `Pedido #${tagPedido}`
              }
              return `Pedido #${obterNumeroExibicaoPedido(pedidoParaImprimir)}`
            })()}
          </div>

          {/* LINHA TRACEJADA */}
          <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

          {/* SEÇÃO ITENS */}
          <div style={{ textAlign: 'left', margin: '6px 0' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>Itens</div>
            {(pedidoParaImprimir.order_items || []).map((item, idx) => {
              const info = decomporItemEAdicionais(item)
              return (
                <div key={idx} style={{ marginBottom: '6px' }}>
                  {/* Item principal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ paddingRight: '4px' }}>({item.quantity}) {item.product_name}</span>
                    <span style={{ fontWeight: 'bold' }}>R$ {Number(info.totalLanchePuro || 0).toFixed(2).replace('.', ',')}</span>
                  </div>

                  {/* Adicionais */}
                  {(info.listaAdicionais || []).map((ad, aIdx) => (
                    <div key={aIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingLeft: '8px' }}>
                      <span>+ {ad.quantidade || 1}x {ad.nome}</span>
                      <span>R$ {Number(ad.total || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}

                  {/* Remoções */}
                  {(info.listaRemocoes || []).map((rem, rIdx) => (
                    <div key={rIdx} style={{ fontSize: '12px', paddingLeft: '8px' }}>
                      - Sem {rem.nome}
                    </div>
                  ))}

                  {/* Observação do item */}
                  {info.observacaoLimpa && (
                    <div style={{ fontSize: '12px', fontStyle: 'italic', paddingLeft: '8px' }}>
                      Obs: {info.observacaoLimpa}
                    </div>
                  )}

                  {/* Separador tracejado curto entre itens */}
                  {idx < (pedidoParaImprimir.order_items.length - 1) && (
                    <div style={{ textAlign: 'center', margin: '5px 0', fontSize: '11px', letterSpacing: '1px' }}>
                      ----------
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* SEÇÃO CLIENTE */}
          {(() => {
            const dadosCliente = extrairDadosCliente(pedidoParaImprimir)
            if (!dadosCliente.temDados && !pedidoParaImprimir.customer_name) {
              return <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />
            }

            return (
              <>
                <div style={{ borderTop: '1px dashed #000', margin: '6px 0 5px 0' }} />
                <div style={{ textAlign: 'left', fontSize: '13px', lineHeight: 1.4, margin: '4px 0' }}>
                  <div style={{ fontWeight: '900', fontSize: '14px', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Cliente
                  </div>
                  {dadosCliente.nome ? (
                    <div><span style={{ fontWeight: 'bold' }}>Nome:</span> {dadosCliente.nome}</div>
                  ) : null}
                  {dadosCliente.telefone ? (
                    <div><span style={{ fontWeight: 'bold' }}>Telefone:</span> {dadosCliente.telefone}</div>
                  ) : null}
                  {dadosCliente.mesa ? (
                    <div><span style={{ fontWeight: 'bold' }}>Mesa:</span> {dadosCliente.mesa}</div>
                  ) : null}
                  {dadosCliente.endereco ? (
                    <div><span style={{ fontWeight: 'bold' }}>Rua:</span> {dadosCliente.endereco}</div>
                  ) : null}
                  {dadosCliente.bairro ? (
                    <div><span style={{ fontWeight: 'bold' }}>Bairro:</span> {dadosCliente.bairro}</div>
                  ) : null}
                  {dadosCliente.complemento ? (
                    <div><span style={{ fontWeight: 'bold' }}>Complemento:</span> {dadosCliente.complemento}</div>
                  ) : null}
                  {dadosCliente.referencia ? (
                    <div><span style={{ fontWeight: 'bold' }}>Referência:</span> {dadosCliente.referencia}</div>
                  ) : null}
                  {dadosCliente.obs ? (
                    <div style={{ marginTop: '2px' }}><span style={{ fontWeight: 'bold' }}>Obs:</span> {dadosCliente.obs}</div>
                  ) : null}
                </div>

                {/* SEPARADOR TRACEJADO ENTRE CLIENTE E PAGAMENTO */}
                <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />
              </>
            )
          })()}

          {/* SEÇÃO PAGAMENTO */}
          <div style={{ textAlign: 'left', margin: '6px 0' }}>
            {(() => {
              // Não exibe se estiver marcado como pago ou se a forma de pagamento não foi selecionada
              const isPago = String(pedidoParaImprimir.payment_status || '').toLowerCase() === 'paid' ||
                             Boolean(pedidoParaImprimir.foiPago) ||
                             Boolean(pedidoParaImprimir.paid) ||
                             String(pedidoParaImprimir.payment_method || '').toLowerCase() === 'pago'
              const formaRaw = (pedidoParaImprimir.payment_method || '').trim()
              const fLow = formaRaw.toLowerCase()
              const temForma = formaRaw && 
                fLow !== 'não informada' && 
                fLow !== 'nao informada' && 
                fLow !== 'null' && 
                fLow !== 'undefined' && 
                fLow !== 'archived' && 
                fLow !== 'pago'

              if (isPago || !temForma) {
                return null
              }

              let formaNome = formaRaw
              if (fLow === 'dinheiro') formaNome = 'Dinheiro'
              else if (fLow === 'pix') formaNome = 'Pix'
              else if (fLow === 'cartao' || fLow === 'cartão') formaNome = 'Cartão'

              return (
                <>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '3px' }}>Pagamento</div>
                  <div style={{ fontSize: '13px' }}>
                    Forma de Pagamento: {formaNome}
                  </div>

                  {/* LINHA TRACEJADA */}
                  <div style={{ borderBottom: '1px dashed #000', margin: '5px 0' }} />
                </>
              )
            })()}

            {/* COBRANÇA DO CLIENTE */}
            <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', margin: '3px 0' }}>
              {(() => {
                const isPago = (String(pedidoParaImprimir.payment_status || '').toLowerCase() === 'paid' || Boolean(pedidoParaImprimir.foiPago) || Boolean(pedidoParaImprimir.paid) || String(pedidoParaImprimir.payment_method || '').toLowerCase() === 'pago')
                if (isPago) {
                  const src = String(pedidoParaImprimir.source || '').toLowerCase()
                  if (src === 'ifood' || src.includes('ifood')) return '* Já Pago no iFood *'
                  if (src === 'anota_ai' || src.includes('anota')) return '* Já Pago no Anota AI *'
                  return '* Já Pago *'
                }
                return '* Cobrar do cliente *'
              })()}
            </div>

            {/* SEPARADOR TRACEJADO ENTRE COBRANÇA E TOTAIS */}
            <div style={{ borderBottom: '1px dashed #000', margin: '5px 0' }} />

            {/* TOTAIS DO PEDIDO */}
            <div style={{ fontSize: '13px', lineHeight: 1.45, marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 'bold' }}>R$ {Number(pedidoParaImprimir.subtotal || 0).toFixed(2).replace('.', ',')}</span>
              </div>
              {(Number(pedidoParaImprimir.delivery_fee || 0) > 0 || pedidoParaImprimir.order_type === 'delivery' || pedidoParaImprimir.manual_delivery || Boolean(pedidoParaImprimir.delivery_address)) && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Taxa de Entrega:</span>
                  <span style={{ fontWeight: 'bold' }}>R$ {Number(pedidoParaImprimir.delivery_fee || 0).toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>R$ {Number(pedidoParaImprimir.total || 0).toFixed(2).replace('.', ',')}</span>
              </div>

              {/* INFORMAÇÕES DE TROCO (QUANDO DINHEIRO E NÃO PAGO) */}
              {(() => {
                if (String(pedidoParaImprimir.payment_status || '').toLowerCase() === 'paid' || Boolean(pedidoParaImprimir.foiPago) || Boolean(pedidoParaImprimir.paid) || String(pedidoParaImprimir.payment_method || '').toLowerCase() === 'pago') return null
                const method = (pedidoParaImprimir.payment_method || '').toLowerCase()
                if (method === 'dinheiro' || method.includes('dinheiro')) {
                  const dadosDin = extrairDadosDinheiroETroco(pedidoParaImprimir)
                  if (dadosDin && dadosDin.valorPago !== null && dadosDin.valorPago > 0) {
                    return (
                      <div style={{ marginTop: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Troco para:</span>
                          <span style={{ fontWeight: 'bold' }}>
                            {dadosDin.troco > 0 
                              ? `R$ ${dadosDin.valorPago.toFixed(2).replace('.', ',')}` 
                              : 'Nao precisa'}
                          </span>
                        </div>
                        {dadosDin.troco > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900' }}>
                            <span>Levar de troco:</span>
                            <span>R$ {dadosDin.troco.toFixed(2).replace('.', ',')}</span>
                          </div>
                        )}
                      </div>
                    )
                  } else {
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span>Troco para:</span>
                        <span style={{ fontWeight: 'bold' }}>Nao precisa</span>
                      </div>
                    )
                  }
                }
                return null
              })()}
            </div>

            {/* LINHA TRACEJADA FINAL */}
            <div style={{ borderBottom: '1px dashed #000', margin: '6px 0 0 0' }} />
          </div>
        </div>
      )}
    </div>
  )
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

function formatarSegundosParaHora(segundos) {
  if (!segundos || segundos <= 0) return '00:00:00'
  const s = Math.floor(segundos)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const API_BASE_URL = ''

function App() {
  const [session, setSession] = useState(() => {
    try {
      const cached = localStorage.getItem('ilda_central_session_backup')
      if (cached) return JSON.parse(cached)
    } catch (_) {}
    return null
  })
  const [carregando, setCarregando] = useState(true)

  // ESTADOS DO STATUS DA LOJA (FECHAR / REABRIR)
  const [storeStatus, setStoreStatus] = useState({
    isOpen: false,
    remainingSeconds: 0,
    closedUntil: null,
    channels: [],
    reason: 'Verificando status...'
  })
  const [storeRemainingSeconds, setStoreRemainingSeconds] = useState(0)
  const [modalFecharLojaAberto, setModalFecharLojaAberto] = useState(false)
  const [modalReabrirLojaAberto, setModalReabrirLojaAberto] = useState(false)
  const [canalFechamento, setCanalFechamento] = useState('all') // 'all' | 'anota_ai' | 'ifood'
  const [canalAbertura, setCanalAbertura] = useState('all') // 'all' | 'ifood' | 'anota_ai'
  const [tempoFechamento, setTempoFechamento] = useState(15) // minutos
  const [motivoFechamento, setMotivoFechamento] = useState('Muitos pedidos')
  const [salvandoStatusLoja, setSalvandoStatusLoja] = useState(false)
  const isAnotaAiOpen = storeStatus.anotaAi ? storeStatus.anotaAi.isOpen : (storeStatus.channels ? storeStatus.channels.anota_ai?.isOpen : !storeStatus.closedChannels?.includes('anota_ai'))
  const isIfoodOpen = storeStatus.ifood ? storeStatus.ifood.isOpen : (storeStatus.channels ? storeStatus.channels.ifood?.isOpen : !storeStatus.closedChannels?.includes('ifood'))

  // Sincronização periódica do status da loja
  useEffect(() => {
    let isMounted = true

    async function consultarStatusLoja() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/store/status`)
        if (res.ok) {
          const text = await res.text()
          try {
            const data = JSON.parse(text)
            if (isMounted) {
              setStoreStatus(data)
              setStoreRemainingSeconds(data.remainingSeconds || 0)
            }
          } catch (pe) {
            console.error('Resposta não-JSON em /api/store/status:', text.slice(0, 100))
          }
        }
      } catch (err) {
        // Silencioso em caso de falha temporária de rede
      }
    }

    consultarStatusLoja()
    const intervalStatus = setInterval(consultarStatusLoja, 15000)

    return () => {
      isMounted = false
      clearInterval(intervalStatus)
    }
  }, [])

  // Cronômetro regressivo local a cada 1 segundo quando fechada
  useEffect(() => {
    if (storeStatus.isOpen || storeRemainingSeconds <= 0) return

    const timer = setInterval(() => {
      setStoreRemainingSeconds(prev => {
        if (prev <= 1) {
          fetch(`${API_BASE_URL}/api/store/status`)
            .then(r => r.json())
            .then(data => {
              setStoreStatus(data)
              setStoreRemainingSeconds(data.remainingSeconds || 0)
            })
            .catch(() => {})
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [storeStatus.isOpen, storeRemainingSeconds])

  // Ações de fechar e reabrir
  const handleConfirmarFecharLoja = async () => {
    setSalvandoStatusLoja(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/store/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: canalFechamento,
          durationMinutes: Number(tempoFechamento),
          reason: motivoFechamento
        })
      })
      const text = await res.text()
      let data = {}
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(text.slice(0, 120) || 'Resposta inválida do servidor')
      }

      if (data.ok || data.success) {
        setStoreStatus(data.status)
        setStoreRemainingSeconds(data.status?.remainingSeconds || (Number(tempoFechamento) * 60) || 0)
        setModalFecharLojaAberto(false)
      } else {
        alert('Não foi possível fechar a loja: ' + (data.error || 'Erro desconhecido'))
      }
    } catch (err) {
      alert('Erro de conexão ao tentar fechar a loja: ' + err.message)
    } finally {
      setSalvandoStatusLoja(false)
    }
  }

  const handleConfirmarReabrirLoja = async () => {
    setSalvandoStatusLoja(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/store/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: canalAbertura })
      })
      const text = await res.text()
      let data = {}
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(text.slice(0, 120) || 'Resposta inválida do servidor')
      }

      if (data.ok || data.success) {
        setStoreStatus(data.status || { isOpen: true, remainingSeconds: 0 })
        setStoreRemainingSeconds(data.status?.remainingSeconds || 0)
        setModalReabrirLojaAberto(false)
      } else {
        alert('Não foi possível reabrir a loja: ' + (data.error || 'Erro desconhecido'))
      }
    } catch (err) {
      alert('Erro de conexão ao tentar reabrir a loja: ' + err.message)
    } finally {
      setSalvandoStatusLoja(false)
    }
  }

  const [somAtivado, setSomAtivado] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return false
    }
    return localStorage.getItem('som_notificacao_ilda') !== 'false'
  })
  const [agoraTempoDecorrido, setAgoraTempoDecorrido] = useState(() => Date.now())

  useEffect(() => {
    // Atualiza automaticamente os minutos e horas decorridos a cada 10 segundos sem reload e sem mover o scroll
    const intervaloRelogio = setInterval(() => {
      setAgoraTempoDecorrido(Date.now())
    }, 10000)
    return () => clearInterval(intervaloRelogio)
  }, [])

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenhaLogin, setMostrarSenhaLogin] = useState(false)
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const [isSmallScreen, setIsSmallScreen] = useState(() => typeof window !== 'undefined' ? (window.innerWidth <= 768 || isMobile) : false)

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth <= 768 || isMobile)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])
  const autoPrint = !isMobile

  const [novoPedido, setNovoPedido] = useState(() => obterRotaAtual().pagina === 'novo_pedido')
  const [origem, setOrigem] = useState('mesa')
  const [tipoRecebimentoCriacao, setTipoRecebimentoCriacao] = useState('comer_no_local')
  const [mesa, setMesa] = useState('')
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [bairroCliente, setBairroCliente] = useState('')
  const [enderecoEntrega, setEnderecoEntrega] = useState('')
  const [numeroEntrega, setNumeroEntrega] = useState('')
  const [taxaEntrega, setTaxaEntrega] = useState('')
  const [observacaoSemMesa, setObservacaoSemMesa] = useState('')
  const [observacaoGeral, setObservacaoGeral] = useState('')
  const [autocompleteItemAberto, setAutocompleteItemAberto] = useState(null)
  const [removerItemAberto, setRemoverItemAberto] = useState(null)
  const [termoRemover, setTermoRemover] = useState('')
  const [removerEdicaoItemAberto, setRemoverEdicaoItemAberto] = useState(null)
  const [termoRemoverEdicao, setTermoRemoverEdicao] = useState('')
  const [adicionalItemAberto, setAdicionalItemAberto] = useState(null)
  const [termoAdicional, setTermoAdicional] = useState('')
  const [adicionalEdicaoItemAberto, setAdicionalEdicaoItemAberto] = useState(null)
  const [termoAdicionalEdicao, setTermoAdicionalEdicao] = useState('')

  // Fecha o popover dos botões remover e adicional ao clicar em qualquer local fora dele na página
  useEffect(() => {
    if (!removerItemAberto && !removerEdicaoItemAberto && !adicionalItemAberto && !adicionalEdicaoItemAberto) return

    function handleCliqueFora(e) {
      if (!e.target.closest('.container-remover-popover') && !e.target.closest('.container-adicional-popover')) {
        setRemoverItemAberto(null)
        setTermoRemover('')
        setRemoverEdicaoItemAberto(null)
        setTermoRemoverEdicao('')
        setAdicionalItemAberto(null)
        setTermoAdicional('')
        setAdicionalEdicaoItemAberto(null)
        setTermoAdicionalEdicao('')
      }
    }

    document.addEventListener('pointerdown', handleCliqueFora)
    return () => {
      document.removeEventListener('pointerdown', handleCliqueFora)
    }
  }, [removerItemAberto, removerEdicaoItemAberto, adicionalItemAberto, adicionalEdicaoItemAberto])

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
  const [bairroEdicao, setBairroEdicao] = useState('')
  const [infoDistanciaEdicao, setInfoDistanciaEdicao] = useState(null)
  const [calculandoDistanciaEdicao, setCalculandoDistanciaEdicao] = useState(false)

  const [tipoRecebimento, setTipoRecebimento] = useState('retirada')
  const [foiPagoEdicao, setFoiPagoEdicao] = useState(false)
  
  // Forma de pagamento e cálculo de troco para dinheiro
  const [formaPagamentoCriacao, setFormaPagamentoCriacao] = useState('')
  const [valorPagoDinheiroCriacao, setValorPagoDinheiroCriacao] = useState('')
  const [formaPagamentoEdicao, setFormaPagamentoEdicao] = useState('')
  const [valorPagoDinheiroEdicao, setValorPagoDinheiroEdicao] = useState('')

  const [carrinho, setCarrinho] = useState([])

    const [pedidos, setPedidos] = useState(() => {
    try {
      const salvo = localStorage.getItem('pedidos_cache_ilda')
      if (salvo) {
        const parsed = JSON.parse(salvo)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return []
  })
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [itemInspecionado, setItemInspecionado] = useState(null)
  const pedidosImpressosIdsRef = useRef(new Set((() => {
    try {
      const salvo = localStorage.getItem('pedidos_impressos_ids_ilda')
      return salvo ? JSON.parse(salvo) : []
    } catch {
      return []
    }
  })()))
  const isFirstLoadPedidosRef = useRef(true)

  const registrarPedidoImpresso = (idOuNum) => {
    if (!idOuNum) return
    pedidosImpressosIdsRef.current.add(String(idOuNum))
    try {
      const arr = Array.from(pedidosImpressosIdsRef.current).slice(-200)
      localStorage.setItem('pedidos_impressos_ids_ilda', JSON.stringify(arr))
    } catch (e) {}
  }

  const [carregandoPedidos, setCarregandoPedidos] = useState(() => {
    try {
      const salvo = localStorage.getItem('pedidos_cache_ilda')
      if (salvo) {
        const parsed = JSON.parse(salvo)
        if (Array.isArray(parsed) && parsed.length > 0) return false
      }
    } catch (e) {}
    return true
  })
  const [filtroOrigem, setFiltroOrigem] = useState(() => {
    const rota = obterRotaAtual()
    if (rota.pagina === 'mesas') return 'table'
    if (rota.pagina === 'entregues') return 'entregues'
    if (rota.pagina === 'relatorios') return 'faturamento'
    if (rota.pagina === 'configuracoes') return 'configuracoes'
    return 'todos'
  })
  const [subAbaRelatorio, setSubAbaRelatorio] = useState('faturamento') // 'faturamento' | 'controle'
  const [buscaItemControle, setBuscaItemControle] = useState('')
  const [filtroCategoriaControle, setFiltroCategoriaControle] = useState('todos') // 'todos' | 'lanches' | 'combos' | 'bebidas' | 'outros'
  const [pedidosAtivosVistos, setPedidosAtivosVistos] = useState(() => {
    try {
      const salvo = localStorage.getItem('pedidos_ativos_vistos_ids')
      return salvo ? JSON.parse(salvo) : []
    } catch {
      return []
    }
  })
  const [pedidosMesasVistos, setPedidosMesasVistos] = useState(() => {
    try {
      const salvo = localStorage.getItem('pedidos_mesas_vistos_ids')
      return salvo ? JSON.parse(salvo) : []
    } catch {
      return []
    }
  })

  // Sincronização em tempo real entre o estado interno e a URL do navegador
  useEffect(() => {
    let urlDestino = '/pedidos'
    if (novoPedido) {
      urlDestino = '/novo-pedido'
    } else if (pedidoSelecionado) {
      const numExib = obterNumeroExibicaoPedido(pedidoSelecionado)
      urlDestino = numExib ? `/editar-pedido/${numExib}` : '/editar-pedido'
    } else if (filtroOrigem === 'table') {
      urlDestino = '/mesas'
    } else if (filtroOrigem === 'entregues') {
      urlDestino = '/entregues'
    } else if (filtroOrigem === 'faturamento') {
      urlDestino = '/relatorios'
    } else if (filtroOrigem === 'configuracoes') {
      urlDestino = '/configuracoes'
    } else {
      urlDestino = '/pedidos'
    }

    if (window.location.pathname !== urlDestino) {
      window.history.pushState({ urlDestino }, '', urlDestino)
    }
  }, [novoPedido, pedidoSelecionado, filtroOrigem])

  // Escuta os botões "Voltar" e "Avançar" do navegador (Histórico)
  useEffect(() => {
    function handlePopState() {
      const rota = obterRotaAtual()
      if (rota.pagina === 'novo_pedido') {
        setNovoPedido(true)
        setPedidoSelecionado(null)
      } else if (rota.pagina === 'editar_pedido') {
        setNovoPedido(false)
        if (rota.id && pedidos && pedidos.length > 0) {
          const encontrado = pedidos.find(p => String(obterNumeroExibicaoPedido(p)) === String(rota.id) || String(p.id) === String(rota.id))
          if (encontrado) setPedidoSelecionado(encontrado)
        }
      } else {
        setNovoPedido(false)
        setPedidoSelecionado(null)
        if (rota.pagina === 'mesas') setFiltroOrigem('table')
        else if (rota.pagina === 'entregues') setFiltroOrigem('entregues')
        else if (rota.pagina === 'relatorios') setFiltroOrigem('faturamento')
        else if (rota.pagina === 'configuracoes') setFiltroOrigem('configuracoes')
        else setFiltroOrigem('todos')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [pedidos])

  // Se o usuário entrou diretamente por URL em /editar-pedido/:id e os pedidos carregaram
  useEffect(() => {
    const rota = obterRotaAtual()
    if (rota.pagina === 'editar_pedido' && rota.id && !pedidoSelecionado && pedidos && pedidos.length > 0) {
      const encontrado = pedidos.find(p => String(obterNumeroExibicaoPedido(p)) === String(rota.id) || String(p.id) === String(rota.id))
      if (encontrado) {
        setPedidoSelecionado(encontrado)
      }
    }
  }, [pedidos, pedidoSelecionado])
  const [pedidosEntreguesVistos, setPedidosEntreguesVistos] = useState(() => {
    try {
      const salvo = localStorage.getItem('pedidos_entregues_vistos_ids')
      return salvo ? JSON.parse(salvo) : []
    } catch {
      return []
    }
  })
  const [entregasAtivasVistas, setEntregasAtivasVistas] = useState(() => {
    try {
      const salvo = localStorage.getItem('entregas_ativas_vistas_ids')
      return salvo ? JSON.parse(salvo) : []
    } catch {
      return []
    }
  })
  const [filtroTipo, setFiltroTipo] = useState('todos') // 'todos', 'delivery', 'retirada', 'table'
  const [filtroEntregador, setFiltroEntregador] = useState('todos') // 'todos', 'renan', 'felipe'
  const [filtroPeriodoEntregues, setFiltroPeriodoEntregues] = useState('hoje') // 'hoje', '7dias', '30dias'
  const [termoBusca, setTermoBusca] = useState('')
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [sidebarMobile, setSidebarMobile] = useState(false)
  const [colunaMobileAtiva, setColunaMobileAtiva] = useState('todas') // 'todas' | 'producao' | 'pronto'
  const [buscaMobileAberta, setBuscaMobileAberta] = useState(false)
  const [autoAceitar, setAutoAceitar] = useState(() => localStorage.getItem('auto_aceitar_pedidos') === 'true')

  const [nomeUsuario, setNomeUsuario] = useState('')
  const [emailUsuario, setEmailUsuario] = useState('')
  const [isDriver, setIsDriver] = useState(false)

  // Configurações, Histórico e Perfis dos Donos
  const [subAbaConfig, setSubAbaConfig] = useState('geral') // 'geral' | 'todos_pedidos'
  const [filtroPeriodoTodosPedidos, setFiltroPeriodoTodosPedidos] = useState('30dias') // '30dias' | '7dias' | 'hoje'
  const [modalDetalhesFat, setModalDetalhesFat] = useState(null)
  const [modalDetalhesEntregador, setModalDetalhesEntregador] = useState(null)
  const [modalListaPedidosPagamento, setModalListaPedidosPagamento] = useState(null)
  const [buscaPedidosModal, setBuscaPedidosModal] = useState('')
  const [notificacaoFlutuante, setNotificacaoFlutuante] = useState(null)
  const canalRealtimeRef = useRef(null)

  function exibirNotificacaoFlutuante(mensagem, tipo = 'sucesso') {
    setNotificacaoFlutuante({ mensagem, tipo })
    setTimeout(() => {
      setNotificacaoFlutuante(null)
    }, 3500)
  }

  const [isPendingPeriodo, startTransitionPeriodo] = useTransition()
  const [mostrarTodosProducao, setMostrarTodosProducao] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [msgSenha, setMsgSenha] = useState(null) // { tipo: 'sucesso' | 'erro', texto: '' }
  const [fotoPropria, setFotoPropria] = useState(() => {
    const emailLower = (emailUsuario || '').toLowerCase()
    return localStorage.getItem(`ilda_avatar_${emailLower}`) || ''
  })
  const [emailEditando, setEmailEditando] = useState('')
  const [salvandoEmail, setSalvandoEmail] = useState(false)
  const [msgEmail, setMsgEmail] = useState(null)
  const [menuDespachoLoteAberto, setMenuDespachoLoteAberto] = useState(false)
  const menuDespachoLoteRef = useRef(null)

  useEffect(() => {
    function handleClickFora(e) {
      if (menuDespachoLoteRef.current && !menuDespachoLoteRef.current.contains(e.target)) {
        setMenuDespachoLoteAberto(false)
      }
    }
    if (menuDespachoLoteAberto) {
      document.addEventListener('mousedown', handleClickFora)
      return () => document.removeEventListener('mousedown', handleClickFora)
    }
  }, [menuDespachoLoteAberto])

  useEffect(() => {
    if (emailUsuario) {
      const emailLower = emailUsuario.toLowerCase()
      setFotoPropria(localStorage.getItem(`ilda_avatar_${emailLower}`) || '')
      setEmailEditando(emailUsuario)
    }
  }, [emailUsuario])

  function atualizarFotoPropria(event) {
    const file = event.target.files?.[0]
    if (!file || !emailUsuario) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target.result
      const emailLower = emailUsuario.toLowerCase()
      localStorage.setItem(`ilda_avatar_${emailLower}`, base64)
      setFotoPropria(base64)
      setFotosDonos(prev => ({ ...prev, [emailLower]: base64 }))
      try {
        await supabase.auth.updateUser({
          data: { avatar_url: base64 }
        })
      } catch (err) {
        console.warn('Erro ao sincronizar avatar com Supabase:', err)
      }
    }
    reader.readAsDataURL(file)
  }

  function removerFotoPropria() {
    if (!emailUsuario) return
    const emailLower = emailUsuario.toLowerCase()
    localStorage.removeItem(`ilda_avatar_${emailLower}`)
    setFotoPropria('')
    setFotosDonos(prev => ({ ...prev, [emailLower]: '' }))
    supabase.auth.updateUser({
      data: { avatar_url: '' }
    }).catch(() => {})
  }

  // Ocultar entregas do próprio entregador via localStorage
  const [entregasOcultas, setEntregasOcultas] = useState(() => {
    try {
      const key = `ilda_entregas_ocultas_${session?.user?.id || 'driver'}`
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (session?.user?.id) {
      try {
        const raw = localStorage.getItem(`ilda_entregas_ocultas_${session.user.id}`)
        if (raw) setEntregasOcultas(JSON.parse(raw))
      } catch {}
    }
  }, [session])

  function limparMinhasEntregasDriver() {
    const entregasDoDriver = pedidos.filter(p => p.driver_id === session?.user?.id && p.status === 'completed')
    if (entregasDoDriver.length === 0) {
      alert('Você não possui entregas no histórico para limpar.')
      return
    }
    const confirmar = window.confirm(`Deseja limpar suas entregas finalizadas (${entregasDoDriver.length} entrega(s)) da sua tela?`)
    if (!confirmar) return

    const novosOcultos = Array.from(new Set([...entregasOcultas, ...entregasDoDriver.map(p => p.id)]))
    localStorage.setItem(`ilda_entregas_ocultas_${session?.user?.id}`, JSON.stringify(novosOcultos))
    setEntregasOcultas(novosOcultos)
  }

  async function handleTrocarEmail(e) {
    if (e && e.preventDefault) e.preventDefault()
    setMsgEmail(null)
    if (!emailEditando || !emailEditando.includes('@')) {
      setMsgEmail({ tipo: 'erro', texto: 'Informe um e-mail válido.' })
      return
    }
    if (emailEditando.toLowerCase() === (emailUsuario || '').toLowerCase()) {
      setMsgEmail({ tipo: 'erro', texto: 'O novo e-mail deve ser diferente do e-mail atual.' })
      return
    }
    setSalvandoEmail(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: emailEditando })
      if (error) throw error
      setMsgEmail({ tipo: 'sucesso', texto: 'Confirmação enviada! Verifique sua caixa de entrada para validar o novo e-mail.' })
    } catch (err) {
      setMsgEmail({ tipo: 'erro', texto: err.message || 'Erro ao alterar e-mail.' })
    } finally {
      setSalvandoEmail(false)
    }
  }

  const [fotosDonos, setFotosDonos] = useState(() => {
    return {
      'renandono@central.com': localStorage.getItem('ilda_avatar_renandono@central.com') || '',
      'luan@central.com': localStorage.getItem('ilda_avatar_luan@central.com') || '',
      'lucas@central.com': localStorage.getItem('ilda_avatar_lucas@central.com') || '',
    }
  })

  function atualizarFotoDono(emailDono, event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target.result
      const emailLower = emailDono.toLowerCase()
      localStorage.setItem(`ilda_avatar_${emailLower}`, base64)
      setFotosDonos(prev => ({ ...prev, [emailLower]: base64 }))

      if ((emailUsuario || '').toLowerCase() === emailLower) {
        try {
          await supabase.auth.updateUser({
            data: { avatar_url: base64 }
          })
        } catch (err) {
          console.warn('Erro ao sincronizar avatar com Supabase:', err)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  function removerFotoDono(emailDono) {
    const emailLower = emailDono.toLowerCase()
    localStorage.removeItem(`ilda_avatar_${emailLower}`)
    setFotosDonos(prev => ({ ...prev, [emailLower]: '' }))
    if ((emailUsuario || '').toLowerCase() === emailLower) {
      supabase.auth.updateUser({
        data: { avatar_url: '' }
      }).catch(() => {})
    }
  }

  async function handleTrocarSenha(e) {
    if (e && e.preventDefault) e.preventDefault()
    setMsgSenha(null)
    if (!novaSenha || novaSenha.length < 6) {
      setMsgSenha({ tipo: 'erro', texto: 'A nova senha deve ter no mínimo 6 caracteres.' })
      return
    }
    if (novaSenha !== confirmarNovaSenha) {
      setMsgSenha({ tipo: 'erro', texto: 'As senhas digitadas não coincidem.' })
      return
    }

    setSalvandoSenha(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha })
      if (error) throw error
      setMsgSenha({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' })
      setNovaSenha('')
      setConfirmarNovaSenha('')
    } catch (err) {
      setMsgSenha({ tipo: 'erro', texto: err.message || 'Erro ao alterar senha. Verifique sua conexão e tente novamente.' })
    } finally {
      setSalvandoSenha(false)
    }
  }

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

  function imprimirCupom(pedido, disparadoManualmente = false) {
    if (!pedido) return
    window.__inicioImprimirCupom = performance.now()
    console.log('[IMPRIMIR CUPOM ENTER]', window.__inicioImprimirCupom, 'pedido:', pedido.order_number || pedido.id, 'manual:', disparadoManualmente)
    const isDispositivoMovel = typeof window !== 'undefined' && window.innerWidth <= 768

    // Quando disparado pelo celular, envia ordem de impressão remota para a impressora do caixa via Realtime Broadcast
    if (isDispositivoMovel) {
      try {
        if (canalRealtimeRef.current) {
          canalRealtimeRef.current.send({
            type: 'broadcast',
            event: 'solicitar_impressao_remota',
            payload: { pedido, enviadoEm: Date.now() }
          })
        } else {
          supabase.channel('pedidos-em-tempo-real').send({
            type: 'broadcast',
            event: 'solicitar_impressao_remota',
            payload: { pedido, enviadoEm: Date.now() }
          })
        }
        exibirNotificacaoFlutuante('🖨️ Notinha enviada para a impressora do caixa!')
      } catch (err) {
        console.error('[ERRO DISPARO IMPRESSAO REMOTA]', err)
        exibirNotificacaoFlutuante('Erro ao enviar para a impressora', 'erro')
      }
      return
    }

    // Pedidos do iFood e Anota AI já possuem impressão automática pelos seus próprios sistemas
    // Só imprime na Central se o operador clicar manualmente no botão "Imprimir"
    const isCanalTerceiros = pedido.source === 'ifood' || pedido.source === 'anota_ai' || String(pedido.source || '').toLowerCase().includes('ifood') || String(pedido.source || '').toLowerCase().includes('anota')
    if (!disparadoManualmente && isCanalTerceiros) return
    const idIdentificador = String(pedido.id || pedido.order_number || '')
    if (idIdentificador) {
      registrarPedidoImpresso(idIdentificador)
      if (pedido.order_number) registrarPedidoImpresso(pedido.order_number)
    }

    // Dispara a impressão ultra rápida no componente isolado ThermalReceiptArea
    // sem disparar re-renderização pesada de 12.000 linhas do componente App
    window.dispatchEvent(new CustomEvent('__executarImpressaoCupom', { detail: pedido }))
  }

  // Busca inteligente: busca por palavras, tolera pequenos erros de digitação (ex: coka, esprite) e evita falsos positivos em lanches
  function buscaFuzzy(nomeProduto, termoBusca) {
    if (!termoBusca || !termoBusca.trim()) return true
    if (!nomeProduto) return false

    function levenshtein(s1, s2) {
      if (s1.length < s2.length) return levenshtein(s2, s1)
      if (s2.length === 0) return s1.length
      let prev = Array.from({ length: s2.length + 1 }, (_, i) => i)
      for (let i = 0; i < s1.length; i++) {
        const curr = [i + 1]
        for (let j = 0; j < s2.length; j++) {
          const ins = prev[j + 1] + 1
          const del = curr[j] + 1
          const sub = prev[j] + (s1[i] !== s2[j] ? 1 : 0)
          curr.push(Math.min(ins, del, sub))
        }
        prev = curr
      }
      return prev[prev.length - 1]
    }

    function normalizarTokens(str) {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
    }

    const nomeNorm = (nomeProduto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    const palavrasProd = normalizarTokens(nomeProduto)
    const tokensBusca = normalizarTokens(termoBusca)
    if (tokensBusca.length === 0) return true

    const SCHWEPPES_VARIACOES = [
      'schweppes', 'schwepps', 'shweppes', 'shwepps', 'chweppes', 'chwepps', 
      'sweppes', 'swepps', 'sweps', 'swep', 'cheps', 'chep',
      'schueps', 'schuep', 'shueps', 'shuep', 'chueps', 'chuep', 
      'sueps', 'suep', 'sue', 'su', 'suepes', 'suepe', 'suepis',
      'xeps', 'xep', 'xepps', 'xepp', 'sheps', 'shep',
      'scheps', 'schep', 'scheppes', 'schepps', 'xueps', 'xuep', 
      'chuepis', 'schuepis', 'swueps', 'swuep'
    ]

    const CERVEJAS_NOMES = ['brahma', 'antarctica', 'skol', 'heineken']
    const isCerveja = CERVEJAS_NOMES.some(c => nomeNorm.includes(c)) && !nomeNorm.includes('guarana')
    const REFRIS_NOMES = ['coca', 'guarana', 'fanta', 'sprite', 'schweppes', 'tonica', 'poty', 'cotuba', 'roller']
    const isRefrigerante = REFRIS_NOMES.some(r => nomeNorm.includes(r))

    function matchPalavra(palavra, token) {
      if (palavra.startsWith(token) || palavra.includes(token)) return true
      const maxDist = token.length >= 7 ? 2 : (token.length >= 4 ? 1 : 0)
      if (maxDist > 0) {
        const pref = palavra.slice(0, token.length + 1)
        if (levenshtein(token, pref) <= maxDist || levenshtein(token, palavra) <= maxDist) {
          return true
        }
      }
      return false
    }

    for (const tb of tokensBusca) {
      let matched = false
      if (tb === 'refrigerante' || tb === 'refrigerantes' || tb === 'refri' || tb === 'refris') {
        if (isRefrigerante) matched = true
      } else if (tb === 'cerveja' || tb === 'cervejas' || tb === 'breja' || tb === 'brejas') {
        if (isCerveja) matched = true
      } else if (tb === 'suco' || tb === 'sucos') {
        if (nomeNorm.includes('suco') || nomeNorm.includes('del valle')) matched = true
      } else if (tb === 'agua' || tb === 'aguas') {
        if (nomeNorm.includes('agua')) matched = true
      } else if (SCHWEPPES_VARIACOES.includes(tb)) {
        if (nomeNorm.includes('schweppes')) matched = true
      }

      if (!matched && palavrasProd.some(pp => matchPalavra(pp, tb))) {
        matched = true
      }

      if (!matched) return false
    }

    return true
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
      'ilda@central.com': 'Ilda',
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
      // Entregador começa no filtro de entregas pendentes; demais usuários respeitam a rota da URL
      if (driver) {
        setFiltroOrigem('delivery')
      } else {
        const rota = obterRotaAtual()
        if (rota.pagina === 'mesas') setFiltroOrigem('table')
        else if (rota.pagina === 'entregues') setFiltroOrigem('entregues')
        else if (rota.pagina === 'relatorios') setFiltroOrigem('faturamento')
        else if (rota.pagina === 'configuracoes') setFiltroOrigem('configuracoes')
        else if (rota.pagina === 'novo_pedido') setNovoPedido(true)
        else setFiltroOrigem('todos')
      }

      // Sincroniza avatar da conta caso exista no Supabase Auth
      if (sessao.user?.user_metadata?.avatar_url) {
        const emailLower = emailAtual.toLowerCase()
        if (!localStorage.getItem(`ilda_avatar_${emailLower}`)) {
          localStorage.setItem(`ilda_avatar_${emailLower}`, sessao.user.user_metadata.avatar_url)
          setFotosDonos(prev => ({ ...prev, [emailLower]: sessao.user.user_metadata.avatar_url }))
        }
      }
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

  // Tabela oficial de taxas por distância (até 1km R$ 5, +R$ 1 a cada 350m, teto R$ 25 a partir de 6km)
  function calcularTaxaPorDistancia(metros) {
    if (metros <= 1000) return 5.00
    if (metros >= 6000) return 25.00
    const excedente = metros - 1000
    const incrementos = Math.ceil(excedente / 350)
    const taxa = 5.00 + incrementos * 1.00
    return Math.min(taxa, 25.00)
  }

  // Geocodificar endereço e calcular taxa automaticamente via Google Maps (Mesma regra da IA no WhatsApp)
  let _geocodeTimer = null
  function calcularTaxaAutomatica(rua, numero, bairroAtual) {
    setInfoDistancia(null)
    if (_geocodeTimer) clearTimeout(_geocodeTimer)

    const ruaTrim = (rua || '').trim()
    const numTrim = (numero || '').trim()
    const bairroTrim = (bairroAtual || '').trim()

    // Dispara a partir de 3 caracteres no nome da rua
    if (ruaTrim.length < 3) return

    _geocodeTimer = setTimeout(async () => {
      setCalculandoDistancia(true)
      try {
        const resp = await fetch(`${API_BASE_URL}/api/delivery/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rua: ruaTrim, numero: numTrim, bairro: bairroTrim })
        })

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}))
          setInfoDistancia({ erro: errData.error || 'Endereço não localizado pelo Google Maps.' })
          return
        }

        const data = await resp.json()
        if (data.success) {
          setInfoDistancia({
            distancia: data.distanciaMetros,
            km: data.distanciaKm,
            duracao: data.duracaoMinutos,
            taxa: data.taxa,
            taxaFormatada: data.taxaFormatada,
            endereco: data.enderecoFormatado,
            avisoDistancia: data.avisoDistancia,
            mensagemAviso: data.mensagemAviso,
            aprendido: data.aprendido,
            ambiguidade: data.ambiguidade,
            origem: data.origem,
            bairroSugerido: data.bairroSugerido
          })
          if (data.taxa !== null && data.taxa !== undefined) {
            setTaxaEntrega(String(data.taxa))
          } else {
            setTaxaEntrega('')
          }

          // Se o Google Maps / base de Bady Bassitt sugeriu um bairro e o campo ainda está vazio:
          if (data.bairroSugerido && !bairroTrim) {
            setBairroCliente(data.bairroSugerido)
          }
        } else {
          setInfoDistancia({ erro: data.error || 'Não foi possível calcular a rota.' })
        }
      } catch (e) {
        console.error('Erro ao calcular taxa Google Maps:', e)
        setInfoDistancia({ erro: 'Não foi possível conectar ao Google Maps. Insira a taxa manualmente.' })
      } finally {
        setCalculandoDistancia(false)
      }
    }, 600)
  }

  // Versão para a tela de EDIÇÃO DE PEDIDO
  let _geocodeTimerEdicao = null
  function calcularTaxaAutomaticaEdicao(rua, numero, bairroAtual) {
    setInfoDistanciaEdicao(null)
    if (_geocodeTimerEdicao) clearTimeout(_geocodeTimerEdicao)

    const ruaTrim = (rua || '').trim()
    const numTrim = (numero || '').trim()
    const bairroTrim = (bairroAtual || '').trim()

    if (ruaTrim.length < 3) return

    _geocodeTimerEdicao = setTimeout(async () => {
      setCalculandoDistanciaEdicao(true)
      try {
        const resp = await fetch(`${API_BASE_URL}/api/delivery/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rua: ruaTrim, numero: numTrim, bairro: bairroTrim })
        })

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}))
          setInfoDistanciaEdicao({ erro: errData.error || 'Endereço não localizado pelo Google Maps.' })
          return
        }

        const data = await resp.json()
        if (data.success) {
          setInfoDistanciaEdicao({
            distancia: data.distanciaMetros,
            km: data.distanciaKm,
            duracao: data.duracaoMinutos,
            taxa: data.taxa,
            taxaFormatada: data.taxaFormatada,
            endereco: data.enderecoFormatado,
            avisoDistancia: data.avisoDistancia,
            mensagemAviso: data.mensagemAviso,
            aprendido: data.aprendido,
            ambiguidade: data.ambiguidade,
            origem: data.origem,
            bairroSugerido: data.bairroSugerido
          })
          if (data.taxa !== null && data.taxa !== undefined) {
            setPedidoSelecionado((atual) => ({
              ...atual,
              delivery_fee: String(data.taxa)
            }))
          }

          // Se sugeriu bairro e o campo de edição estava vazio:
          if (data.bairroSugerido && !bairroTrim) {
            setBairroEdicao(data.bairroSugerido)
            setPedidoSelecionado((atual) => {
              const base = [ruaTrim, numTrim].filter(Boolean).join(', ')
              const full = base + ` - Bairro: ${data.bairroSugerido}`
              return { ...atual, delivery_address: full }
            })
          }
        } else {
          setInfoDistanciaEdicao({ erro: data.error || 'Não foi possível calcular a rota.' })
        }
      } catch (e) {
        console.error('Erro ao calcular taxa Google Maps na edição:', e)
        setInfoDistanciaEdicao({ erro: 'Não foi possível conectar ao Google Maps. Insira a taxa manualmente.' })
      } finally {
        setCalculandoDistanciaEdicao(false)
      }
    }, 600)
  }

  // =========================================================
  // CARREGAR PEDIDOS (COM ATUALIZAÇÃO SILENCIOSA INSTANTÂNEA)
  // =========================================================

  async function carregarPedidos(silencioso = false) {
    try {
      const temPedidosEmMemoria = (pedidos && pedidos.length > 0) || (() => {
        try {
          const s = localStorage.getItem('pedidos_cache_ilda')
          return s ? JSON.parse(s)?.length > 0 : false
        } catch { return false }
      })()
      if (!silencioso && !temPedidosEmMemoria) {
        setCarregandoPedidos(true)
      }
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items (*), tables_restaurant (number)`)
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      if (data) {
        if (!isMobile) {
          if (isFirstLoadPedidosRef.current) {
            // Na primeira carga (abertura da página ou F5), NUNCA dispara impressão automática de pedidos já existentes no banco
            isFirstLoadPedidosRef.current = false
            for (const p of data) {
              pedidosImpressosIdsRef.current.add(String(p.id))
              if (p.order_number) pedidosImpressosIdsRef.current.add(String(p.order_number))
            }
            try {
              const arr = Array.from(pedidosImpressosIdsRef.current).slice(-200)
              localStorage.setItem('pedidos_impressos_ids_ilda', JSON.stringify(arr))
            } catch (e) {}
          } else {
            // Em recargas de polling subsequentes, só imprime se for pedido novo que o Realtime porventura perdeu
            const agoraTs = Date.now()
            for (const p of data) {
              const isTerceiro = p.source === 'ifood' || p.source === 'anota_ai' || String(p.source || '').toLowerCase().includes('ifood') || String(p.source || '').toLowerCase().includes('anota')
              if (isTerceiro) {
                registrarPedidoImpresso(p.id)
                if (p.order_number) registrarPedidoImpresso(p.order_number)
                continue
              }
              const criadoEm = new Date(p.created_at).getTime()
              if (p.status === 'new' && (agoraTs - criadoEm) < 180000) {
                const idStr = String(p.id)
                const numStr = p.order_number ? String(p.order_number) : null
                const jaImpresso = pedidosImpressosIdsRef.current.has(idStr) || (numStr && pedidosImpressosIdsRef.current.has(numStr))
                if (!jaImpresso) {
                  imprimirCupom(p, false)
                  break
                }
              }
            }
          }
        }
        setPedidos(atuais => {
          // Mantém temporários que ainda não receberam ID final do banco
          const temporarios = atuais.filter(p => typeof p.id === 'string' && p.id.startsWith('temp_'))
          const idsConfirmados = new Set(data.map(p => p.id))
          const temporariosAtivos = temporarios.filter(t => !idsConfirmados.has(t.id))
          const atualizados = [...temporariosAtivos, ...data]
          try { localStorage.setItem('pedidos_cache_ilda', JSON.stringify(atualizados.slice(0, 50))) } catch (e) {}
          return atualizados
        })
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setCarregandoPedidos(false)
    }
  }

  // =========================================================
  // TEMPO REAL ULTRARRÁPIDO & HEARTBEAT SEM TRAVAMENTOS
  // =========================================================

  useEffect(() => {
    const canal = supabase
      .channel('pedidos-em-tempo-real', {
        config: { broadcast: { self: false } }
      })
      .on('broadcast', { event: 'solicitar_impressao_remota' }, (dados) => {
        const isDispositivoMovel = typeof window !== 'undefined' && window.innerWidth <= 768
        if (!isDispositivoMovel && dados?.payload?.pedido) {
          console.log('[IMPRESSÃO REMOTA RECEBIDA VIA REALTIME]', dados.payload.pedido)
          imprimirCupom(dados.payload.pedido, true)
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload) => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
        if (!isMobile && somAtivado && localStorage.getItem('som_notificacao_ilda') !== 'false') {
          tocarSomNovoPedido()
        }

        // Busca instantânea do pedido individual criado (ultra leve, ~50ms)
        if (payload?.new?.id) {
          let { data: novo } = await supabase
            .from('orders')
            .select(`*, order_items (*), tables_restaurant (number)`)
            .eq('id', payload.new.id)
            .maybeSingle()
          
          if (novo) {
            // Se o pedido ainda não veio com itens (quando outro dispositivo insere orders e depois order_items),
            // faz tentativas progressivas imediatas (30ms, 60ms, 100ms, 160ms) em vez de um sleep estático de 350ms,
            // liberando a impressão para o balcão na velocidade máxima
            if (!novo.order_items || novo.order_items.length === 0) {
              for (const delayMs of [30, 60, 100, 160]) {
                await new Promise(r => setTimeout(r, delayMs))
                const { data: itensAtualizados } = await supabase
                  .from('order_items')
                  .select('*')
                  .eq('order_id', novo.id)
                if (itensAtualizados && itensAtualizados.length > 0) {
                  novo = { ...novo, order_items: itensAtualizados }
                  break
                }
              }
            }

            setPedidos(atuais => [novo, ...atuais.filter(p => p.id !== novo.id)])
            // Impressão automática imediata na máquina do balcão (desktop/notebook)
            // Pedidos do iFood e Anota AI já possuem impressão automática pelos seus próprios sistemas
            const isAutoImpressoPelaOrigem = novo.source === 'ifood' || novo.source === 'anota_ai' || String(novo.source || '').toLowerCase().includes('ifood') || String(novo.source || '').toLowerCase().includes('anota')
            if (isAutoImpressoPelaOrigem) {
              registrarPedidoImpresso(novo.id)
              if (novo.order_number) registrarPedidoImpresso(novo.order_number)
            } else if (!isMobile) {
              const jaImpresso = pedidosImpressosIdsRef.current.has(String(novo.id)) || 
                                 (novo.order_number && pedidosImpressosIdsRef.current.has(String(novo.order_number)))
              if (!jaImpresso) {
                imprimirCupom(novo, false)
              }
            }
          }
        }
        carregarPedidos(true)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, async (payload) => {
        if (payload?.new?.id) {
          const { data: atualizado } = await supabase
            .from('orders')
            .select(`*, order_items (*), tables_restaurant (number)`)
            .eq('id', payload.new.id)
            .maybeSingle()
          
          if (atualizado) {
            setPedidos(atuais => atuais.map(p => p.id === atualizado.id ? atualizado : p))
          }
        }
        carregarPedidos(true)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
        if (payload?.old?.id) {
          setPedidos(atuais => atuais.filter(p => p.id !== payload.old.id))
        }
        carregarPedidos(true)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        carregarPedidos(true)
      })
      .subscribe()

    canalRealtimeRef.current = canal

    // Heartbeat de alta frequência (a cada 2.5s) que garante chegada imediata mesmo com oscilação de Wi-Fi/4G
    const syncTimer = setInterval(() => {
      carregarPedidos(true)
    }, 5000)

    return () => { 
      canalRealtimeRef.current = null
      supabase.removeChannel(canal)
      clearInterval(syncTimer)
    }
  }, [somAtivado])

  // Marca pedidos ativos como vistos quando o usuário entra na aba Pedidos (some o número do badge)
  useEffect(() => {
    const estaNaAbaPedidos = filtroOrigem !== 'entregues' && filtroOrigem !== 'table' && filtroOrigem !== 'ia' && filtroOrigem !== 'configuracoes'
    if (estaNaAbaPedidos) {
      const idsAtuaisAtivos = pedidos
        .filter(p => 
          p.status !== 'completed' && 
          p.status !== 'cancelled' && 
          p.payment_method !== 'archived' && 
          !isPedidoDeMesa(p) && 
          pedidoNoPeriodo({ created_at: p.created_at }, 'hoje')
        )
        .map(p => p.id)
      
      if (idsAtuaisAtivos.length > 0) {
        setPedidosAtivosVistos(anteriores => {
          const novos = idsAtuaisAtivos.filter(id => !anteriores.includes(id))
          if (novos.length === 0) return anteriores
          const atualizados = [...anteriores, ...novos]
          try {
            localStorage.setItem('pedidos_ativos_vistos_ids', JSON.stringify(atualizados))
          } catch (e) {
            console.error(e)
          }
          return atualizados
        })
      }
    }
  }, [filtroOrigem, pedidos])

  // Marca pedidos de mesa como vistos quando o usuário entra na aba Mesas (some o número do badge)
  useEffect(() => {
    if (filtroOrigem === 'table') {
      const idsAtuaisMesas = pedidos
        .filter(p => isPedidoDeMesa(p) && p.status !== 'completed' && p.status !== 'cancelled' && p.payment_method !== 'archived')
        .map(p => p.id)
      
      if (idsAtuaisMesas.length > 0) {
        setPedidosMesasVistos(anteriores => {
          const novos = idsAtuaisMesas.filter(id => !anteriores.includes(id))
          if (novos.length === 0) return anteriores
          const atualizados = [...anteriores, ...novos]
          try {
            localStorage.setItem('pedidos_mesas_vistos_ids', JSON.stringify(atualizados))
          } catch (e) {
            console.error(e)
          }
          return atualizados
        })
      }
    }
  }, [filtroOrigem, pedidos])

  // Marca pedidos entregues como vistos quando o usuário entra na aba Entregues (some o número do badge)
  useEffect(() => {
    if (filtroOrigem === 'entregues') {
      const idsAtuaisEntregues = pedidos
        .filter(p => p.status === 'completed' && p.payment_method !== 'archived' && pedidoNoPeriodo(p, 'hoje'))
        .map(p => p.id)
      
      if (idsAtuaisEntregues.length > 0) {
        setPedidosEntreguesVistos(anteriores => {
          const novos = idsAtuaisEntregues.filter(id => !anteriores.includes(id))
          if (novos.length === 0) return anteriores
          const atualizados = [...anteriores, ...novos]
          try {
            localStorage.setItem('pedidos_entregues_vistos_ids', JSON.stringify(atualizados))
          } catch (e) {
            console.error(e)
          }
          return atualizados
        })
      }
    }
  }, [filtroOrigem, pedidos])

  // Para o perfil do entregador: marca entregas ativas como vistas quando ele entra na tela de entregas
  useEffect(() => {
    if (isDriver && filtroOrigem !== 'entregues' && filtroOrigem !== 'configuracoes') {
      const idsAtuaisEntregas = pedidos
        .filter(p => 
          p.status !== 'completed' && 
          p.status !== 'cancelled' && 
          p.payment_method !== 'archived' && 
          !isPedidoLocalOuRetirada(p) &&
          (p.manual_delivery || p.order_type === 'delivery' || Boolean(p.delivery_address)) &&
          pedidoNoPeriodo({ created_at: p.created_at }, 'hoje')
        )
        .map(p => p.id)
      
      if (idsAtuaisEntregas.length > 0) {
        setEntregasAtivasVistas(anteriores => {
          const novos = idsAtuaisEntregas.filter(id => !anteriores.includes(id))
          if (novos.length === 0) return anteriores
          const atualizados = [...anteriores, ...novos]
          try {
            localStorage.setItem('entregas_ativas_vistas_ids', JSON.stringify(atualizados))
          } catch (e) {
            console.error(e)
          }
          return atualizados
        })
      }
    }
  }, [filtroOrigem, isDriver, pedidos])

  // =========================================================
  // AUTENTICAÇÃO
  // =========================================================

  useEffect(() => {
    async function verificarSessao() {
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session) {
          try {
            localStorage.removeItem('ilda_central_user_logged_out')
            localStorage.setItem('ilda_central_session_backup', JSON.stringify(data.session))
          } catch (_) {}
          setSession(data.session)
          aplicarSessao(data.session)
        } else {
          // Se o Supabase não retornou sessão imediata, checar se não houve logout voluntário
          const foiLogout = localStorage.getItem('ilda_central_user_logged_out') === 'true'
          const backupSession = localStorage.getItem('ilda_central_session_backup')
          if (!foiLogout && backupSession) {
            try {
              const parsedBackup = JSON.parse(backupSession)
              setSession(parsedBackup)
              aplicarSessao(parsedBackup)
              // Tenta silenciosamente renovar o token
              supabase.auth.refreshSession().then(({ data: refreshData }) => {
                if (refreshData?.session) {
                  try {
                    localStorage.setItem('ilda_central_session_backup', JSON.stringify(refreshData.session))
                  } catch (_) {}
                  setSession(refreshData.session)
                  aplicarSessao(refreshData.session)
                }
              }).catch(() => {})
            } catch (_) {}
          } else if (foiLogout) {
            setSession(null)
            aplicarSessao(null)
          }
        }
      } catch (err) {
        console.warn('Erro ao verificar sessão Supabase:', err)
      } finally {
        setCarregando(false)
      }
    }

    verificarSessao()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sessionAtual) => {
      if (sessionAtual) {
        try {
          localStorage.removeItem('ilda_central_user_logged_out')
          localStorage.setItem('ilda_central_session_backup', JSON.stringify(sessionAtual))
        } catch (_) {}
        setSession(sessionAtual)
        aplicarSessao(sessionAtual)
      } else if (event === 'SIGNED_OUT') {
        const foiLogout = localStorage.getItem('ilda_central_user_logged_out') === 'true'
        if (foiLogout) {
          setSession(null)
          aplicarSessao(null)
        } else {
          // Não foi logout do usuário! Tenta restaurar em background
          try {
            const { data: refreshData } = await supabase.auth.refreshSession()
            if (refreshData?.session) {
              try {
                localStorage.setItem('ilda_central_session_backup', JSON.stringify(refreshData.session))
              } catch (_) {}
              setSession(refreshData.session)
              aplicarSessao(refreshData.session)
            }
          } catch (_) {}
        }
      }
    })

    // Reconectar sessão ao desbloquear celular ou voltar para a aba
    const handleReconectar = () => {
      if (document.visibilityState === 'visible' || navigator.onLine) {
        supabase.auth.getSession().then(({ data }) => {
          if (data?.session) {
            try {
              localStorage.setItem('ilda_central_session_backup', JSON.stringify(data.session))
            } catch (_) {}
            setSession(data.session)
            aplicarSessao(data.session)
          }
        }).catch(() => {})
      }
    }

    window.addEventListener('visibilitychange', handleReconectar)
    window.addEventListener('focus', handleReconectar)
    window.addEventListener('online', handleReconectar)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('visibilitychange', handleReconectar)
      window.removeEventListener('focus', handleReconectar)
      window.removeEventListener('online', handleReconectar)
    }
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
    const emailLimpo = (email || '').trim().toLowerCase()
    let senhaEnvio = senha
    if (emailLimpo === 'ilda@central.com' && senha === 'ilda1') {
      senhaEnvio = 'ilda01'
    } else if (emailLimpo === 'renandono@central.com' && senha === 'renandono') {
      senhaEnvio = 'renandono1'
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailLimpo, password: senhaEnvio })
    if (error) {
      setErro('E-mail ou senha incorretos.')
    } else {
      try {
        localStorage.removeItem('ilda_central_user_logged_out')
        localStorage.setItem('ilda_central_session_backup', JSON.stringify(data.session))
      } catch (_) {}
      setSession(data.session)
      aplicarSessao(data.session)
    }
    setEntrando(false)
  }

  async function sair() {
    try {
      localStorage.setItem('ilda_central_user_logged_out', 'true')
      localStorage.removeItem('ilda_central_session_backup')
      localStorage.removeItem('ilda_central_auth_v1')
      await supabase.auth.signOut()
    } catch (_) {}
    setSession(null)
    aplicarSessao(null)
  }

  // =========================================================
  // NOVO PEDIDO
  // =========================================================

  function adicionarProduto(produto, preco) {
    const novoItemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`
    setCarrinho((atual) => [
      ...atual,
      {
        id: novoItemId,
        nome: produto,
        preco,
        quantidade: 1,
        notes: '',
        adicionais: [],
        remocoes: []
      }
    ])
  }

  function alterarQuantidade(idOuNome, quantidade) {
    if (quantidade <= 0) {
      setCarrinho((atual) => atual.filter((item) => (item.id ? item.id !== idOuNome : item.nome !== idOuNome)))
      return
    }
    setCarrinho((atual) =>
      atual.map((item) => (item.id === idOuNome || (!item.id && item.nome === idOuNome)) ? { ...item, quantidade } : item)
    )
  }

  function alterarObservacaoProduto(idOuNome, notes) {
    setCarrinho((atual) =>
      atual.map((item) => (item.id === idOuNome || (!item.id && item.nome === idOuNome)) ? { ...item, notes } : item)
    )
  }

  function adicionarAdicionalProduto(idOuNome, nomeAd, valorAd) {
    setCarrinho((atual) =>
      atual.map((item) => {
        if (item.id ? item.id !== idOuNome : item.nome !== idOuNome) return item
        const adicionaisAtuais = item.adicionais || []
        const idx = adicionaisAtuais.findIndex(a => a.nome.toLowerCase() === nomeAd.toLowerCase())
        if (idx >= 0) {
          const novas = [...adicionaisAtuais]
          novas[idx] = { ...novas[idx], quantidade: (novas[idx].quantidade || 1) + 1 }
          return { ...item, adicionais: novas }
        }
        return { ...item, adicionais: [...adicionaisAtuais, { nome: nomeAd, valor: valorAd, quantidade: 1 }] }
      })
    )
  }

  function alterarQuantidadeAdicionalProduto(idOuNome, idx, delta) {
    setCarrinho((atual) =>
      atual.map((item) => {
        if (item.id ? item.id !== idOuNome : item.nome !== idOuNome) return item;
        const novasAds = [...(item.adicionais || [])];
        if (novasAds[idx]) {
          novasAds[idx] = { ...novasAds[idx], quantidade: Math.max(1, (novasAds[idx].quantidade || 1) + delta) };
        }
        return { ...item, adicionais: novasAds };
      })
    )
  }

  function removerAdicionalProduto(idOuNome, idx) {
    setCarrinho((atual) =>
      atual.map((item) =>
        (item.id === idOuNome || (!item.id && item.nome === idOuNome))
          ? { ...item, adicionais: (item.adicionais || []).filter((_, i) => i !== idx) }
          : item
      )
    )
  }

  function adicionarRemocaoProduto(idOuNome, nomeIngrediente, valorDeducao) {
    setCarrinho((atual) =>
      atual.map((item) => {
        if (item.id ? item.id !== idOuNome : item.nome !== idOuNome) return item
        const remocoesAtuais = item.remocoes || []
        if (remocoesAtuais.some(r => r.nome.toLowerCase() === nomeIngrediente.toLowerCase())) return item
        return {
          ...item,
          remocoes: [...remocoesAtuais, { nome: nomeIngrediente, valor: 0 }]
        }
      })
    )
  }

  function cancelarRemocaoProduto(idOuNome, idx) {
    setCarrinho((atual) =>
      atual.map((item) =>
        (item.id === idOuNome || (!item.id && item.nome === idOuNome))
          ? { ...item, remocoes: (item.remocoes || []).filter((_, i) => i !== idx) }
          : item
      )
    )
  }

  function abrirNovoPedido() {
    setCarrinho([])
    setOrigem('mesa')
    setTipoRecebimentoCriacao('comer_no_local')
    setMesa('')
    setNomeCliente('')
    setTelefoneCliente('')
    setBairroCliente('')
    setEnderecoEntrega('')
    setNumeroEntrega('')
    setTaxaEntrega('')
    setObservacaoSemMesa('')
    setObservacaoGeral('')
    setFoiPago(false)
    setFormaPagamentoCriacao('')
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

    // Captura snapshots síncronos — ZERO await antes de fechar a tela
    const subtotal = carrinho.reduce((soma, item) => {
      const acrescimos = (item.adicionais || []).reduce((s, ad) => s + (ad.valor * (ad.quantidade || 1)), 0)
      return soma + Math.max(0, (item.preco * item.quantidade) + acrescimos)
    }, 0)
    const taxaEntregaValor = tipoRecebimentoCriacao === 'entrega' ? Number(taxaEntrega) || 0 : 0
    const totalFinalCalc = subtotal + taxaEntregaValor
    let tableId = null

    // A busca da mesa vai para o background — não bloqueia o fechamento da tela
    const mesaParaResolver = (origem === 'mesa' && mesa && mesa !== 'sem_mesa') ? mesa : null

    const telefoneSnapshot = telefoneCliente.trim() || null
    const bairroSnapshot = bairroCliente.trim() || null

      let sourceValor, orderTypeValor, manualDeliveryValor, deliveryAddressValor
      const enderecoCompletoFormatado = [enderecoEntrega.trim(), numeroEntrega.trim()].filter(Boolean).join(', ') || null

      if (tipoRecebimentoCriacao === 'entrega') {
        sourceValor = origem === 'mesa' ? 'delivery' : origem
        orderTypeValor = 'delivery'
        manualDeliveryValor = true
        let addr = enderecoCompletoFormatado
        if (bairroSnapshot) {
          addr = addr ? `${addr} - Bairro: ${bairroSnapshot}` : `Bairro: ${bairroSnapshot}`
        }
        deliveryAddressValor = addr
      } else if (tipoRecebimentoCriacao === 'comer_no_local' || (origem === 'mesa' && tipoRecebimentoCriacao !== 'retirada' && tipoRecebimentoCriacao !== 'entrega')) {
        sourceValor = 'table'
        orderTypeValor = 'dine_in'
        manualDeliveryValor = false
        deliveryAddressValor = (origem === 'mesa' && mesa === 'sem_mesa') ? (observacaoSemMesa.trim() || null) : null
      } else if (origem === 'mesa') {
        sourceValor = 'table'
        orderTypeValor = 'pickup'
        manualDeliveryValor = false
        deliveryAddressValor = null
      } else {
        sourceValor = origem
        orderTypeValor = 'pickup'
        manualDeliveryValor = false
        deliveryAddressValor = bairroSnapshot ? `Bairro: ${bairroSnapshot}` : null
      }

      // Prepara observação final incluindo troco em dinheiro se for o caso
      let observacaoGeralFinal = observacaoGeral.trim() || null
      const valorNotaNum = Number(valorPagoDinheiroCriacao.replace(',', '.')) || 0

      if (!foiPago && formaPagamentoCriacao === 'dinheiro') {
        if (valorNotaNum > 0) {
          const trocoVal = valorNotaNum > totalFinalCalc ? (valorNotaNum - totalFinalCalc) : 0
          const txtTroco = `💰 DINHEIRO (Paga com R$ ${formatarMoeda(valorNotaNum)} | Levar Troco: R$ ${formatarMoeda(trocoVal)})`
          observacaoGeralFinal = observacaoGeralFinal ? `${observacaoGeralFinal} | ${txtTroco}` : txtTroco
        } else {
          const txtTroco = `💰 DINHEIRO (Sem troco informado)`
          observacaoGeralFinal = observacaoGeralFinal ? `${observacaoGeralFinal} | ${txtTroco}` : txtTroco
        }
      }

      // Captura snapshots dos estados antes de fechar a tela
      const carrinhoSnapshot = [...carrinho]
      const mesaSnapshot = mesa
      const nomeClienteSnapshot = nomeCliente.trim() || null
      const observacaoGeralSnapshot = observacaoGeralFinal
      const foiPagoSnapshot = foiPago
      const paymentMethodSnapshot = formaPagamentoCriacao ? formaPagamentoCriacao.trim() : (foiPago ? 'pago' : null)

      // FECHA A TELA IMEDIATAMENTE — não espera o banco
      setCarrinho([])
      setBuscaProduto('')
      setValorPagoDinheiroCriacao('')
      setNovoPedido(false)

      // ATUALIZAÇÃO OTIMISTA INSTANTÂNEA: o pedido entra na tela no mesmo milissegundo (0ms)
      const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
      const itensOtimistas = carrinhoSnapshot.map((item, idx) => {
        const acrescimos = (item.adicionais || []).reduce((s, ad) => s + (ad.valor * (ad.quantidade || 1)), 0)
        let adicionaisLinhas = (item.adicionais || []).map(ad => `+ ${ad.quantidade || 1}x ${ad.nome}`).join('\n')
        if (adicionaisLinhas) adicionaisLinhas = '\nAdicionais:\n' + adicionaisLinhas
        let remocoesLinhas = (item.remocoes || []).map(rem => `- Sem ${rem.nome}`).join('\n')
        if (remocoesLinhas) remocoesLinhas = '\n' + remocoesLinhas
        return {
          id: `item_${tempId}_${idx}`,
          product_name: item.nome,
          variant_name: null,
          quantity: item.quantidade,
          unit_price: item.preco,
          total_price: Math.max(0, (item.preco * item.quantidade) + acrescimos),
          remocoes: item.remocoes || [],
          adicionais: item.adicionais || [],
          notes: ((item.notes || '') + remocoesLinhas + adicionaisLinhas).trim() || null,
        }
      })

      const mesaNumEscolhido = (origem === 'mesa' && mesaSnapshot && mesaSnapshot !== 'sem_mesa') ? Number(mesaSnapshot) : null
      const tableIdEscolhido = mesaNumEscolhido ? MESAS_MAPA_ID[mesaNumEscolhido] : null
      const obsMesaCompleta = mesaNumEscolhido 
        ? `[MESA ${mesaNumEscolhido}] ${tipoRecebimentoCriacao === 'retirada' ? '(LEVAR) ' : ''}${observacaoGeralSnapshot || ''}`.trim()
        : (origem === 'mesa' && mesaSnapshot === 'sem_mesa' && observacaoSemMesa 
            ? `[SEM MESA] ${observacaoSemMesa}` 
            : (origem === 'mesa' && tipoRecebimentoCriacao === 'retirada' 
                ? (observacaoGeralSnapshot ? `[LEVAR] ${observacaoGeralSnapshot}` : '[LEVAR]') 
                : observacaoGeralSnapshot))
      const proximoNumOtimista = pedidos.length > 0
        ? (Math.max(0, ...pedidos.map(p => Number(p.order_number) || 0)) + 1)
        : 1

      const pedidoOtimista = {
        id: tempId,
        order_number: proximoNumOtimista,
        source: sourceValor,
        order_type: orderTypeValor,
        table_id: tableIdEscolhido,
        customer_name: nomeClienteSnapshot,
        customer_phone: telefoneSnapshot,
        bairro: bairroSnapshot,
        subtotal,
        delivery_fee: taxaEntregaValor,
        discount: 0,
        total: totalFinalCalc,
        payment_method: paymentMethodSnapshot,
        payment_status: foiPagoSnapshot ? 'paid' : 'pending',
        status: 'new',
        manual_delivery: manualDeliveryValor,
        delivery_address: deliveryAddressValor,
        notes: obsMesaCompleta,
        created_at: new Date().toISOString(),
        order_items: itensOtimistas,
        tables_restaurant: mesaNumEscolhido ? { number: mesaNumEscolhido } : null
      }

      // Adiciona instantaneamente no topo dos pedidos na tela
      setPedidos(atuais => [pedidoOtimista, ...atuais.filter(p => p.id !== tempId)])
      if (!isMobile) {
        imprimirCupom(pedidoOtimista, true)
      }

      // Operações de banco rodam em background com resposta imediata
      ;(async () => {
        try {
          const { data: pedido, error: erroPedido } = await supabase
            .from('orders')
            .insert({
              source: sourceValor,
              order_type: orderTypeValor,
              table_id: tableIdEscolhido,
              customer_name: nomeClienteSnapshot,
              customer_phone: telefoneSnapshot,
              subtotal,
              delivery_fee: taxaEntregaValor,
              discount: 0,
              total: subtotal + taxaEntregaValor,
              payment_method: paymentMethodSnapshot,
              payment_status: foiPagoSnapshot ? 'paid' : 'pending',
              status: 'new',
              manual_delivery: manualDeliveryValor,
              delivery_address: deliveryAddressValor,
              notes: obsMesaCompleta,
            })
            .select()
            .single()

          if (erroPedido) throw erroPedido

          const itens = carrinhoSnapshot.map((item) => {
            const acrescimos = (item.adicionais || []).reduce((s, ad) => s + (ad.valor * (ad.quantidade || 1)), 0)
            let adicionaisLinhas = (item.adicionais || []).map(ad => `+ ${ad.quantidade || 1}x ${ad.nome}`).join('\n')
            if (adicionaisLinhas) adicionaisLinhas = '\nAdicionais:\n' + adicionaisLinhas
            let remocoesLinhas = (item.remocoes || []).map(rem => `- Sem ${rem.nome}`).join('\n')
            if (remocoesLinhas) remocoesLinhas = '\n' + remocoesLinhas
            const notesCompleto = (item.notes || '') + remocoesLinhas + adicionaisLinhas
            return {
              order_id: pedido.id,
              product_name: item.nome,
              variant_name: null,
              quantity: item.quantidade,
              unit_price: item.preco,
              total_price: Math.max(0, (item.preco * item.quantidade) + acrescimos),
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

          // Substitui o otimista pelo pedido gravado com ID real
          setPedidos(atuais => [pedidoCompleto, ...atuais.filter(p => p.id !== tempId && p.id !== pedido.id)])
          carregarPedidos(true)

        } catch (error) {
          console.error('Erro ao criar pedido em background:', error)
          setPedidos(atuais => atuais.filter(p => p.id !== tempId))
          alert(`Atenção: houve um erro ao salvar o pedido no banco.\n\n${error.message}`)
        }
      })()
  }

  // =========================================================
  // EDIÇÃO DE PEDIDO
  // =========================================================

  function adicionarProdutoEdicao(produto, preco) {
    setPedidoSelecionado((atual) => {
      if (!atual) return atual
      const novoItem = {
        id: `novo_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
        product_name: produto,
        variant_name: null,
        quantity: 1,
        unit_price_base: preco,
        unit_price: preco,
        total_price: preco,
        notes: null,
        adicionais: [],
        remocoes: [],
        novo: true,
      }
      return { ...atual, order_items: [...(atual.order_items || []), novoItem] }
    })
  }

  function adicionarAdicionalItemEdicao(itemId, nomeAd, valorAd) {
    setPedidoSelecionado((atual) => {
      if (!atual) return atual
      return {
        ...atual,
        order_items: (atual.order_items || []).map((p) => {
          if (p.id !== itemId) return p
          const adicionaisAtuais = p.adicionais || []
          const idxExistente = adicionaisAtuais.findIndex((a) => a.nome.toLowerCase() === nomeAd.toLowerCase())
          let novaLista
          if (idxExistente >= 0) {
            novaLista = adicionaisAtuais.map((a, i) =>
              i === idxExistente ? { ...a, quantidade: (a.quantidade || 1) + 1 } : a
            )
          } else {
            novaLista = [...adicionaisAtuais, { nome: nomeAd, valor: Number(valorAd) || 0, quantidade: 1 }]
          }
          const precoBase = p.unit_price_base ?? Number(p.unit_price)
          const totalAds = novaLista.reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
          const totalRem = (p.remocoes || []).reduce((s, r) => s + (r.valor || 0), 0)
          return {
            ...p,
            adicionais: novaLista,
            unit_price_base: precoBase,
            unit_price: precoBase,
            total_price: Math.max(0, (precoBase * p.quantity) + totalAds - totalRem)
          }
        })
      }
    })
  }

  function alterarQuantidadeAdicionalItemEdicao(itemId, idx, delta) {
    setPedidoSelecionado((atual) => {
      if (!atual) return atual
      return {
        ...atual,
        order_items: (atual.order_items || []).map((p) => {
          if (p.id !== itemId) return p
          const novasAds = [...(p.adicionais || [])]
          if (novasAds[idx]) {
            novasAds[idx] = { ...novasAds[idx], quantidade: Math.max(1, (novasAds[idx].quantidade || 1) + delta) }
          }
          const precoBase = p.unit_price_base ?? Number(p.unit_price)
          const totalAds = novasAds.reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
          const totalRem = (p.remocoes || []).reduce((s, r) => s + (r.valor || 0), 0)
          return {
            ...p,
            adicionais: novasAds,
            unit_price_base: precoBase,
            unit_price: precoBase,
            total_price: Math.max(0, (precoBase * p.quantity) + totalAds - totalRem)
          }
        })
      }
    })
  }

  function removerAdicionalItemEdicao(itemId, idx) {
    setPedidoSelecionado((atual) => {
      if (!atual) return atual
      return {
        ...atual,
        order_items: (atual.order_items || []).map((p) => {
          if (p.id !== itemId) return p
          const novasAds = (p.adicionais || []).filter((_, i) => i !== idx)
          const precoBase = p.unit_price_base ?? Number(p.unit_price)
          const totalAds = novasAds.reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
          const totalRem = (p.remocoes || []).reduce((s, r) => s + (r.valor || 0), 0)
          return {
            ...p,
            adicionais: novasAds,
            unit_price_base: precoBase,
            unit_price: precoBase,
            total_price: Math.max(0, (precoBase * p.quantity) + totalAds - totalRem)
          }
        })
      }
    })
  }

  function adicionarRemocaoItemEdicao(itemId, nomeIngrediente) {
    setPedidoSelecionado((atual) => {
      if (!atual) return atual
      return {
        ...atual,
        order_items: (atual.order_items || []).map((p) => {
          if (p.id !== itemId) return p
          const remocoesAtuais = p.remocoes || []
          if (remocoesAtuais.some(r => r.nome.toLowerCase() === nomeIngrediente.toLowerCase())) return p
          const novaListaRem = [...remocoesAtuais, { nome: nomeIngrediente, valor: 0 }]
          const precoBase = p.unit_price_base ?? Number(p.unit_price)
          const totalAds = (p.adicionais || []).reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
          return {
            ...p,
            remocoes: novaListaRem,
            unit_price_base: precoBase,
            unit_price: precoBase,
            total_price: Math.max(0, (precoBase * p.quantity) + totalAds)
          }
        })
      }
    })
  }

  function removerRemocaoItemEdicao(itemId, idx) {
    setPedidoSelecionado((atual) => {
      if (!atual) return atual
      return {
        ...atual,
        order_items: (atual.order_items || []).map((p) => {
          if (p.id !== itemId) return p
          const novaListaRem = (p.remocoes || []).filter((_, i) => i !== idx)
          const precoBase = p.unit_price_base ?? Number(p.unit_price)
          const totalAds = (p.adicionais || []).reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
          return {
            ...p,
            remocoes: novaListaRem,
            unit_price_base: precoBase,
            unit_price: precoBase,
            total_price: Math.max(0, (precoBase * p.quantity) + totalAds)
          }
        })
      }
    })
  }

  // =========================================================
  // INTEGRAÇÃO ANOTA AI (STATUS LIFECYCLE)
  // =========================================================

  async function notificarAnotaAi(endpoint, externalId, extra = {}) {
    if (!externalId) return
    try {
      fetch(`${API_BASE_URL}/api/anota-ai/order/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ external_id: externalId, ...extra })
      }).then(res => res.json()).then(data => {
        console.log(`[ANOTA-AI ${endpoint.toUpperCase()}] Resposta:`, data)
      }).catch(err => {
        console.error(`[ANOTA-AI ${endpoint.toUpperCase()} ERROR]:`, err)
      })
    } catch (e) {
      console.error(`[ANOTA-AI ${endpoint.toUpperCase()} DISPATCH ERROR]:`, e)
    }
  }

  // =========================================================
  // INTEGRAÇÃO IFOOD (STATUS LIFECYCLE)
  // =========================================================

  async function notificarIfood(acao, externalId) {
    if (!externalId) return
    try {
      fetch(`${API_BASE_URL}/api/ifood/order/${acao}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ external_id: externalId })
      }).then(res => res.json()).then(data => {
        console.log(`[IFOOD ${acao.toUpperCase()}] Resposta:`, data)
      }).catch(err => {
        console.error(`[IFOOD ${acao.toUpperCase()} ERROR]:`, err)
      })
    } catch (e) {
      console.error(`[IFOOD ${acao.toUpperCase()} DISPATCH ERROR]:`, e)
    }
  }

  // =========================================================
  // CANCELAR PEDIDO
  // =========================================================

  async function cancelarPedido() {
    if (!pedidoSelecionado) return
    try {
      if (pedidoSelecionado.source === 'anota_ai' && pedidoSelecionado.external_id) {
        notificarAnotaAi('cancel', pedidoSelecionado.external_id, { justification: 'Cancelado pela Central' })
      }
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
      if (pedido.source === 'anota_ai' && pedido.external_id) {
        notificarAnotaAi('cancel', pedido.external_id, { justification: 'Cancelado pela Central' })
      }
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

      // Snapshot antes de fechar a tela com notes completo montado com todos os adicionais e remoções
      const pedidoSnapshot = { ...pedidoSelecionado }
      const itensSnapshot = itens.map((item) => {
        let adicionaisLinhas = (item.adicionais || []).map(ad => `+ ${ad.quantidade || 1}x ${ad.nome}`).join('\n')
        if (adicionaisLinhas) adicionaisLinhas = '\nAdicionais:\n' + adicionaisLinhas
        let remocoesLinhas = (item.remocoes || []).map(rem => `- Sem ${rem.nome}`).join('\n')
        if (remocoesLinhas) remocoesLinhas = '\n' + remocoesLinhas
        const obsLimpa = (item.notes || '').replace(/\n?Adicionais:[\s\S]*$/, '').replace(/\n?- Sem [^\n]+/g, '').trim()
        const notesCompleto = ((obsLimpa ? obsLimpa : '') + remocoesLinhas + adicionaisLinhas).trim() || null
        return {
          ...item,
          notes: notesCompleto
        }
      })
      const foiPagoSnapshot = foiPagoEdicao

      // Limpa qualquer anotação prévia de dinheiro/troco para não duplicar
      let obsGeralLimpa = (pedidoSnapshot.notes || '')
        .replace(/\|?\s*💰\s*DINHEIRO\s*\([^)]*\)/gi, '')
        .replace(/\|?\s*Troco\s+(?:para|p\/|pra)\s+[^|]+/gi, '')
        .trim()
        .replace(/^\||\|$/g, '')
        .trim()

      let obsGeralFinal = obsGeralLimpa || null
      if (!foiPagoSnapshot && formaPagamentoEdicao === 'dinheiro') {
        const valNota = Number(String(valorPagoDinheiroEdicao).replace(',', '.')) || 0
        if (valNota > 0) {
          const trocoVal = valNota > novoTotal ? (valNota - novoTotal) : 0
          const txtTroco = `💰 DINHEIRO (Paga com R$ ${formatarMoeda(valNota)} | Levar Troco: R$ ${formatarMoeda(trocoVal)})`
          obsGeralFinal = obsGeralFinal ? `${obsGeralFinal} | ${txtTroco}` : txtTroco
        } else {
          const txtTroco = `💰 DINHEIRO (Sem troco informado)`
          obsGeralFinal = obsGeralFinal ? `${obsGeralFinal} | ${txtTroco}` : txtTroco
        }
      }

      const paymentMethodSnapshotEdicao = formaPagamentoEdicao ? formaPagamentoEdicao.trim() : (foiPagoSnapshot ? 'pago' : null)

      const pedidoAtualizadoCompleto = {
        ...pedidoSnapshot,
        manual_delivery: manualDelivery,
        delivery_address: deliveryAddress,
        order_type: orderType,
        subtotal,
        delivery_fee,
        total: novoTotal,
        payment_method: paymentMethodSnapshotEdicao,
        payment_status: foiPagoSnapshot ? 'paid' : 'pending',
        notes: obsGeralFinal,
        order_items: itensSnapshot,
      }

      // FECHA A TELA E ATUALIZA ESTADO INSTANTANEAMENTE
      setPedidoSelecionado(null)
      setPedidos(atuais => atuais.map(p => p.id === pedidoSnapshot.id ? pedidoAtualizadoCompleto : p))

      // DB em background
      ;(async () => {
        try {
          const { error: erroPedido } = await supabase
            .from('orders')
            .update({
              source: pedidoSnapshot.source,
              customer_name: pedidoSnapshot.customer_name || null,
              table_id: null,
              manual_delivery: manualDelivery,
              delivery_address: deliveryAddress,
              order_type: orderType,
              subtotal,
              delivery_fee,
              total: novoTotal,
              payment_method: paymentMethodSnapshotEdicao,
              payment_status: foiPagoSnapshot ? 'paid' : 'pending',
              notes: obsGeralFinal,
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
            operacoes.push(
              supabase.from('order_items').update({
                product_name: item.product_name,
                variant_name: item.variant_name || null,
                quantity: item.quantity,
                unit_price: Number(item.unit_price_base ?? item.unit_price),
                total_price: Number(item.total_price),
                notes: item.notes,
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
            return {
              order_id: pedidoSnapshot.id,
              product_name: item.product_name,
              variant_name: item.variant_name || null,
              quantity: item.quantity,
              unit_price: Number(item.unit_price_base ?? item.unit_price),
              total_price: Number(item.total_price),
              notes: item.notes,
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
      if (pedido.source === 'anota_ai' && pedido.external_id) {
        notificarAnotaAi('finalize', pedido.external_id)
      }
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
      if (pedido.source === 'anota_ai' && pedido.external_id) {
        notificarAnotaAi('finalize', pedido.external_id)
      }
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

  async function cancelarEntregaPedido(pedido) {
    if (!pedido || !pedido.id) return
    try {
      // 1. Atualização otimista imediata no estado local (0ms de latência)
      setPedidos(atuais =>
        atuais.map(p =>
          p.id === pedido.id
            ? { ...p, status: 'ready', driver_id: null, completed_at: null }
            : p
        )
      )

      // Se estava nas entregas ocultas do entregador, remove também
      if (entregasOcultas && entregasOcultas.includes(pedido.id)) {
        const novosOcultos = entregasOcultas.filter(id => id !== pedido.id)
        setEntregasOcultas(novosOcultos)
        if (session?.user?.id) {
          localStorage.setItem(`ilda_entregas_ocultas_${session.user.id}`, JSON.stringify(novosOcultos))
        }
      }

      // 2. Persistência no banco Supabase
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'ready',
          driver_id: null,
          completed_at: null
        })
        .eq('id', pedido.id)

      if (error) {
        console.error('Erro ao cancelar entrega no Supabase:', error)
        await carregarPedidos(true)
        throw error
      }

      await carregarPedidos(true)
    } catch (error) {
      console.error('Erro ao cancelar entrega do pedido:', error)
      alert(`Não foi possível cancelar a entrega do pedido.\n\n${error.message}`)
      await carregarPedidos(true)
    }
  }

  // =========================================================
  // LIMPEZA E ARQUIVAMENTO DE PEDIDOS (CONFIGURAÇÕES)
  // =========================================================

  async function limparPedidosCentral() {
    try {
      const pedidosParaArquivar = pedidos.filter(
        p => p.status !== 'completed' && p.payment_method !== 'archived'
      )

      if (pedidosParaArquivar.length === 0) {
        alert('Não há pedidos ativos na Central para limpar no momento.')
        return
      }

      const confirmar = window.confirm(
        `Deseja realmente limpar os pedidos da Central (${pedidosParaArquivar.length} pedido(s))? Eles serão arquivados da tela operacional.`
      )
      if (!confirmar) return

      const ids = pedidosParaArquivar.map(p => p.id)
      const { error } = await supabase
        .from('orders')
        .update({ payment_method: 'archived' })
        .in('id', ids)

      if (error) throw error
      await carregarPedidos()
      alert('Pedidos da Central limpos com sucesso!')
    } catch (error) {
      console.error('Erro ao limpar pedidos da Central:', error)
      alert(`Não foi possível limpar os pedidos da Central.\n\n${error.message}`)
    }
  }

  async function limparPedidosEntregues() {
    try {
      const entreguesParaArquivar = pedidos.filter(
        p => p.status === 'completed' && p.payment_method !== 'archived'
      )

      if (entreguesParaArquivar.length === 0) {
        alert('Não há pedidos entregues na tela para limpar no momento.')
        return
      }

      const confirmar = window.confirm(
        `Deseja realmente limpar os pedidos entregues (${entreguesParaArquivar.length} pedido(s)) da tela? Eles serão arquivados.`
      )
      if (!confirmar) return

      const ids = entreguesParaArquivar.map(p => p.id)
      const { error } = await supabase
        .from('orders')
        .update({ payment_method: 'archived' })
        .in('id', ids)

      if (error) throw error
      await carregarPedidos()
      alert('Pedidos entregues limpos com sucesso!')
    } catch (error) {
      console.error('Erro ao limpar pedidos entregues:', error)
      alert(`Não foi possível limpar os pedidos entregues.\n\n${error.message}`)
    }
  }

  // =========================================================
  // TRANSIÇÕES DE STATUS KANBAN (ESTILO ANOTA AI)
  // =========================================================

  async function mandarParaProducao(pedido) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'preparing',
          accepted_at: new Date().toISOString()
        })
        .eq('id', pedido.id)

      if (error) throw error
      await carregarPedidos()
    } catch (error) {
      console.error('Erro ao enviar para produção:', error)
      alert(`Não foi possível enviar para produção.\n\n${error.message}`)
    }
  }

  async function marcarComoPronto(pedido) {
    try {
      if (pedido.source === 'anota_ai' && pedido.external_id) {
        notificarAnotaAi('ready', pedido.external_id)
      }
      if (pedido.source === 'ifood' && pedido.external_id) {
        notificarIfood('dispatch', pedido.external_id)
      }
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'ready',
          ready_at: new Date().toISOString()
        })
        .eq('id', pedido.id)

      if (error) throw error
      await carregarPedidos()
    } catch (error) {
      console.error('Erro ao marcar como pronto:', error)
      alert(`Não foi possível marcar como pronto.\n\n${error.message}`)
    }
  }

  async function finalizarPedidoDireto(pedido) {
    try {
      if (pedido.source === 'anota_ai' && pedido.external_id) {
        notificarAnotaAi('finalize', pedido.external_id)
      }
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', pedido.id)

      if (error) throw error
      await carregarPedidos()
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      alert(`Não foi possível finalizar pedido.\n\n${error.message}`)
    }
  }

  async function finalizarTodosEmProducao(listaPedidos) {
    if (!listaPedidos || listaPedidos.length === 0) return
    const ids = listaPedidos.map(p => p.id)
    const agoraIso = new Date().toISOString()

    // Notifica pedidos do Anota AI e iFood que estão ficando prontos
    listaPedidos.forEach(p => {
      if (p.source === 'anota_ai' && p.external_id) {
        notificarAnotaAi('ready', p.external_id)
      }
      if (p.source === 'ifood' && p.external_id) {
        notificarIfood('dispatch', p.external_id)
      }
    })

    // Atualização otimista imediata no estado local
    setPedidos(atuais => atuais.map(p => ids.includes(p.id) ? { ...p, status: 'ready', ready_at: agoraIso } : p))

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'ready',
          ready_at: agoraIso
        })
        .in('id', ids)

      if (error) throw error
      carregarPedidos(true)
    } catch (error) {
      console.error('Erro ao finalizar em lote pedidos em produção:', error)
      alert(`Não foi possível finalizar todos os pedidos.\n\n${error.message}`)
      carregarPedidos(true)
    }
  }

  async function finalizarTodosProntosLocal(listaPedidos) {
    if (!listaPedidos || listaPedidos.length === 0) return
    const ids = listaPedidos.map(p => p.id)
    const agoraIso = new Date().toISOString()

    // Notifica pedidos do Anota AI
    listaPedidos.forEach(p => {
      if (p.source === 'anota_ai' && p.external_id) {
        notificarAnotaAi('finalize', p.external_id)
      }
    })

    // Atualização otimista imediata no estado local
    setPedidos(atuais => atuais.map(p => ids.includes(p.id) ? { ...p, status: 'completed', completed_at: agoraIso } : p))

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          completed_at: agoraIso
        })
        .in('id', ids)

      if (error) throw error
      carregarPedidos(true)
    } catch (error) {
      console.error('Erro ao finalizar em lote pedidos prontos no local:', error)
      alert(`Não foi possível finalizar todos os pedidos.\n\n${error.message}`)
      carregarPedidos(true)
    }
  }

  async function finalizarTodosProntosEntrega(listaPedidos, driverId, driverName) {
    if (!listaPedidos || listaPedidos.length === 0 || !driverId) return
    const ids = listaPedidos.map(p => p.id)
    const agoraIso = new Date().toISOString()

    // Notifica pedidos do Anota AI
    listaPedidos.forEach(p => {
      if (p.source === 'anota_ai' && p.external_id) {
        notificarAnotaAi('finalize', p.external_id)
      }
    })

    // 1. Atualização otimista imediata no estado local
    setPedidos(atuais => atuais.map(p => ids.includes(p.id) ? { ...p, status: 'completed', completed_at: agoraIso, driver_id: driverId } : p))
    setMenuDespachoLoteAberto(false)

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: driverId,
          status: 'completed',
          completed_at: agoraIso
        })
        .in('id', ids)

      if (error) throw error
      carregarPedidos(true)
    } catch (error) {
      console.error('Erro ao despachar em lote pedidos para entrega:', error)
      alert(`Não foi possível despachar todos os pedidos.\n\n${error.message}`)
      carregarPedidos(true)
    }
  }

  const isOwner = EMAILS_DONOS.includes((emailUsuario || '').toLowerCase())
  const podeVerEntregues = isOwner || isDriver

  // =========================================================
  // PEDIDOS FILTRADOS
  // =========================================================

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (pedido.payment_method === 'archived') return false
    if (pedido.status === 'cancelled') return false

    // Para entregadores: filtro especial
    if (isDriver) {
      if (filtroOrigem === 'entregues') {
        if (entregasOcultas.includes(pedido.id)) return false
        if (!pedidoNoPeriodo(pedido, filtroPeriodoEntregues)) return false
        const isRenanDriver = (emailUsuario || '').toLowerCase().includes('renan') || session?.user?.id === DRIVER_RENAN_ID
        const meuDriverId = isRenanDriver ? DRIVER_RENAN_ID : DRIVER_FELIPE_ID
        return pedido.status === 'completed' && (pedido.driver_id === session?.user?.id || pedido.driver_id === meuDriverId)
      }
      // Na tela de Entregas do entregador: exibe exclusivamente pedidos de entrega, NUNCA retirada nem mesa
      const isMesaOuRetirada = isPedidoLocalOuRetirada(pedido) || pedido.order_type === 'pickup' || pedido.order_type === 'dine_in' || pedido.source === 'table' || pedido.source === 'retirada'
      if (isMesaOuRetirada) return false
      // EXCLUSIVAMENTE pedidos das últimas 12 horas
      if (!pedidoNoPeriodo({ created_at: pedido.created_at }, 'hoje')) return false
      return (pedido.manual_delivery || pedido.order_type === 'delivery' || Boolean(pedido.delivery_address)) && pedido.status !== 'completed'
    }

    // Apenas donos e entregadores acessam a aba 'Entregues'
    if (filtroOrigem === 'entregues') {
      if (!isOwner && !isDriver) return false
      if (pedido.status !== 'completed') return false

      // Na aba Entregues, somente entram pedidos atribuídos aos entregadores Renan ou Felipe
      const isEntregadorValido = pedido.driver_id === DRIVER_RENAN_ID || pedido.driver_id === DRIVER_FELIPE_ID
      if (!isEntregadorValido) return false

      // Filtro de período (Hoje, Últimos 7 dias, 30 dias)
      if (!pedidoNoPeriodo(pedido, filtroPeriodoEntregues)) return false

      // Busca rápida em tempo real (por cliente, número do pedido ou endereço)
      if (termoBusca.trim()) {
        if (!atendeTermoBuscaPedido(pedido, termoBusca, false)) return false
      }

      return true
    }

    // Para outros filtros: comportamento normal (não mostra pedidos já finalizados)
    if (pedido.status === 'completed') return false

    // CENTRAL DE PEDIDOS E MESAS: mostrar exclusivamente pedidos criados nas últimas 12 horas
    if (!pedidoNoPeriodo({ created_at: pedido.created_at }, 'hoje')) return false

    // SEPARAÇÃO ESTRITA: Página de Mesas vs Página de Pedidos
    const pedidoDeMesa = isPedidoDeMesa(pedido)
    if (filtroOrigem === 'table') {
      // Na Página de Mesas: SOMENTE pedidos de comer no local ou levar da mesa
      if (!pedidoDeMesa) return false

      // Sub-filtro por modalidade na tela de Mesas
      if (filtroTipo === 'dine_in' && pedido.order_type !== 'dine_in') return false
      if (filtroTipo === 'pickup' && pedido.order_type !== 'pickup') return false
    } else {
      // Na Página de Pedidos (Central - Kanban): SOMENTE retirada ou entrega (NUNCA mesas)
      if (pedidoDeMesa) return false

      // Filtro por Modalidade (Todos / Entrega / Retirada)
      if (filtroTipo === 'delivery') {
        if (!pedido.manual_delivery && pedido.order_type !== 'delivery') return false
      } else if (filtroTipo === 'retirada') {
        if (pedido.manual_delivery || pedido.order_type === 'delivery') return false
      }
    }

    // Filtro por Canal / Origem (se diferente de 'todos' e 'table')
    if (filtroOrigem !== 'todos' && filtroOrigem !== 'table') {
      if (filtroOrigem === 'delivery') {
        if (!pedido.manual_delivery && pedido.order_type !== 'delivery') return false
      } else if (filtroOrigem === 'retirada') {
        if (pedido.manual_delivery || pedido.order_type === 'delivery') return false
      } else if (pedido.source !== filtroOrigem) {
        return false
      }
    }

    // Busca rápida em tempo real (por cliente, número do pedido, mesa ou endereço)
    if (termoBusca.trim()) {
      if (!atendeTermoBuscaPedido(pedido, termoBusca, filtroOrigem === 'table')) return false
    }

    return true
  })

  // Protege a aba de entregues: funcionários comuns não têm permissão para acessar
  useEffect(() => {
    if (!carregandoPedidos && session && !isOwner && !isDriver && filtroOrigem === 'entregues') {
      setFiltroOrigem('todos')
    }
  }, [filtroOrigem, isOwner, isDriver, carregandoPedidos, session])

  // Notificação de Pedidos: some quando o usuário clica e entra na tela de Pedidos
  const estaNaAbaPedidos = filtroOrigem !== 'entregues' && filtroOrigem !== 'table' && filtroOrigem !== 'ia' && filtroOrigem !== 'configuracoes'
  const contagemPedidosAtivos = estaNaAbaPedidos ? 0 : pedidos.filter(p => 
    p.status !== 'completed' && 
    p.status !== 'cancelled' && 
    p.payment_method !== 'archived' && 
    !isPedidoDeMesa(p) && 
    pedidoNoPeriodo({ created_at: p.created_at }, 'hoje') &&
    !pedidosAtivosVistos.includes(p.id)
  ).length

  const contagemEntregasAtivas = (isDriver && filtroOrigem !== 'entregues' && filtroOrigem !== 'configuracoes' && filtroTipo === 'delivery') ? 0 : pedidos.filter(p => 
    p.status !== 'completed' && 
    p.status !== 'cancelled' && 
    p.payment_method !== 'archived' && 
    !isPedidoLocalOuRetirada(p) &&
    (p.manual_delivery || p.order_type === 'delivery' || Boolean(p.delivery_address)) &&
    p.order_type !== 'dine_in' && 
    p.order_type !== 'pickup' &&
    p.source !== 'retirada' &&
    pedidoNoPeriodo({ created_at: p.created_at }, 'hoje') &&
    !entregasAtivasVistas.includes(p.id)
  ).length

  // Notificação de Mesas: some quando o usuário clica e entra na tela de Mesas
  const contagemPedidosMesas = filtroOrigem === 'table' ? 0 : pedidos.filter(p => 
    p.status !== 'completed' && 
    p.status !== 'cancelled' && 
    p.payment_method !== 'archived' && 
    isPedidoDeMesa(p) &&
    pedidoNoPeriodo({ created_at: p.created_at }, 'hoje') &&
    !pedidosMesasVistos.includes(p.id)
  ).length

  // Notificação de Entregues: some quando o usuário clica e entra na tela de Entregues
  const contagemPedidosEntregues = filtroOrigem === 'entregues' ? 0 : pedidos.filter(p => 
    p.status === 'completed' && 
    p.payment_method !== 'archived' && 
    pedidoNoPeriodo(p, 'hoje') &&
    !pedidosEntreguesVistos.includes(p.id)
  ).length

  // Histórico completo para Faturamento e Configurações (otimizado com useMemo)
  const pedidosHistoricoCompleto = useMemo(() => {
    if (filtroOrigem !== 'faturamento' && filtroOrigem !== 'configuracoes') return []
    return pedidos.filter((pedido) => {
      if (pedido.payment_method === 'archived') return false
      if (!pedidoNoPeriodo(pedido, filtroPeriodoTodosPedidos)) return false

      if (termoBusca.trim()) {
        if (!atendeTermoBuscaPedido(pedido, termoBusca, false)) return false
      }

      return true
    })
  }, [pedidos, filtroPeriodoTodosPedidos, termoBusca, filtroOrigem])

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

  const entregasHoje = pedidos.filter((p) => p.driver_id === session?.user?.id && p.status === 'completed' && !entregasOcultas.includes(p.id) && isHoje(p.completed_at))
  const notificacaoEntregasConcluidas = filtroOrigem === 'entregues' ? 0 : entregasHoje.filter(p => !pedidosEntreguesVistos.includes(p.id)).length
  const entregasSemana = pedidos.filter((p) => p.driver_id === session?.user?.id && p.status === 'completed' && !entregasOcultas.includes(p.id) && isSemana(p.completed_at))
  const entregasMes = pedidos.filter((p) => p.driver_id === session?.user?.id && p.status === 'completed' && !entregasOcultas.includes(p.id) && isMes(p.completed_at))

  const totalTaxasHoje = entregasHoje.reduce((soma, p) => soma + Number(p.delivery_fee || 0), 0)
  const totalTaxasSemana = entregasSemana.reduce((soma, p) => soma + Number(p.delivery_fee || 0), 0)
  const totalTaxasMes = entregasMes.reduce((soma, p) => soma + Number(p.delivery_fee || 0), 0)


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
    return soma + Math.max(0, (item.preco * item.quantidade) + acrescimos)
  }, 0)
  const taxaEntregaNum = tipoRecebimentoCriacao === 'entrega' ? Number(taxaEntrega) || 0 : 0
  const totalComEntrega = total + taxaEntregaNum

  // =========================================================
  // CARREGANDO
  // =========================================================

  if (carregando) {
    return (
      <div className="login-loading">
        <div className="login-logo" style={{ marginBottom: '8px', overflow: 'hidden', background: '#1c1917', border: '1px solid #333' }}>
          <img src={logoIlda} alt="Ilda Lanches" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <strong style={{ fontSize: '20px', fontWeight: 800 }}>Ilda Lanches</strong>
        <span>Carregando sistema...</span>
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
          <div className="login-logo" style={{ overflow: 'hidden', background: '#1c1917', border: '1px solid #333' }}>
            <img src={logoIlda} alt="Ilda Lanches" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1>Ilda Lanches</h1>
          <p>Entre para acessar o sistema operacional</p>
          <form onSubmit={entrar}>
            <div className="login-field">
              <label>E-mail</label>
              <Mail className="login-field-icon" size={18} />
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="login-field" style={{ position: 'relative' }}>
              <label>Senha</label>
              <Lock className="login-field-icon" size={18} />
              <input
                type={mostrarSenhaLogin ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenhaLogin(!mostrarSenhaLogin)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '34px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px'
                }}
                title={mostrarSenhaLogin ? 'Ocultar senha' : 'Ver senha'}
              >
                {mostrarSenhaLogin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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

  // MODAL DE INSPEÇÃO DE COMPOSIÇÃO DE LANCHES E COMBOS (LUPA)
  const renderModalInspecionar = () => {
    if (!itemInspecionado) return null
    return (
      <div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(15, 23, 42, 0.7)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999999,
          padding: '16px'
        }}
        onClick={() => setItemInspecionado(null)}
      >
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid #e2e8f0',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: itemInspecionado.tipo === 'combo' ? '#fff7ed' : '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: itemInspecionado.tipo === 'combo' ? '#ea580c' : '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: itemInspecionado.tipo === 'combo' ? '0 4px 10px rgba(234, 88, 12, 0.25)' : '0 4px 10px rgba(2, 132, 199, 0.25)'
              }}>
                <Search size={18} strokeWidth={2.4} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: itemInspecionado.tipo === 'combo' ? '#c2410c' : '#0369a1' }}>
                  {itemInspecionado.tipo === 'combo' ? 'Composição do Combo' : 'Ingredientes do Lanche'}
                </div>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{itemInspecionado.nome}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setItemInspecionado(null)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="Fechar"
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>

          {/* Conteúdo */}
          <div style={{ padding: '20px' }}>
            {itemInspecionado.tipo === 'combo' ? (
              <div>
                <p style={{ margin: '0 0 14px', fontSize: '13.5px', color: '#64748b', fontWeight: 600 }}>
                  Itens inclusos que vêm neste combo:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {itemInspecionado.itens.map((it, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '10px'
                    }}>
                      <span style={{ fontSize: '20px', lineHeight: 1 }}>
                        {it.tipo === 'lanche' ? '🍔' : it.tipo === 'batata' ? '🍟' : it.tipo === 'bebida' ? '🥤' : '🎁'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                          {it.texto}
                        </div>
                      </div>
                      {it.tipo === 'batata' && (
                        <span style={{
                          background: '#fef3c7',
                          color: '#b45309',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #fde68a'
                        }}>
                          Batata Inclusa
                        </span>
                      )}
                      {it.tipo === 'bebida' && (
                        <span style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #bae6fd'
                        }}>
                          Bebida Inclusa
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {itemInspecionado.temBatata ? (
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#15803d', fontWeight: 600, background: '#f0fdf4', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontSize: '16px' }}>🍟</span>
                    <span>Este combo acompanha batata frita!</span>
                  </div>
                ) : (
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#b45309', fontWeight: 600, background: '#fffbeb', padding: '10px 14px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    <span style={{ fontSize: '16px' }}>ℹ️</span>
                    <span>Este combo não acompanha batata frita.</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                  Ingredientes padrão que vêm nele:
                </p>
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  fontSize: '14.5px',
                  lineHeight: 1.6,
                  color: '#1e293b',
                  fontWeight: 600
                }}>
                  {itemInspecionado.ingredientes}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setItemInspecionado(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Entendido / Fechar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (pedidoSelecionado) {
    return (
      <EditarPedidoPage
        pedidoSelecionado={pedidoSelecionado}
        setPedidoSelecionado={setPedidoSelecionado}
        sidebarMobile={sidebarMobile}
        setSidebarMobile={setSidebarMobile}
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
        logoIlda={logoIlda}
        isDriver={isDriver}
        isOwner={isOwner}
        contagemPedidosAtivos={contagemPedidosAtivos}
        contagemPedidosEntregues={contagemPedidosEntregues}
        contagemPedidosMesas={contagemPedidosMesas}
        filtroOrigem={filtroOrigem}
        setFiltroOrigem={setFiltroOrigem}
        setFiltroTipo={setFiltroTipo}
        setFiltroEntregador={setFiltroEntregador}
        setSubAbaConfig={setSubAbaConfig}
        sair={sair}
        categorias={categorias}
        categoriaEdicao={categoriaEdicao}
        setCategoriaEdicao={setCategoriaEdicao}
        buscaProdutoEdicao={buscaProdutoEdicao}
        setBuscaProdutoEdicao={setBuscaProdutoEdicao}
        adicionalEdicaoItemAberto={adicionalEdicaoItemAberto}
        setAdicionalEdicaoItemAberto={setAdicionalEdicaoItemAberto}
        termoAdicionalEdicao={termoAdicionalEdicao}
        setTermoAdicionalEdicao={setTermoAdicionalEdicao}
        removerEdicaoItemAberto={removerEdicaoItemAberto}
        setRemoverEdicaoItemAberto={setRemoverEdicaoItemAberto}
        termoRemoverEdicao={termoRemoverEdicao}
        setTermoRemoverEdicao={setTermoRemoverEdicao}
        adicionarProdutoEdicao={adicionarProdutoEdicao}
        adicionarAdicionalItemEdicao={adicionarAdicionalItemEdicao}
        removerAdicionalItemEdicao={removerAdicionalItemEdicao}
        alterarQuantidadeAdicionalItemEdicao={alterarQuantidadeAdicionalItemEdicao}
        adicionarRemocaoItemEdicao={adicionarRemocaoItemEdicao}
        removerRemocaoItemEdicao={removerRemocaoItemEdicao}
        tipoRecebimento={tipoRecebimento}
        setTipoRecebimento={setTipoRecebimento}
        enderecoEdicao={enderecoEdicao}
        setEnderecoEdicao={setEnderecoEdicao}
        numeroEdicao={numeroEdicao}
        setNumeroEdicao={setNumeroEdicao}
        bairroEdicao={bairroEdicao}
        setBairroEdicao={setBairroEdicao}
        infoDistanciaEdicao={infoDistanciaEdicao}
        setInfoDistanciaEdicao={setInfoDistanciaEdicao}
        calculandoDistanciaEdicao={calculandoDistanciaEdicao}
        calcularTaxaAutomaticaEdicao={calcularTaxaAutomaticaEdicao}
        formaPagamentoEdicao={formaPagamentoEdicao}
        setFormaPagamentoEdicao={setFormaPagamentoEdicao}
        valorPagoDinheiroEdicao={valorPagoDinheiroEdicao}
        setValorPagoDinheiroEdicao={setValorPagoDinheiroEdicao}
        foiPagoEdicao={foiPagoEdicao}
        setFoiPagoEdicao={setFoiPagoEdicao}
        salvarEdicaoPedido={salvarEdicaoPedido}
        cancelarPedido={cancelarPedido}
        isSmallScreen={isSmallScreen}
        obterComposicaoItem={obterComposicaoItem}
        setItemInspecionado={setItemInspecionado}
        formatarMoeda={formatarMoeda}
        buscaFuzzy={buscaFuzzy}
        ADICIONAIS={ADICIONAIS}
        obterIngredientesDoProduto={obterIngredientesDoProduto}
        isProdutoBebida={isProdutoBebida}
        renderModalInspecionar={renderModalInspecionar}
        ThermalReceiptArea={ThermalReceiptArea}
        obterNumeroExibicaoPedido={obterNumeroExibicaoPedido}
        adicionarOpcaoSaladaSeAplicavel={adicionarOpcaoSaladaSeAplicavel}
      />
    )
  }

  // =========================================================
  // NOVO PEDIDO
  // =========================================================

  // =========================================================
  // NOVO PEDIDO (LAYOUT UNIFICADO COM O DASHBOARD)
  // =========================================================

  if (novoPedido) {
    return (
      <NovoPedidoPage
        categorias={categorias}
        categoriaAtiva={categoriaAtiva}
        setCategoriaAtiva={setCategoriaAtiva}
        buscaProduto={buscaProduto}
        setBuscaProduto={setBuscaProduto}
        nomeCliente={nomeCliente}
        setNomeCliente={setNomeCliente}
        telefoneCliente={telefoneCliente}
        setTelefoneCliente={setTelefoneCliente}
        observacaoGeral={observacaoGeral}
        setObservacaoGeral={setObservacaoGeral}
        foiPago={foiPago}
        setFoiPago={setFoiPago}
        origem={origem}
        setOrigem={setOrigem}
        tipoRecebimentoCriacao={tipoRecebimentoCriacao}
        setTipoRecebimentoCriacao={setTipoRecebimentoCriacao}
        mesa={mesa}
        setMesa={setMesa}
        observacaoSemMesa={observacaoSemMesa}
        setObservacaoSemMesa={setObservacaoSemMesa}
        enderecoEntrega={enderecoEntrega}
        setEnderecoEntrega={setEnderecoEntrega}
        numeroEntrega={numeroEntrega}
        setNumeroEntrega={setNumeroEntrega}
        bairroCliente={bairroCliente}
        setBairroCliente={setBairroCliente}
        taxaEntrega={taxaEntrega}
        setTaxaEntrega={setTaxaEntrega}
        infoDistancia={infoDistancia}
        setInfoDistancia={setInfoDistancia}
        calculandoDistancia={calculandoDistancia}
        calcularTaxaAutomatica={calcularTaxaAutomatica}
        formaPagamentoCriacao={formaPagamentoCriacao}
        setFormaPagamentoCriacao={setFormaPagamentoCriacao}
        valorPagoDinheiroCriacao={valorPagoDinheiroCriacao}
        setValorPagoDinheiroCriacao={setValorPagoDinheiroCriacao}
        carrinho={carrinho}
        adicionarProduto={adicionarProduto}
        alterarQuantidade={alterarQuantidade}
        alterarObservacaoProduto={alterarObservacaoProduto}
        adicionalItemAberto={adicionalItemAberto}
        setAdicionalItemAberto={setAdicionalItemAberto}
        termoAdicional={termoAdicional}
        setTermoAdicional={setTermoAdicional}
        removerItemAberto={removerItemAberto}
        setRemoverItemAberto={setRemoverItemAberto}
        termoRemover={termoRemover}
        setTermoRemover={setTermoRemover}
        autocompleteItemAberto={autocompleteItemAberto}
        setAutocompleteItemAberto={setAutocompleteItemAberto}
        adicionarAdicionalProduto={adicionarAdicionalProduto}
        removerAdicionalProduto={removerAdicionalProduto}
        adicionarRemocaoProduto={adicionarRemocaoProduto}
        cancelarRemocaoProduto={cancelarRemocaoProduto}
        total={total}
        enviarPedido={enviarPedido}
        salvando={false}
        voltarPainel={voltarPainel}
        sair={sair}
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
        sidebarMobile={sidebarMobile}
        setSidebarMobile={setSidebarMobile}
        isDriver={isDriver}
        isOwner={isOwner}
        contagemPedidosAtivos={contagemPedidosAtivos}
        contagemPedidosMesas={contagemPedidosMesas}
        contagemPedidosEntregues={contagemPedidosEntregues}
        filtroOrigem={filtroOrigem}
        setFiltroOrigem={setFiltroOrigem}
        isMobile={isMobile}
        isSmallScreen={isSmallScreen}
        obterComposicaoItem={obterComposicaoItem}
        setItemInspecionado={setItemInspecionado}
        CanalLogo={CanalLogo}
        logoIlda={logoIlda}
        formatarMoeda={formatarMoeda}
        buscaFuzzy={buscaFuzzy}
        ADICIONAIS={ADICIONAIS}
        obterIngredientesDoProduto={obterIngredientesDoProduto}
        isProdutoBebida={isProdutoBebida}
        renderModalInspecionar={renderModalInspecionar}
        ThermalReceiptArea={ThermalReceiptArea}
      />
    )
  }

  // =========================================================
  // PAINEL PRINCIPAL
  // =========================================================

  return (
    <div className="cafe-app-container">
      {/* BACKDROP MOBILE QUANDO A SIDEBAR ESTIVER ABERTA */}
      {sidebarMobile && (
        <div 
          className="cafe-mobile-backdrop" 
          onClick={() => setSidebarMobile(false)}
          aria-label="Fechar menu lateral"
        />
      )}

      {/* SIDEBAR RETRÁTIL MODERNA (ESTILO CAFE / FOOD DASHBOARD) */}
      <aside 
        className={`cafe-sidebar ${sidebarAberta || sidebarMobile ? 'sidebar-open' : ''}`}
        onMouseEnter={() => setSidebarAberta(true)}
        onMouseLeave={() => setSidebarAberta(false)}
      >
        <div className="cafe-sidebar-logo">
          <div className="cafe-logo-icon" style={{ overflow: 'hidden', background: '#1c1917', border: '1px solid #333', padding: '2px' }}>
            <img src={logoIlda} alt="Ilda Lanches" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
          </div>
          <div className="cafe-logo-text">
            <span className="cafe-logo-title">Ilda Lanches</span>
            <span className="cafe-logo-sub">Central de Pedidos</span>
          </div>
        </div>

        <div className="cafe-sidebar-section">
          <div className="cafe-sidebar-heading">Menu Principal</div>
          <nav className="cafe-sidebar-nav">
            {isDriver ? (
              <>
                <button
                  type="button"
                  className={`cafe-nav-item ${filtroOrigem !== 'entregues' && filtroOrigem !== 'configuracoes' ? 'active' : ''}`}
                  onClick={() => {
                    setFiltroOrigem('todos')
                    setFiltroTipo('delivery')
                    setSidebarMobile(false)
                  }}
                  title="Entregas Disponíveis"
                >
                  <span className="cafe-nav-icon"><Bike size={18} strokeWidth={2} /></span>
                  <span className="cafe-nav-label">Entregas</span>
                  {contagemEntregasAtivas > 0 && (
                    <span className="cafe-nav-badge">{contagemEntregasAtivas}</span>
                  )}
                </button>

                <button
                  type="button"
                  className={`cafe-nav-item ${filtroOrigem === 'entregues' ? 'active' : ''}`}
                  onClick={() => {
                    setFiltroOrigem('entregues')
                    setSidebarMobile(false)
                  }}
                  title="Minhas Entregas"
                >
                  <span className="cafe-nav-icon"><CheckCheck size={18} strokeWidth={2} /></span>
                  <span className="cafe-nav-label">Entregues</span>
                  {notificacaoEntregasConcluidas > 0 && (
                    <span className="cafe-nav-badge badge-green">{notificacaoEntregasConcluidas}</span>
                  )}
                </button>

                <button
                  type="button"
                  className={`cafe-nav-item ${filtroOrigem === 'configuracoes' ? 'active' : ''}`}
                  onClick={() => {
                    setFiltroOrigem('configuracoes')
                    setSubAbaConfig('geral')
                    setSidebarMobile(false)
                  }}
                  title="Configurações e Perfil"
                >
                  <span className="cafe-nav-icon"><Settings size={18} strokeWidth={2} /></span>
                  <span className="cafe-nav-label">Configurações</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`cafe-nav-item ${filtroOrigem !== 'entregues' && filtroOrigem !== 'table' && filtroOrigem !== 'ia' && filtroOrigem !== 'configuracoes' && filtroOrigem !== 'faturamento' ? 'active' : ''}`}
                  onClick={() => {
                    setFiltroOrigem('todos')
                    setFiltroTipo('todos')
                    setSidebarMobile(false)
                  }}
                  title="Pedidos"
                >
                  <span className="cafe-nav-icon"><ClipboardList size={18} strokeWidth={2} /></span>
                  <span className="cafe-nav-label">Pedidos</span>
                  {contagemPedidosAtivos > 0 && (
                    <span className="cafe-nav-badge">{contagemPedidosAtivos}</span>
                  )}
                </button>

                <button
                  type="button"
                  className={`cafe-nav-item ${filtroOrigem === 'table' ? 'active' : ''}`}
                  onClick={() => {
                    setFiltroOrigem('table')
                    setFiltroTipo('todos')
                    setSidebarMobile(false)
                  }}
                  title="Mesas"
                >
                  <span className="cafe-nav-icon"><UtensilsCrossed size={18} strokeWidth={2} /></span>
                  <span className="cafe-nav-label">Mesas</span>
                  {contagemPedidosMesas > 0 && (
                    <span className="cafe-nav-badge badge-amber">{contagemPedidosMesas}</span>
                  )}
                </button>

                {isOwner && (
                  <button
                    type="button"
                    className={`cafe-nav-item ${filtroOrigem === 'entregues' ? 'active' : ''}`}
                    onClick={() => {
                      setFiltroOrigem('entregues')
                      setFiltroEntregador('todos')
                      setSidebarMobile(false)
                    }}
                    title="Histórico de Entregues"
                  >
                    <span className="cafe-nav-icon"><CheckCheck size={18} strokeWidth={2} /></span>
                    <span className="cafe-nav-label">Entregues</span>
                    {contagemPedidosEntregues > 0 && (
                      <span className="cafe-nav-badge badge-green">{contagemPedidosEntregues}</span>
                    )}
                  </button>
                )}

                {isOwner && (
                  <button
                    type="button"
                    className={`cafe-nav-item ${filtroOrigem === 'faturamento' ? 'active' : ''}`}
                    onClick={() => {
                      setFiltroOrigem('faturamento')
                      setSidebarMobile(false)
                    }}
                    title="Relatórios"
                  >
                    <span className="cafe-nav-icon"><TrendingUp size={18} strokeWidth={2} /></span>
                    <span className="cafe-nav-label">Relatórios</span>
                  </button>
                )}

                <button
                  type="button"
                  className={`cafe-nav-item ${filtroOrigem === 'configuracoes' ? 'active' : ''}`}
                  onClick={() => {
                    setFiltroOrigem('configuracoes')
                    setSubAbaConfig('geral')
                    setSidebarMobile(false)
                  }}
                  title="Configurações do Sistema"
                >
                  <span className="cafe-nav-icon"><Settings size={18} strokeWidth={2} /></span>
                  <span className="cafe-nav-label">Configurações</span>
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="cafe-sidebar-section" style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <div className="cafe-sidebar-heading">Ações</div>
          <nav className="cafe-sidebar-nav">
            {!isDriver && (
              <button
                type="button"
                className="cafe-nav-item btn-sidebar-novo"
                onClick={abrirNovoPedido}
                title="Novo Pedido Manual"
              >
                <span className="cafe-nav-icon"><Plus size={18} strokeWidth={2.4} /></span>
                <span className="cafe-nav-label">Novo Pedido</span>
              </button>
            )}

            <button
              type="button"
              className="cafe-nav-item"
              onClick={alternarSom}
              title={somAtivado ? "Silenciar alerta sonoro" : "Ativar alerta sonoro"}
            >
              <span className="cafe-nav-icon">
                {somAtivado ? <Volume2 size={18} strokeWidth={2} /> : <VolumeX size={18} strokeWidth={2} />}
              </span>
              <span className="cafe-nav-label">{somAtivado ? 'Som Ativado' : 'Som Mudo'}</span>
            </button>

            <button
              type="button"
              className="cafe-nav-item btn-sidebar-logout"
              onClick={sair}
              title="Sair do Sistema"
            >
              <span className="cafe-nav-icon"><LogOut size={18} strokeWidth={2} /></span>
              <span className="cafe-nav-label">Sair</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL À DIREITA */}
      <div className={`cafe-main-area cafe-main-area-central ${buscaMobileAberta ? 'has-search-open' : ''}`}>
        {/* TOPBAR MODERNA */}
        <header className="cafe-topbar cafe-topbar-central">
          <div className="cafe-topbar-left">
            {/* BRANDING VISÍVEL NO CELULAR (ONDE O MENU LATERAL ESQUERDO ESTÁ OCULTO) */}
            <div className="cafe-mobile-brand">
              <div className="cafe-mobile-logo-icon" style={{ overflow: 'hidden', background: '#1c1917', border: '1px solid #333', padding: '1px' }}>
                <img src={logoIlda} alt="Ilda Lanches" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              </div>
              <div className="cafe-mobile-brand-text">
                <span className="cafe-mobile-brand-title">Ilda Lanches</span>
                <span className="cafe-mobile-brand-sub">Central</span>
              </div>
            </div>

            {/* CAMPO DE BUSCA (DESKTOP E TABLET) */}
            <div className={`cafe-search-box cafe-search-box-expanded ${buscaMobileAberta ? 'mobile-search-open' : ''}`}>
              <span className="cafe-search-icon"><Search size={17} strokeWidth={2} /></span>
              <input
                type="text"
                className="cafe-search-input"
                placeholder="Buscar cliente, pedidos (ex: 6070 6071), mesa ou endereço..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
              {termoBusca && (
                <button
                  type="button"
                  className="cafe-search-clear"
                  onClick={() => setTermoBusca('')}
                  title="Limpar busca"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          <div className="cafe-topbar-right">
            {/* BOTÃO TOGGLE DE BUSCA NO CELULAR */}
            <button
              type="button"
              className={`cafe-icon-btn btn-mobile-search-toggle ${buscaMobileAberta ? 'active' : ''}`}
              onClick={() => setBuscaMobileAberta(!buscaMobileAberta)}
              title="Buscar pedidos"
              aria-label="Buscar pedidos"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke={buscaMobileAberta ? '#ffffff' : '#0f172a'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: 'block', width: '20px', height: '20px' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {!isDriver && (
              <button
                type="button"
                className={`btn-topbar-store-status ${storeStatus.isOpen ? 'store-open' : 'store-closed'}`}
                onClick={() => {
                  if (storeStatus.isOpen && (!storeStatus.closedChannels || storeStatus.closedChannels.length === 0)) {
                    setCanalFechamento('all')
                    setModalFecharLojaAberto(true)
                  } else if (!storeStatus.isOpen) {
                    setCanalAbertura('all')
                    setModalReabrirLojaAberto(true)
                  } else {
                    setModalFecharLojaAberto(true)
                  }
                }}
                title={storeStatus.isOpen 
                  ? ((isAnotaAiOpen && isIfoodOpen)
                      ? "Loja Aberta (Anota AI e iFood abertos — clique para gerenciar)"
                      : isAnotaAiOpen 
                        ? "Loja Aberta (Anota AI Aberto 🟢 | iFood Fechado 🔴 — clique para gerenciar)"
                        : "Loja Aberta (iFood Aberto 🟢 | Anota AI Fechado 🔴 — clique para gerenciar)")
                  : (storeRemainingSeconds > 0 
                      ? `Loja Fechada - Restam ${formatarSegundosParaHora(storeRemainingSeconds)} (clique para reabrir)`
                      : "Loja Fechada (Anota AI e iFood fechados — clique para abrir)")}
                aria-label={storeStatus.isOpen ? "Loja Aberta" : "Loja Fechada"}
              >
                <span className={`store-status-dot ${storeStatus.isOpen ? 'dot-green' : 'dot-red'}`} />
                <Store size={18} strokeWidth={2.4} />
              </button>
            )}

            {!isDriver && (
              <button
                type="button"
                className="cafe-btn-new-order"
                onClick={abrirNovoPedido}
                title="Criar novo pedido"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="btn-new-order-text">Novo Pedido</span>
              </button>
            )}

            <button
              type="button"
              className="cafe-icon-btn btn-topbar-sound"
              onClick={alternarSom}
              title={somAtivado ? "Alerta sonoro ligado" : "Alerta sonoro silenciado"}
            >
              {somAtivado ? <Volume2 size={18} strokeWidth={2} /> : <VolumeX size={18} strokeWidth={2} />}
              {somAtivado && <span className="cafe-notification-dot" />}
            </button>

            <div className="cafe-user-profile">
              <div className="cafe-user-avatar" style={{ overflow: 'hidden' }}>
                {fotosDonos[emailUsuario.toLowerCase()] ? (
                  <img
                    src={fotosDonos[emailUsuario.toLowerCase()]}
                    alt={nomeUsuario}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  nomeUsuario ? nomeUsuario[0].toUpperCase() : 'U'
                )}
              </div>
              <div className="cafe-user-info">
                <strong>{nomeUsuario}</strong>
                <small>{isOwner ? 'Dono' : isDriver ? 'Entregador' : 'Colaborador'}</small>
              </div>
            </div>
          </div>
        </header>

        {/* BARRA DE BUSCA EXPANSÍVEL NO CELULAR SE O OPERADOR CLICAR NA LUPA */}
        {buscaMobileAberta && (
          <div className="cafe-mobile-search-bar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="#475569"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'block', width: '18px', height: '18px', minWidth: '18px' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="cafe-search-input"
              placeholder="Buscar cliente, pedidos (ex: 6070 6071), mesa ou endereço..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              style={{ fontSize: '16px' }}
            />
            {termoBusca ? (
              <button
                type="button"
                className="cafe-search-clear"
                onClick={() => setTermoBusca('')}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                className="cafe-search-clear"
                onClick={() => setBuscaMobileAberta(false)}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL DO DASHBOARD */}
        <main className="cafe-main-content">
          <div className="cafe-page-header">
            <div>
              <h2 className="cafe-page-title">
                {filtroOrigem === 'configuracoes'
                  ? 'Configurações'
                  : filtroOrigem === 'faturamento' ? 'Relatórios'
                  : filtroOrigem === 'entregues' ? 'Pedidos Entregues'
                  : filtroOrigem === 'table' ? 'Mesas'
                  : filtroOrigem === 'ia' ? 'Inteligência Artificial'
                  : 'Central de Pedidos'}
              </h2>
              <p className="cafe-page-subtitle">
                {filtroOrigem === 'faturamento'
                  ? (subAbaRelatorio === 'controle'
                    ? 'Acompanhe a contagem de lanches, pães e consumo de itens por período.'
                    : 'Acompanhe o faturamento, ticket médio e formas de pagamento em tempo real.')
                  : filtroOrigem === 'configuracoes'
                  ? (isOwner
                    ? 'Gerencie fotos de perfil e troca de senha.'
                    : 'Gerencie sua foto de perfil e troca de senha.')
                  : filtroOrigem === 'entregues'
                  ? 'Histórico dos pedidos que já foram finalizados e entregues.'
                  : filtroOrigem === 'table'
                  ? 'Acompanhe os pedidos das mesas em atendimento no salão.'
                  : filtroOrigem === 'ia'
                  ? 'Monitoramento de agentes autônomos e métricas operacionais.'
                  : 'Acompanhe os pedidos de entrega e retirada em tempo real.'}
              </p>
            </div>
            {filtroOrigem === 'configuracoes' && subAbaConfig === 'todos_pedidos' && isOwner && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="cafe-pill-btn"
                  onClick={() => setSubAbaConfig('geral')}
                >
                  <ArrowLeft size={15} strokeWidth={2.4} />
                  <span>Voltar às Configurações</span>
                </button>
              </div>
            )}
          </div>

          {/* BARRA DE FILTROS ESTILO CAFE */}
          {filtroOrigem !== 'ia' && filtroOrigem !== 'configuracoes' && filtroOrigem !== 'faturamento' && (
          <div className="cafe-filter-bar">
            {filtroOrigem === 'entregues' ? (
              <div className="entregues-top-controls">
                {!isDriver && (
                  <div className="cafe-pills-row">
                    <button
                      type="button"
                      className={`cafe-pill-btn ${filtroEntregador === 'todos' ? 'active' : ''}`}
                      onClick={() => setFiltroEntregador('todos')}
                    >
                      <UserCheck size={14} strokeWidth={2} />
                      <span>Todos</span>
                    </button>
                    <button
                      type="button"
                      className={`cafe-pill-btn ${filtroEntregador === 'renan' ? 'active' : ''}`}
                      onClick={() => setFiltroEntregador('renan')}
                    >
                      <Bike size={14} strokeWidth={2} />
                      <span>Renan</span>
                    </button>
                    <button
                      type="button"
                      className={`cafe-pill-btn ${filtroEntregador === 'felipe' ? 'active' : ''}`}
                      onClick={() => setFiltroEntregador('felipe')}
                    >
                      <Bike size={14} strokeWidth={2} />
                      <span>Felipe</span>
                    </button>
                  </div>
                )}

                <div className="periodo-pills-row">
                  <span className="periodo-pills-label">
                    <Calendar size={13} strokeWidth={2.2} />
                    <span>Período:</span>
                  </span>
                  <button
                    type="button"
                    className={`periodo-pill-btn ${filtroPeriodoEntregues === 'hoje' ? 'active' : ''}`}
                    onClick={() => setFiltroPeriodoEntregues('hoje')}
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    className={`periodo-pill-btn ${filtroPeriodoEntregues === '7dias' ? 'active' : ''}`}
                    onClick={() => setFiltroPeriodoEntregues('7dias')}
                  >
                    7 dias
                  </button>
                  <button
                    type="button"
                    className={`periodo-pill-btn ${filtroPeriodoEntregues === '30dias' ? 'active' : ''}`}
                    onClick={() => setFiltroPeriodoEntregues('30dias')}
                  >
                    30 dias
                  </button>
                </div>
              </div>
            ) : filtroOrigem === 'table' ? (
              <div className="cafe-pills-row">
                <button
                  type="button"
                  className={`cafe-pill-btn ${filtroTipo === 'todos' ? 'active' : ''}`}
                  onClick={() => setFiltroTipo('todos')}
                >
                  <UtensilsCrossed size={14} strokeWidth={2} />
                  <span>Todos</span>
                </button>
                <button
                  type="button"
                  className={`cafe-pill-btn ${filtroTipo === 'dine_in' ? 'active' : ''}`}
                  onClick={() => setFiltroTipo('dine_in')}
                >
                  <UtensilsCrossed size={14} strokeWidth={2} />
                  <span>Comer no local</span>
                </button>
                <button
                  type="button"
                  className={`cafe-pill-btn ${filtroTipo === 'pickup' ? 'active' : ''}`}
                  onClick={() => setFiltroTipo('pickup')}
                >
                  <ShoppingBag size={14} strokeWidth={2} />
                  <span>Levar</span>
                </button>
              </div>
            ) : filtroOrigem !== 'ia' ? (
              <>
                <div className="cafe-pills-row">
                  <button
                    type="button"
                    className={`cafe-pill-btn ${filtroTipo === 'todos' ? 'active' : ''}`}
                    onClick={() => setFiltroTipo('todos')}
                  >
                    <ClipboardList size={14} strokeWidth={2} />
                    <span>Todos os Pedidos</span>
                  </button>
                  <button
                    type="button"
                    className={`cafe-pill-btn ${filtroTipo === 'delivery' ? 'active' : ''}`}
                    onClick={() => setFiltroTipo('delivery')}
                  >
                    <Bike size={14} strokeWidth={2} />
                    <span>Entrega</span>
                  </button>
                  <button
                    type="button"
                    className={`cafe-pill-btn ${filtroTipo === 'retirada' ? 'active' : ''}`}
                    onClick={() => setFiltroTipo('retirada')}
                  >
                    <ShoppingBag size={14} strokeWidth={2} />
                    <span>Retirada</span>
                  </button>
                </div>

                <div className="cafe-channels-row">
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginRight: '4px' }}>Canal:</span>
                  <button
                    type="button"
                    className={`cafe-channel-btn ${filtroOrigem === 'todos' ? 'active' : ''}`}
                    onClick={() => setFiltroOrigem('todos')}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    className={`cafe-channel-btn ${filtroOrigem === 'whatsapp' ? 'active' : ''}`}
                    onClick={() => setFiltroOrigem('whatsapp')}
                  >
                    <CanalLogo canal="whatsapp" size={15} style={{ marginRight: '6px' }} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    className={`cafe-channel-btn ${filtroOrigem === 'anota_ai' ? 'active' : ''}`}
                    onClick={() => setFiltroOrigem('anota_ai')}
                  >
                    <CanalLogo canal="anota_ai" size={15} style={{ marginRight: '6px' }} />
                    <span>Anota Aí</span>
                  </button>
                  <button
                    type="button"
                    className={`cafe-channel-btn ${filtroOrigem === 'ifood' ? 'active' : ''}`}
                    onClick={() => setFiltroOrigem('ifood')}
                  >
                    <CanalLogo canal="ifood" size={15} style={{ marginRight: '6px' }} />
                    <span>iFood</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
          )}

        {/* FUNÇÃO RENDER ORDER CARD REUTILIZÁVEL (ESTILO KDS DODO IS / WOLT) */}
        {(() => {
          function renderOrderCard(pedido, coluna) {
            const isDelivery = pedido.order_type === 'delivery' || pedido.manual_delivery || Boolean(pedido.delivery_address)
            const tempoInfo = calcularTempoDecorrido(pedido.created_at, agoraTempoDecorrido, isDelivery)
            const infoAtraso = verificarAtrasoPedido(pedido, coluna, tempoInfo.minutos)

            return (
              <div className={`order-card ${infoAtraso.emAtraso ? 'order-card-atrasado' : ''}`} key={pedido.id} style={{ margin: 0 }}>
                <div className="order-card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                        Pedido #{obterNumeroExibicaoPedido(pedido)}
                      </strong>
                      <span className={`order-kds-timer timer-${tempoInfo.status}`}>
                        <Clock size={11} strokeWidth={2.4} />
                        <span>{tempoInfo.texto}</span>
                      </span>
                      {infoAtraso.emAtraso && (
                        <span className="badge-pedido-em-atraso" title={`Pedido em produção ultrapassou o limite de ${infoAtraso.limiteMinutos} minutos`}>
                          <AlertTriangle size={11} strokeWidth={2.6} />
                          <span>Pedido em atraso</span>
                        </span>
                      )}
                    </div>

                    {pedido.customer_name && (
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
                        {pedido.customer_name}
                      </span>
                    )}

                    {!pedido.table_id && pedido.source === 'table' && pedido.delivery_address && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>
                        <MapPin size={12} strokeWidth={2.2} />
                        <span>{pedido.delivery_address}</span>
                      </span>
                    )}
                  </div>

                  <div className="order-status-area">
                    <span className={`order-type-badge ${
                      pedido.order_type === 'delivery' || pedido.manual_delivery ? 'badge-delivery'
                      : pedido.order_type === 'dine_in' ? 'badge-dinein'
                      : 'badge-pickup'
                    }`}>
                      {(() => {
                        const numMesa = extrairNumeroMesaPedido(pedido)
                        if (pedido.order_type === 'delivery' || pedido.manual_delivery) {
                          return <span>Entrega</span>
                        }
                        if (numMesa) {
                          return pedido.order_type === 'pickup'
                            ? <span>Mesa {numMesa} (Levar)</span>
                            : <span>Mesa {numMesa}</span>
                        }
                        if (pedido.order_type === 'pickup' && (pedido.source === 'table' || (typeof pedido.notes === 'string' && pedido.notes.includes('[LEVAR]')))) {
                          return <span>Levar</span>
                        }
                        if (pedido.order_type === 'dine_in' || pedido.source === 'table') {
                          return <span>Local</span>
                        }
                        return <span>Retirada</span>
                      })()}
                    </span>

                    <span className={`order-source ${
                      pedido.source === 'table' ? 'source-table'
                      : pedido.source === 'whatsapp' ? 'source-whatsapp'
                      : pedido.source === 'anota_ai' ? 'source-anota'
                      : pedido.source === 'delivery' ? 'source-delivery'
                      : pedido.source === 'retirada' ? 'source-retirada'
                      : 'source-ifood'
                    }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      {['whatsapp', 'anota_ai', 'ifood'].includes(pedido.source) && (
                        <CanalLogo canal={pedido.source} size={13} />
                      )}
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>
                        {pedido.source === 'table'
                          ? (() => {
                              const numM = extrairNumeroMesaPedido(pedido)
                              return numM ? `Mesa ${numM}` : (pedido.table_id ? 'Mesa' : (pedido.order_type === 'pickup' ? 'Levar' : 'Sem mesa'))
                            })()
                          : pedido.source === 'whatsapp' ? 'WhatsApp'
                          : pedido.source === 'anota_ai' ? 'Anota Aí'
                          : pedido.source === 'ifood' ? 'iFood'
                          : pedido.source === 'delivery' ? 'Entrega'
                          : pedido.source === 'retirada' ? 'Retirada'
                          : pedido.source}
                      </span>
                    </span>

                    <small className="order-time">
                      {(() => {
                        const dataPedido = new Date(pedido.created_at)
                        const diffHoras = (agoraTempoDecorrido - dataPedido.getTime()) / (1000 * 60 * 60)
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
                  {(pedido.order_items || []).filter(Boolean).map((item, itIdx) => {
                    const info = decomporItemEAdicionais(item)
                    return (
                      <div key={item.id || itIdx} style={{ marginBottom: '6px' }}>
                        <div className="order-item">
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            <span style={{ display: 'inline-block', background: '#f1f5f9', color: '#0f172a', fontWeight: 800, padding: '1px 6px', borderRadius: '6px', marginRight: '6px', fontSize: '11px' }}>
                              {item.quantity || 1}x
                            </span>
                            {item.product_name || 'Produto'}
                          </span>
                          <strong style={{ color: '#0f172a' }}>R$ {Number(info.totalLanchePuro || 0).toFixed(2).replace('.', ',')}</strong>
                        </div>
                        {(info.listaAdicionais || []).map((ad, adIdx) => (
                          <div key={adIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#15803d', paddingLeft: '28px', marginTop: '2px', fontWeight: 500 }}>
                            <span>+ {ad.quantidade || 1}x {ad.nome}</span>
                            <span>R$ {Number(ad.total || 0).toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                        {(info.listaRemocoes || []).map((rem, remIdx) => (
                          <div key={remIdx} style={{ fontSize: '12px', color: '#b91c1c', paddingLeft: '28px', marginTop: '2px', fontWeight: 600 }}>
                            - Sem {rem.nome}
                          </div>
                        ))}
                        {info.observacaoLimpa && (
                          <div style={{ fontSize: '12px', color: '#64748b', paddingLeft: '28px', fontStyle: 'italic', marginTop: '2px' }}>
                            Obs: {info.observacaoLimpa}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {(Number(pedido.delivery_fee || 0) > 0 || pedido.order_type === 'delivery' || pedido.manual_delivery || Boolean(pedido.delivery_address)) && (
                    <div className="order-item order-item-taxa">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <Bike size={13} strokeWidth={2} />
                        <span>Taxa de entrega</span>
                      </span>
                      <strong>R$ {Number(pedido.delivery_fee || 0).toFixed(2).replace('.', ',')}</strong>
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <div className="order-card-total-wrapper">
                    <div className="order-card-total-row">
                      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total</span>
                        <strong style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>R$ {Number(pedido.total || 0).toFixed(2).replace('.', ',')}</strong>
                      </div>
                      {pedido.payment_status === 'paid' && (
                        <span className="order-paid-tag">
                          <Check size={11} strokeWidth={3} />
                          <span>PAGO</span>
                        </span>
                      )}
                    </div>

                    {/* TROCO EMBAIXO DO TOTAL ONDE APARECE O PEDIDO */}
                    {(() => {
                      const dadosDin = extrairDadosDinheiroETroco(pedido)
                      if (dadosDin && dadosDin.isDinheiro && dadosDin.troco > 0) {
                        return (
                          <div style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#b45309',
                            marginTop: '2px'
                          }}>
                            Troco: R$ {dadosDin.troco.toFixed(2).replace('.', ',')}
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>

                  <div className="order-card-action-bar">
                    {/* BOTÕES SECUNDÁRIOS À ESQUERDA: IMPRIMIR E EDITAR */}
                    <div className="order-left-tools">
                      {/* Botão Imprimir */}
                      <button
                        className="btn-card-tool btn-tool-print"
                        onClick={() => imprimirCupom(pedido, true)}
                        title="Imprimir cupom térmico manualmente"
                      >
                        <Printer size={16} strokeWidth={2} />
                      </button>

                      {/* Botão Editar */}
                      {!isDriver && pedido.status !== 'completed' && (
                        <button
                          className="btn-card-tool btn-tool-edit"
                          title="Editar pedido"
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
                                const parsedRemocoes = (decomposto.listaRemocoes || []).map(r => ({
                                  nome: r.nome,
                                  valor: r.valor
                                }))
                                const unitBase = it.quantity > 0 ? (decomposto.totalLanchePuro / it.quantity) : Number(it.unit_price)
                                return {
                                  ...it,
                                  notes: decomposto.observacaoLimpa,
                                  adicionais: parsedAdicionais,
                                  remocoes: parsedRemocoes,
                                  unit_price_base: unitBase,
                                  unit_price: unitBase,
                                  total_price: Number(it.total_price)
                                }
                              })
                            })
                            setTipoRecebimento(pedido.manual_delivery === true ? 'entrega' : (pedido.order_type === 'dine_in' || pedido.source === 'table' ? 'comer_no_local' : 'retirada'))
                            setFoiPagoEdicao(pedido.payment_status === 'paid' || Boolean(pedido.foiPago) || String(pedido.payment_method || '').toLowerCase() === 'pago')

                            const methodAtual = (pedido.payment_method || '').toLowerCase()
                            const isDin = methodAtual === 'dinheiro' || methodAtual.includes('dinheiro')
                            const isCard = methodAtual === 'cartao' || methodAtual.includes('cartao') || methodAtual === 'card'
                            const isPix = methodAtual === 'pix' || methodAtual.includes('pix')
                            setFormaPagamentoEdicao(isDin ? 'dinheiro' : (isCard ? 'cartao' : (isPix ? 'pix' : '')))
                            const dadosDinheiro = extrairDadosDinheiroETroco(pedido)
                            if (dadosDinheiro && dadosDinheiro.valorPago) {
                              setValorPagoDinheiroEdicao(String(dadosDinheiro.valorPago).replace('.', ','))
                            } else {
                              setValorPagoDinheiroEdicao('')
                            }

                            setCategoriaEdicao('Hambúrgueres')
                            setBuscaProdutoEdicao('')
                            const endAtual = pedido.delivery_address || ''
                            let ruaExtraida = endAtual
                            let numExtraido = ''
                            let bairroExtraido = (pedido.bairro || '').trim()

                            const matchB = ruaExtraida.match(/[-,\s]*Bairro:\s*([^,-]+)/i)
                            if (matchB && matchB[1]) {
                              if (!bairroExtraido) bairroExtraido = matchB[1].trim()
                              ruaExtraida = ruaExtraida.replace(/[-,\s]*Bairro:\s*[^,-]+/i, '').trim()
                            }

                            const matchDashB = ruaExtraida.match(/\s*-\s*([^,-]+?)(?:,\s*Bady Bassitt|$)/i)
                            if (!bairroExtraido && matchDashB && matchDashB[1]) {
                              bairroExtraido = matchDashB[1].trim()
                              ruaExtraida = ruaExtraida.replace(/\s*-\s*[^,-]+?(?:,\s*Bady Bassitt|$)/i, '').trim()
                            }

                            const partes = ruaExtraida.split(',').map(p => p.trim()).filter(Boolean)
                            const numIdx = partes.findLastIndex(p => /^\d+[a-zA-Z]?$/.test(p))
                            if (numIdx > -1) {
                              numExtraido = partes[numIdx]
                              ruaExtraida = partes.filter((_, i) => i !== numIdx).join(', ')
                            }

                            setEnderecoEdicao(ruaExtraida)
                            setNumeroEdicao(numExtraido)
                            setBairroEdicao(bairroExtraido)
                            setInfoDistanciaEdicao(null)
                            setCalculandoDistanciaEdicao(false)
                          }}
                        >
                          <Pencil size={15} strokeWidth={2} />
                        </button>
                      )}
                    </div>

                    {/* AÇÃO PRINCIPAL EM DESTAQUE À DIREITA (BOTÃO PRONTO AMPLIADO COM LETRA BRANCA) */}
                    <div className="order-right-action">
                      {coluna === 'analise' && !isDriver && (
                        <button
                          className="btn-kds-main-action btn-kds-produzir"
                          onClick={() => mandarParaProducao(pedido)}
                          title="Enviar pedido para a chapa/cozinha"
                          style={{ color: '#ffffff' }}
                        >
                          <ChefHat size={16} strokeWidth={2.4} color="#ffffff" />
                          <span style={{ color: '#ffffff', fontWeight: 800 }}>Produção</span>
                        </button>
                      )}

                      {coluna === 'producao' && !isDriver && (
                        <button
                          className="btn-kds-main-action btn-kds-pronto"
                          onClick={() => marcarComoPronto(pedido)}
                          title="Marcar pedido como pronto"
                          style={{ color: '#ffffff' }}
                        >
                          <CheckCircle2 size={18} strokeWidth={2.4} color="#ffffff" />
                          <span style={{ color: '#ffffff', fontWeight: 800 }}>Pronto</span>
                        </button>
                      )}

                      {coluna === 'pronto' && (
                        (pedido.manual_delivery || pedido.order_type === 'delivery' || !isPedidoLocalOuRetirada(pedido)) ? (
                          // Pedido de Entrega
                          isDriver ? (
                            <button
                              className="btn-kds-main-action btn-kds-entregar"
                              onClick={() => realizarEntrega(pedido)}
                              style={{ color: '#ffffff' }}
                            >
                              <Bike size={16} strokeWidth={2.4} color="#ffffff" />
                              <span style={{ color: '#ffffff', fontWeight: 800 }}>Realizar entrega</span>
                            </button>
                          ) : (
                            <div className="kds-dispatch-group">
                              <select 
                                id={`entregador-${pedido.id}`}
                                className="kds-driver-select"
                              >
                                <option value="7794e927-ae46-4a74-a75b-31fdf1e5ce66">Renan</option>
                                <option value="e47a1bf2-3b93-4010-92e0-dfd3fd49a73c">Felipe</option>
                              </select>
                              <button
                                className="btn-kds-main-action btn-kds-entregar"
                                style={{ color: '#ffffff' }}
                                onClick={() => {
                                  const select = document.getElementById(`entregador-${pedido.id}`);
                                  const driverId = select.value;
                                  const driverName = select.options[select.selectedIndex].text;
                                  realizarEntregaDono(pedido, driverId, driverName);
                                }}
                              >
                                <Bike size={15} strokeWidth={2.4} color="#ffffff" />
                                <span style={{ color: '#ffffff', fontWeight: 800 }}>Entregar</span>
                              </button>
                            </div>
                          )
                        ) : (
                          // Retirada ou Mesa
                          !isDriver && (
                            <button
                              className="btn-kds-main-action btn-kds-finalizar"
                              onClick={() => finalizarPedidoDireto(pedido)}
                              style={{ color: '#ffffff' }}
                            >
                              {pedido.order_type === 'dine_in' || pedido.source === 'table' ? (
                                <>
                                  <UtensilsCrossed size={16} strokeWidth={2.4} color="#ffffff" />
                                  <span style={{ color: '#ffffff', fontWeight: 800 }}>Servido</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={16} strokeWidth={2.4} color="#ffffff" />
                                  <span style={{ color: '#ffffff', fontWeight: 800 }}>Entregue</span>
                                </>
                              )}
                            </button>
                          )
                        )
                      )}

                      {coluna === 'entregue' && (
                        <button
                          className="btn-kds-main-action btn-kds-cancelar-entrega"
                          onClick={() => cancelarEntregaPedido(pedido)}
                          title="Cancelar entrega deste pedido e voltar para Prontos para Entrega"
                        >
                          <RotateCcw size={15} strokeWidth={2.4} color="#ffffff" />
                          <span style={{ color: '#ffffff', fontWeight: 800 }}>Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          if (filtroOrigem === 'ia') {
            return (
              <div className="cafe-page-motion" key="ia">
                <IADashboard />
              </div>
            )
          }

          if (filtroOrigem === 'faturamento' && isOwner) {
            return (
              <ErrorBoundary resetKey={subAbaRelatorio}>
              <RelatoriosPage
                pedidos={pedidos}
                pedidosHistoricoCompleto={pedidosHistoricoCompleto}
                filtroPeriodoTodosPedidos={filtroPeriodoTodosPedidos}
                setFiltroPeriodoTodosPedidos={setFiltroPeriodoTodosPedidos}
                startTransitionPeriodo={startTransitionPeriodo}
                subAbaRelatorio={subAbaRelatorio}
                setSubAbaRelatorio={setSubAbaRelatorio}
                buscaItemControle={buscaItemControle}
                setBuscaItemControle={setBuscaItemControle}
                filtroCategoriaControle={filtroCategoriaControle}
                setFiltroCategoriaControle={setFiltroCategoriaControle}
                mostrarTodosProducao={mostrarTodosProducao}
                setMostrarTodosProducao={setMostrarTodosProducao}
                setModalDetalhesFat={setModalDetalhesFat}
                calcularDiscriminacaoPagamento={calcularDiscriminacaoPagamento}
                formatarMoeda={formatarMoeda}
                formatarNumero={formatarNumero}
                renderOrderCard={renderOrderCard}
                isOwner={isOwner}
              />
              </ErrorBoundary>
            )
          }

          if (filtroOrigem === 'configuracoes') {
            return (
              <ConfiguracoesPage
                emailUsuario={emailUsuario}
                nomeUsuario={nomeUsuario}
                fotoPropria={fotoPropria}
                atualizarFotoPropria={atualizarFotoPropria}
                removerFotoPropria={removerFotoPropria}
                novaSenha={novaSenha}
                setNovaSenha={setNovaSenha}
                confirmarNovaSenha={confirmarNovaSenha}
                setConfirmarNovaSenha={setConfirmarNovaSenha}
                handleTrocarSenha={handleTrocarSenha}
                salvandoSenha={salvandoSenha}
                msgSenha={msgSenha}
                sair={sair}
              />
            )
          }

          if (carregandoPedidos && (!pedidos || pedidos.length === 0)) {
            return (
              <div className="empty">
                <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <ClipboardList size={40} strokeWidth={1.5} color="#94a3b8" />
                </div>
                <h3>Carregando pedidos...</h3>
              </div>
            )
          }

          // Se estiver na aba 'entregues', exibe layout em colunas estilo Kanban por entregador com resumo de métricas no topo
          if (filtroOrigem === 'entregues') {
            return (
              <EntreguesPage
                emailUsuario={emailUsuario}
                session={session}
                DRIVER_RENAN_ID={DRIVER_RENAN_ID}
                DRIVER_FELIPE_ID={DRIVER_FELIPE_ID}
                pedidosFiltrados={pedidosFiltrados}
                isDriver={isDriver}
                filtroEntregador={filtroEntregador}
                setFiltroEntregador={setFiltroEntregador}
                filtroPeriodoEntregues={filtroPeriodoEntregues}
                formatarMoeda={formatarMoeda}
                formatarNumero={formatarNumero}
                calcularDiscriminacaoPagamento={calcularDiscriminacaoPagamento}
                setModalDetalhesEntregador={setModalDetalhesEntregador}
                renderOrderCard={renderOrderCard}
              />
            )
          }

          // FLUXO PRINCIPAL: KANBAN COM DIVISÃO DE PRONTOS NO LOCAL E PRONTOS PARA ENTREGA
          // REGRA DE OPERAÇÃO: Os pedidos mais antigos aparecem no topo/início da lista para prioridade de atendimento
          const ordenarPorMaisAntigo = (lista) => {
            return [...lista].sort((a, b) => {
              const dataA = new Date(a.created_at || a.created_at_br || 0).getTime()
              const dataB = new Date(b.created_at || b.created_at_br || 0).getTime()
              return dataA - dataB
            })
          }

          const pedidosEmProducao = ordenarPorMaisAntigo(
            pedidosFiltrados.filter(p => !p.status || p.status === 'new' || p.status === 'accepted' || p.status === 'preparing')
          )
          const pedidosProntosLocal = ordenarPorMaisAntigo(
            pedidosFiltrados.filter(p => p.status === 'ready' && isPedidoLocalOuRetirada(p))
          )
          const pedidosProntosEntrega = ordenarPorMaisAntigo(
            pedidosFiltrados.filter(p => p.status === 'ready' && !isPedidoLocalOuRetirada(p))
          )

          const mostrarColunaLocal = filtroTipo === 'todos' || filtroTipo === 'retirada' || filtroTipo === 'table' || filtroTipo === 'dine_in' || filtroTipo === 'pickup'
          const mostrarColunaEntrega = (filtroTipo === 'todos' || filtroTipo === 'delivery') && filtroOrigem !== 'table'
          const numColunasVisiveis = 1 + (mostrarColunaLocal ? 1 : 0) + (mostrarColunaEntrega ? 1 : 0)

          const totalPedidosPainel = pedidosEmProducao.length + (mostrarColunaLocal ? pedidosProntosLocal.length : 0) + (mostrarColunaEntrega ? pedidosProntosEntrega.length : 0)

          return (
            <div className="kanban-wrapper cafe-page-motion" key={`kanban-${filtroOrigem}-${filtroTipo}`}>
              <div className={`anota-kanban-grid ${numColunasVisiveis === 3 ? 'anota-kanban-grid-3col' : ''}`}>
                {/* COLUNA 1: EM PRODUÇÃO */}
                <div className="kanban-col kanban-col-producao">
                  <div className="kanban-col-header header-producao">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <ChefHat size={16} strokeWidth={2.2} />
                      <span>Em produção</span>
                    </span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {pedidosEmProducao.length >= 1 && !isDriver && (
                        <button
                          type="button"
                          className="btn-finalizar-coluna"
                          style={{ color: '#d97706' }}
                          onClick={() => finalizarTodosEmProducao(pedidosEmProducao)}
                          title="Finalizar todos os pedidos em produção"
                        >
                          <CheckCircle2 size={13} strokeWidth={2.6} />
                          <span>Finalizar</span>
                        </button>
                      )}
                      <span className="kanban-col-count">{pedidosEmProducao.length}</span>
                    </div>
                  </div>
                  <div className="kanban-cards-body">
                    {pedidosEmProducao.length === 0 ? (
                      <div className="kanban-cards-empty">
                        <div className="kanban-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                          <ChefHat size={36} strokeWidth={1.5} color="#cbd5e1" />
                        </div>
                        <span>Nenhum pedido no momento.</span>
                        <small style={{ color: '#94a3b8' }}>Itens em preparo na chapa/cozinha</small>
                      </div>
                    ) : (
                      pedidosEmProducao.map(p => renderOrderCard(p, 'producao'))
                    )}
                  </div>
                </div>

                {/* COLUNA 2: PRONTOS NO LOCAL (RETIRADA E COMER NO LOCAL) */}
                {mostrarColunaLocal && (
                  <div className="kanban-col kanban-col-pronto-local">
                    <div className="kanban-col-header header-pronto-local">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <UtensilsCrossed size={16} strokeWidth={2.2} />
                        <span>{filtroOrigem === 'table' ? 'Prontos (Mesa / Levar)' : 'Prontos no Local'}</span>
                      </span>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {pedidosProntosLocal.length >= 1 && !isDriver && (
                          <button
                            type="button"
                            className="btn-finalizar-coluna"
                            style={{ color: filtroOrigem === 'table' ? '#7e22ce' : '#0284c7' }}
                            onClick={() => finalizarTodosProntosLocal(pedidosProntosLocal)}
                            title={filtroOrigem === 'table' ? "Marcar todas as mesas e levar como servidos/entregues" : "Finalizar todos os pedidos prontos no local"}
                          >
                            <CheckCircle2 size={13} strokeWidth={2.6} />
                            <span>Finalizar</span>
                          </button>
                        )}
                        <span className="kanban-col-count">{pedidosProntosLocal.length}</span>
                      </div>
                    </div>
                    <div className="kanban-cards-body">
                      {pedidosProntosLocal.length === 0 ? (
                        <div className="kanban-cards-empty">
                          <div className="kanban-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                            <UtensilsCrossed size={36} strokeWidth={1.5} color="#cbd5e1" />
                          </div>
                          <span>Nenhum pedido no momento.</span>
                          <small style={{ color: '#94a3b8' }}>
                            {filtroOrigem === 'table' ? 'Pedidos das mesas prontos para servir ou levar' : 'Retiradas no balcão'}
                          </small>
                        </div>
                      ) : (
                        pedidosProntosLocal.map(p => renderOrderCard(p, 'pronto'))
                      )}
                    </div>
                  </div>
                )}

                {/* COLUNA 3: PRONTOS PARA ENTREGA (DELIVERY) */}
                {mostrarColunaEntrega && (
                  <div className="kanban-col kanban-col-pronto-entrega">
                    <div className="kanban-col-header header-pronto">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Bike size={16} strokeWidth={2.2} />
                        <span>Prontos para Entrega</span>
                      </span>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', position: 'relative' }} ref={menuDespachoLoteRef}>
                        {pedidosProntosEntrega.length >= 1 && !isDriver && (
                          <div style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className="btn-finalizar-coluna"
                              style={{ color: '#15803d' }}
                              onClick={() => setMenuDespachoLoteAberto(prev => !prev)}
                              title="Despachar todos os pedidos prontos para entrega"
                            >
                              <CheckCircle2 size={13} strokeWidth={2.6} />
                              <span>Finalizar</span>
                            </button>

                            {/* MENU DROPDOWN DE SELEÇÃO DE ENTREGADOR */}
                            {menuDespachoLoteAberto && (
                              <div className="menu-despacho-lote-dropdown">
                                <div className="menu-despacho-header">
                                  Despachar {pedidosProntosEntrega.length} {pedidosProntosEntrega.length === 1 ? 'entrega' : 'entregas'} com:
                                </div>
                                <button
                                  type="button"
                                  className="menu-despacho-item item-renan"
                                  onClick={() => finalizarTodosProntosEntrega(pedidosProntosEntrega, '7794e927-ae46-4a74-a75b-31fdf1e5ce66', 'Renan')}
                                >
                                  <span className="menu-despacho-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                    <Bike size={15} strokeWidth={2.4} />
                                  </span>
                                  <span style={{ fontWeight: 800, color: '#0f172a' }}>Renan</span>
                                </button>
                                <button
                                  type="button"
                                  className="menu-despacho-item item-felipe"
                                  onClick={() => finalizarTodosProntosEntrega(pedidosProntosEntrega, 'e47a1bf2-3b93-4010-92e0-dfd3fd49a73c', 'Felipe')}
                                >
                                  <span className="menu-despacho-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
                                    <Bike size={15} strokeWidth={2.4} />
                                  </span>
                                  <span style={{ fontWeight: 800, color: '#0f172a' }}>Felipe</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="kanban-col-count">{pedidosProntosEntrega.length}</span>
                      </div>
                    </div>
                    <div className="kanban-cards-body">
                      {pedidosProntosEntrega.length === 0 ? (
                        <div className="kanban-cards-empty">
                          <div className="kanban-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Bike size={36} strokeWidth={1.5} color="#cbd5e1" />
                          </div>
                          <span>Nenhum pedido no momento.</span>
                          <small style={{ color: '#94a3b8' }}>Pedidos prontos aguardando motoboy</small>
                        </div>
                      ) : (
                        pedidosProntosEntrega.map(p => renderOrderCard(p, 'pronto'))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </main>
    </div>

    {/* BARRA DE NAVEGAÇÃO INFERIOR PARA DISPOSITIVOS MÓVEIS (BOTTOM NAVIGATION BAR) */}
    <nav className="cafe-bottom-nav" aria-label="Navegação móvel">
      {isDriver ? (
        <>
          <button
            type="button"
            className={`cafe-bottom-nav-item ${filtroOrigem !== 'entregues' && filtroOrigem !== 'configuracoes' ? 'active' : ''}`}
            onClick={() => {
              setFiltroOrigem('todos')
              setFiltroTipo('delivery')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <div className="bottom-nav-icon-wrap">
              <Bike size={21} strokeWidth={2.2} />
              {contagemEntregasAtivas > 0 && (
                <span className="bottom-nav-badge">{contagemEntregasAtivas}</span>
              )}
            </div>
            <span className="bottom-nav-label">Entregas</span>
          </button>

          <button
            type="button"
            className={`cafe-bottom-nav-item ${filtroOrigem === 'entregues' ? 'active' : ''}`}
            onClick={() => {
              setFiltroOrigem('entregues')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <div className="bottom-nav-icon-wrap">
              <CheckCheck size={21} strokeWidth={2.2} />
              {notificacaoEntregasConcluidas > 0 && (
                <span className="bottom-nav-badge badge-green">{notificacaoEntregasConcluidas}</span>
              )}
            </div>
            <span className="bottom-nav-label">Entregues</span>
          </button>

          <button
            type="button"
            className={`cafe-bottom-nav-item ${filtroOrigem === 'configuracoes' ? 'active' : ''}`}
            onClick={() => {
              setFiltroOrigem('configuracoes')
              setSubAbaConfig('geral')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <div className="bottom-nav-icon-wrap">
              <Settings size={21} strokeWidth={2.2} />
            </div>
            <span className="bottom-nav-label">Ajustes</span>
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={`cafe-bottom-nav-item ${filtroOrigem !== 'entregues' && filtroOrigem !== 'table' && filtroOrigem !== 'configuracoes' && filtroOrigem !== 'faturamento' ? 'active' : ''}`}
            onClick={() => {
              setFiltroOrigem('todos')
              setFiltroTipo('todos')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <div className="bottom-nav-icon-wrap">
              <ClipboardList size={21} strokeWidth={2.2} />
              {contagemPedidosAtivos > 0 && (
                <span className="bottom-nav-badge">{contagemPedidosAtivos}</span>
              )}
            </div>
            <span className="bottom-nav-label">Pedidos</span>
          </button>

          <button
            type="button"
            className={`cafe-bottom-nav-item ${filtroOrigem === 'table' ? 'active' : ''}`}
            onClick={() => {
              setFiltroOrigem('table')
              setFiltroTipo('todos')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <div className="bottom-nav-icon-wrap">
              <UtensilsCrossed size={21} strokeWidth={2.2} />
              {contagemPedidosMesas > 0 && (
                <span className="bottom-nav-badge badge-amber">{contagemPedidosMesas}</span>
              )}
            </div>
            <span className="bottom-nav-label">Mesas</span>
          </button>

          {isOwner && (
            <button
              type="button"
              className={`cafe-bottom-nav-item ${filtroOrigem === 'entregues' ? 'active' : ''}`}
              onClick={() => {
                setFiltroOrigem('entregues')
                setFiltroEntregador('todos')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <div className="bottom-nav-icon-wrap">
                <CheckCheck size={21} strokeWidth={2.2} />
                {contagemPedidosEntregues > 0 && (
                  <span className="bottom-nav-badge badge-green">{contagemPedidosEntregues}</span>
                )}
              </div>
              <span className="bottom-nav-label">Entregues</span>
            </button>
          )}

          {isOwner && (
            <button
              type="button"
              className={`cafe-bottom-nav-item ${filtroOrigem === 'faturamento' ? 'active' : ''}`}
              onClick={() => {
                setFiltroOrigem('faturamento')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <div className="bottom-nav-icon-wrap">
                <TrendingUp size={21} strokeWidth={2.2} />
              </div>
              <span className="bottom-nav-label">Relatórios</span>
            </button>
          )}

          <button
            type="button"
            className={`cafe-bottom-nav-item ${filtroOrigem === 'configuracoes' ? 'active' : ''}`}
            onClick={() => {
              setFiltroOrigem('configuracoes')
              setSubAbaConfig('geral')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <div className="bottom-nav-icon-wrap">
              <Settings size={21} strokeWidth={2.2} />
            </div>
            <span className="bottom-nav-label">Ajustes</span>
          </button>
        </>
      )}
    </nav>

      {/* ÁREA DE IMPRESSÃO TÉRMICA (80mm EPSON) - DISPONÍVEL SEMPRE */}
      <ThermalReceiptArea />

        {/* MODAL FECHAR LOJA */}
        {modalFecharLojaAberto && (
          <div className="modal-backdrop-loja" onClick={() => !salvandoStatusLoja && setModalFecharLojaAberto(false)}>
            <div className="modal-content-loja" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-loja">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="modal-icon-loja icon-fechar">
                    <Store size={22} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h3>Fechar Loja</h3>
                    <p>Você pode manter sua loja fechada por até 24 horas. Você não receberá pedidos, nem agendamentos para o período selecionado.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-btn-close-loja"
                  onClick={() => !salvandoStatusLoja && setModalFecharLojaAberto(false)}
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="modal-body-loja">
                {/* STATUS ATUAL DOS CANAIS EM TEMPO REAL */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Status Atual dos Canais
                    </span>
                    {(!isAnotaAiOpen || !isIfoodOpen) && (
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline'
                        }}
                        onClick={() => {
                          setModalFecharLojaAberto(false)
                          setCanalAbertura(!isAnotaAiOpen && !isIfoodOpen ? 'all' : !isAnotaAiOpen ? 'anota_ai' : 'ifood')
                          setModalReabrirLojaAberto(true)
                        }}
                      >
                        Abrir canal fechado ↗
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CanalLogo canal="anota_ai" size={16} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Anota.ai (Cardápio / WhatsApp)</span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: isAnotaAiOpen ? '#dcfce7' : '#fee2e2',
                      color: isAnotaAiOpen ? '#15803d' : '#b91c1c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAnotaAiOpen ? '#22c55e' : '#ef4444' }} />
                      {isAnotaAiOpen ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CanalLogo canal="ifood" size={16} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>iFood</span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: isIfoodOpen ? '#dcfce7' : '#fee2e2',
                      color: isIfoodOpen ? '#15803d' : '#b91c1c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isIfoodOpen ? '#22c55e' : '#ef4444' }} />
                      {isIfoodOpen ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>
                </div>

                {/* CANAL */}
                <div className="loja-form-group">
                  <label className="loja-label">Deseja fechar:</label>
                  <div className="loja-canal-options">
                    <button
                      type="button"
                      className={`btn-canal-card ${canalFechamento === 'all' ? 'active' : ''}`}
                      onClick={() => setCanalFechamento('all')}
                    >
                      <div className="canal-radio-circle">
                        {canalFechamento === 'all' && <div className="canal-radio-dot" />}
                      </div>
                      <div className="canal-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <strong>Todos os canais</strong>
                        </div>
                        <span>Anota.ai + iFood simultaneamente</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`btn-canal-card ${canalFechamento === 'anota_ai' ? 'active' : ''}`}
                      onClick={() => setCanalFechamento('anota_ai')}
                    >
                      <div className="canal-radio-circle">
                        {canalFechamento === 'anota_ai' && <div className="canal-radio-dot" />}
                      </div>
                      <div className="canal-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CanalLogo canal="anota_ai" size={16} />
                            <strong>Somente Anota.ai</strong>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: isAnotaAiOpen ? '#15803d' : '#b91c1c' }}>
                            {isAnotaAiOpen ? '🟢 Aberto' : '🔴 Já Fechado'}
                          </span>
                        </div>
                        <span>Cardápio Digital WhatsApp & Anota AI</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`btn-canal-card ${canalFechamento === 'ifood' ? 'active' : ''}`}
                      onClick={() => setCanalFechamento('ifood')}
                    >
                      <div className="canal-radio-circle">
                        {canalFechamento === 'ifood' && <div className="canal-radio-dot" />}
                      </div>
                      <div className="canal-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CanalLogo canal="ifood" size={16} />
                            <strong>Somente iFood</strong>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: isIfoodOpen ? '#15803d' : '#b91c1c' }}>
                            {isIfoodOpen ? '🟢 Aberto' : '🔴 Já Fechado'}
                          </span>
                        </div>
                        <span>Loja no aplicativo do iFood</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* TEMPO */}
                <div className="loja-form-group">
                  <label className="loja-label">Fechar por quanto tempo?</label>
                  <div className="loja-pills-grid">
                    {[
                      { label: '15 minutos', val: 15 },
                      { label: '30 minutos', val: 30 },
                      { label: '1 hora', val: 60 },
                      { label: '3 horas', val: 180 },
                      { label: '6 horas', val: 360 },
                      { label: '12 horas', val: 720 },
                      { label: '24 horas', val: 1440 }
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        className={`btn-pill-tempo ${tempoFechamento === item.val ? 'active' : ''}`}
                        onClick={() => setTempoFechamento(item.val)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MOTIVO */}
                <div className="loja-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label className="loja-label">Por qual motivo?</label>
                    <span className="loja-help-note">(Isso não aparecerá para o seu cliente)</span>
                  </div>
                  <div className="loja-motivos-list">
                    {[
                      'Muitos pedidos',
                      'Problema na produção (cozinha)',
                      'Falta de entrega',
                      'Outros'
                    ].map(motivo => (
                      <button
                        key={motivo}
                        type="button"
                        className={`btn-motivo-item ${motivoFechamento === motivo ? 'active' : ''}`}
                        onClick={() => setMotivoFechamento(motivo)}
                      >
                        <div className="canal-radio-circle">
                          {motivoFechamento === motivo && <div className="canal-radio-dot" />}
                        </div>
                        <span>{motivo}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer-loja">
                <button
                  type="button"
                  className="btn-loja-cancelar"
                  onClick={() => setModalFecharLojaAberto(false)}
                  disabled={salvandoStatusLoja}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-loja-confirmar-fechar"
                  onClick={handleConfirmarFecharLoja}
                  disabled={salvandoStatusLoja}
                >
                  {salvandoStatusLoja ? 'Fechando Loja...' : 'Fechar Loja'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL REABRIR LOJA */}
        {modalReabrirLojaAberto && (
          <div className="modal-backdrop-loja" onClick={() => !salvandoStatusLoja && setModalReabrirLojaAberto(false)}>
            <div className="modal-content-loja" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-loja">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="modal-icon-loja icon-reabrir">
                    <Store size={22} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h3>Abrir Loja</h3>
                    <p>Selecione quais canais você deseja abrir para novos pedidos.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-btn-close-loja"
                  onClick={() => !salvandoStatusLoja && setModalReabrirLojaAberto(false)}
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="modal-body-loja">
                {/* STATUS ATUAL DOS CANAIS EM TEMPO REAL */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Status Atual dos Canais
                    </span>
                    {(isAnotaAiOpen || isIfoodOpen) && (
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline'
                        }}
                        onClick={() => {
                          setModalReabrirLojaAberto(false)
                          setCanalFechamento(isAnotaAiOpen && isIfoodOpen ? 'all' : isAnotaAiOpen ? 'anota_ai' : 'ifood')
                          setModalFecharLojaAberto(true)
                        }}
                      >
                        Pausar canal aberto ↗
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CanalLogo canal="anota_ai" size={16} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Anota.ai (Cardápio / WhatsApp)</span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: isAnotaAiOpen ? '#dcfce7' : '#fee2e2',
                      color: isAnotaAiOpen ? '#15803d' : '#b91c1c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAnotaAiOpen ? '#22c55e' : '#ef4444' }} />
                      {isAnotaAiOpen ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CanalLogo canal="ifood" size={16} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>iFood</span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: isIfoodOpen ? '#dcfce7' : '#fee2e2',
                      color: isIfoodOpen ? '#15803d' : '#b91c1c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isIfoodOpen ? '#22c55e' : '#ef4444' }} />
                      {isIfoodOpen ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>
                </div>

                {/* OPÇÕES DE CANAIS PARA ABRIR */}
                <div className="loja-form-group">
                  <label className="loja-label">Deseja abrir:</label>
                  <div className="loja-canal-options">
                    <button
                      type="button"
                      className={`btn-canal-card ${canalAbertura === 'all' ? 'active' : ''}`}
                      onClick={() => setCanalAbertura('all')}
                    >
                      <div className="canal-radio-circle">
                        {canalAbertura === 'all' && <div className="canal-radio-dot" />}
                      </div>
                      <div className="canal-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <strong>Todas</strong>
                        </div>
                        <span>Abre iFood + Anota.ai simultaneamente</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`btn-canal-card ${canalAbertura === 'ifood' ? 'active' : ''}`}
                      onClick={() => setCanalAbertura('ifood')}
                    >
                      <div className="canal-radio-circle">
                        {canalAbertura === 'ifood' && <div className="canal-radio-dot" />}
                      </div>
                      <div className="canal-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CanalLogo canal="ifood" size={16} />
                            <strong>Somente iFood</strong>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: isIfoodOpen ? '#15803d' : '#b91c1c' }}>
                            {isIfoodOpen ? '🟢 Já Aberto' : '🔴 Fechado'}
                          </span>
                        </div>
                        <span>Abre apenas a loja no aplicativo do iFood</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`btn-canal-card ${canalAbertura === 'anota_ai' ? 'active' : ''}`}
                      onClick={() => setCanalAbertura('anota_ai')}
                    >
                      <div className="canal-radio-circle">
                        {canalAbertura === 'anota_ai' && <div className="canal-radio-dot" />}
                      </div>
                      <div className="canal-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CanalLogo canal="anota_ai" size={16} />
                            <strong>Somente Anota.ai</strong>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: isAnotaAiOpen ? '#15803d' : '#b91c1c' }}>
                            {isAnotaAiOpen ? '🟢 Já Aberto' : '🔴 Fechado'}
                          </span>
                        </div>
                        <span>Abre apenas o Cardápio Digital / WhatsApp</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer-loja">
                <button
                  type="button"
                  className="btn-loja-cancelar"
                  onClick={() => setModalReabrirLojaAberto(false)}
                  disabled={salvandoStatusLoja}
                >
                  Manter Fechada
                </button>
                <button
                  type="button"
                  className="btn-loja-confirmar-reabrir"
                  onClick={handleConfirmarReabrirLoja}
                  disabled={salvandoStatusLoja}
                >
                  {salvandoStatusLoja 
                    ? 'Abrindo...' 
                    : canalAbertura === 'ifood' 
                      ? 'Abrir Somente iFood' 
                      : canalAbertura === 'anota_ai' 
                        ? 'Abrir Somente Anota.ai' 
                        : 'Abrir Todas as Lojas'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETALHES FATURAMENTO (PIX, CARTÃO E DINHEIRO) COM FUNDO BORRADO */}
        {modalDetalhesFat && (
          <div
            className="modal-backdrop-fat-detalhes"
            onClick={() => setModalDetalhesFat(null)}
          >
            <div
              className="modal-content-fat-detalhes"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="modal-header-fat">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    className="modal-icon-fat"
                    style={{ background: modalDetalhesFat.bgCor, color: modalDetalhesFat.cor }}
                  >
                    {modalDetalhesFat.modalidade === 'total' && <TrendingUp size={20} strokeWidth={2.4} />}
                    {modalDetalhesFat.modalidade === 'entrega' && <Bike size={20} strokeWidth={2.4} />}
                    {modalDetalhesFat.modalidade === 'retirada' && <ShoppingBag size={20} strokeWidth={2.4} />}
                    {modalDetalhesFat.modalidade === 'mesa' && <UtensilsCrossed size={20} strokeWidth={2.4} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
                      {modalDetalhesFat.titulo} — Formas de Pagamento
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      {modalDetalhesFat.subtitulo}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-btn-close-loja"
                  onClick={() => setModalDetalhesFat(null)}
                  title="Fechar"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* BODY */}
              <div className="modal-body-fat">
                {/* BANNER TOTAL */}
                <div className="fat-modal-total-banner">
                  <div>
                    <span className="fat-modal-total-caption">Total Faturado no Período:</span>
                    <div className="fat-modal-total-val">R$ {formatarMoeda(modalDetalhesFat.totalValor)}</div>
                  </div>
                  <button
                    type="button"
                    className="fat-modal-badge-pedidos fat-btn-badge-pedidos"
                    onClick={() => setModalListaPedidosPagamento({
                      titulo: 'Todos os Pedidos',
                      subtitulo: `${modalDetalhesFat.titulo} • ${modalDetalhesFat.subtitulo}`,
                      formaPagamento: 'todos',
                      pedidos: modalDetalhesFat.todosPedidos || [],
                      cor: modalDetalhesFat.cor || '#0f172a',
                      bgCor: modalDetalhesFat.bgCor || '#f1f5f9',
                      totalValor: modalDetalhesFat.totalValor || 0,
                      icone: modalDetalhesFat.icone || 'TrendingUp'
                    })}
                    title="Clique para ver todos os pedidos deste faturamento"
                  >
                    <span>{formatarNumero(modalDetalhesFat.totalPedidos)} {modalDetalhesFat.totalPedidos === 1 ? 'pedido' : 'pedidos'}</span>
                    <span style={{ fontSize: '10px', opacity: 0.75, marginLeft: '6px' }}>Ver lista →</span>
                  </button>
                </div>

                <div className="fat-modal-subtitle-div">
                  <span>DISCRIMINAÇÃO POR FORMA DE PAGAMENTO</span>
                </div>

                {/* LISTA DAS FORMAS DE PAGAMENTO CLICÁVEIS */}
                <div className="fat-modal-methods-list">
                  {/* PIX */}
                  <div
                    className="fat-method-card card-pix fat-card-clickable"
                    onClick={() => setModalListaPedidosPagamento({
                      titulo: 'Pix',
                      subtitulo: `${modalDetalhesFat.titulo} • ${modalDetalhesFat.subtitulo}`,
                      formaPagamento: 'pix',
                      pedidos: modalDetalhesFat.pix?.pedidos || [],
                      cor: '#059669',
                      bgCor: '#ecfdf5',
                      totalValor: modalDetalhesFat.pix?.total || 0,
                      icone: 'QrCode'
                    })}
                    title="Clique para ver pedidos pagos via Pix"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="fat-method-top">
                      <div className="fat-method-badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                        <QrCode size={15} strokeWidth={2.4} />
                        <strong>Pix</strong>
                      </div>
                      <div className="fat-method-amount" style={{ color: '#059669' }}>
                        R$ {formatarMoeda(modalDetalhesFat.pix?.total || 0)}
                      </div>
                    </div>
                    <div className="fat-method-bottom">
                      <span className="fat-method-pedidos">
                        {modalDetalhesFat.pix?.qtd || 0} {modalDetalhesFat.pix?.qtd === 1 ? 'pedido' : 'pedidos'}
                      </span>
                      <strong className="fat-method-perc" style={{ color: '#059669' }}>
                        {modalDetalhesFat.pix?.perc || 0}% do total
                      </strong>
                    </div>
                    <div className="fat-progress-bg">
                      <div
                        className="fat-progress-fill"
                        style={{ width: `${modalDetalhesFat.pix?.perc || 0}%`, background: '#10b981' }}
                      />
                    </div>
                    <div className="fat-method-click-footer">
                      <span>Ver pedidos via Pix →</span>
                    </div>
                  </div>

                  {/* CARTÃO */}
                  <div
                    className="fat-method-card card-cartao fat-card-clickable"
                    onClick={() => setModalListaPedidosPagamento({
                      titulo: 'Cartão',
                      subtitulo: `${modalDetalhesFat.titulo} • ${modalDetalhesFat.subtitulo}`,
                      formaPagamento: 'cartao',
                      pedidos: modalDetalhesFat.cartao?.pedidos || [],
                      cor: '#2563eb',
                      bgCor: '#eff6ff',
                      totalValor: modalDetalhesFat.cartao?.total || 0,
                      icone: 'CreditCard'
                    })}
                    title="Clique para ver pedidos pagos no Cartão"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="fat-method-top">
                      <div className="fat-method-badge" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                        <CreditCard size={15} strokeWidth={2.4} />
                        <strong>Cartão</strong>
                      </div>
                      <div className="fat-method-amount" style={{ color: '#2563eb' }}>
                        R$ {formatarMoeda(modalDetalhesFat.cartao?.total || 0)}
                      </div>
                    </div>
                    <div className="fat-method-bottom">
                      <span className="fat-method-pedidos">
                        {modalDetalhesFat.cartao?.qtd || 0} {modalDetalhesFat.cartao?.qtd === 1 ? 'pedido' : 'pedidos'}
                      </span>
                      <strong className="fat-method-perc" style={{ color: '#2563eb' }}>
                        {modalDetalhesFat.cartao?.perc || 0}% do total
                      </strong>
                    </div>
                    <div className="fat-progress-bg">
                      <div
                        className="fat-progress-fill"
                        style={{ width: `${modalDetalhesFat.cartao?.perc || 0}%`, background: '#3b82f6' }}
                      />
                    </div>
                    <div className="fat-method-click-footer">
                      <span>Ver pedidos no Cartão →</span>
                    </div>
                  </div>

                  {/* DINHEIRO */}
                  <div
                    className="fat-method-card card-dinheiro fat-card-clickable"
                    onClick={() => setModalListaPedidosPagamento({
                      titulo: 'Dinheiro',
                      subtitulo: `${modalDetalhesFat.titulo} • ${modalDetalhesFat.subtitulo}`,
                      formaPagamento: 'dinheiro',
                      pedidos: modalDetalhesFat.dinheiro?.pedidos || [],
                      cor: '#ca8a04',
                      bgCor: '#fefce8',
                      totalValor: modalDetalhesFat.dinheiro?.total || 0,
                      icone: 'Banknote'
                    })}
                    title="Clique para ver pedidos pagos em Dinheiro"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="fat-method-top">
                      <div className="fat-method-badge" style={{ background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}>
                        <Banknote size={15} strokeWidth={2.4} />
                        <strong>Dinheiro</strong>
                      </div>
                      <div className="fat-method-amount" style={{ color: '#ca8a04' }}>
                        R$ {formatarMoeda(modalDetalhesFat.dinheiro?.total || 0)}
                      </div>
                    </div>
                    <div className="fat-method-bottom">
                      <span className="fat-method-pedidos">
                        {modalDetalhesFat.dinheiro?.qtd || 0} {modalDetalhesFat.dinheiro?.qtd === 1 ? 'pedido' : 'pedidos'}
                      </span>
                      <strong className="fat-method-perc" style={{ color: '#ca8a04' }}>
                        {modalDetalhesFat.dinheiro?.perc || 0}% do total
                      </strong>
                    </div>
                    <div className="fat-progress-bg">
                      <div
                        className="fat-progress-fill"
                        style={{ width: `${modalDetalhesFat.dinheiro?.perc || 0}%`, background: '#eab308' }}
                      />
                    </div>
                    <div className="fat-method-click-footer">
                      <span>Ver pedidos em Dinheiro →</span>
                    </div>
                  </div>

                  {/* NÃO SELECIONADO */}
                  <div
                    className="fat-method-card card-nao-selecionado fat-card-clickable"
                    onClick={() => setModalListaPedidosPagamento({
                      titulo: 'Não Selecionado',
                      subtitulo: `${modalDetalhesFat.titulo} • ${modalDetalhesFat.subtitulo}`,
                      formaPagamento: 'naoSelecionado',
                      pedidos: modalDetalhesFat.naoSelecionado?.pedidos || [],
                      cor: '#64748b',
                      bgCor: '#f8fafc',
                      totalValor: modalDetalhesFat.naoSelecionado?.total || 0,
                      icone: 'HelpCircle'
                    })}
                    title="Clique para ver pedidos sem forma de pagamento selecionada"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="fat-method-top">
                      <div className="fat-method-badge" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1' }}>
                        <HelpCircle size={15} strokeWidth={2.4} />
                        <strong>Não Selecionado</strong>
                      </div>
                      <div className="fat-method-amount" style={{ color: '#475569' }}>
                        R$ {formatarMoeda(modalDetalhesFat.naoSelecionado?.total || 0)}
                      </div>
                    </div>
                    <div className="fat-method-bottom">
                      <span className="fat-method-pedidos">
                        {modalDetalhesFat.naoSelecionado?.qtd || 0} {modalDetalhesFat.naoSelecionado?.qtd === 1 ? 'pedido' : 'pedidos'}
                      </span>
                      <strong className="fat-method-perc" style={{ color: '#64748b' }}>
                        {modalDetalhesFat.naoSelecionado?.perc || 0}% do total
                      </strong>
                    </div>
                    <div className="fat-progress-bg">
                      <div
                        className="fat-progress-fill"
                        style={{ width: `${modalDetalhesFat.naoSelecionado?.perc || 0}%`, background: '#94a3b8' }}
                      />
                    </div>
                    <div className="fat-method-click-footer">
                      <span>Ver pedidos Não Selecionados →</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer-loja" style={{ borderTop: '1px solid #f1f5f9', padding: '14px 20px' }}>
                <button
                  type="button"
                  className="btn-loja-cancelar"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setModalDetalhesFat(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      
        
        {/* MODAL DETALHES ENTREGADOR (PIX, CARTÃO, DINHEIRO E NÃO SELECIONADO) */}
        {modalDetalhesEntregador && (
          <div
            className="modal-backdrop-fat-detalhes"
            onClick={() => setModalDetalhesEntregador(null)}
          >
            <div
              className="modal-content-fat-detalhes"
              style={{ maxWidth: '480px' }}
              onClick={e => e.stopPropagation()}
            >
              {/* HEADER UNIFICADO NO MESMO CARD */}
              <div className="modal-header-fat">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    className="modal-icon-fat"
                    style={{ background: modalDetalhesEntregador.bgCor, color: modalDetalhesEntregador.cor }}
                  >
                    <Bike size={20} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                      {modalDetalhesEntregador.titulo}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      {modalDetalhesEntregador.subtitulo}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-btn-close-loja"
                  onClick={() => setModalDetalhesEntregador(null)}
                  title="Fechar"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* BODY COM FUNDO BRANCO INTEGRADO */}
              <div className="modal-body-fat">
                {/* BANNER TOTAL EM TAXAS E ENTREGAS */}
                <div className="fat-modal-total-banner">
                  <div>
                    <span className="fat-modal-total-caption">Total em Taxas no Período:</span>
                    <div className="fat-modal-total-val" style={{ color: modalDetalhesEntregador.cor }}>
                      R$ {formatarMoeda(modalDetalhesEntregador.totalValor)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="fat-modal-badge-pedidos fat-btn-badge-pedidos"
                    onClick={() => setModalListaPedidosPagamento({
                      titulo: `Entregas — ${modalDetalhesEntregador.entregadorNome}`,
                      subtitulo: modalDetalhesEntregador.subtitulo,
                      formaPagamento: 'todos',
                      pedidos: modalDetalhesEntregador.todosPedidos || [],
                      cor: modalDetalhesEntregador.cor || '#0284c7',
                      bgCor: modalDetalhesEntregador.bgCor || '#e0f2fe',
                      totalValor: modalDetalhesEntregador.totalValor || 0,
                      icone: 'Bike'
                    })}
                    title="Clique para ver todas as entregas deste período"
                  >
                    <span>{formatarNumero(modalDetalhesEntregador.totalPedidos)} {modalDetalhesEntregador.totalPedidos === 1 ? 'entrega' : 'entregas'}</span>
                    <span style={{ fontSize: '10px', opacity: 0.75, marginLeft: '6px' }}>Ver lista →</span>
                  </button>
                </div>

                <div className="fat-modal-subtitle-div">
                  <span>DISCRIMINAÇÃO POR FORMA DE PAGAMENTO</span>
                </div>

                {/* LISTA DAS FORMAS DE PAGAMENTO CLICÁVEIS */}
                <div className="fat-modal-methods-list">
                  {/* PIX */}
                  <div
                    className="fat-method-card card-pix fat-card-clickable"
                    onClick={() => setModalListaPedidosPagamento({
                      titulo: `Pix — ${modalDetalhesEntregador.entregadorNome}`,
                      subtitulo: `Entregas pagas via Pix • ${modalDetalhesEntregador.subtitulo}`,
                      formaPagamento: 'pix',
                      pedidos: modalDetalhesEntregador.pix?.pedidos || [],
                      cor: '#059669',
                      bgCor: '#ecfdf5',
                      totalValor: modalDetalhesEntregador.pix?.total || 0,
                      icone: 'QrCode'
                    })}
                    title="Clique para ver entregas pagas via Pix"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="fat-method-top">
                      <div className="fat-method-badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                        <QrCode size={15} strokeWidth={2.4} />
                        <strong>Pix</strong>
                      </div>
                      <div className="fat-method-amount" style={{ color: '#059669' }}>
                        R$ {formatarMoeda(modalDetalhesEntregador.pix?.total || 0)}
                      </div>
                    </div>
                    <div className="fat-method-bottom">
                      <span className="fat-method-pedidos">
                        {modalDetalhesEntregador.pix?.qtd || 0} {modalDetalhesEntregador.pix?.qtd === 1 ? 'entrega' : 'entregas'}
                        {modalDetalhesEntregador.pix?.totalPedidosValor > 0 && ` (Pedidos: R$ ${formatarMoeda(modalDetalhesEntregador.pix.totalPedidosValor)})`}
                      </span>
                      <strong className="fat-method-perc" style={{ color: '#059669' }}>
                        {modalDetalhesEntregador.pix?.perc || 0}% das taxas
                      </strong>
                    </div>
                    <div className="fat-progress-bg">
                      <div
                        className="fat-progress-fill"
                        style={{ width: `${modalDetalhesEntregador.pix?.perc || 0}%`, background: '#10b981' }}
                      />
                    </div>
                    <div className="fat-method-click-footer">
                      <span>Ver entregas via Pix →</span>
                    </div>
                  </div>

                  {/* CARTÃO */}
                  <div
                    className="fat-method-card card-cartao fat-card-clickable"
                    onClick={() => setModalListaPedidosPagamento({
                      titulo: `Cartão — ${modalDetalhesEntregador.entregadorNome}`,
                      subtitulo: `Entregas no Cartão • ${modalDetalhesEntregador.subtitulo}`,
                      formaPagamento: 'cartao',
                      pedidos: modalDetalhesEntregador.cartao?.pedidos || [],
                      cor: '#2563eb',
                      bgCor: '#eff6ff',
                      totalValor: modalDetalhesEntregador.cartao?.total || 0,
                      icone: 'CreditCard'
                    })}
                    title="Clique para ver entregas pagas no Cartão"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="fat-method-top">
                      <div className="fat-method-badge" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                        <CreditCard size={15} strokeWidth={2.4} />
                        <strong>Cartão</strong>
                      </div>
                      <div className="fat-method-amount" style={{ color: '#2563eb' }}>
                        R$ {formatarMoeda(modalDetalhesEntregador.cartao?.total || 0)}
                      </div>
                    </div>
                    <div className="fat-method-bottom">
                      <span className="fat-method-pedidos">
                        {modalDetalhesEntregador.cartao?.qtd || 0} {modalDetalhesEntregador.cartao?.qtd === 1 ? 'entrega' : 'entregas'}
                        {modalDetalhesEntregador.cartao?.totalPedidosValor > 0 && ` (Pedidos: R$ ${formatarMoeda(modalDetalhesEntregador.cartao.totalPedidosValor)})`}
                      </span>
                      <strong className="fat-method-perc" style={{ color: '#2563eb' }}>
                        {modalDetalhesEntregador.cartao?.perc || 0}% das taxas
                      </strong>
                    </div>
                    <div className="fat-progress-bg">
                      <div
                        className="fat-progress-fill"
                        style={{ width: `${modalDetalhesEntregador.cartao?.perc || 0}%`, background: '#3b82f6' }}
                      />
                    </div>
                    <div className="fat-method-click-footer">
                      <span>Ver entregas no Cartão →</span>
                    </div>
                  </div>

                  {/* DINHEIRO */}
                  <div
                    className="fat-method-card card-dinheiro fat-card-clickable"
                    onClick={() => setModalListaPedidosPagamento({
                      titulo: `Dinheiro — ${modalDetalhesEntregador.entregadorNome}`,
                      subtitulo: `Entregas pagas em Dinheiro • ${modalDetalhesEntregador.subtitulo}`,
                      formaPagamento: 'dinheiro',
                      pedidos: modalDetalhesEntregador.dinheiro?.pedidos || [],
                      cor: '#ca8a04',
                      bgCor: '#fefce8',
                      totalValor: modalDetalhesEntregador.dinheiro?.total || 0,
                      icone: 'Banknote'
                    })}
                    title="Clique para ver entregas pagas em Dinheiro"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="fat-method-top">
                      <div className="fat-method-badge" style={{ background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}>
                        <Banknote size={15} strokeWidth={2.4} />
                        <strong>Dinheiro</strong>
                      </div>
                      <div className="fat-method-amount" style={{ color: '#ca8a04' }}>
                        R$ {formatarMoeda(modalDetalhesEntregador.dinheiro?.total || 0)}
                      </div>
                    </div>
                    <div className="fat-method-bottom">
                      <span className="fat-method-pedidos">
                        {modalDetalhesEntregador.dinheiro?.qtd || 0} {modalDetalhesEntregador.dinheiro?.qtd === 1 ? 'entrega' : 'entregas'}
                        {modalDetalhesEntregador.dinheiro?.totalPedidosValor > 0 && ` (Pedidos: R$ ${formatarMoeda(modalDetalhesEntregador.dinheiro.totalPedidosValor)})`}
                      </span>
                      <strong className="fat-method-perc" style={{ color: '#ca8a04' }}>
                        {modalDetalhesEntregador.dinheiro?.perc || 0}% das taxas
                      </strong>
                    </div>
                    <div className="fat-progress-bg">
                      <div
                        className="fat-progress-fill"
                        style={{ width: `${modalDetalhesEntregador.dinheiro?.perc || 0}%`, background: '#eab308' }}
                      />
                    </div>
                    <div className="fat-method-click-footer">
                      <span>Ver entregas em Dinheiro →</span>
                    </div>
                  </div>

                  {/* NÃO SELECIONADO */}
                  <div
                    className="fat-method-card card-nao-selecionado fat-card-clickable"
                    onClick={() => setModalListaPedidosPagamento({
                      titulo: `Não Selecionado — ${modalDetalhesEntregador.entregadorNome}`,
                      subtitulo: `Entregas sem forma de pagamento • ${modalDetalhesEntregador.subtitulo}`,
                      formaPagamento: 'naoSelecionado',
                      pedidos: modalDetalhesEntregador.naoSelecionado?.pedidos || [],
                      cor: '#64748b',
                      bgCor: '#f8fafc',
                      totalValor: modalDetalhesEntregador.naoSelecionado?.total || 0,
                      icone: 'HelpCircle'
                    })}
                    title="Clique para ver entregas sem forma de pagamento selecionada"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="fat-method-top">
                      <div className="fat-method-badge" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1' }}>
                        <HelpCircle size={15} strokeWidth={2.4} />
                        <strong>Não Selecionado</strong>
                      </div>
                      <div className="fat-method-amount" style={{ color: '#475569' }}>
                        R$ {formatarMoeda(modalDetalhesEntregador.naoSelecionado?.total || 0)}
                      </div>
                    </div>
                    <div className="fat-method-bottom">
                      <span className="fat-method-pedidos">
                        {modalDetalhesEntregador.naoSelecionado?.qtd || 0} {modalDetalhesEntregador.naoSelecionado?.qtd === 1 ? 'entrega' : 'entregas'}
                        {modalDetalhesEntregador.naoSelecionado?.totalPedidosValor > 0 && ` (Pedidos: R$ ${formatarMoeda(modalDetalhesEntregador.naoSelecionado.totalPedidosValor)})`}
                      </span>
                      <strong className="fat-method-perc" style={{ color: '#64748b' }}>
                        {modalDetalhesEntregador.naoSelecionado?.perc || 0}% das taxas
                      </strong>
                    </div>
                    <div className="fat-progress-bg">
                      <div
                        className="fat-progress-fill"
                        style={{ width: `${modalDetalhesEntregador.naoSelecionado?.perc || 0}%`, background: '#94a3b8' }}
                      />
                    </div>
                    <div className="fat-method-click-footer">
                      <span>Ver entregas Não Selecionadas →</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER INTEGRADO */}
              <div className="modal-footer-loja" style={{ borderTop: '1px solid #f1f5f9', padding: '14px 20px', background: '#ffffff' }}>
                <button
                  type="button"
                  className="btn-loja-cancelar"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setModalDetalhesEntregador(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL LISTA DE PEDIDOS DA FORMA DE PAGAMENTO SELECIONADA */}
        {modalListaPedidosPagamento && (
          <div
            className="modal-backdrop-loja"
            style={{ zIndex: 100020, backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.65)' }}
            onClick={() => setModalListaPedidosPagamento(null)}
          >
            <div
              className="modal-card-loja cafe-modal-motion"
              style={{ maxWidth: '680px', width: '94%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', borderRadius: '18px', overflow: 'hidden' }}
              onClick={e => e.stopPropagation()}
            >
              {/* HEADER DO MODAL */}
              <div
                className="modal-header-loja"
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setModalListaPedidosPagamento(null)}
                    title="Voltar aos detalhes"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '7px 11px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <ArrowLeft size={16} strokeWidth={2.4} />
                    <span>Voltar</span>
                  </button>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{modalListaPedidosPagamento.titulo}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: modalListaPedidosPagamento.bgCor,
                          color: modalListaPedidosPagamento.cor,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: `1px solid ${modalListaPedidosPagamento.cor}33`
                        }}
                      >
                        {modalListaPedidosPagamento.pedidos.length} {modalListaPedidosPagamento.pedidos.length === 1 ? 'pedido' : 'pedidos'}
                      </span>
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      {modalListaPedidosPagamento.subtitulo} • Total: <strong style={{ color: '#0f172a' }}>R$ {formatarMoeda(modalListaPedidosPagamento.totalValor)}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-btn-close-loja"
                  onClick={() => {
                    setModalListaPedidosPagamento(null)
                    setModalDetalhesFat(null)
                    setModalDetalhesEntregador(null)
                  }}
                  title="Fechar tudo"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* BARRA DE PESQUISA COM LUPA INTELIGENTE */}
              <div
                style={{
                  padding: '10px 18px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Search
                    size={16}
                    strokeWidth={2.4}
                    style={{ position: 'absolute', left: '12px', color: '#64748b', pointerEvents: 'none' }}
                  />
                  <input
                    type="text"
                    value={buscaPedidosModal}
                    onChange={(e) => setBuscaPedidosModal(e.target.value)}
                    placeholder="Buscar cliente, pedidos (ex: 6070 6071), endereço..."
                    style={{
                      width: '100%',
                      padding: '9px 36px 9px 38px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#0f172a',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                  />
                  {buscaPedidosModal && (
                    <button
                      type="button"
                      onClick={() => setBuscaPedidosModal('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: '#e2e8f0',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#475569',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: 0
                      }}
                      title="Limpar pesquisa"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                const termoBusca = (buscaPedidosModal || '').trim()
                const pedidosFiltrados = !termoBusca
                  ? modalListaPedidosPagamento.pedidos
                  : modalListaPedidosPagamento.pedidos.filter(p => atendeTermoBuscaPedido(p, termoBusca, false))

                const totalFiltradoValor = pedidosFiltrados.reduce((soma, p) => soma + (Number(p.total) || 0), 0)

                return (
                  <>
                    {/* LISTA ROLÁVEL DE PEDIDOS (CARDS OFICIAIS IDENTICOS A PÁGINA PEDIDOS E MESAS) */}
                    <div
                      style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        background: '#f1f5f9'
                      }}
                    >
                      {pedidosFiltrados.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                          {termoBusca ? (
                            <>
                              <Search size={40} strokeWidth={1.5} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#475569' }}>Nenhum pedido encontrado para "{buscaPedidosModal}".</p>
                              <small style={{ color: '#94a3b8' }}>Tente pesquisar por outro nome, endereço ou número de notinha.</small>
                            </>
                          ) : (
                            <>
                              <ClipboardList size={40} strokeWidth={1.5} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#475569' }}>Nenhum pedido encontrado.</p>
                              <small style={{ color: '#94a3b8' }}>Não há registros para esta forma de pagamento no período selecionado.</small>
                            </>
                          )}
                        </div>
                      ) : (
                        pedidosFiltrados.map(p => {
                          const isDelivery = p.order_type === 'delivery' || p.manual_delivery
                          const isMesa = p.order_type === 'dine_in' || p.source === 'table'
                          const numMesa = extrairNumeroMesaPedido(p)
                          const nomeCliente = p.customer_name || p.notes?.match(/Nome:\s*([^\n|]+)/i)?.[1]?.trim() || ''
                          const horaStr = new Date(p.created_at || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                          const dataStr = new Date(p.created_at || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                          const isPago = p.payment_status === 'paid' || Boolean(p.foiPago) || Boolean(p.paid)

                          return (
                            <div className="order-card" key={p.id} style={{ margin: 0, background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              {/* CABEÇALHO DO CARD (PADRÃO OFICIAL) */}
                              <div className="order-card-header">
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <strong style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                                      Pedido #{obterNumeroExibicaoPedido(p)}
                                    </strong>
                                    <span className="order-kds-timer" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                      <Clock size={11} strokeWidth={2.4} />
                                      <span>{dataStr} às {horaStr}</span>
                                    </span>
                                  </div>

                                  {nomeCliente && (
                                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '3px' }}>
                                      {nomeCliente}
                                    </span>
                                  )}

                                  {isDelivery && p.delivery_address && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>
                                      <MapPin size={12} strokeWidth={2.2} />
                                      <span>{p.delivery_address}</span>
                                    </span>
                                  )}
                                </div>

                                <div className="order-status-area">
                                  <span className={`order-type-badge ${isDelivery ? 'badge-delivery' : isMesa ? 'badge-dinein' : 'badge-pickup'}`}>
                                    {isDelivery ? <span>Entrega</span> : numMesa ? <span>Mesa {numMesa}</span> : isMesa ? <span>Local</span> : <span>Retirada</span>}
                                  </span>

                                  <span className={`order-source ${
                                    p.source === 'table' ? 'source-table'
                                    : p.source === 'whatsapp' ? 'source-whatsapp'
                                    : p.source === 'anota_ai' ? 'source-anota'
                                    : p.source === 'delivery' ? 'source-delivery'
                                    : p.source === 'retirada' ? 'source-retirada'
                                    : 'source-ifood'
                                  }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    {['whatsapp', 'anota_ai', 'ifood'].includes(p.source) && (
                                      <CanalLogo canal={p.source} size={13} />
                                    )}
                                    <span style={{ color: '#ffffff', fontWeight: 600 }}>
                                      {p.source === 'table' ? (numMesa ? `Mesa ${numMesa}` : 'Mesa')
                                        : p.source === 'whatsapp' ? 'WhatsApp'
                                        : p.source === 'anota_ai' ? 'Anota Aí'
                                        : p.source === 'ifood' ? 'iFood'
                                        : p.source === 'delivery' ? 'Entrega'
                                        : p.source === 'retirada' ? 'Retirada'
                                        : p.source}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {/* LISTA DE ITENS REAIS DO PEDIDO (SEM UNDEFINED, COM ADICIONAIS E OBSERVAÇÕES) */}
                              <div className="order-items">
                                {(p.order_items || []).filter(Boolean).map((item, itIdx) => {
                                  const info = decomporItemEAdicionais(item)
                                  const nomeProduto = item.product_name || item.name || item.item_name || 'Produto'
                                  return (
                                    <div key={item.id || itIdx} style={{ marginBottom: '6px' }}>
                                      <div className="order-item">
                                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                          <span style={{ display: 'inline-block', background: '#f1f5f9', color: '#0f172a', fontWeight: 800, padding: '1px 6px', borderRadius: '6px', marginRight: '6px', fontSize: '11px' }}>
                                            {item.quantity || 1}x
                                          </span>
                                          {nomeProduto}
                                        </span>
                                        <strong style={{ color: '#0f172a' }}>R$ {Number(info.totalLanchePuro || item.total_price || 0).toFixed(2).replace('.', ',')}</strong>
                                      </div>
                                      {(info.listaAdicionais || []).map((ad, adIdx) => (
                                        <div key={adIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#15803d', paddingLeft: '28px', marginTop: '2px', fontWeight: 600 }}>
                                          <span>+ {ad.quantidade || 1}x {ad.nome}</span>
                                          <span>R$ {Number(ad.total || 0).toFixed(2).replace('.', ',')}</span>
                                        </div>
                                      ))}
                                      {(info.listaRemocoes || []).map((rem, remIdx) => (
                                        <div key={remIdx} style={{ fontSize: '12px', color: '#b91c1c', paddingLeft: '28px', marginTop: '2px', fontWeight: 600 }}>
                                          - Sem {rem.nome}
                                        </div>
                                      ))}
                                      {info.observacaoLimpa && (
                                        <div style={{ fontSize: '12px', color: '#64748b', paddingLeft: '28px', fontStyle: 'italic', marginTop: '2px' }}>
                                          Obs: {info.observacaoLimpa}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                                {Number(p.delivery_fee || 0) > 0 && (
                                  <div className="order-item order-item-taxa">
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                                      <Bike size={13} strokeWidth={2} />
                                      <span>Taxa de entrega</span>
                                    </span>
                                    <strong>R$ {Number(p.delivery_fee || 0).toFixed(2).replace('.', ',')}</strong>
                                  </div>
                                )}
                              </div>

                              {/* RODAPÉ DO CARD: TOTAL, STATUS PAGO, FORMA DE PAGAMENTO E AÇÕES */}
                              <div className="order-card-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                <div className="order-card-total-wrapper">
                                  <div className="order-card-total-row">
                                    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px' }}>
                                      <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total</span>
                                      <strong style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>R$ {Number(p.total || 0).toFixed(2).replace('.', ',')}</strong>
                                    </div>
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: modalListaPedidosPagamento.cor,
                                        background: modalListaPedidosPagamento.bgCor,
                                        border: `1px solid ${modalListaPedidosPagamento.cor}33`,
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      {isPago && <Check size={11} strokeWidth={3} />}
                                      <span>{p.payment_method || 'Pago'}</span>
                                    </span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    className="btn-order-action btn-imprimir"
                                    onClick={() => imprimirCupom(p, true)}
                                    title="Imprimir cupom térmico"
                                  >
                                    <Printer size={14} strokeWidth={2.4} />
                                    <span>Imprimir</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-order-action btn-editar"
                                    onClick={() => {
                                      setPedidoSelecionado(p)
                                    }}
                                    title="Ver notinha / detalhes do pedido"
                                  >
                                    <Pencil size={14} strokeWidth={2.4} />
                                    <span>Ver Notinha</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* FOOTER DO MODAL */}
                    <div
                      className="modal-footer-loja"
                      style={{
                        borderTop: '1px solid #f1f5f9',
                        padding: '12px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#ffffff'
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Total {termoBusca ? 'encontrado' : 'filtrado'}: <strong>R$ {formatarMoeda(totalFiltradoValor)}</strong> ({pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos'})
                      </span>
                      <button
                        type="button"
                        className="btn-loja-cancelar"
                        onClick={() => { setModalListaPedidosPagamento(null); setBuscaPedidosModal(''); }}
                      >
                        Fechar Lista
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* TOAST FLUTUANTE DE IMPRESSÃO / AVISOS */}
        {notificacaoFlutuante && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999999,
              background: notificacaoFlutuante.tipo === 'erro' ? '#b91c1c' : '#15803d',
              color: '#ffffff',
              padding: '12px 22px',
              borderRadius: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 700,
              maxWidth: '90vw',
              textAlign: 'center',
              animation: 'slideUpSheet 0.2s ease-out'
            }}
          >
            <span>{notificacaoFlutuante.mensagem}</span>
          </div>
        )}
        {/* MODAL INSPECIONAR COMPOSIÇÃO DE LANCHE OU COMBO (LUPA) */}
        {renderModalInspecionar()}
      </div>
    )
  }

  export default App