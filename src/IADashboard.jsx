import React, { useState, useEffect } from 'react'

const API_BASE_FALLBACK = 'http://2.24.93.166/api'

async function fetchApi(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  let primaryUrl = `/api${cleanEndpoint}`
  
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    // Em localhost/127.0.0.1 em desenvolvimento local, usa direto o IP da VPS
    if (host === 'localhost' || host === '127.0.0.1') {
      primaryUrl = `${API_BASE_FALLBACK}${cleanEndpoint}`
    }
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(primaryUrl, { credentials: 'omit', ...options, signal: controller.signal })
    clearTimeout(timer)
    if (res.ok) return res
  } catch (err) {
    console.warn(`[IA API] Falha na rota primária ${primaryUrl}:`, err)
  }

  // Tenta fallback direto na VPS caso a primeira tentativa tenha falhado
  const fallbackUrl = `${API_BASE_FALLBACK}${cleanEndpoint}`
  if (fallbackUrl !== primaryUrl) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 6000)
      const resFallback = await fetch(fallbackUrl, { credentials: 'omit', ...options, signal: controller.signal })
      clearTimeout(timer)
      if (resFallback.ok) return resFallback
    } catch (errFallback) {
      console.error(`[IA API] Falha no fallback ${fallbackUrl}:`, errFallback)
    }
  }

  throw new Error(`Não foi possível conectar ao servidor da IA em ${endpoint}`)
}

export default function IADashboard() {
  const [stats, setStats] = useState(null)
  const [contacts, setContacts] = useState([])
  const [landmarks, setLandmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [novoNumero, setNovoNumero] = useState('')
  const [novoNome, setNovoNome] = useState('')

  const [buscaAtiva, setBuscaAtiva] = useState(false)
  const [sugestoes, setSugestoes] = useState([])
  const [buscando, setBuscando] = useState(false)

  // Estados para novo ponto de referência
  const [novoPontoNome, setNovoPontoNome] = useState('')
  const [novoPontoEndereco, setNovoPontoEndereco] = useState('')
  const [novoPontoTaxa, setNovoPontoTaxa] = useState('')
  const [salvandoPonto, setSalvandoPonto] = useState(false)

  // Limite de exibição para Locais e Contatos (4 por vez)
  const [limiteLandmarks, setLimiteLandmarks] = useState(4)
  const [limiteContatos, setLimiteContatos] = useState(4)

  // Estados para Recarga de Saldo OpenAI
  const [modalRecargaAberto, setModalRecargaAberto] = useState(false)
  const [valorRecarga, setValorRecarga] = useState('')
  const [tipoOperacaoRecarga, setTipoOperacaoRecarga] = useState('add') // 'add' ou 'set'
  const [salvandoRecarga, setSalvandoRecarga] = useState(false)

  async function salvarRecarga(e) {
    if (e) e.preventDefault()
    const num = parseFloat(valorRecarga.replace(',', '.'))
    if (isNaN(num) || num < 0) {
      alert('Informe um valor válido em dólares (ex: 6.00)')
      return
    }

    setSalvandoRecarga(true)
    try {
      const payload = tipoOperacaoRecarga === 'add' ? { amount: num } : { new_balance: num }
      const res = await fetchApi('/billing/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Erro ao salvar recarga')
      const data = await res.json()
      setStats(prev => prev ? {
        ...prev,
        openai: { ...prev.openai, balance: data.balance }
      } : prev)
      setModalRecargaAberto(false)
      setValorRecarga('')
    } catch (err) {
      alert(err.message)
    } finally {
      setSalvandoRecarga(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    if (novoNome.length >= 2 && buscaAtiva) {
      buscarContatosWpp(novoNome)
    } else {
      setSugestoes([])
    }
  }, [novoNome, buscaAtiva])

  async function buscarContatosWpp(termo) {
    setBuscando(true)
    try {
      const res = await fetchApi(`/whatsapp-contacts?search=${encodeURIComponent(termo)}`)
      if (res.ok) {
        const data = await res.json()
        setSugestoes(data)
      }
    } catch (err) {
      console.error('Erro ao buscar contatos:', err)
    } finally {
      setBuscando(false)
    }
  }

  function selecionarSugestao(contato) {
    setNovoNome(contato.name)
    setNovoNumero(contato.phone)
    setSugestoes([])
    setBuscaAtiva(false)
  }

  async function carregarDados() {
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.allSettled([
        fetchApi('/stats').then(r => r.json()),
        fetchApi('/contacts').then(r => r.json()),
        fetchApi('/landmarks').then(r => r.json())
      ])

      const [resStats, resContacts, resLandmarks] = results
      let sucessoAlgum = false

      if (resStats.status === 'fulfilled' && resStats.value) {
        setStats(resStats.value)
        sucessoAlgum = true
      }
      if (resContacts.status === 'fulfilled' && Array.isArray(resContacts.value)) {
        setContacts(resContacts.value)
        sucessoAlgum = true
      }
      if (resLandmarks.status === 'fulfilled' && Array.isArray(resLandmarks.value)) {
        setLandmarks(resLandmarks.value)
        sucessoAlgum = true
      }

      if (!sucessoAlgum) {
        setError('Não foi possível conectar ao servidor da IA. Verifique se o serviço está ativo.')
      }
    } catch (err) {
      setError('Não foi possível conectar ao servidor da IA. Verifique se o serviço está ativo.')
    } finally {
      setLoading(false)
    }
  }

  async function atualizarContato(phone, isBlocked) {
    try {
      const res = await fetchApi('/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, is_blocked: isBlocked })
      })
      if (!res.ok) throw new Error('Erro ao salvar contato')
      carregarDados()
    } catch (err) {
      alert(err.message)
    }
  }

  async function adicionarContato(e) {
    e.preventDefault()
    let cleanPhone = novoNumero.replace(/\D/g, '')
    if (!cleanPhone) return

    if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
      cleanPhone = '55' + cleanPhone
    }

    try {
      const res = await fetchApi('/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: cleanPhone, 
          name: novoNome || 'Contato Manual',
          is_blocked: 1 
        })
      })
      if (!res.ok) throw new Error('Erro ao adicionar contato')
      setNovoNumero('')
      setNovoNome('')
      setBuscaAtiva(false)
      carregarDados()
    } catch (err) {
      alert(err.message)
    }
  }

  async function adicionarPonto(e) {
    e.preventDefault()
    if (!novoPontoNome.trim() || !novoPontoTaxa) return

    const taxaNum = parseFloat(novoPontoTaxa.replace(',', '.'))
    if (isNaN(taxaNum)) {
      alert('Por favor, informe uma taxa válida (Ex: 6.00 ou 6)')
      return
    }

    setSalvandoPonto(true)
    try {
      const res = await fetchApi('/landmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoPontoNome.trim(),
          endereco: novoPontoEndereco.trim() || null,
          taxa: taxaNum
        })
      })
      if (!res.ok) throw new Error('Erro ao cadastrar ponto de referência')
      setNovoPontoNome('')
      setNovoPontoEndereco('')
      setNovoPontoTaxa('')
      carregarDados()
    } catch (err) {
      alert(err.message)
    } finally {
      setSalvandoPonto(false)
    }
  }

  async function excluirPonto(id) {
    if (!confirm('Deseja excluir este ponto de referência?')) return
    try {
      const res = await fetchApi(`/landmarks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir')
      carregarDados()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading && !stats) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
        Carregando dados da IA...
      </div>
    )
  }

  return (
    <div className="ia-dashboard-page" style={{ padding: '16px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif', boxSizing: 'border-box', width: '100%', paddingBottom: '90px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
        🤖 Painel de Controle da IA & Entregas
      </h2>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', lineHeight: 1.4 }}>
          {error}
        </div>
      )}

      {/* METRICAS */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <div style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>CLIENTES HOJE</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginTop: '4px' }}>{stats.conversations.today}</div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>CLIENTES ÚLTIMOS 7 DIAS</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginTop: '4px' }}>{stats.conversations.week}</div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>SALDO OPENAI</div>
              <button
                type="button"
                onClick={() => {
                  setValorRecarga('')
                  setTipoOperacaoRecarga('add')
                  setModalRecargaAberto(true)
                }}
                style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title="Adicionar recarga ou ajustar saldo"
              >
                + Recarga
              </button>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#10b981', marginTop: '6px' }}>
              ${((stats.openai && stats.openai.balance !== undefined) ? stats.openai.balance : 5.07).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* NOVA SEÇÃO: PONTOS DE REFERÊNCIA & LOCAIS CONHECIDOS */}
      <div style={{ background: 'white', padding: '18px', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            📍 Locais Conhecidos (Bady Bassitt)
          </h3>
          <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
            {landmarks.length} cadastrados
          </span>
        </div>
        <p style={{ color: '#4b5563', fontSize: '13px', marginBottom: '16px', lineHeight: 1.4 }}>
          Quando o cliente disser <i>"Entrega no Tridico"</i>, <i>"Na Adega"</i> ou <i>"Na Praça"</i> sem o endereço exato, a IA consulta esta tabela e aplica a taxa na hora.
        </p>

        <form onSubmit={adicionarPonto} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Nome do local (Ex: Adega do Zé, Tridico)" 
            value={novoPontoNome}
            onChange={(e) => setNovoPontoNome(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
            required
          />
          <input 
            type="text" 
            placeholder="Endereço aproximado (opcional)" 
            value={novoPontoEndereco}
            onChange={(e) => setNovoPontoEndereco(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
          />
          <input 
            type="text" 
            placeholder="Taxa R$ (Ex: 6.00)" 
            value={novoPontoTaxa}
            onChange={(e) => setNovoPontoTaxa(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
            required
          />
          <button 
            type="submit" 
            disabled={salvandoPonto}
            style={{ padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', width: '100%' }}
          >
            {salvandoPonto ? 'Salvando...' : '+ Salvar Ponto'}
          </button>
        </form>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left', background: '#f9fafb' }}>
                <th style={{ padding: '10px 8px', color: '#374151' }}>Ponto / Local</th>
                <th style={{ padding: '10px 8px', color: '#374151' }}>Endereço</th>
                <th style={{ padding: '10px 8px', color: '#374151' }}>Taxa</th>
                <th style={{ padding: '10px 8px', color: '#374151', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {landmarks.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                    Nenhum ponto de referência cadastrado ainda.
                  </td>
                </tr>
              ) : (
                landmarks.slice(0, limiteLandmarks).map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#111827' }}>
                      📍 {l.nome}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#6b7280' }}>
                      {l.endereco || <span style={{ fontStyle: 'italic' }}>Não especificado</span>}
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#059669', whiteSpace: 'nowrap' }}>
                      R$ {Number(l.taxa).toFixed(2).replace('.', ',')}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => excluirPonto(l.id)}
                        style={{ 
                          padding: '5px 10px', 
                          background: '#fee2e2', 
                          color: '#dc2626', 
                          border: '1px solid #fca5a5', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {landmarks.length > 4 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
            {limiteLandmarks < landmarks.length ? (
              <>
                <button 
                  type="button"
                  onClick={() => setLimiteLandmarks(prev => prev + 4)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: '#f9fafb',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Mostrar mais
                </button>
                <button 
                  type="button"
                  onClick={() => setLimiteLandmarks(landmarks.length)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #ea580c',
                    background: '#fff7ed',
                    color: '#ea580c',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Mostrar tudo
                </button>
                {limiteLandmarks > 4 && (
                  <button 
                    type="button"
                    onClick={() => setLimiteLandmarks(4)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#6b7280',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Fechar
                  </button>
                )}
              </>
            ) : (
              <button 
                type="button"
                onClick={() => setLimiteLandmarks(4)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#f3f4f6',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Fechar
              </button>
            )}
          </div>
        )}
      </div>

      {/* SEÇÃO: CONTROLE DE CONTATOS (BLOQUEAR / PERMITIR IA) */}
      <div style={{ background: 'white', padding: '18px', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>Controle de Contatos (Bloquear IA)</h3>
        <p style={{ color: '#4b5563', fontSize: '13px', marginBottom: '16px', lineHeight: 1.4 }}>
          Números bloqueados aqui não receberão resposta automática do bot de WhatsApp.
        </p>

        {/* FORMULÁRIO DE ADIÇÃO COM AUTOCOMPLETE */}
        <form onSubmit={adicionarContato} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px', position: 'relative' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              placeholder="Buscar contato WhatsApp..." 
              value={novoNome}
              onChange={(e) => {
                setNovoNome(e.target.value)
                setBuscaAtiva(true)
              }}
              onFocus={() => setBuscaAtiva(true)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }}
            />
            {buscando && (
              <div style={{ position: 'absolute', right: '10px', top: '11px', fontSize: '12px', color: '#9ca3af' }}>
                Buscando...
              </div>
            )}
            {sugestoes.length > 0 && buscaAtiva && (
              <ul style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                marginTop: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                listStyle: 'none',
                padding: 0,
                zIndex: 50,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}>
                {sugestoes.map(c => (
                  <li 
                    key={c.phone} 
                    onClick={() => selecionarSugestao(c)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {c.pic ? (
                      <img src={c.pic} alt="" style={{ width: '32px', height: '32px', borderRadius: '16px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '16px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>👤</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#111827' }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>+{c.phone}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input 
            type="text" 
            placeholder="Número (Ex: 5517999999999)" 
            value={novoNumero}
            onChange={(e) => setNovoNumero(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', boxSizing: 'border-box', fontSize: '14px' }}
            required
          />
          <button type="submit" style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', width: '100%' }}>
            Adicionar à lista
          </button>
        </form>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px', color: '#4b5563' }}>Número</th>
                <th style={{ padding: '10px 8px', color: '#4b5563' }}>Nome</th>
                <th style={{ padding: '10px 8px', color: '#4b5563' }}>Status (IA)</th>
                <th style={{ padding: '10px 8px', color: '#4b5563', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Nenhum contato registrado ainda.</td>
                </tr>
              ) : (
                contacts.slice(0, limiteContatos).map((c) => (
                  <tr key={c.phone_number} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>+{c.phone_number}</td>
                    <td style={{ padding: '10px 8px' }}>{c.name || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Desconhecido</span>}</td>
                    <td style={{ padding: '10px 8px' }}>
                      {c.is_blocked ? (
                        <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>BLOQUEADO</span>
                      ) : (
                        <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>PERMITIDO</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => atualizarContato(c.phone_number, c.is_blocked ? 0 : 1)}
                        style={{ 
                          padding: '6px 12px', 
                          background: c.is_blocked ? '#10b981' : '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {c.is_blocked ? 'Permitir IA' : 'Bloquear IA'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {contacts.length > 4 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
            {limiteContatos < contacts.length ? (
              <>
                <button 
                  type="button"
                  onClick={() => setLimiteContatos(prev => prev + 4)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: '#f9fafb',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Mostrar mais
                </button>
                <button 
                  type="button"
                  onClick={() => setLimiteContatos(contacts.length)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #ea580c',
                    background: '#fff7ed',
                    color: '#ea580c',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Mostrar tudo
                </button>
                {limiteContatos > 4 && (
                  <button 
                    type="button"
                    onClick={() => setLimiteContatos(4)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#6b7280',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Fechar
                  </button>
                )}
              </>
            ) : (
              <button 
                type="button"
                onClick={() => setLimiteContatos(4)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#f3f4f6',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Fechar
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE RECARGA / AJUSTE DE SALDO OPENAI */}
      {modalRecargaAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                💳 Saldo de Créditos OpenAI
              </h3>
              <button
                type="button"
                onClick={() => setModalRecargaAberto(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#4b5563', fontSize: '13px', marginBottom: '16px', lineHeight: 1.4 }}>
              Saldo atual registrado: <strong style={{ color: '#10b981' }}>${((stats?.openai?.balance !== undefined) ? stats.openai.balance : 5.07).toFixed(2)}</strong>
            </p>

            {/* Alternador de Tipo de Operação */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setTipoOperacaoRecarga('add')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: tipoOperacaoRecarga === 'add' ? '2px solid #10b981' : '1px solid #d1d5db',
                  background: tipoOperacaoRecarga === 'add' ? '#f0fdf4' : '#f9fafb',
                  color: tipoOperacaoRecarga === 'add' ? '#15803d' : '#374151'
                }}
              >
                + Adicionar Recarga
              </button>
              <button
                type="button"
                onClick={() => setTipoOperacaoRecarga('set')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: tipoOperacaoRecarga === 'set' ? '2px solid #10b981' : '1px solid #d1d5db',
                  background: tipoOperacaoRecarga === 'set' ? '#f0fdf4' : '#f9fafb',
                  color: tipoOperacaoRecarga === 'set' ? '#15803d' : '#374151'
                }}
              >
                Definir Saldo Exato
              </button>
            </div>

            <form onSubmit={salvarRecarga}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  {tipoOperacaoRecarga === 'add' ? 'Valor da recarga feita na OpenAI ($ USD):' : 'Valor exato do saldo na OpenAI ($ USD):'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280', fontWeight: 'bold' }}>$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder={tipoOperacaoRecarga === 'add' ? '6.00' : '5.07'}
                    value={valorRecarga}
                    onChange={(e) => setValorRecarga(e.target.value)}
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 28px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Botões rápidos para recargas comuns */}
              {tipoOperacaoRecarga === 'add' && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {[5, 6, 10, 15, 20].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setValorRecarga(val.toFixed(2))}
                      style={{
                        padding: '4px 10px',
                        background: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#374151',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      +${val}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalRecargaAberto(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: '#f3f4f6',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoRecarga}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#10b981',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: salvandoRecarga ? 'not-allowed' : 'pointer',
                    opacity: salvandoRecarga ? 0.7 : 1
                  }}
                >
                  {salvandoRecarga ? 'Salvando...' : 'Confirmar Saldo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
