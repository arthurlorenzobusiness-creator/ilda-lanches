import React from 'react'
import {
  ArrowLeft,
  ShoppingBag,
  UtensilsCrossed,
  Bike,
  Check,
  X,
  Search,
  Plus,
  Trash2,
  ClipboardList,
  CheckCheck,
  TrendingUp,
  LogOut,
  Settings,
  MapPin,
  Save,
  CheckCircle2,
  User
} from 'lucide-react'

export default function EditarPedidoPage({
  pedidoSelecionado,
  setPedidoSelecionado,
  sidebarMobile,
  setSidebarMobile,
  sidebarAberta,
  setSidebarAberta,
  logoIlda,
  isDriver,
  isOwner,
  contagemPedidosAtivos,
  contagemPedidosEntregues,
  contagemPedidosMesas,
  filtroOrigem,
  setFiltroOrigem,
  setFiltroTipo,
  setFiltroEntregador,
  setSubAbaConfig,
  sair,
  categorias,
  categoriaEdicao,
  setCategoriaEdicao,
  buscaProdutoEdicao,
  setBuscaProdutoEdicao,
  adicionalEdicaoItemAberto,
  setAdicionalEdicaoItemAberto,
  termoAdicionalEdicao,
  setTermoAdicionalEdicao,
  removerEdicaoItemAberto,
  setRemoverEdicaoItemAberto,
  termoRemoverEdicao,
  setTermoRemoverEdicao,
  adicionarProdutoEdicao,
  adicionarAdicionalItemEdicao,
  removerAdicionalItemEdicao,
  alterarQuantidadeAdicionalItemEdicao,
  adicionarRemocaoItemEdicao,
  removerRemocaoItemEdicao,
  tipoRecebimento,
  setTipoRecebimento,
  enderecoEdicao,
  setEnderecoEdicao,
  numeroEdicao,
  setNumeroEdicao,
  bairroEdicao,
  setBairroEdicao,
  infoDistanciaEdicao,
  setInfoDistanciaEdicao,
  calculandoDistanciaEdicao,
  calcularTaxaAutomaticaEdicao,
  formaPagamentoEdicao,
  setFormaPagamentoEdicao,
  valorPagoDinheiroEdicao,
  setValorPagoDinheiroEdicao,
  foiPagoEdicao,
  setFoiPagoEdicao,
  salvarEdicaoPedido,
  cancelarPedido,
  isSmallScreen,
  obterComposicaoItem,
  setItemInspecionado,
  formatarMoeda,
  buscaFuzzy,
  ADICIONAIS,
  obterIngredientesDoProduto,
  isProdutoBebida,
  renderModalInspecionar,
  ThermalReceiptArea,
  obterNumeroExibicaoPedido,
  adicionarOpcaoSaladaSeAplicavel
}) {
    const totalAtualEdicao = Number(
      (pedidoSelecionado.order_items || []).reduce(
        (soma, item) => soma + Number(item.total_price || (item.unit_price * item.quantity)), 0
      ) + Number(pedidoSelecionado.delivery_fee || 0)
    )

    return (
      <div className="cafe-app-container">
        {/* BACKDROP MOBILE */}
        {sidebarMobile && (
          <div 
            className="cafe-mobile-backdrop" 
            onClick={() => setSidebarMobile(false)}
            aria-label="Fechar menu lateral"
          />
        )}

        {/* SIDEBAR RETRÁTIL MODERNA */}
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
                    className="cafe-nav-item"
                    onClick={() => {
                      setPedidoSelecionado(null)
                      setFiltroOrigem('todos')
                      setFiltroTipo('delivery')
                    }}
                    title="Entregas Disponíveis"
                  >
                    <span className="cafe-nav-icon"><Bike size={18} strokeWidth={2} /></span>
                    <span className="cafe-nav-label">Entregas</span>
                    {contagemPedidosAtivos > 0 && (
                      <span className="cafe-nav-badge">{contagemPedidosAtivos}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="cafe-nav-item"
                    onClick={() => {
                      setPedidoSelecionado(null)
                      setFiltroOrigem('entregues')
                    }}
                    title="Minhas Entregas"
                  >
                    <span className="cafe-nav-icon"><CheckCheck size={18} strokeWidth={2} /></span>
                    <span className="cafe-nav-label">Entregues</span>
                    {contagemPedidosEntregues > 0 && (
                      <span className="cafe-nav-badge badge-green">{contagemPedidosEntregues}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="cafe-nav-item"
                    onClick={() => {
                      setPedidoSelecionado(null)
                      setFiltroOrigem('configuracoes')
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
                    className="cafe-nav-item"
                    onClick={() => {
                      setPedidoSelecionado(null)
                      setFiltroOrigem('todos')
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
                    className="cafe-nav-item"
                    onClick={() => {
                      setPedidoSelecionado(null)
                      setFiltroOrigem('table')
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
                      className="cafe-nav-item"
                      onClick={() => {
                        setPedidoSelecionado(null)
                        setFiltroOrigem('entregues')
                        setFiltroEntregador('todos')
                      }}
                      title="Ver Entregues"
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
                      className="cafe-nav-item"
                      onClick={() => {
                        setPedidoSelecionado(null)
                        setFiltroOrigem('faturamento')
                      }}
                      title="Relatórios"
                    >
                      <span className="cafe-nav-icon"><TrendingUp size={18} strokeWidth={2} /></span>
                      <span className="cafe-nav-label">Relatórios</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="cafe-nav-item"
                    onClick={() => {
                      setPedidoSelecionado(null)
                      setFiltroOrigem('configuracoes')
                      setSubAbaConfig('geral')
                    }}
                    title="Configurações"
                  >
                    <span className="cafe-nav-icon"><Settings size={18} strokeWidth={2} /></span>
                    <span className="cafe-nav-label">Configurações</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="cafe-sidebar-section cafe-sidebar-footer">
            <nav className="cafe-sidebar-nav">
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

        {/* ÁREA PRINCIPAL */}
        <div className="cafe-main-area">
          {/* TOPBAR MODERNA */}
          <header className="cafe-topbar">
            <div className="cafe-topbar-left">
              <button
                type="button"
                className="cafe-btn-back"
                onClick={() => setPedidoSelecionado(null)}
                title="Voltar ao Painel de Pedidos"
              >
                <ArrowLeft size={16} strokeWidth={2.4} />
                <span>Voltar ao Painel</span>
              </button>
            </div>

            <div className="cafe-topbar-right">
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: '#fff7ed',
                color: '#c2410c',
                fontSize: '13px',
                fontWeight: 700,
                border: '1px solid #fed7aa'
              }}>
                Pedido #{obterNumeroExibicaoPedido(pedidoSelecionado)}
              </span>
            </div>
          </header>

          {/* CONTEÚDO PRINCIPAL DE EDIÇÃO */}
          <main className="cafe-main-content">
            <div className="cafe-page-header">
              <div>
                <h1 className="cafe-page-title">Editar Pedido #{obterNumeroExibicaoPedido(pedidoSelecionado)}</h1>
                <p className="cafe-page-subtitle">Altere itens, quantidades, adicionais, endereço de entrega e valores</p>
              </div>
            </div>

            <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* CARD 1: ORIGEM E CLIENTE */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '22px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <User size={18} color="#ea580c" strokeWidth={2.2} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Origem & Cliente</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
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
                        style={{
                          flex: 1,
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          color: '#1e293b',
                          background: '#ffffff',
                          fontWeight: 500,
                          outline: 'none'
                        }}
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
                          style={{
                            width: '130px',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            color: '#1e293b',
                            background: '#ffffff',
                            fontWeight: 500,
                            outline: 'none'
                          }}
                        >
                          <option value="sem_mesa">S/ Mesa</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>Mesa {n}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      placeholder=""
                      value={pedidoSelecionado.customer_name || ''}
                      onChange={(e) => setPedidoSelecionado((atual) => ({ ...atual, customer_name: e.target.value }))}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        color: '#1e293b',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: ITENS DO PEDIDO */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '22px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingBag size={18} color="#ea580c" strokeWidth={2.2} />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Itens do Pedido</h3>
                  </div>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                    {pedidoSelecionado.order_items?.length || 0} {pedidoSelecionado.order_items?.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                {(!pedidoSelecionado.order_items || pedidoSelecionado.order_items.length === 0) ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: '16px 0', textAlign: 'center' }}>
                    Nenhum item adicionado a este pedido ainda.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {pedidoSelecionado.order_items.map((item) => (
                      <div 
                        key={item.id} 
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* LINHA 1: NOME, PREÇO E CONTROLE DE QUANTIDADE */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{item.product_name}</span>
                              {obterComposicaoItem(item.product_name) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setItemInspecionado(obterComposicaoItem(item.product_name))
                                  }}
                                  style={{
                                    background: '#f8fafc',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    padding: '2px 5px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#0284c7',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title="Ver ingredientes e itens do lanche/combo"
                                >
                                  <Search size={13} strokeWidth={2.6} />
                                </button>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                              R$ {((Number(item.unit_price_base ?? item.unit_price)) * item.quantity).toFixed(2).replace('.', ',')}
                              <span style={{ marginLeft: '6px', fontSize: '12px', color: '#94a3b8' }}>
                                (R$ {Number(item.unit_price_base ?? item.unit_price).toFixed(2).replace('.', ',')} un.)
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                              type="button"
                              onClick={() => {
                                const novaQuantidade = item.quantity - 1
                                setPedidoSelecionado((atual) => ({
                                  ...atual,
                                  order_items: novaQuantidade <= 0
                                    ? atual.order_items.filter((p) => p.id !== item.id)
                                    : atual.order_items.map((p) => {
                                        if (p.id === item.id) {
                                          const uBase = p.unit_price_base ?? Number(p.unit_price)
                                          const tAds = (p.adicionais || []).reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                                          const tRem = (p.remocoes || []).reduce((s, r) => s + (r.valor || 0), 0)
                                          return { ...p, quantity: novaQuantidade, total_price: Math.max(0, (novaQuantidade * uBase) + tAds - tRem) }
                                        }
                                        return p
                                      }),
                                }))
                              }}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#1e293b',
                                fontSize: '16px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              −
                            </button>
                            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                              {item.quantity}
                            </span>
                            <button 
                              type="button"
                              onClick={() => {
                                const novaQuantidade = item.quantity + 1
                                setPedidoSelecionado((atual) => ({
                                  ...atual,
                                  order_items: atual.order_items.map((p) => {
                                    if (p.id === item.id) {
                                      const uBase = p.unit_price_base ?? Number(p.unit_price)
                                      const tAds = (p.adicionais || []).reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                                      const tRem = (p.remocoes || []).reduce((s, r) => s + (r.valor || 0), 0)
                                      return { ...p, quantity: novaQuantidade, total_price: Math.max(0, (novaQuantidade * uBase) + tAds - tRem) }
                                    }
                                    return p
                                  }),
                                }))
                              }}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#1e293b',
                                fontSize: '16px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* LINHA 2: OBSERVAÇÃO, AUTOCOMPLETE DE ADICIONAIS & BOTÃO REMOVER */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder=""
                            value={item.notes || ''}
                            onChange={(e) => {
                              const v = e.target.value
                              setPedidoSelecionado((atual) => ({
                                ...atual,
                                order_items: atual.order_items.map((p) => p.id === item.id ? { ...p, notes: v } : p)
                              }))
                            }}
                            style={{
                              flex: 1,
                              minWidth: '160px',
                              fontSize: '13px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              outline: 'none'
                            }}
                          />

                          {!isProdutoBebida(item.product_name) && (
                            <div className="container-adicional-popover" style={{ position: 'relative' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setRemoverEdicaoItemAberto(null)
                                  if (adicionalEdicaoItemAberto === item.id) {
                                    setAdicionalEdicaoItemAberto(null)
                                    setTermoAdicionalEdicao('')
                                  } else {
                                    setAdicionalEdicaoItemAberto(item.id)
                                    setTermoAdicionalEdicao('')
                                    if (!isSmallScreen) {
                                      setTimeout(() => {
                                        const inp = document.getElementById(`input-adicional-edicao-${item.id}`)
                                        if (inp) {
                                          inp.focus()
                                          inp.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                                        }
                                      }, 40)
                                    }
                                  }
                                }}
                                style={{
                                  background: adicionalEdicaoItemAberto === item.id ? '#dcfce7' : '#f0fdf4',
                                  border: '1px solid #10b981',
                                  color: '#15803d',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  whiteSpace: 'nowrap',
                                  boxSizing: 'border-box'
                                }}
                                title="Incluir adicionais neste lanche"
                              >
                                + Adicional
                              </button>

                              {adicionalEdicaoItemAberto === item.id && (
                                isSmallScreen ? (
                                  /* MODAL / BOTTOM SHEET MOBILE PARA INCLUIR ADICIONAIS NA EDIÇÃO */
                                  <div
                                    className="modal-backdrop-mobile-adicional"
                                    style={{
                                      position: 'fixed',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(15, 23, 42, 0.65)',
                                      backdropFilter: 'blur(4px)',
                                      WebkitBackdropFilter: 'blur(4px)',
                                      zIndex: 999999,
                                      display: 'flex',
                                      alignItems: 'flex-end',
                                      justifyContent: 'center',
                                      padding: 0
                                    }}
                                    onClick={() => { setAdicionalEdicaoItemAberto(null); setTermoAdicionalEdicao(''); }}
                                  >
                                    <div
                                      className="modal-sheet-mobile-adicional"
                                      style={{
                                        background: '#ffffff',
                                        width: '100%',
                                        maxWidth: '480px',
                                        maxHeight: '85vh',
                                        borderRadius: '24px 24px 0 0',
                                        boxShadow: '0 -10px 32px rgba(0,0,0,0.3)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'hidden',
                                        boxSizing: 'border-box',
                                        animation: 'slideUpSheet 0.22s ease-out'
                                      }}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {/* Puxador gaveta iOS */}
                                      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '6px' }}>
                                        <div style={{ width: '42px', height: '4.5px', background: '#cbd5e1', borderRadius: '4px' }} />
                                      </div>

                                      {/* Header */}
                                      <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              width: '24px',
                                              height: '24px',
                                              borderRadius: '50%',
                                              background: '#dcfce7',
                                              color: '#15803d',
                                              fontWeight: 900,
                                              fontSize: '15px'
                                            }}>+</span>
                                            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                                              Incluir Adicionais
                                            </h3>
                                          </div>
                                          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                                            {item.product_name}
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => { setAdicionalEdicaoItemAberto(null); setTermoAdicionalEdicao(''); }}
                                          style={{
                                            background: '#f1f5f9',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '34px',
                                            height: '34px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: '#475569',
                                            fontWeight: 800,
                                            fontSize: '15px'
                                          }}
                                          title="Fechar"
                                        >
                                          ✕
                                        </button>
                                      </div>

                                      {/* Busca opcional sem autofocus no mobile */}
                                      <div style={{ padding: '10px 16px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
                                        <input
                                          id={`input-adicional-edicao-${item.id}`}
                                          type="text"
                                          value={termoAdicionalEdicao}
                                          onChange={(e) => setTermoAdicionalEdicao(e.target.value)}
                                          placeholder=""
                                          style={{
                                            width: '100%',
                                            fontSize: '14px',
                                            padding: '9px 12px',
                                            borderRadius: '10px',
                                            border: '1.5px solid #86efac',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            background: '#ffffff'
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault()
                                              const textoTrim = termoAdicionalEdicao.trim()
                                              if (!textoTrim) return
                                              const match = ADICIONAIS.find(([nome]) => nome.toLowerCase() === textoTrim.toLowerCase())
                                              if (match) {
                                                adicionarAdicionalItemEdicao(item.id, match[0], match[1])
                                              } else {
                                                adicionarAdicionalItemEdicao(item.id, textoTrim, 0)
                                              }
                                              setTermoAdicionalEdicao('')
                                            }
                                          }}
                                        />
                                      </div>

                                      {/* Grade com todos os adicionais em botões amplos para toque */}
                                      <div
                                        style={{
                                          flex: 1,
                                          overflowY: 'auto',
                                          WebkitOverflowScrolling: 'touch',
                                          padding: '12px 16px',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '8px',
                                          maxHeight: '52vh'
                                        }}
                                      >
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                                          Toque no adicional para incluir ({ADICIONAIS.length} disponíveis):
                                        </div>

                                        {(() => {
                                          const busca = (termoAdicionalEdicao || '').toLowerCase().trim()
                                          const filtrados = ADICIONAIS.filter(([nome]) => nome.toLowerCase().includes(busca))
                                          const temMatchExato = filtrados.some(([nome]) => nome.toLowerCase() === busca)

                                          return (
                                            <>
                                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                                                {filtrados.map(([nomeAd, valorAd]) => (
                                                  <button
                                                    type="button"
                                                    key={nomeAd}
                                                    onClick={() => {
                                                      adicionarAdicionalItemEdicao(item.id, nomeAd, valorAd)
                                                    }}
                                                    style={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'space-between',
                                                      padding: '10px 12px',
                                                      borderRadius: '10px',
                                                      border: '1.5px solid #bbf7d0',
                                                      background: '#f0fdf4',
                                                      color: '#166534',
                                                      fontSize: '13px',
                                                      fontWeight: 600,
                                                      cursor: 'pointer',
                                                      textAlign: 'left',
                                                      boxSizing: 'border-box',
                                                      gap: '6px'
                                                    }}
                                                  >
                                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                      <div style={{ fontWeight: 700 }}>{nomeAd}</div>
                                                      <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>+R$ {valorAd.toFixed(2).replace('.', ',')}</span>
                                                    </div>
                                                    <span style={{
                                                      fontSize: '13px',
                                                      fontWeight: 800,
                                                      color: '#15803d',
                                                      background: '#dcfce7',
                                                      width: '22px',
                                                      height: '22px',
                                                      borderRadius: '50%',
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      flexShrink: 0
                                                    }}>+</span>
                                                  </button>
                                                ))}
                                              </div>

                                              {busca && !temMatchExato && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    adicionarAdicionalItemEdicao(item.id, termoAdicionalEdicao.trim(), 0)
                                                    setTermoAdicionalEdicao('')
                                                  }}
                                                  style={{
                                                    marginTop: '6px',
                                                    padding: '10px 14px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    color: '#15803d',
                                                    background: '#f0fdf4',
                                                    border: '1.5px dashed #86efac',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    boxSizing: 'border-box'
                                                  }}
                                                >
                                                  <span>+ Adicional personalizado: "{termoAdicionalEdicao.trim()}"</span>
                                                  <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>Toque aqui</span>
                                                </button>
                                              )}
                                            </>
                                          )
                                        })()}

                                        {/* Exibição dos adicionais já incluídos */}
                                        {(item.adicionais || []).length > 0 && (
                                          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #bbf7d0' }}>
                                            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#15803d', marginBottom: '6px' }}>
                                              Adicionais já incluídos neste lanche:
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                              {(item.adicionais || []).map((ad, aIdx) => (
                                                <span
                                                  key={aIdx}
                                                  style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    background: '#dcfce7',
                                                    color: '#166534',
                                                    border: '1px solid #86efac',
                                                    padding: '4px 10px',
                                                    borderRadius: '9999px',
                                                    fontSize: '12px',
                                                    fontWeight: 600
                                                  }}
                                                >
                                                  <button
                                                    type="button"
                                                    onClick={() => alterarQuantidadeAdicionalItemEdicao(item.id, aIdx, -1)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', fontWeight: 800, padding: '0 2px' }}
                                                  >−</button>
                                                  <span>{ad.quantidade || 1}x {ad.nome} (+R$ {((ad.valor || 0) * (ad.quantidade || 1)).toFixed(2).replace('.', ',')})</span>
                                                  <button
                                                    type="button"
                                                    onClick={() => alterarQuantidadeAdicionalItemEdicao(item.id, aIdx, 1)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', fontWeight: 800, padding: '0 2px' }}
                                                  >+</button>
                                                  <button
                                                    type="button"
                                                    onClick={() => removerAdicionalItemEdicao(item.id, aIdx)}
                                                    style={{
                                                      background: 'none',
                                                      border: 'none',
                                                      color: '#dc2626',
                                                      cursor: 'pointer',
                                                      fontWeight: 800,
                                                      fontSize: '13px',
                                                      padding: 0,
                                                      lineHeight: 1,
                                                      marginLeft: '2px'
                                                    }}
                                                    title="Remover adicional"
                                                  >
                                                    ✕
                                                  </button>
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Rodapé com botão Concluir grande */}
                                      <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
                                        <button
                                          type="button"
                                          onClick={() => { setAdicionalEdicaoItemAberto(null); setTermoAdicionalEdicao(''); }}
                                          style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: '#0f172a',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
                                          }}
                                        >
                                          Concluir e Voltar ao Pedido
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  /* POPOVER PARA TELAS GRANDES (DESKTOP) */
                                  <div style={{
                                    position: 'absolute', top: '100%', left: 0, zIndex: 99999,
                                    background: 'white', border: '1.5px solid #10b981', borderRadius: '12px',
                                    boxShadow: '0 8px 24px rgba(16,185,129,0.22)', minWidth: 'min(240px, calc(100vw - 32px))', maxWidth: 'min(280px, calc(100vw - 32px))', touchAction: 'manipulation',
                                    marginTop: '4px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
                                  }}>
                                    <div style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: 700, color: '#166534', background: '#dcfce7', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span>Incluir adicional:</span>
                                      <button 
                                        type="button" 
                                        onClick={() => { setAdicionalEdicaoItemAberto(null); setTermoAdicionalEdicao(''); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 'bold', fontSize: '13px', padding: 0, lineHeight: 1 }}
                                        title="Fechar"
                                      >✕</button>
                                    </div>

                                    {/* Campo para escrever o adicional */}
                                    <div style={{ padding: '6px 8px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
                                      <input
                                        id={`input-adicional-edicao-${item.id}`}
                                        type="text"
                                        autoFocus
                                        value={termoAdicionalEdicao}
                                        onChange={(e) => setTermoAdicionalEdicao(e.target.value)}
                                        placeholder=""
                                        style={{
                                          width: '100%',
                                          fontSize: '14px',
                                          padding: '6px 8px',
                                          borderRadius: '6px',
                                          border: '1px solid #86efac',
                                          outline: 'none',
                                          boxSizing: 'border-box'
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault()
                                            const textoTrim = termoAdicionalEdicao.trim()
                                            if (!textoTrim) return
                                            const match = ADICIONAIS.find(([nome]) => nome.toLowerCase() === textoTrim.toLowerCase())
                                            if (match) {
                                              adicionarAdicionalItemEdicao(item.id, match[0], match[1])
                                            } else {
                                              adicionarAdicionalItemEdicao(item.id, textoTrim, 0)
                                            }
                                            setAdicionalEdicaoItemAberto(null)
                                            setTermoAdicionalEdicao('')
                                          }
                                        }}
                                      />
                                    </div>

                                    <div 
                                      className="popover-adicional-lista" 
                                      style={{ 
                                        maxHeight: '260px', 
                                        overflowY: 'auto',
                                        WebkitOverflowScrolling: 'touch',
                                        overscrollBehavior: 'contain'
                                      }}
                                    >
                                      {(() => {
                                        const busca = (termoAdicionalEdicao || '').toLowerCase().trim()
                                        const filtrados = ADICIONAIS.filter(([nome]) => nome.toLowerCase().includes(busca))

                                        if (filtrados.length === 0 && !busca) {
                                          return (
                                            <div style={{ padding: '12px 10px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                                              Nenhum adicional disponível
                                            </div>
                                          )
                                        }

                                        const temMatchExato = filtrados.some(([nome]) => nome.toLowerCase() === busca)

                                        return (
                                          <>
                                            {filtrados.map(([nomeAd, valorAd]) => (
                                              <div
                                                key={nomeAd}
                                                onClick={() => {
                                                  adicionarAdicionalItemEdicao(item.id, nomeAd, valorAd)
                                                  setAdicionalEdicaoItemAberto(null)
                                                  setTermoAdicionalEdicao('')
                                                }}
                                                style={{
                                                  padding: '7px 10px',
                                                  minHeight: '36px',
                                                  boxSizing: 'border-box',
                                                  cursor: 'pointer',
                                                  fontSize: '12px',
                                                  fontWeight: 600,
                                                  color: '#166534',
                                                  borderBottom: '1px solid #f0fdf4',
                                                  display: 'flex',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  background: 'white'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                              >
                                                <span>{nomeAd}</span>
                                                <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>+R${valorAd},00</span>
                                              </div>
                                            ))}

                                            {busca && !temMatchExato && (
                                              <div
                                                onClick={() => {
                                                  adicionarAdicionalItemEdicao(item.id, termoAdicionalEdicao.trim(), 0)
                                                  setAdicionalEdicaoItemAberto(null)
                                                  setTermoAdicionalEdicao('')
                                                }}
                                                style={{
                                                  padding: '8px 10px',
                                                  minHeight: '38px',
                                                  boxSizing: 'border-box',
                                                  cursor: 'pointer',
                                                  fontSize: '12px',
                                                  fontWeight: 700,
                                                  color: '#15803d',
                                                  background: '#f0fdf4',
                                                  borderTop: '1px dashed #86efac',
                                                  display: 'flex',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                              >
                                                <span>+ Incluir "{termoAdicionalEdicao.trim()}"</span>
                                                <span style={{ fontSize: '10.5px', color: '#166534', fontWeight: 600 }}>Enter ↵</span>
                                              </div>
                                            )}
                                          </>
                                        )
                                      })()}
                                    </div>

                                    {/* Rodapé fixo informativo */}
                                    <div style={{
                                      padding: '5px 10px',
                                      fontSize: '11px',
                                      color: '#166534',
                                      background: '#f0fdf4',
                                      borderTop: '1px solid #bbf7d0',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      fontWeight: 600
                                    }}>
                                      <span>{ADICIONAIS.length} opções disponíveis</span>
                                      {ADICIONAIS.length > 5 && (
                                        <span style={{ fontSize: '10px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                          ↕ Role p/ ver todos
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          {/* BOTÃO VERMELHO - REMOVER NA EDIÇÃO */}
                          {!isProdutoBebida(item.product_name) && (() => {
                            const ingredientesBrutos = obterIngredientesDoProduto(item.product_name)
                            const ingredientesPossiveis = adicionarOpcaoSaladaSeAplicavel ? adicionarOpcaoSaladaSeAplicavel(ingredientesBrutos) : ingredientesBrutos
                            if (!ingredientesPossiveis || ingredientesPossiveis.length === 0) return null
                            const remocoesAtuais = (item.remocoes || []).map(r => r.nome.toLowerCase())
                            const ingredientesDisponiveis = ingredientesPossiveis.filter(([ing]) => !remocoesAtuais.includes(ing.toLowerCase()))

                            return (
                              <div className="container-remover-popover" style={{ position: 'relative' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdicionalEdicaoItemAberto(null)
                                    if (removerEdicaoItemAberto === item.id) {
                                      setRemoverEdicaoItemAberto(null)
                                      setTermoRemoverEdicao('')
                                    } else {
                                      setRemoverEdicaoItemAberto(item.id)
                                      setTermoRemoverEdicao('')
                                      if (!isSmallScreen) {
                                        setTimeout(() => {
                                          const inp = document.getElementById(`input-remover-edicao-${item.id}`)
                                          if (inp) {
                                            inp.focus()
                                            inp.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                                          }
                                        }, 40)
                                      }
                                    }
                                  }}
                                  style={{
                                    background: removerEdicaoItemAberto === item.id ? '#fee2e2' : '#fef2f2',
                                    border: '1px solid #ef4444',
                                    color: '#dc2626',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="Remover ingredientes deste lanche"
                                >
                                  - Remover
                                </button>
                                {removerEdicaoItemAberto === item.id && (
                                  isSmallScreen ? (
                                    /* MODAL / BOTTOM SHEET MOBILE PARA RETIRAR INGREDIENTES NA EDIÇÃO */
                                    <div
                                      className="modal-backdrop-mobile-remover"
                                      style={{
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                                        backdropFilter: 'blur(4px)',
                                        WebkitBackdropFilter: 'blur(4px)',
                                        zIndex: 999999,
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        padding: 0
                                      }}
                                      onClick={() => { setRemoverEdicaoItemAberto(null); setTermoRemoverEdicao(''); }}
                                    >
                                      <div
                                        className="modal-sheet-mobile-remover"
                                        style={{
                                          background: '#ffffff',
                                          width: '100%',
                                          maxWidth: '480px',
                                          maxHeight: '85vh',
                                          borderRadius: '24px 24px 0 0',
                                          boxShadow: '0 -10px 32px rgba(0,0,0,0.3)',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          overflow: 'hidden',
                                          boxSizing: 'border-box',
                                          animation: 'slideUpSheet 0.22s ease-out'
                                        }}
                                        onClick={e => e.stopPropagation()}
                                      >
                                        {/* Puxador visual gaveta iOS */}
                                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '6px' }}>
                                          <div style={{ width: '42px', height: '4.5px', background: '#cbd5e1', borderRadius: '4px' }} />
                                        </div>

                                        {/* Header */}
                                        <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: '#fee2e2',
                                                color: '#dc2626',
                                                fontWeight: 900,
                                                fontSize: '15px'
                                              }}>−</span>
                                              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                                                Retirar Ingredientes
                                              </h3>
                                            </div>
                                            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                                              {item.product_name}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => { setRemoverEdicaoItemAberto(null); setTermoRemoverEdicao(''); }}
                                            style={{
                                              background: '#f1f5f9',
                                              border: 'none',
                                              borderRadius: '50%',
                                              width: '34px',
                                              height: '34px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              cursor: 'pointer',
                                              color: '#475569',
                                              fontWeight: 800,
                                              fontSize: '15px'
                                            }}
                                            title="Fechar"
                                          >
                                            ✕
                                          </button>
                                        </div>

                                        {/* Busca opcional sem autofocus */}
                                        <div style={{ padding: '10px 16px', background: '#fff1f2', borderBottom: '1px solid #fecaca' }}>
                                          <input
                                            id={`input-remover-edicao-${item.id}`}
                                            type="text"
                                            value={termoRemoverEdicao}
                                            onChange={(e) => setTermoRemoverEdicao(e.target.value)}
                                            placeholder=""
                                            style={{
                                              width: '100%',
                                              fontSize: '14px',
                                              padding: '9px 12px',
                                              borderRadius: '10px',
                                              border: '1.5px solid #fca5a5',
                                              outline: 'none',
                                              boxSizing: 'border-box',
                                              background: '#ffffff'
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault()
                                                const textoTrim = termoRemoverEdicao.trim()
                                                if (!textoTrim) return
                                                const match = ingredientesDisponiveis.find(([ing]) => ing.toLowerCase() === textoTrim.toLowerCase())
                                                const nomeRem = match ? match[0] : textoTrim
                                                adicionarRemocaoItemEdicao(item.id, nomeRem)
                                                setTermoRemoverEdicao('')
                                              }
                                            }}
                                          />
                                        </div>

                                        {/* Grade de botões amplos para toque */}
                                        <div
                                          style={{
                                            flex: 1,
                                            overflowY: 'auto',
                                            WebkitOverflowScrolling: 'touch',
                                            padding: '12px 16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            maxHeight: '52vh'
                                          }}
                                        >
                                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                                            Toque no ingrediente para retirar:
                                          </div>

                                          {(() => {
                                            const busca = (termoRemoverEdicao || '').toLowerCase().trim()
                                            const filtrados = ingredientesDisponiveis.filter(([ing]) => ing.toLowerCase().includes(busca))

                                            if (filtrados.length === 0 && !busca) {
                                              return (
                                                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px', background: '#f8fafc', borderRadius: '10px' }}>
                                                  Todos os ingredientes padrão já foram retirados
                                                </div>
                                              )
                                            }

                                            const temMatchExato = filtrados.some(([ing]) => ing.toLowerCase() === busca)

                                            return (
                                              <>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                                                  {filtrados.map(([ing]) => (
                                                    <button
                                                      type="button"
                                                      key={ing}
                                                      onClick={() => {
                                                        adicionarRemocaoItemEdicao(item.id, ing)
                                                      }}
                                                      style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '10px 12px',
                                                        borderRadius: '10px',
                                                        border: '1.5px solid #fecaca',
                                                        background: '#fff1f2',
                                                        color: '#991b1b',
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        boxSizing: 'border-box'
                                                      }}
                                                    >
                                                      <span>- {ing}</span>
                                                      <span style={{
                                                        fontSize: '11px',
                                                        fontWeight: 800,
                                                        color: '#dc2626',
                                                        background: '#fee2e2',
                                                        padding: '2px 6px',
                                                        borderRadius: '6px'
                                                      }}>Tirar</span>
                                                    </button>
                                                  ))}
                                                </div>

                                                {busca && !temMatchExato && (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      adicionarRemocaoItemEdicao(item.id, termoRemoverEdicao.trim())
                                                      setTermoRemoverEdicao('')
                                                    }}
                                                    style={{
                                                      marginTop: '6px',
                                                      padding: '10px 14px',
                                                      cursor: 'pointer',
                                                      fontSize: '13px',
                                                      fontWeight: 700,
                                                      color: '#dc2626',
                                                      background: '#fff1f2',
                                                      border: '1.5px dashed #fca5a5',
                                                      borderRadius: '10px',
                                                      display: 'flex',
                                                      justifyContent: 'space-between',
                                                      alignItems: 'center',
                                                      width: '100%',
                                                      boxSizing: 'border-box'
                                                    }}
                                                  >
                                                    <span>- Retirar outro: "{termoRemoverEdicao.trim()}"</span>
                                                    <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 700 }}>Toque aqui</span>
                                                  </button>
                                                )}
                                              </>
                                            )
                                          })()}

                                          {/* Exibição dos itens já retirados */}
                                          {(item.remocoes || []).length > 0 && (
                                            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #fca5a5' }}>
                                              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
                                                Ingredientes já marcados para retirada:
                                              </div>
                                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {(item.remocoes || []).map((rem, rIdx) => (
                                                  <span
                                                    key={rIdx}
                                                    style={{
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      gap: '6px',
                                                      background: '#fee2e2',
                                                      color: '#991b1b',
                                                      border: '1px solid #fca5a5',
                                                      padding: '4px 10px',
                                                      borderRadius: '9999px',
                                                      fontSize: '12px',
                                                      fontWeight: 600
                                                    }}
                                                  >
                                                    <span>Sem {rem.nome}</span>
                                                    <button
                                                      type="button"
                                                      onClick={() => removerRemocaoItemEdicao(item.id, rIdx)}
                                                      style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#991b1b',
                                                        cursor: 'pointer',
                                                        fontWeight: 800,
                                                        fontSize: '13px',
                                                        padding: 0,
                                                        lineHeight: 1
                                                      }}
                                                      title="Desfazer retirada"
                                                    >
                                                      ✕
                                                    </button>
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Rodapé com botão Concluir grande */}
                                        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
                                          <button
                                            type="button"
                                            onClick={() => { setRemoverEdicaoItemAberto(null); setTermoRemoverEdicao(''); }}
                                            style={{
                                              width: '100%',
                                              padding: '12px',
                                              background: '#0f172a',
                                              color: '#ffffff',
                                              border: 'none',
                                              borderRadius: '12px',
                                              fontSize: '14px',
                                              fontWeight: 700,
                                              cursor: 'pointer',
                                              boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
                                            }}
                                          >
                                            Concluir e Voltar ao Pedido
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* POPOVER PARA TELAS GRANDES (DESKTOP) */
                                    <div style={{
                                      position: 'absolute',
                                      top: 'calc(100% + 4px)',
                                      right: 0,
                                      zIndex: 1000,
                                      background: 'white',
                                      border: '1.5px solid #f87171',
                                      borderRadius: '12px',
                                      boxShadow: '0 8px 24px rgba(220,38,38,0.22)',
                                      minWidth: '220px',
                                      maxWidth: '280px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      overflow: 'hidden'
                                    }}>
                                      <div style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: 700, color: '#991b1b', background: '#fee2e2', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Retirar ingrediente:</span>
                                        <button 
                                          type="button" 
                                          onClick={() => { setRemoverEdicaoItemAberto(null); setTermoRemoverEdicao(''); }}
                                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 'bold', fontSize: '13px', padding: 0, lineHeight: 1 }}
                                          title="Fechar"
                                        >✕</button>
                                      </div>

                                      <div style={{ padding: '6px 8px', background: '#fffafb', borderBottom: '1px solid #fecaca' }}>
                                        <input
                                          id={`input-remover-edicao-${item.id}`}
                                          type="text"
                                          autoFocus
                                          value={termoRemoverEdicao}
                                          onChange={(e) => setTermoRemoverEdicao(e.target.value)}
                                          placeholder=""
                                          style={{
                                            width: '100%',
                                            fontSize: '14px',
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid #f87171',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault()
                                              const textoTrim = termoRemoverEdicao.trim()
                                              if (!textoTrim) return
                                              const match = ingredientesDisponiveis.find(([ing]) => ing.toLowerCase() === textoTrim.toLowerCase())
                                              const nomeRem = match ? match[0] : textoTrim
                                              adicionarRemocaoItemEdicao(item.id, nomeRem)
                                              setRemoverEdicaoItemAberto(null)
                                              setTermoRemoverEdicao('')
                                            }
                                          }}
                                        />
                                      </div>

                                      <div className="popover-remover-lista" style={{ maxHeight: '180px', overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                                        {(() => {
                                          const busca = (termoRemoverEdicao || '').toLowerCase().trim()
                                          const filtrados = ingredientesDisponiveis.filter(([ing]) => ing.toLowerCase().includes(busca))

                                          if (filtrados.length === 0 && !busca) {
                                            return (
                                              <div style={{ padding: '8px 10px', fontSize: '12px', color: '#64748b' }}>
                                                Todos os itens foram retirados
                                              </div>
                                            )
                                          }

                                          const temMatchExato = filtrados.some(([ing]) => ing.toLowerCase() === busca)

                                          return (
                                            <>
                                              {filtrados.map(([ing]) => (
                                                <div
                                                  key={ing}
                                                  onClick={() => {
                                                    adicionarRemocaoItemEdicao(item.id, ing)
                                                    setRemoverEdicaoItemAberto(null)
                                                    setTermoRemoverEdicao('')
                                                  }}
                                                  style={{
                                                    padding: '8px 10px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#b91c1c',
                                                    borderBottom: '1px solid #fef2f2',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                  }}
                                                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                >
                                                  <span>- {ing}</span>
                                                </div>
                                              ))}

                                              {busca && !temMatchExato && (
                                                <div
                                                  onClick={() => {
                                                    adicionarRemocaoItemEdicao(item.id, termoRemoverEdicao.trim())
                                                    setRemoverEdicaoItemAberto(null)
                                                    setTermoRemoverEdicao('')
                                                  }}
                                                  style={{
                                                    padding: '8px 10px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    color: '#dc2626',
                                                    background: '#fff1f2',
                                                    borderTop: '1px dashed #fca5a5',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                  }}
                                                  onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff1f2'}
                                                >
                                                  <span>- Retirar "{termoRemoverEdicao.trim()}"</span>
                                                  <span style={{ fontSize: '10.5px', color: '#991b1b', fontWeight: 600 }}>Enter ↵</span>
                                                </div>
                                              )}
                                            </>
                                          )
                                        })()}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )
                          })()}
                        </div>

                        {/* LINHA 3: TAGS DOS ITENS REMOVIDOS */}
                        {(item.remocoes || []).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                            {(item.remocoes || []).map((rem, idx) => (
                              <span 
                                key={idx} 
                                style={{
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  border: '1px solid #fca5a5'
                                }}
                              >
                                - Sem {rem.nome}
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setPedidoSelecionado(atual => ({
                                      ...atual,
                                      order_items: atual.order_items.map(p => {
                                        if (p.id !== item.id) return p
                                        const novaListaRem = (p.remocoes || []).filter((_, i) => i !== idx)
                                        const somaAd = (p.adicionais || []).reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                                        const precoBase = p.unit_price_base ?? Number(p.unit_price)
                                        return {
                                          ...p,
                                          remocoes: novaListaRem,
                                          total_price: Math.max(0, (precoBase * p.quantity) + somaAd)
                                        }
                                      })
                                    }))
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#b91c1c',
                                    padding: '0 2px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  title="Desfazer remoção deste item"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* LINHA 4: TAGS DOS ADICIONAIS JÁ SELECIONADOS */}
                        {(item.adicionais || []).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                            {(item.adicionais || []).map((ad, idx) => (
                              <span 
                                key={idx} 
                                style={{
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  border: '1px solid #bbf7d0'
                                }}
                              >
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setPedidoSelecionado(atual => ({
                                      ...atual,
                                      order_items: atual.order_items.map(p => {
                                        if (p.id !== item.id) return p
                                        const novasAds = [...(p.adicionais || [])]
                                        novasAds[idx] = { ...novasAds[idx], quantidade: Math.max(1, (novasAds[idx].quantidade || 1) - 1) }
                                        const totalAdicionais = novasAds.reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                                        const totalRemocoes = (p.remocoes || []).reduce((s, r) => s + (r.valor || 0), 0)
                                        const pBase = p.unit_price_base ?? Number(p.unit_price)
                                        return {
                                          ...p, adicionais: novasAds, unit_price_base: pBase, unit_price: pBase, total_price: Math.max(0, (pBase * p.quantity) + totalAdicionais - totalRemocoes)
                                        }
                                      })
                                    }))
                                  }} 
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', padding: '0 2px', fontWeight: 800, fontSize: '14px' }}
                                >
                                  −
                                </button>
                                <span>{ad.quantidade || 1}x {ad.nome} (+R${ad.valor})</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setPedidoSelecionado(atual => ({
                                      ...atual,
                                      order_items: atual.order_items.map(p => {
                                        if (p.id !== item.id) return p
                                        const novasAds = [...(p.adicionais || [])]
                                        novasAds[idx] = { ...novasAds[idx], quantidade: (novasAds[idx].quantidade || 1) + 1 }
                                        const totalAdicionais = novasAds.reduce((s, a) => s + (a.valor * (a.quantidade || 1)), 0)
                                        const totalRemocoes = (p.remocoes || []).reduce((s, r) => s + (r.valor || 0), 0)
                                        const pBase = p.unit_price_base ?? Number(p.unit_price)
                                        return {
                                          ...p, adicionais: novasAds, unit_price_base: pBase, unit_price: pBase, total_price: Math.max(0, (pBase * p.quantity) + totalAdicionais - totalRemocoes)
                                        }
                                      })
                                    }))
                                  }} 
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', padding: '0 2px', fontWeight: 800, fontSize: '14px' }}
                                >
                                  +
                                </button>
                                
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
                                          const totalRemocoes = (p.remocoes || []).reduce((s, r) => s + (r.valor || 0), 0)
                                          
                                          return {
                                            ...p,
                                            adicionais: novaLista,
                                            unit_price_base: precoBase,
                                            unit_price: precoBase,
                                            total_price: Math.max(0, (precoBase * p.quantity) + totalAdicionais - totalRemocoes)
                                          }
                                        })
                                      }
                                    })
                                  }}
                                  style={{
                                    background: '#bbf7d0',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '16px',
                                    height: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#166534',
                                    fontWeight: 700,
                                    fontSize: '11px',
                                    marginLeft: '2px'
                                  }}
                                  title="Remover adicional"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD 3: ADICIONAR PRODUTOS */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '22px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <Plus size={18} color="#ea580c" strokeWidth={2.2} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Adicionar Produtos ao Pedido</h3>
                </div>

                {/* BUSCA DE PRODUTOS */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <span style={{ position: 'absolute', top: '12px', left: '14px', color: '#94a3b8' }}>
                    <Search size={16} strokeWidth={2.2} />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Pesquisar produto pelo nome (lanche, bebida, porção...)" 
                    value={buscaProdutoEdicao}
                    onChange={(e) => setBuscaProdutoEdicao(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#1e293b',
                      background: '#ffffff',
                      outline: 'none'
                    }}
                  />
                  {buscaProdutoEdicao && (
                    <button
                      type="button"
                      onClick={() => setBuscaProdutoEdicao('')}
                      style={{
                        position: 'absolute',
                        top: '11px',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* PÍLULAS DE CATEGORIAS (SE NÃO ESTIVER BUSCANDO) */}
                {!buscaProdutoEdicao && (
                  <div className="cafe-pills-row" style={{ marginBottom: '16px', overflowX: 'auto', flexWrap: 'wrap', gap: '8px' }}>
                    {categorias.map((cat) => (
                      <button
                        key={cat.nome}
                        type="button"
                        className={`cafe-pill-btn ${categoriaEdicao === cat.nome ? 'active' : ''}`}
                        onClick={() => setCategoriaEdicao(cat.nome)}
                      >
                        {cat.nome}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* GRID DE PRODUTOS */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '12px'
                }}>
                  {(() => {
                    if (buscaProdutoEdicao) {
                      const searchLower = buscaProdutoEdicao.toLowerCase()
                      const allProducts = categorias.flatMap(c => c.produtos)
                      const filtered = allProducts.filter(([nome]) => buscaFuzzy(nome, searchLower))
                      
                      if (filtered.length === 0) {
                        return <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Nenhum produto encontrado com essa busca.</p>
                      }

                      return filtered.map(([produto, preco]) => (
                        <button 
                          key={produto} 
                          type="button"
                          onClick={() => adicionarProdutoEdicao(produto, preco)}
                          style={{
                            padding: '14px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '8px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ea580c'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.08)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <strong style={{ fontSize: '13px', color: '#0f172a', lineHeight: 1.3 }}>{produto}</strong>
                          <span style={{ fontSize: '13px', color: '#ea580c', fontWeight: 700 }}>R$ {preco.toFixed(2).replace('.', ',')}</span>
                        </button>
                      ))
                    } else {
                      return categorias.find((c) => c.nome === categoriaEdicao)?.produtos.map(([produto, preco]) => (
                        <button 
                          key={produto} 
                          type="button"
                          onClick={() => adicionarProdutoEdicao(produto, preco)}
                          style={{
                            padding: '14px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '8px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ea580c'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.08)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <strong style={{ fontSize: '13px', color: '#0f172a', lineHeight: 1.3 }}>{produto}</strong>
                          <span style={{ fontSize: '13px', color: '#ea580c', fontWeight: 700 }}>R$ {preco.toFixed(2).replace('.', ',')}</span>
                        </button>
                      ))
                    }
                  })()}
                </div>
              </div>

              {/* CARD 4: TIPO DE RECEBIMENTO & ENDEREÇO */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '22px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <MapPin size={18} color="#ea580c" strokeWidth={2.2} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Tipo de Recebimento & Endereço</h3>
                </div>

                <div className="cafe-pills-row" style={{ flexWrap: 'wrap', gap: '8px', marginBottom: tipoRecebimento === 'entrega' ? '18px' : '0' }}>
                  <button
                    type="button"
                    className={`cafe-pill-btn ${tipoRecebimento === 'comer_no_local' ? 'active' : ''}`}
                    onClick={() => {
                      setTipoRecebimento('comer_no_local')
                      setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: 0, delivery_address: null, order_type: 'dine_in' }))
                      setInfoDistanciaEdicao(null)
                      setEnderecoEdicao('')
                      setNumeroEdicao('')
                    }}
                  >
                    <UtensilsCrossed size={14} strokeWidth={2} />
                    <span>Comer no local</span>
                  </button>
                  <button
                    type="button"
                    className={`cafe-pill-btn ${tipoRecebimento === 'retirada' ? 'active' : ''}`}
                    onClick={() => {
                      setTipoRecebimento('retirada')
                      setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: 0, delivery_address: null, order_type: 'pickup' }))
                      setInfoDistanciaEdicao(null)
                      setEnderecoEdicao('')
                      setNumeroEdicao('')
                    }}
                  >
                    <ShoppingBag size={14} strokeWidth={2} />
                    <span>{pedidoSelecionado?.source === 'table' || Boolean(pedidoSelecionado?.tables_restaurant?.number) || (typeof pedidoSelecionado?.notes === 'string' && /\[MESA\s*\d+\]/i.test(pedidoSelecionado.notes)) ? 'Levar' : 'Retirada'}</span>
                  </button>
                  <button
                    type="button"
                    className={`cafe-pill-btn ${tipoRecebimento === 'entrega' ? 'active' : ''}`}
                    onClick={() => {
                      setTipoRecebimento('entrega')
                      setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: 0, delivery_address: null, order_type: 'delivery' }))
                    }}
                  >
                    <Bike size={14} strokeWidth={2} />
                    <span>Entrega</span>
                  </button>
                </div>

                {tipoRecebimento === 'entrega' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div style={{ flex: 2 }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                          Rua / Logradouro
                        </label>
                        <input
                          type="text"
                          placeholder=""
                          value={enderecoEdicao}
                          onChange={(e) => {
                            const novaRua = e.target.value
                            setEnderecoEdicao(novaRua)
                            const base = [novaRua.trim(), numeroEdicao.trim()].filter(Boolean).join(', ')
                            const full = base + (bairroEdicao.trim() ? ` - Bairro: ${bairroEdicao.trim()}` : '')
                            setPedidoSelecionado((atual) => ({ ...atual, delivery_address: full }))
                            calcularTaxaAutomaticaEdicao(novaRua, numeroEdicao, bairroEdicao)
                          }}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            color: '#1e293b',
                            background: '#ffffff',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                          Número
                        </label>
                        <input
                          type="text"
                          placeholder=""
                          value={numeroEdicao}
                          onChange={(e) => {
                            const novoNum = e.target.value
                            setNumeroEdicao(novoNum)
                            const base = [enderecoEdicao.trim(), novoNum.trim()].filter(Boolean).join(', ')
                            const full = base + (bairroEdicao.trim() ? ` - Bairro: ${bairroEdicao.trim()}` : '')
                            setPedidoSelecionado((atual) => ({ ...atual, delivery_address: full }))
                            calcularTaxaAutomaticaEdicao(enderecoEdicao, novoNum, bairroEdicao)
                          }}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            color: '#1e293b',
                            background: '#ffffff',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1.5 }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                          Bairro
                        </label>
                        <input
                          type="text"
                          placeholder=""
                          value={bairroEdicao}
                          onChange={(e) => {
                            const novoBairro = e.target.value
                            setBairroEdicao(novoBairro)
                            const base = [enderecoEdicao.trim(), numeroEdicao.trim()].filter(Boolean).join(', ')
                            const full = base + (novoBairro.trim() ? ` - Bairro: ${novoBairro.trim()}` : '')
                            setPedidoSelecionado((atual) => ({ ...atual, delivery_address: full }))
                            if (enderecoEdicao.trim().length >= 3) {
                              calcularTaxaAutomaticaEdicao(enderecoEdicao, numeroEdicao, novoBairro)
                            }
                          }}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            color: '#1e293b',
                            background: '#ffffff',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      {calculandoDistanciaEdicao && (
                        <small style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                          📍 Calculando distância com precisão...
                        </small>
                      )}
                      {infoDistanciaEdicao && !calculandoDistanciaEdicao && !infoDistanciaEdicao.erro && (
                        infoDistanciaEdicao.aprendido ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            border: '1px solid #86efac'
                          }}>
                            ✓ {infoDistanciaEdicao.km || (infoDistanciaEdicao.distancia != null && !isNaN(infoDistanciaEdicao.distancia) ? (infoDistanciaEdicao.distancia / 1000).toFixed(1) : null) ? `${Number(infoDistanciaEdicao.km || infoDistanciaEdicao.distancia / 1000).toFixed(1)} km — ` : ''}Endereço memorizado ({infoDistanciaEdicao.bairroSugerido || 'Memória interna'}) — Taxa: {infoDistanciaEdicao.taxaFormatada || `R$ ${Number(infoDistanciaEdicao.taxa).toFixed(2).replace('.', ',')}`}
                          </div>
                        ) : infoDistanciaEdicao.ambiguidade ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#fffbeb',
                            color: '#b45309',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            border: '1px solid #fde68a'
                          }}>
                            ⚠️ {infoDistanciaEdicao.km || (infoDistanciaEdicao.distancia != null && !isNaN(infoDistanciaEdicao.distancia) ? (infoDistanciaEdicao.distancia / 1000).toFixed(1) : null) ? `~${Number(infoDistanciaEdicao.km || infoDistanciaEdicao.distancia / 1000).toFixed(1)} km — ` : ''}Rua Projetada / Ambígua: Confirme o local exato e defina a taxa manualmente.
                          </div>
                        ) : (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            border: '1px solid #bbf7d0'
                          }}>
                            ✓ {(infoDistanciaEdicao.distancia != null && !isNaN(infoDistanciaEdicao.distancia))
                              ? (infoDistanciaEdicao.distancia < 1000
                                  ? `${Math.round(infoDistanciaEdicao.distancia)} m`
                                  : `${(infoDistanciaEdicao.distancia / 1000).toFixed(1)} km`)
                              : (infoDistanciaEdicao.km != null && !isNaN(infoDistanciaEdicao.km) ? `${Number(infoDistanciaEdicao.km).toFixed(1)} km` : '')}
                            {(infoDistanciaEdicao.taxa != null && !isNaN(infoDistanciaEdicao.taxa))
                              ? ` — Taxa sugerida: R$ ${Number(infoDistanciaEdicao.taxa).toFixed(2).replace('.', ',')}`
                              : ' — Taxa sob consulta (definir manualmente)'}
                          </div>
                        )
                      )}
                      {infoDistanciaEdicao && !calculandoDistanciaEdicao && infoDistanciaEdicao.avisoDistancia && (
                        <div style={{ marginTop: '6px', padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '12px', fontWeight: 600 }}>
                          ⚠️ {infoDistanciaEdicao.mensagemAviso || `Atenção: Endereço a mais de 8 km (${infoDistanciaEdicao.km} km) da lanchonete! Taxa sob consulta (confirmar viabilidade de entrega e definir taxa).`}
                        </div>
                      )}
                      {infoDistanciaEdicao && !calculandoDistanciaEdicao && infoDistanciaEdicao.erro && (
                        <small style={{ color: '#ef4444', display: 'block', fontWeight: 600 }}>
                          ⚠️ {infoDistanciaEdicao.erro}
                        </small>
                      )}
                    </div>

                    <div style={{ maxWidth: '240px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        Taxa de Entrega (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder=""
                        value={pedidoSelecionado.delivery_fee || ''}
                        onChange={(e) => setPedidoSelecionado((atual) => ({ ...atual, delivery_fee: e.target.value }))}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: infoDistanciaEdicao?.ambiguidade && !pedidoSelecionado.delivery_fee ? '1px solid #f59e0b' : '1px solid #cbd5e1',
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#0f172a',
                          background: infoDistanciaEdicao?.ambiguidade && !pedidoSelecionado.delivery_fee ? '#fffbeb' : '#ffffff',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 5: STATUS E FORMA DE PAGAMENTO */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '22px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <CheckCircle2 size={18} color="#ea580c" strokeWidth={2.2} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Pagamento do Pedido</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* STATUS DO PAGAMENTO */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      Status do Pagamento
                    </label>
                    <div className="cafe-pills-row" style={{ gap: '10px' }}>
                      <button 
                        type="button" 
                        className={`cafe-pill-btn ${!foiPagoEdicao ? 'active' : ''}`} 
                        onClick={() => setFoiPagoEdicao(false)}
                      >
                        Não Pago
                      </button>
                      <button 
                        type="button" 
                        className={`cafe-pill-btn ${foiPagoEdicao ? 'active' : ''}`} 
                        onClick={() => setFoiPagoEdicao(true)}
                      >
                        <Check size={14} strokeWidth={2.5} />
                        <span>Sim, Pago</span>
                      </button>
                    </div>
                  </div>

                  {/* FORMA DE PAGAMENTO */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      Forma de Pagamento
                    </label>
                    <div className="cafe-pills-row" style={{ gap: '10px' }}>
                      <button
                        type="button"
                        className={`cafe-pill-btn ${formaPagamentoEdicao === 'pix' ? 'active' : ''}`}
                        onClick={() => setFormaPagamentoEdicao(prev => prev === 'pix' ? '' : 'pix')}
                      >
                        <span>Pix</span>
                      </button>
                      <button
                        type="button"
                        className={`cafe-pill-btn ${formaPagamentoEdicao === 'cartao' ? 'active' : ''}`}
                        onClick={() => setFormaPagamentoEdicao(prev => prev === 'cartao' ? '' : 'cartao')}
                      >
                        <span>Cartão</span>
                      </button>
                      <button
                        type="button"
                        className={`cafe-pill-btn ${formaPagamentoEdicao === 'dinheiro' ? 'active' : ''}`}
                        onClick={() => setFormaPagamentoEdicao(prev => prev === 'dinheiro' ? '' : 'dinheiro')}
                      >
                        <span>Dinheiro</span>
                      </button>
                    </div>
                  </div>

                  {/* CAMPO DE DINHEIRO E CÁLCULO DE TROCO DINÂMICO */}
                  {!foiPagoEdicao && formaPagamentoEdicao === 'dinheiro' && (
                    <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                      <label style={{ display: 'block', color: '#92400e', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                        Valor da nota que o cliente vai pagar (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder=""
                        value={valorPagoDinheiroEdicao}
                        onChange={(e) => setValorPagoDinheiroEdicao(e.target.value)}
                        style={{
                          width: '100%',
                          maxWidth: '240px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #fcd34d',
                          fontSize: '15px',
                          fontWeight: 700,
                          background: '#fff',
                          outline: 'none'
                        }}
                      />
                      {(() => {
                        const valNota = Number(String(valorPagoDinheiroEdicao).replace(',', '.')) || 0
                        const trocoCalc = valNota > totalAtualEdicao ? (valNota - totalAtualEdicao) : 0
                        if (valNota > 0) {
                          return (
                            <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 700 }}>
                              {trocoCalc > 0 ? (
                                <span style={{ color: '#b45309' }}>💰 LEVAR DE TROCO: R$ {formatarMoeda(trocoCalc)} (Cliente vai pagar com R$ {formatarMoeda(valNota)})</span>
                              ) : valNota === totalAtualEdicao ? (
                                <span style={{ color: '#15803d' }}>✓ VALOR EXATO (Não precisa de troco)</span>
                              ) : (
                                <span style={{ color: '#dc2626' }}>⚠️ Valor informado (R$ {formatarMoeda(valNota)}) é menor que o total do pedido (R$ {formatarMoeda(totalAtualEdicao)})</span>
                              )}
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 6: TOTAL E BOTÕES DE AÇÃO */}
              <div style={{
                background: '#0f172a',
                borderRadius: '16px',
                padding: '22px 26px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)'
              }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Total do Pedido
                  </span>
                  <strong style={{ fontSize: '26px', color: '#ffffff', fontWeight: 800 }}>
                    R$ {totalAtualEdicao.toFixed(2).replace('.', ',')}
                  </strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    onClick={cancelarPedido}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: '1px solid #ef4444',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#f87171',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
                  >
                    <Trash2 size={16} strokeWidth={2.2} />
                    <span>Cancelar Pedido</span>
                  </button>

                  <button 
                    type="button"
                    onClick={salvarEdicaoPedido}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 26px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #ea580c, #f97316)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Save size={16} strokeWidth={2.2} />
                    <span>Salvar Pedido</span>
                  </button>
                </div>
              </div>

            </div>
          </main>
        </div>

        {/* NAVEGAÇÃO INFERIOR MOBILE */}
        <nav className="cafe-bottom-nav" aria-label="Navegação móvel">
          {isDriver ? (
            <>
              <button
                type="button"
                className="cafe-bottom-nav-item active"
                onClick={() => {
                  setPedidoSelecionado(null)
                  setFiltroOrigem('todos')
                  setFiltroTipo('delivery')
                }}
              >
                <div className="bottom-nav-icon-wrap">
                  <Bike size={21} strokeWidth={2.2} />
                  {contagemPedidosAtivos > 0 && (
                    <span className="bottom-nav-badge">{contagemPedidosAtivos}</span>
                  )}
                </div>
                <span className="bottom-nav-label">Entregas</span>
              </button>

              <button
                type="button"
                className="cafe-bottom-nav-item"
                onClick={() => {
                  setPedidoSelecionado(null)
                  setFiltroOrigem('entregues')
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

              <button
                type="button"
                className="cafe-bottom-nav-item"
                onClick={() => {
                  setPedidoSelecionado(null)
                  setFiltroOrigem('configuracoes')
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
                className="cafe-bottom-nav-item active"
                onClick={() => {
                  setPedidoSelecionado(null)
                  setFiltroOrigem('todos')
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
                className="cafe-bottom-nav-item"
                onClick={() => {
                  setPedidoSelecionado(null)
                  setFiltroOrigem('table')
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
                  className="cafe-bottom-nav-item"
                  onClick={() => {
                    setPedidoSelecionado(null)
                    setFiltroOrigem('entregues')
                    setFiltroEntregador('todos')
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
                    setPedidoSelecionado(null)
                    setFiltroOrigem('faturamento')
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
                className="cafe-bottom-nav-item"
                onClick={() => {
                  setPedidoSelecionado(null)
                  setFiltroOrigem('configuracoes')
                  setSubAbaConfig('geral')
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
        <ThermalReceiptArea />
        {renderModalInspecionar()}
      </div>
    )
}
