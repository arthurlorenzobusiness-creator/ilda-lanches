import React, { useState, useEffect } from 'react'

const API_URL = 'http://2.24.93.166:8081/api'

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
      const res = await fetch(`${API_URL}/whatsapp-contacts?search=${encodeURIComponent(termo)}`)
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
      const resStats = await fetch(`${API_URL}/stats`)
      if (!resStats.ok) throw new Error('Falha ao carregar métricas')
      const dataStats = await resStats.json()
      setStats(dataStats)

      const resContacts = await fetch(`${API_URL}/contacts`)
      if (!resContacts.ok) throw new Error('Falha ao carregar contatos')
      const dataContacts = await resContacts.json()
      setContacts(dataContacts)

      const resLandmarks = await fetch(`${API_URL}/landmarks`)
      if (resLandmarks.ok) {
        const dataLandmarks = await resLandmarks.json()
        setLandmarks(dataLandmarks)
      }
    } catch (err) {
      console.error(err)
      setError('Não foi possível conectar ao servidor da IA.')
    } finally {
      setLoading(false)
    }
  }

  async function atualizarContato(phone, is_blocked, name = null) {
    try {
      const payload = { is_blocked }
      if (name !== null) payload.name = name

      const res = await fetch(`${API_URL}/contacts/${phone}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Erro ao atualizar contato')
      carregarDados()
    } catch (err) {
      alert(err.message)
    }
  }

  async function adicionarContato(e) {
    e.preventDefault()
    if (!novoNumero) return
    const numLimpo = novoNumero.replace(/\D/g, '')
    if (numLimpo.length < 10) {
      alert('Número inválido. Digite com DDD.')
      return
    }
    await atualizarContato(numLimpo, 0, novoNome.trim() || null)
    setNovoNumero('')
    setNovoNome('')
  }

  async function adicionarPonto(e) {
    e.preventDefault()
    if (!novoPontoNome.trim() || !novoPontoTaxa) {
      alert('Informe o nome do local e a taxa de entrega.')
      return
    }
    setSalvandoPonto(true)
    try {
      const res = await fetch(`${API_URL}/landmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoPontoNome.trim(),
          endereco: novoPontoEndereco.trim(),
          taxa: parseFloat(novoPontoTaxa.replace(',', '.')) || 0
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
      const res = await fetch(`${API_URL}/landmarks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir')
      carregarDados()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading && !stats) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando dados da IA...</div>
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
        🤖 Painel de Controle da IA & Entregas
      </h2>

      {error && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* METRICAS */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>CLIENTES HOJE</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginTop: '4px' }}>{stats.conversations.today}</div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>CLIENTES ÚLTIMOS 7 DIAS</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginTop: '4px' }}>{stats.conversations.week}</div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>CUSTO OPENAI (GPT-4o)</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>${stats.openai.cost.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{(stats.openai.tokens / 1000).toFixed(1)}k tokens</div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>CUSTO ELEVENLABS (ÁUDIO)</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6366f1', marginTop: '4px' }}>${stats.elevenlabs.cost.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{stats.elevenlabs.characters} caracteres</div>
          </div>
        </div>
      )}

      {/* NOVA SEÇÃO: PONTOS DE REFERÊNCIA & LOCAIS CONHECIDOS */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
            📍 Locais Conhecidos & Pontos de Referência (Bady Bassitt)
          </h3>
          <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
            {landmarks.length} cadastrados
          </span>
        </div>
        <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '16px', lineHeight: 1.4 }}>
          Quando um cliente fala <i>"Entrega no Tridico"</i>, <i>"Na Adega"</i> ou <i>"Na Praça"</i> sem saber o endereço, a IA consulta esta tabela automaticamente e aplica a taxa exata na hora!
        </p>

        <form onSubmit={adicionarPonto} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Nome do local (Ex: Adega do Zé, Tridico, Hotel Salvador)" 
            value={novoPontoNome}
            onChange={(e) => setNovoPontoNome(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', flex: '1 1 240px' }}
            required
          />
          <input 
            type="text" 
            placeholder="Endereço aproximado (opcional)" 
            value={novoPontoEndereco}
            onChange={(e) => setNovoPontoEndereco(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', flex: '1 1 200px' }}
          />
          <input 
            type="text" 
            placeholder="Taxa R$ (Ex: 6.00)" 
            value={novoPontoTaxa}
            onChange={(e) => setNovoPontoTaxa(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '130px' }}
            required
          />
          <button 
            type="submit" 
            disabled={salvandoPonto}
            style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {salvandoPonto ? 'Salvando...' : '+ Salvar Ponto'}
          </button>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left', background: '#f9fafb' }}>
                <th style={{ padding: '10px 8px', color: '#374151' }}>Nome do Ponto / Local</th>
                <th style={{ padding: '10px 8px', color: '#374151' }}>Endereço Vinculado</th>
                <th style={{ padding: '10px 8px', color: '#374151' }}>Taxa Definida</th>
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
                landmarks.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#111827' }}>
                      📍 {l.nome}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#6b7280' }}>
                      {l.endereco || <span style={{ fontStyle: 'italic' }}>Não especificado</span>}
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#059669' }}>
                      R$ {Number(l.taxa).toFixed(2).replace('.', ',')}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => excluirPonto(l.id)}
                        style={{ 
                          padding: '4px 8px', 
                          background: '#fee2e2', 
                          color: '#dc2626', 
                          border: '1px solid #fca5a5', 
                          borderRadius: '4px', 
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
      </div>

      {/* SEÇÃO: CONTROLE DE CONTATOS (BLOQUEAR / PERMITIR IA) */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>Controle de Contatos (Bloquear IA)</h3>
        <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '16px' }}>
          Números bloqueados aqui não receberão resposta automática do bot de WhatsApp.
        </p>

        {/* FORMULÁRIO DE ADIÇÃO COM AUTOCOMPLETE */}
        <form onSubmit={adicionarContato} style={{ display: 'flex', gap: '10px', marginBottom: '20px', position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Buscar contato por nome no WhatsApp..." 
              value={novoNome}
              onChange={(e) => {
                setNovoNome(e.target.value)
                setBuscaAtiva(true)
              }}
              onFocus={() => setBuscaAtiva(true)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
            />
            {buscando && (
              <div style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '12px', color: '#9ca3af' }}>
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
                borderRadius: '6px',
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
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#111827' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>+{c.phone}</div>
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
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', flex: 1 }}
            required
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Adicionar à lista
          </button>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', color: '#4b5563' }}>Número</th>
                <th style={{ padding: '12px 8px', color: '#4b5563' }}>Nome</th>
                <th style={{ padding: '12px 8px', color: '#4b5563' }}>Status (IA)</th>
                <th style={{ padding: '12px 8px', color: '#4b5563', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Nenhum contato registrado ainda.</td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.phone_number} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>+{c.phone_number}</td>
                    <td style={{ padding: '12px 8px' }}>{c.name || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Desconhecido</span>}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {c.is_blocked ? (
                        <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>BLOQUEADO</span>
                      ) : (
                        <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>PERMITIDO</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => atualizarContato(c.phone_number, c.is_blocked ? 0 : 1)}
                        style={{ 
                          padding: '6px 12px', 
                          background: c.is_blocked ? '#10b981' : '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
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
      </div>
    </div>
  )
}
