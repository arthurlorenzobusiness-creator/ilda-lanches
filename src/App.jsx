import { useEffect, useState } from 'react'
import { supabase } from './supabase'

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

function App() {
  const [session, setSession] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)

  const [novoPedido, setNovoPedido] = useState(false)
  const [origem, setOrigem] = useState('mesa')
  const [tipoRecebimentoCriacao, setTipoRecebimentoCriacao] = useState('retirada')
  const [mesa, setMesa] = useState('')
  const [nomeCliente, setNomeCliente] = useState('')
  const [enderecoEntrega, setEnderecoEntrega] = useState('')
  const [numeroEntrega, setNumeroEntrega] = useState('')
  const [taxaEntrega, setTaxaEntrega] = useState('')
  const [observacaoSemMesa, setObservacaoSemMesa] = useState('')
  const [foiPago, setFoiPago] = useState(false)
  const [calculandoDistancia, setCalculandoDistancia] = useState(false)
  const [infoDistancia, setInfoDistancia] = useState(null) // { distancia, taxa }

  const [categoriaAtiva, setCategoriaAtiva] = useState('Hambúrgueres')
  const [categoriaEdicao, setCategoriaEdicao] = useState('Hambúrgueres')
  const [buscaProduto, setBuscaProduto] = useState('')
  const [buscaProdutoEdicao, setBuscaProdutoEdicao] = useState('')

  const [tipoRecebimento, setTipoRecebimento] = useState('retirada')
  const [foiPagoEdicao, setFoiPagoEdicao] = useState(false)

  const [carrinho, setCarrinho] = useState([])

  const [pedidos, setPedidos] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [pedidoParaImprimir, setPedidoParaImprimir] = useState(null)

  const [carregandoPedidos, setCarregandoPedidos] = useState(true)
  const [filtroOrigem, setFiltroOrigem] = useState('todos')

  const [nomeUsuario, setNomeUsuario] = useState('')
  const [emailUsuario, setEmailUsuario] = useState('')
  const [isDriver, setIsDriver] = useState(false)

  // =========================================================
  // HELPERS
  // =========================================================

  function imprimirCupom(pedido) {
    setPedidoParaImprimir(pedido)
    setTimeout(() => {
      window.print()
    }, 120)
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
    carregarPedidos()
    const canal = supabase
      .channel('pedidos-em-tempo-real')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
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
      return [...atual, { nome: produto, preco, quantidade: 1 }]
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
    setFoiPago(false)
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
    if (origem === 'mesa' && tipoRecebimentoCriacao !== 'entrega' && !mesa) {
      alert('Selecione uma mesa.')
      return
    }

    try {
      const subtotal = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
      const taxaEntregaValor = tipoRecebimentoCriacao === 'entrega' ? Number(taxaEntrega) || 0 : 0

      let tableId = null
      if (origem === 'mesa' && tipoRecebimentoCriacao !== 'entrega' && mesa !== 'sem_mesa') {
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

      if (origem === 'mesa' && tipoRecebimentoCriacao === 'entrega') {
        sourceValor = 'table'
        orderTypeValor = 'delivery'
        manualDeliveryValor = true
        deliveryAddressValor = enderecoCompletoFormatado
      } else if (origem === 'mesa' && mesa !== 'sem_mesa') {
        sourceValor = 'table'
        orderTypeValor = 'dine_in'
        manualDeliveryValor = false
        deliveryAddressValor = null
      } else if (origem === 'mesa' && mesa === 'sem_mesa') {
        sourceValor = 'table'
        orderTypeValor = 'dine_in'
        manualDeliveryValor = false
        deliveryAddressValor = observacaoSemMesa.trim() || null
      } else if (tipoRecebimentoCriacao === 'entrega') {
        sourceValor = origem
        orderTypeValor = 'delivery'
        manualDeliveryValor = true
        deliveryAddressValor = enderecoCompletoFormatado
      } else {
        sourceValor = origem
        orderTypeValor = 'pickup'
        manualDeliveryValor = false
        deliveryAddressValor = null
      }

      const { data: pedido, error: erroPedido } = await supabase
        .from('orders')
        .insert({
          source: sourceValor,
          order_type: orderTypeValor,
          table_id: tableId,
          customer_name: nomeCliente.trim() || null,
          subtotal,
          delivery_fee: taxaEntregaValor,
          discount: 0,
          total: subtotal + taxaEntregaValor,
          payment_method: null,
          payment_status: foiPago ? 'paid' : 'pending',
          status: 'new',
          manual_delivery: manualDeliveryValor,
          delivery_address: deliveryAddressValor,
        })
        .select()
        .single()

      if (erroPedido) throw erroPedido

      const itens = carrinho.map((item) => ({
        order_id: pedido.id,
        product_name: item.nome,
        variant_name: null,
        quantity: item.quantidade,
        unit_price: item.preco,
        total_price: item.preco * item.quantidade,
        notes: null,
      }))

      const { error: erroItens } = await supabase.from('order_items').insert(itens)
      if (erroItens) {
        await supabase.from('orders').delete().eq('id', pedido.id)
        throw erroItens
      }

      const pedidoCompleto = {
        ...pedido,
        order_items: itens,
        tables_restaurant: mesa && mesa !== 'sem_mesa' ? { number: Number(mesa) } : null
      }

      setCarrinho([])
      setNovoPedido(false)
      await carregarPedidos()
      imprimirCupom(pedidoCompleto)
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
          order_items: atual.order_items.map((item) =>
            item.id === itemExistente.id
              ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * Number(item.unit_price) }
              : item
          ),
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
    const confirmado = window.confirm(
      `Tem certeza que deseja cancelar o Pedido #${pedidoSelecionado.order_number}? Esta ação não pode ser desfeita.`
    )
    if (!confirmado) return
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', pedidoSelecionado.id)
      if (error) throw error
      alert(`Pedido #${pedidoSelecionado.order_number} cancelado.`)
      await carregarPedidos()
      setPedidoSelecionado(null)
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
      alert(`Não foi possível cancelar o pedido.\n\n${error.message}`)
    }
  }

  async function cancelarPedidoDireto(pedido) {
    const confirmado = window.confirm(
      `Tem certeza que deseja cancelar o Pedido #${pedido.order_number}?\n\nEle será removido da lista e desconsiderado das estatísticas e taxas de entrega.`
    )
    if (!confirmado) return

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', pedido.id)

      if (error) throw error

      alert(`Pedido #${pedido.order_number} cancelado com sucesso.`)
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
      const subtotal = itens.reduce((soma, item) => soma + Number(item.unit_price) * Number(item.quantity), 0)
      const delivery_fee = tipoAtual === 'entrega' ? Number(pedidoSelecionado.delivery_fee) || 0 : 0
      const novoTotal = subtotal + delivery_fee
      const manualDelivery = tipoAtual === 'entrega'
      const deliveryAddress = tipoAtual === 'entrega'
        ? (pedidoSelecionado.delivery_address || '').trim() || null
        : null
      const orderType = tipoAtual === 'entrega' ? 'delivery' : 'pickup'

      const { error: erroPedido } = await supabase
        .from('orders')
        .update({
          manual_delivery: manualDelivery,
          delivery_address: deliveryAddress,
          order_type: orderType,
          subtotal,
          delivery_fee,
          total: novoTotal,
          payment_status: foiPagoEdicao ? 'paid' : 'pending',
        })
        .eq('id', pedidoSelecionado.id)
      if (erroPedido) throw erroPedido

      const idsExistentes = itens.filter((item) => !item.novo).map((item) => item.id)
      const { data: itensBanco, error: erroBuscaItens } = await supabase
        .from('order_items').select('id').eq('order_id', pedidoSelecionado.id)
      if (erroBuscaItens) throw erroBuscaItens

      const idsParaExcluir = (itensBanco || []).map((item) => item.id).filter((id) => !idsExistentes.includes(id))
      if (idsParaExcluir.length > 0) {
        const { error: erroExclusao } = await supabase.from('order_items').delete().in('id', idsParaExcluir)
        if (erroExclusao) throw erroExclusao
      }

      for (const item of itens.filter((item) => !item.novo)) {
        const { error: erroAtualizacao } = await supabase
          .from('order_items')
          .update({
            product_name: item.product_name,
            variant_name: item.variant_name || null,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            total_price: Number(item.unit_price) * Number(item.quantity),
            notes: item.notes || null,
          })
          .eq('id', item.id)
        if (erroAtualizacao) throw erroAtualizacao
      }

      const itensNovos = itens.filter((item) => item.novo).map((item) => ({
        order_id: pedidoSelecionado.id,
        product_name: item.product_name,
        variant_name: item.variant_name || null,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total_price: Number(item.unit_price) * Number(item.quantity),
        notes: item.notes || null,
      }))

      const pedidoAtualizadoCompleto = {
        ...pedidoSelecionado,
        manual_delivery: manualDelivery,
        delivery_address: deliveryAddress,
        order_type: orderType,
        subtotal,
        delivery_fee,
        total: novoTotal,
        payment_status: foiPagoEdicao ? 'paid' : 'pending',
        order_items: itens,
      }

      await carregarPedidos()
      setPedidoSelecionado(null)
      imprimirCupom(pedidoAtualizadoCompleto)
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      alert(`Não foi possível salvar o pedido.\n\n${error.message}`)
    }
  }

  // =========================================================
  // REALIZAR ENTREGA
  // =========================================================

  async function realizarEntrega(pedido) {
    const confirmado = window.confirm(
      `Confirmar entrega do Pedido #${pedido.order_number}?\n\nEssa entrega será registrada na sua conta.`
    )
    if (!confirmado) return

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
    const confirmado = window.confirm(
      `Confirmar entrega do Pedido #${pedido.order_number} para o entregador ${driverName}?`
    )
    if (!confirmado) return

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
    const confirmado = window.confirm(
      "Tem certeza que deseja limpar a tela? Isso ocultará todos os pedidos atuais da lista, mas não afetará o faturamento nem as estatísticas."
    )
    if (!confirmado) return

    try {
      const idsParaArquivar = pedidos
        .filter(p => p.payment_method !== 'archived')
        .map(p => p.id)

      if (idsParaArquivar.length === 0) {
        alert("A tela já está limpa.")
        return
      }

      // Supabase in() can handle arrays, update all at once
      const { error } = await supabase
        .from('orders')
        .update({ payment_method: 'archived' })
        .in('id', idsParaArquivar)
        
      if (error) throw error

      alert("Tela limpa com sucesso!")
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

  // =========================================================
  // TOTAL DO CARRINHO
  // =========================================================

  const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
  const taxaEntregaNum = tipoRecebimentoCriacao === 'entrega' ? Number(taxaEntrega) || 0 : 0
  const totalComEntrega = total + taxaEntregaNum

  // =========================================================
  // CARREGANDO
  // =========================================================

  if (carregando) {
    return (
      <div className="login-loading">
        <strong>Central Lanchonete</strong>
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
          <div className="login-logo">CL</div>
          <h1>Central Lanchonete</h1>
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
          <div>
            <h1>Central Lanchonete</h1>
            <span>Editar pedido</span>
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
            <div className="edit-order-info">
              <div>
                <strong>Origem</strong>
                <span>
                  {pedidoSelecionado.source === 'table'
                    ? pedidoSelecionado.table_id
                      ? `Mesa ${pedidoSelecionado.tables_restaurant?.number ?? '-'}`
                      : 'Sem mesa'
                    : pedidoSelecionado.source === 'whatsapp' ? 'WhatsApp'
                    : pedidoSelecionado.source === 'anota_ai' ? 'Anota Aí'
                    : pedidoSelecionado.source === 'ifood' ? 'iFood'
                    : pedidoSelecionado.source === 'delivery' ? 'Entrega'
                    : pedidoSelecionado.source === 'retirada' ? 'Retirada'
                    : pedidoSelecionado.source}
                </span>
              </div>
              <div>
                <strong>Cliente</strong>
                <span>{pedidoSelecionado.customer_name || 'Não informado'}</span>
              </div>
            </div>

            {/* ITENS DO PEDIDO */}
            <div className="edit-order-section">
              <h3>Itens do pedido</h3>
              {pedidoSelecionado.order_items?.map((item) => (
                <div className="edit-order-item" key={item.id}>
                  <div>
                    <strong>{item.quantity}x {item.product_name}</strong>
                    <span>R$ {Number(item.unit_price).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="quantity">
                    <button onClick={() => {
                      const novaQuantidade = item.quantity - 1
                      setPedidoSelecionado((atual) => ({
                        ...atual,
                        order_items: novaQuantidade <= 0
                          ? atual.order_items.filter((p) => p.id !== item.id)
                          : atual.order_items.map((p) =>
                              p.id === item.id
                                ? { ...p, quantity: novaQuantidade, total_price: novaQuantidade * Number(p.unit_price) }
                                : p
                            ),
                      }))
                    }}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => {
                      const novaQuantidade = item.quantity + 1
                      setPedidoSelecionado((atual) => ({
                        ...atual,
                        order_items: atual.order_items.map((p) =>
                          p.id === item.id
                            ? { ...p, quantity: novaQuantidade, total_price: novaQuantidade * Number(p.unit_price) }
                            : p
                        ),
                      }))
                    }}>+</button>
                  </div>
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
                  className={tipoRecebimento === 'retirada' ? 'source active' : 'source'}
                  onClick={() => {
                    setTipoRecebimento('retirada')
                    setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: 0, delivery_address: null }))
                  }}
                >
                  Retirada
                </button>
                <button
                  type="button"
                  className={tipoRecebimento === 'entrega' ? 'source active' : 'source'}
                  onClick={() => {
                    setTipoRecebimento('entrega')
                    setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: 0, delivery_address: null }))
                  }}
                >
                  Entrega
                </button>
              </div>

              {tipoRecebimento === 'entrega' && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginTop: '16px' }}>
                  <div className="field" style={{ flex: '0 0 140px', marginTop: 0 }}>
                    <label>Taxa de entrega</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={pedidoSelecionado.delivery_fee || ''}
                      onChange={(e) => setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: e.target.value }))}
                    />
                  </div>
                  <div className="field" style={{ flex: 1, marginTop: 0 }}>
                    <label>Endereço de entrega</label>
                    <input
                      type="text"
                      placeholder="Digite o endereço de entrega"
                      value={pedidoSelecionado.delivery_address || ''}
                      onChange={(e) => setPedidoSelecionado((atual) => ({ ...atual, delivery_address: e.target.value }))}
                    />
                  </div>
                </div>
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
                      (soma, item) => soma + Number(item.unit_price) * Number(item.quantity), 0
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
          <div>
            <h1>Central Lanchonete</h1>
            <span>Novo pedido</span>
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
                            setTipoRecebimentoCriacao('retirada')
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
                        className={tipoRecebimentoCriacao === 'retirada' ? 'source active' : 'source'}
                        onClick={() => { setTipoRecebimentoCriacao('retirada'); setEnderecoEntrega(''); setTaxaEntrega(''); setInfoDistancia(null) }}
                      >
                        Retirada
                      </button>
                      <button
                        type="button"
                        className={tipoRecebimentoCriacao === 'entrega' ? 'source active' : 'source'}
                        onClick={() => { setTipoRecebimentoCriacao('entrega'); setMesa(''); setObservacaoSemMesa('') }}
                      >
                        Entrega
                      </button>
                    </div>
                  </div>

                  {origem === 'mesa' && tipoRecebimentoCriacao !== 'entrega' && (
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

                  {origem === 'mesa' && mesa === 'sem_mesa' && tipoRecebimentoCriacao === 'retirada' && (
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
                    <div className="cart-item" key={item.nome}>
                      <div>
                        <strong>{item.nome}</strong>
                        <span>R$ {item.preco.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="quantity">
                        <button type="button" onClick={() => alterarQuantidade(item.nome, item.quantidade - 1)}>−</button>
                        <span>{item.quantidade}</span>
                        <button type="button" onClick={() => alterarQuantidade(item.nome, item.quantidade + 1)}>+</button>
                      </div>
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
                  disabled={carrinho.length === 0 || (origem === 'mesa' && tipoRecebimentoCriacao !== 'entrega' && !mesa)}
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
        <div>
          <h1>Central Lanchonete</h1>
          <span>Painel de pedidos</span>
        </div>
        <div className="user">
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
                <strong style={{ color: '#16a34a' }}>R$ {faturamentoHoje.toFixed(2).replace('.', ',')}</strong>
              </div>
              <div className="stat-card">
                <span>Esta Semana</span>
                <strong style={{ color: '#16a34a' }}>R$ {faturamentoSemana.toFixed(2).replace('.', ',')}</strong>
              </div>
              <div className="stat-card">
                <span>Este Mês</span>
                <strong style={{ color: '#16a34a' }}>R$ {faturamentoMes.toFixed(2).replace('.', ',')}</strong>
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
                <button className={filtroOrigem === 'entregues' ? 'filter active' : 'filter'} onClick={() => setFiltroOrigem('entregues')}>Entregues</button>
              )}
            </>
          )}
        </div>

        {/* LISTA DE PEDIDOS */}
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
                  {pedido.order_items?.map((item) => (
                    <div className="order-item" key={item.id}>
                      <span>{item.quantity}x {item.product_name}</span>
                      <strong>R$ {Number(item.total_price).toFixed(2).replace('.', ',')}</strong>
                    </div>
                  ))}
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
                    {/* Select + Botão realizar entrega — para os donos */}
                    {isOwner && pedido.manual_delivery && !pedido.driver_id && pedido.status !== 'completed' && (
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
                          setPedidoSelecionado(pedido)
                          setTipoRecebimento(pedido.manual_delivery === true ? 'entrega' : 'retirada')
                          setFoiPagoEdicao(pedido.payment_status === 'paid')
                          setCategoriaEdicao('Hambúrgueres')
                          setBuscaProdutoEdicao('')
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
      </main>

      {/* ÁREA DE IMPRESSÃO TÉRMICA (80mm EPSON) */}
      <div id="thermal-receipt-area" className="thermal-receipt">
        {pedidoParaImprimir && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            {/* TIPO DE PEDIDO */}
            <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
              {pedidoParaImprimir.order_type === 'delivery' || pedidoParaImprimir.manual_delivery ? 'PARA ENTREGA' : 'RETIRADA NO LOCAL'}
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
              {(pedidoParaImprimir.order_items || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span>({item.quantity}) {item.product_name}</span>
                  <span style={{ fontWeight: 'bold' }}>R$ {Number(item.total_price || item.unit_price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
            <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

            {/* CLIENTE & LOCALIZAÇÃO */}
            <div style={{ textAlign: 'left', fontSize: '12px', margin: '6px 0', lineHeight: 1.4 }}>
              <div><strong>Cliente:</strong> {pedidoParaImprimir.customer_name || 'Balcão / Não informado'}</div>
              {pedidoParaImprimir.table_id && (
                <div><strong>Mesa:</strong> {pedidoParaImprimir.tables_restaurant?.number ? `Mesa ${pedidoParaImprimir.tables_restaurant.number}` : 'Mesa'}</div>
              )}
              {pedidoParaImprimir.delivery_address && (
                <div style={{ marginTop: '2px' }}>
                  <strong>Entrega:</strong> {pedidoParaImprimir.delivery_address}
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
            <div style={{ textAlign: 'left', fontSize: '12px', margin: '6px 0' }}>
              <div><strong>Pagamento:</strong> {pedidoParaImprimir.payment_status === 'paid' ? 'Pagamento já realizado' : 'Cobrar do cliente'}</div>
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