import React from 'react'
import {
  ArrowLeft,
  ChefHat,
  ShoppingBag,
  UtensilsCrossed,
  Bike,
  Check,
  X,
  Search,
  Plus,
  Trash2,
  Clock,
  ClipboardList,
  CheckCheck,
  TrendingUp,
  LogOut,
  Settings
} from 'lucide-react'

export default function NovoPedidoPage({
  categorias,
  categoriaAtiva,
  setCategoriaAtiva,
  buscaProduto,
  setBuscaProduto,
  nomeCliente,
  setNomeCliente,
  telefoneCliente,
  setTelefoneCliente,
  observacaoGeral,
  setObservacaoGeral,
  foiPago,
  setFoiPago,
  origem,
  setOrigem,
  tipoRecebimentoCriacao,
  setTipoRecebimentoCriacao,
  mesa,
  setMesa,
  observacaoSemMesa,
  setObservacaoSemMesa,
  enderecoEntrega,
  setEnderecoEntrega,
  numeroEntrega,
  setNumeroEntrega,
  bairroCliente,
  setBairroCliente,
  taxaEntrega,
  setTaxaEntrega,
  infoDistancia,
  setInfoDistancia,
  calculandoDistancia,
  calcularTaxaAutomatica,
  formaPagamentoCriacao,
  setFormaPagamentoCriacao,
  valorPagoDinheiroCriacao,
  setValorPagoDinheiroCriacao,
  carrinho,
  adicionarProduto,
  alterarQuantidade,
  alterarObservacaoProduto,
  adicionalItemAberto,
  setAdicionalItemAberto,
  termoAdicional,
  setTermoAdicional,
  removerItemAberto,
  setRemoverItemAberto,
  termoRemover,
  setTermoRemover,
  autocompleteItemAberto,
  setAutocompleteItemAberto,
  adicionarAdicionalProduto,
  removerAdicionalProduto,
  adicionarRemocaoProduto,
  cancelarRemocaoProduto,
  total,
  enviarPedido,
  salvando = false,
  voltarPainel,
  sair,
  sidebarAberta,
  setSidebarAberta,
  sidebarMobile,
  setSidebarMobile,
  isDriver,
  isOwner,
  contagemPedidosAtivos,
  contagemPedidosMesas,
  contagemPedidosEntregues,
  filtroOrigem,
  setFiltroOrigem,
  isMobile,
  isSmallScreen,
  obterComposicaoItem,
  setItemInspecionado,
  CanalLogo,
  logoIlda,
  formatarMoeda,
  buscaFuzzy,
  ADICIONAIS,
  obterIngredientesDoProduto,
  isProdutoBebida,
  renderModalInspecionar,
  ThermalReceiptArea
}) {
  const categoria = (categorias || []).find((item) => item.nome === categoriaAtiva)

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
            <button
              type="button"
              className="cafe-nav-item"
              onClick={() => {
                voltarPainel()
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
                voltarPainel()
                setFiltroOrigem('table')
              }}
              title="Ver Mesas"
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
                  voltarPainel()
                  setFiltroOrigem('entregues')
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
                  voltarPainel()
                  setFiltroOrigem('faturamento')
                }}
                title="Relatórios"
              >
                <span className="cafe-nav-icon"><TrendingUp size={18} strokeWidth={2} /></span>
                <span className="cafe-nav-label">Relatórios</span>
              </button>
            )}
          </nav>
        </div>

        <div className="cafe-sidebar-section" style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <div className="cafe-sidebar-heading">Ações</div>
          <nav className="cafe-sidebar-nav">
            <button
              type="button"
              className="cafe-nav-item"
              onClick={voltarPainel}
              title="Voltar ao Painel"
            >
              <span className="cafe-nav-icon"><ArrowLeft size={18} strokeWidth={2.4} /></span>
              <span className="cafe-nav-label">Voltar ao Painel</span>
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
      <div className="cafe-main-area">
        {/* TOPBAR MODERNA */}
        <header className="cafe-topbar">
          <div className="cafe-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="cafe-btn-back"
              onClick={voltarPainel}
              title="Voltar ao Painel de Pedidos"
            >
              <ArrowLeft size={16} strokeWidth={2.4} />
              <span>Voltar ao Painel</span>
            </button>
          </div>

          <div className="cafe-topbar-right">
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL COM DESIGN REFINADO */}
        <main className="cafe-main-content">
          <div className="cafe-page-header">
            <div>
              <h1 className="cafe-page-title">Novo Pedido</h1>
              <p className="cafe-page-subtitle">Monte o pedido no balcão e envie para a cozinha em tempo real</p>
            </div>
          </div>

          <div className="order-layout cafe-page-motion" key="novo-pedido-layout">
            <section className="products-area">
              {/* CONFIGURAÇÕES DO PEDIDO */}
              <div className="order-settings" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '20px' }}>
                <div className="order-settings-grid">
                  <div className="field">
                    <label>Nome do cliente</label>
                    <input
                      type="text"
                      placeholder=""
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Telefone do cliente</label>
                    <input
                      type="text"
                      placeholder=""
                      value={telefoneCliente}
                      onChange={(e) => setTelefoneCliente(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Observação geral do pedido</label>
                    <input
                      type="text"
                      placeholder=""
                      value={observacaoGeral}
                      onChange={(e) => setObservacaoGeral(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Foi pago?</label>
                    <div className="cafe-pills-row">
                      <button
                        type="button"
                        className={`cafe-pill-btn ${!foiPago ? 'active' : ''}`}
                        onClick={() => setFoiPago(false)}
                      >
                        Não Pago
                      </button>
                      <button
                        type="button"
                        className={`cafe-pill-btn ${foiPago ? 'active' : ''}`}
                        onClick={() => setFoiPago(true)}
                      >
                        <Check size={14} strokeWidth={2.5} />
                        <span>Sim, Pago</span>
                      </button>
                    </div>
                  </div>

                  <div className="field">
                    <label>Origem do pedido</label>
                    <div className="cafe-pills-row" style={{ flexWrap: 'wrap' }}>
                      {['mesa', 'whatsapp', 'anota_ai', 'ifood'].map((item) => (
                        <button
                          type="button"
                          key={item}
                          className={`cafe-pill-btn ${origem === item ? 'active' : ''}`}
                          onClick={() => {
                            setOrigem(item)
                          }}
                        >
                          {item === 'mesa' && <UtensilsCrossed size={14} strokeWidth={2} />}
                          {item === 'whatsapp' && <CanalLogo canal="whatsapp" size={15} style={{ marginRight: '4px' }} />}
                          {item === 'anota_ai' && <CanalLogo canal="anota_ai" size={15} style={{ marginRight: '4px' }} />}
                          {item === 'ifood' && <CanalLogo canal="ifood" size={15} style={{ marginRight: '4px' }} />}
                          <span>
                            {item === 'mesa' ? 'Mesa' : item === 'whatsapp' ? 'WhatsApp' : item === 'ifood' ? 'iFood' : 'Anota Aí'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Tipo de recebimento</label>
                    <div className="cafe-pills-row" style={{ flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={`cafe-pill-btn ${tipoRecebimentoCriacao === 'comer_no_local' ? 'active' : ''}`}
                        onClick={() => {
                          setTipoRecebimentoCriacao('comer_no_local')
                          setEnderecoEntrega('')
                          setTaxaEntrega('')
                          setInfoDistancia(null)
                        }}
                      >
                        <UtensilsCrossed size={14} strokeWidth={2} />
                        <span>{origem === 'mesa' ? 'Comer no local' : 'Comer aqui'}</span>
                      </button>
                      <button
                        type="button"
                        className={`cafe-pill-btn ${tipoRecebimentoCriacao === 'retirada' ? 'active' : ''}`}
                        onClick={() => {
                          setTipoRecebimentoCriacao('retirada')
                          setEnderecoEntrega('')
                          setTaxaEntrega('')
                          setInfoDistancia(null)
                        }}
                      >
                        <ShoppingBag size={14} strokeWidth={2} />
                        <span>{origem === 'mesa' ? 'Levar' : 'Retirada'}</span>
                      </button>
                      <button
                        type="button"
                        className={`cafe-pill-btn ${tipoRecebimentoCriacao === 'entrega' ? 'active' : ''}`}
                        onClick={() => {
                          setTipoRecebimentoCriacao('entrega')
                          setMesa('')
                          setObservacaoSemMesa('')
                        }}
                      >
                        <Bike size={14} strokeWidth={2} />
                        <span>Entrega</span>
                      </button>
                    </div>
                  </div>

                  {origem === 'mesa' && (tipoRecebimentoCriacao === 'comer_no_local' || tipoRecebimentoCriacao === 'retirada') && (
                    <div className="field">
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Mesa</span>
                        {tipoRecebimentoCriacao === 'retirada' && (
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, textTransform: 'none' }}>
                            (Opcional)
                          </span>
                        )}
                      </label>
                      <select value={mesa} onChange={(e) => { setMesa(e.target.value); setObservacaoSemMesa('') }}>
                        <option value="">{tipoRecebimentoCriacao === 'retirada' ? 'Nenhuma mesa selecionada (Opcional)' : 'Selecione a mesa'}</option>
                        {tipoRecebimentoCriacao === 'comer_no_local' && <option value="sem_mesa">Sem mesa</option>}
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
                        placeholder=""
                        value={observacaoSemMesa}
                        onChange={(e) => setObservacaoSemMesa(e.target.value)}
                      />
                    </div>
                  )}

                  {tipoRecebimentoCriacao === 'entrega' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                        <div className="field" style={{ margin: 0 }}>
                          <label>Rua / Logradouro</label>
                          <input
                            type="text"
                            placeholder=""
                            value={enderecoEntrega}
                            onChange={(e) => {
                              const novaRua = e.target.value
                              setEnderecoEntrega(novaRua)
                              setTaxaEntrega('')
                              calcularTaxaAutomatica(novaRua, numeroEntrega, bairroCliente)
                            }}
                          />
                        </div>
                        <div className="field" style={{ margin: 0 }}>
                          <label>Número</label>
                          <input
                            type="text"
                            placeholder=""
                            value={numeroEntrega}
                            onChange={(e) => {
                              const novoNum = e.target.value
                              setNumeroEntrega(novoNum)
                              setTaxaEntrega('')
                              calcularTaxaAutomatica(enderecoEntrega, novoNum, bairroCliente)
                            }}
                          />
                        </div>
                      </div>

                      <div className="field" style={{ marginTop: '10px', marginBottom: 0 }}>
                        <label>Bairro</label>
                        <input
                          type="text"
                          placeholder=""
                          value={bairroCliente}
                          onChange={(e) => {
                            const novoBairro = e.target.value
                            setBairroCliente(novoBairro)
                            if (enderecoEntrega.trim().length >= 3) {
                              calcularTaxaAutomatica(enderecoEntrega, numeroEntrega, novoBairro)
                            }
                          }}
                        />
                      </div>

                      <div className="field" style={{ marginTop: '10px', marginBottom: 0 }}>
                        <label>
                          Taxa de entrega (R$)
                          {infoDistancia && !infoDistancia.erro && (
                            <span style={{ fontSize: '11px', color: infoDistancia.ambiguidade ? '#b45309' : '#6b7280', marginLeft: '6px', fontWeight: 500 }}>
                              {infoDistancia.aprendido
                                ? '(verificada na memória)'
                                : infoDistancia.ambiguidade
                                  ? '(requer definição manual)'
                                  : '(calculada automaticamente)'}
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder=""
                          value={taxaEntrega}
                          onChange={(e) => setTaxaEntrega(e.target.value)}
                          style={infoDistancia?.ambiguidade && !taxaEntrega ? { borderColor: '#f59e0b', background: '#fffbeb' } : {}}
                        />
                      </div>

                      <div style={{ marginTop: '4px', marginBottom: '8px' }}>
                        {calculandoDistancia && (
                          <small style={{ color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={12} />
                            <span>Calculando distância...</span>
                          </small>
                        )}
                        {infoDistancia && !calculandoDistancia && !infoDistancia.erro && (
                          infoDistancia.aprendido ? (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '5px 10px',
                              borderRadius: '7px',
                              fontSize: '12px',
                              fontWeight: 700,
                              border: '1px solid #86efac',
                              marginTop: '4px'
                            }}>
                              ✓ {infoDistancia.km || (infoDistancia.distancia != null && !isNaN(infoDistancia.distancia) ? (infoDistancia.distancia / 1000).toFixed(1) : null) ? `${Number(infoDistancia.km || infoDistancia.distancia / 1000).toFixed(1)} km — ` : ''}Endereço memorizado ({infoDistancia.bairroSugerido || 'Memória interna'}) — Taxa: {infoDistancia.taxaFormatada || `R$ ${Number(infoDistancia.taxa).toFixed(2).replace('.', ',')}`}
                            </div>
                          ) : infoDistancia.ambiguidade ? (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#fffbeb',
                              color: '#b45309',
                              padding: '5px 10px',
                              borderRadius: '7px',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: '1px solid #fde68a',
                              marginTop: '4px'
                            }}>
                              ⚠️ {infoDistancia.km || (infoDistancia.distancia != null && !isNaN(infoDistancia.distancia) ? (infoDistancia.distancia / 1000).toFixed(1) : null) ? `~${Number(infoDistancia.km || infoDistancia.distancia / 1000).toFixed(1)} km — ` : ''}Rua Projetada / Ambígua: Confirme o local exato e defina a taxa manualmente.
                            </div>
                          ) : (
                            <small style={{ color: '#16a34a', display: 'block', fontWeight: 600 }}>
                              ✓ {(infoDistancia.distancia != null && !isNaN(infoDistancia.distancia))
                                ? (infoDistancia.distancia < 1000
                                    ? `${Math.round(infoDistancia.distancia)} m`
                                    : `${(infoDistancia.distancia / 1000).toFixed(1)} km`)
                                : (infoDistancia.km != null && !isNaN(infoDistancia.km) ? `${Number(infoDistancia.km).toFixed(1)} km` : '')}
                              {(infoDistancia.taxa != null && !isNaN(infoDistancia.taxa))
                                ? ` — Taxa calculada: R$ ${Number(infoDistancia.taxa).toFixed(2).replace('.', ',')}`
                                : ' — Taxa sob consulta (definir manualmente)'}
                            </small>
                          )
                        )}
                        {infoDistancia && !calculandoDistancia && infoDistancia.avisoDistancia && (
                          <div style={{ marginTop: '6px', padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '12px', fontWeight: 600 }}>
                            ⚠️ {infoDistancia.mensagemAviso || `Atenção: Endereço a mais de 8 km (${infoDistancia.km} km) da lanchonete! Taxa sob consulta (confirmar viabilidade de entrega e definir taxa).`}
                          </div>
                        )}
                        {infoDistancia && !calculandoDistancia && infoDistancia.erro && (
                          <small style={{ color: '#ef4444', display: 'block' }}>
                            {infoDistancia.erro}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  <div className="field">
                    <label>Forma de pagamento</label>
                    <div className="cafe-pills-row">
                      <button
                        type="button"
                        className={`cafe-pill-btn ${formaPagamentoCriacao === 'pix' ? 'active' : ''}`}
                        onClick={() => setFormaPagamentoCriacao(prev => prev === 'pix' ? '' : 'pix')}
                      >
                        <span>Pix</span>
                      </button>
                      <button
                        type="button"
                        className={`cafe-pill-btn ${formaPagamentoCriacao === 'cartao' ? 'active' : ''}`}
                        onClick={() => setFormaPagamentoCriacao(prev => prev === 'cartao' ? '' : 'cartao')}
                      >
                        <span>Cartão</span>
                      </button>
                      <button
                        type="button"
                        className={`cafe-pill-btn ${formaPagamentoCriacao === 'dinheiro' ? 'active' : ''}`}
                        onClick={() => setFormaPagamentoCriacao(prev => prev === 'dinheiro' ? '' : 'dinheiro')}
                      >
                        <span>Dinheiro</span>
                      </button>
                    </div>
                  </div>

                  {!foiPago && formaPagamentoCriacao === 'dinheiro' && (
                    <div className="field" style={{ background: '#fffbeb', padding: '14px', borderRadius: '12px', border: '1px solid #fde68a', marginTop: '8px' }}>
                      <label style={{ color: '#92400e', fontWeight: 700 }}>
                        Valor da nota que o cliente vai pagar (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder=""
                        value={valorPagoDinheiroCriacao}
                        onChange={(e) => setValorPagoDinheiroCriacao(e.target.value)}
                        style={{ background: '#fff', border: '1px solid #fcd34d', marginTop: '4px' }}
                      />
                      {(() => {
                        const valNota = Number(String(valorPagoDinheiroCriacao).replace(',', '.')) || 0
                        const subtotalCalc = carrinho.reduce((s, it) => s + (it.preco * it.quantidade) + (it.adicionais || []).reduce((sa, a) => sa + (a.valor * (a.quantidade || 1)), 0), 0)
                        const totalCalc = subtotalCalc + (tipoRecebimentoCriacao === 'entrega' ? (Number(taxaEntrega) || 0) : 0)
                        const trocoCalc = valNota > totalCalc ? (valNota - totalCalc) : 0
                        if (valNota > 0) {
                          return (
                            <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 700 }}>
                              {trocoCalc > 0 ? (
                                <span style={{ color: '#b45309' }}>💰 LEVAR DE TROCO: R$ {formatarMoeda(trocoCalc)} (Cliente vai pagar com R$ {formatarMoeda(valNota)})</span>
                              ) : valNota === totalCalc ? (
                                <span style={{ color: '#15803d' }}>✓ VALOR EXATO (Não precisa de troco)</span>
                              ) : (
                                <span style={{ color: '#dc2626' }}>⚠️ Valor informado (R$ {formatarMoeda(valNota)}) é menor que o total do pedido (R$ {formatarMoeda(totalCalc)})</span>
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

              {/* BUSCA DE PRODUTOS NO CARDÁPIO */}
              <div className="product-catalog-search-box" style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '16px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0 14px', height: '48px', boxSizing: 'border-box', position: 'relative' }}>
                <span style={{ display: 'flex', alignItems: 'center', color: '#64748b', marginRight: '10px' }}><Search size={18} strokeWidth={2.2} /></span>
                <input 
                  type="text" 
                  className="product-catalog-search-input"
                  placeholder="Pesquisar produto no cardápio (lanche, bebida, combo...)" 
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#0f172a', fontWeight: 500 }}
                />
                {buscaProduto && (
                  <button type="button" onClick={() => setBuscaProduto('')} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* CATEGORIAS EM PÍLULAS */}
              {!buscaProduto && (
                <div className="cafe-pills-row" style={{ marginBottom: '16px' }}>
                  {categorias.map((cat) => (
                    <button
                      type="button"
                      key={cat.nome}
                      className={`cafe-pill-btn ${categoriaAtiva === cat.nome ? 'active' : ''}`}
                      onClick={() => setCategoriaAtiva(cat.nome)}
                    >
                      {cat.nome}
                    </button>
                  ))}
                </div>
              )}

              {/* GRADE DE PRODUTOS */}
              <div className="product-grid">
                {(() => {
                  if (buscaProduto) {
                    const searchLower = buscaProduto.toLowerCase()
                    const allProducts = categorias.flatMap(c => c.produtos)
                    const filtered = allProducts.filter(([nome]) => buscaFuzzy(nome, searchLower))
                    
                    if (filtered.length === 0) {
                      return <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '30px', fontWeight: 600 }}>Nenhum produto encontrado com esse nome.</p>
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

            {/* CARRINHO LATERAL MODERNO */}
            <aside 
              className="cart cafe-cart-card"
              style={{
                marginBottom: (isMobile && (removerItemAberto || adicionalItemAberto)) ? '280px' : (isMobile ? '80px' : undefined),
                transition: 'margin-bottom 0.25s ease'
              }}
            >
              <div className="cart-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} strokeWidth={2.2} color="#0f172a" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Pedido</h3>
                </div>
                <span className="cafe-cart-badge">{carrinho.reduce((soma, item) => soma + item.quantidade, 0)} {carrinho.reduce((soma, item) => soma + item.quantidade, 0) === 1 ? 'item' : 'itens'}</span>
              </div>

              {carrinho.length === 0 ? (
                <div className="cart-empty">
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ShoppingBag size={48} strokeWidth={1.2} color="#cbd5e1" />
                  </div>
                  <p style={{ margin: '12px 0 4px', fontSize: '15px', fontWeight: 700, color: '#334155' }}>Nenhum produto adicionado</p>
                  <small style={{ color: '#64748b', fontSize: isMobile ? '13.5px' : '12px' }}>{isMobile ? 'Toque nos produtos acima para montar o pedido' : 'Clique nos produtos ao lado para montar o pedido'}</small>
                </div>
              ) : (
                <div className="cart-items">
                  {
                  carrinho.map((item, itemIdx) => {
                    const itemId = item.id || (`item_${itemIdx}_${item.nome}`)
                    return (
                    <div className={`cart-item-container ${autocompleteItemAberto === itemId || removerItemAberto === itemId || adicionalItemAberto === itemId ? 'has-open-popover' : ''}`} key={itemId} style={{display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px'}}>
                      <div className="cart-item" style={{borderBottom: 'none', paddingBottom: 0, marginBottom: 0}}>
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <strong>{item.nome}</strong>
                            {obterComposicaoItem(item.nome) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setItemInspecionado(obterComposicaoItem(item.nome))
                                }}
                                style={{
                                  background: '#f1f5f9',
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
                                <Search size={12} strokeWidth={2.6} />
                              </button>
                            )}
                          </div>
                          <span>R$ {Math.max(0, (item.preco * item.quantidade) + (item.adicionais || []).reduce((s, ad) => s + (ad.valor * (ad.quantidade || 1)), 0)).toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="quantity">
                          <button type="button" onClick={() => alterarQuantidade(itemId, item.quantidade - 1)}>−</button>
                          <span>{item.quantidade}</span>
                          <button type="button" onClick={() => alterarQuantidade(itemId, item.quantidade + 1)}>+</button>
                        </div>
                      </div>
                      {/* Linha de observação, adicional e remoção */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginTop: '4px' }}>
                        <input 
                          type="text" 
                          placeholder="" 
                          value={item.notes || ''}
                          onChange={(e) => alterarObservacaoProduto(itemId, e.target.value)}
                          style={{ flex: 1, minWidth: 0, fontSize: '12px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }}
                        />
                        {!isProdutoBebida(item.nome) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '115px', flexShrink: 0, position: 'relative', zIndex: (adicionalItemAberto === itemId || removerItemAberto === itemId) ? 99999 : 2 }}>
                            {/* Botão Verde "+ Adicional" */}
                            <div className="container-adicional-popover" style={{ position: 'relative' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setRemoverItemAberto(null)
                                  setAutocompleteItemAberto(null)
                                  if (adicionalItemAberto === itemId) {
                                    setAdicionalItemAberto(null)
                                    setTermoAdicional('')
                                  } else {
                                    setAdicionalItemAberto(itemId)
                                    setTermoAdicional('')
                                    if (!isSmallScreen) {
                                      setTimeout(() => {
                                        const inp = document.getElementById(`input-adicional-${itemId.replace(/[^a-zA-Z0-9]/g, '_')}`)
                                        if (inp) {
                                          inp.focus()
                                          inp.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                                        }
                                      }, 40)
                                    }
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  justifyContent: 'center',
                                  background: adicionalItemAberto === itemId ? '#dcfce7' : '#f0fdf4',
                                  border: '1px solid #10b981',
                                  color: '#15803d',
                                  borderRadius: '8px',
                                  padding: '6px 10px',
                                  fontSize: '12px',
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
                              {adicionalItemAberto === itemId && (
                                isSmallScreen ? (
                                  /* MODAL / BOTTOM SHEET MOBILE PARA INCLUIR ADICIONAIS */
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
                                      animation: 'fadeInBackdrop 0.2s ease-out'
                                    }}
                                    onClick={() => { setAdicionalItemAberto(null); setTermoAdicional(''); }}
                                  >
                                    <div
                                      style={{
                                        width: '100%',
                                        maxWidth: '480px',
                                        backgroundColor: '#ffffff',
                                        borderTopLeftRadius: '20px',
                                        borderTopRightRadius: '20px',
                                        boxShadow: '0 -10px 25px rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        maxHeight: '85vh',
                                        overflow: 'hidden',
                                        animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Cabeçalho do modal mobile */}
                                      <div style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid #f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: '#f8fafc'
                                      }}>
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
                                              Adicionar Ingredientes
                                            </h3>
                                          </div>
                                          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                                            {item.nome}
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => { setAdicionalItemAberto(null); setTermoAdicional(''); }}
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

                                      {/* Campo de busca opcional */}
                                      <div style={{ padding: '10px 16px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
                                        <input
                                          id={`input-adicional-${itemId.replace(/[^a-zA-Z0-9]/g, "_")}`}
                                          type="text"
                                          value={termoAdicional}
                                          onChange={(e) => setTermoAdicional(e.target.value)}
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
                                          Toque para adicionar:
                                        </div>

                                        {(() => {
                                          const busca = (termoAdicional || '').toLowerCase().trim()
                                          const filtrados = ADICIONAIS.filter(([nomeAd]) => nomeAd.toLowerCase().includes(busca))

                                          if (filtrados.length === 0 && !busca) {
                                            return (
                                              <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                                                Nenhum adicional disponível
                                              </div>
                                            )
                                          }

                                          return (
                                            <>
                                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                                                {filtrados.map(([nomeAd, valorAd]) => (
                                                  <button
                                                    type="button"
                                                    key={nomeAd}
                                                    onClick={() => {
                                                      adicionarAdicionalProduto(itemId, nomeAd, valorAd)
                                                      setTermoAdicional('')
                                                    }}
                                                    style={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'space-between',
                                                      padding: '10px 12px',
                                                      borderRadius: '10px',
                                                      border: '1.5px solid #bbf7d0',
                                                      background: '#f0fdf4',
                                                      color: '#15803d',
                                                      fontSize: '13px',
                                                      fontWeight: 600,
                                                      cursor: 'pointer',
                                                      textAlign: 'left',
                                                      boxSizing: 'border-box',
                                                      gap: '6px'
                                                    }}
                                                  >
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nomeAd}</span>
                                                    <span style={{
                                                      fontSize: '11.5px',
                                                      fontWeight: 800,
                                                      color: '#166534',
                                                      background: '#dcfce7',
                                                      padding: '2px 6px',
                                                      borderRadius: '6px',
                                                      flexShrink: 0
                                                    }}>+R${valorAd}</span>
                                                  </button>
                                                ))}
                                              </div>

                                              {/* Se o usuário digitou algo e não há match exato, botão para criar */}
                                              {busca && !filtrados.some(([nomeAd]) => nomeAd.toLowerCase() === busca) && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    adicionarAdicionalProduto(itemId, termoAdicional.trim(), 0)
                                                    setTermoAdicional('')
                                                  }}
                                                  style={{
                                                    marginTop: '6px',
                                                    padding: '10px 14px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    color: '#15803d',
                                                    background: '#dcfce7',
                                                    border: '1.5px dashed #86efac',
                                                    borderRadius: '10px',
                                                    textAlign: 'center'
                                                  }}
                                                >
                                                  + Adicionar "{termoAdicional.trim()}" (R$ 0,00)
                                                </button>
                                              )}
                                            </>
                                          )
                                        })()}

                                        {/* Adicionais já selecionados neste item (com contador e remover) */}
                                        {(item.adicionais || []).length > 0 && (
                                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>
                                              Adicionados a este lanche ({item.adicionais.length}):
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                              {(item.adicionais || []).map((ad, adIdx) => (
                                                <span
                                                  key={adIdx}
                                                  style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    background: '#dcfce7',
                                                    color: '#15803d',
                                                    border: '1px solid #86efac',
                                                    padding: '5px 8px',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: 700
                                                  }}
                                                >
                                                  <span>{ad.quantidade > 1 ? `${ad.quantidade}x ` : ''}{ad.nome} (+R${(ad.valor * (ad.quantidade || 1)).toFixed(2).replace('.', ',')})</span>
                                                  <button
                                                    type="button"
                                                    onClick={() => removerAdicionalProduto(itemId, adIdx)}
                                                    style={{
                                                      background: 'none',
                                                      border: 'none',
                                                      color: '#166534',
                                                      cursor: 'pointer',
                                                      fontWeight: 800,
                                                      fontSize: '13px',
                                                      padding: 0,
                                                      lineHeight: 1
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
                                          onClick={() => { setAdicionalItemAberto(null); setTermoAdicional(''); }}
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
                                    position: 'absolute', top: '100%', right: 0, zIndex: 99999,
                                    background: 'white', border: '1.5px solid #10b981', borderRadius: '12px',
                                    boxShadow: '0 8px 24px rgba(16,185,129,0.22)', minWidth: 'min(240px, calc(100vw - 32px))', maxWidth: 'min(280px, calc(100vw - 32px))', touchAction: 'manipulation',
                                    marginTop: '4px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
                                  }}>
                                    <div style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: 700, color: '#166534', background: '#dcfce7', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span>Incluir ingrediente:</span>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setAdicionalItemAberto(null)
                                          setTermoAdicional('')
                                        }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 800, fontSize: '14px', padding: '0 2px' }}
                                        title="Fechar"
                                      >✕</button>
                                    </div>
                                    <div style={{ padding: '6px 8px', background: '#f0fdf4', borderBottom: '1px solid #dcfce7' }}>
                                      <input
                                        id={`input-adicional-${itemId.replace(/[^a-zA-Z0-9]/g, "_")}`}
                                        type="text"
                                        value={termoAdicional}
                                        onChange={(e) => setTermoAdicional(e.target.value)}
                                        placeholder=""
                                        style={{ width: '100%', fontSize: '11.5px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #86efac', outline: 'none', boxSizing: 'border-box' }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault()
                                            const textoTrim = termoAdicional.trim()
                                            if (!textoTrim) return
                                            const match = ADICIONAIS.find(([nomeAd]) => nomeAd.toLowerCase() === textoTrim.toLowerCase())
                                            const valorFinal = match ? match[1] : 0
                                            const nomeFinal = match ? match[0] : textoTrim
                                            adicionarAdicionalProduto(itemId, nomeFinal, valorFinal)
                                            setTermoAdicional('')
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
                                        const busca = (termoAdicional || '').toLowerCase().trim()
                                        const filtrados = ADICIONAIS.filter(([nomeAd]) => nomeAd.toLowerCase().includes(busca))

                                        if (filtrados.length === 0 && !busca) {
                                          return (
                                            <div style={{ padding: '12px 10px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                                              Nenhum adicional disponível
                                            </div>
                                          )
                                        }

                                        const temMatchExato = filtrados.some(([nomeAd]) => nomeAd.toLowerCase() === busca)

                                        return (
                                          <>
                                            {filtrados.map(([nomeAd, valorAd]) => (
                                              <div
                                                key={nomeAd}
                                                onClick={() => {
                                                  adicionarAdicionalProduto(itemId, nomeAd, valorAd)
                                                  setAdicionalItemAberto(null)
                                                  setTermoAdicional('')
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
                                                  transition: 'background 0.15s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                              >
                                                <span>{nomeAd}</span>
                                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '2px 5px', borderRadius: '4px' }}>+R${valorAd}</span>
                                              </div>
                                            ))}
                                            {busca && !temMatchExato && (
                                              <div
                                                onClick={() => {
                                                  adicionarAdicionalProduto(itemId, termoAdicional.trim(), 0)
                                                  setAdicionalItemAberto(null)
                                                  setTermoAdicional('')
                                                }}
                                                style={{
                                                  padding: '8px 10px',
                                                  cursor: 'pointer',
                                                  fontSize: '11.5px',
                                                  fontWeight: 700,
                                                  color: '#15803d',
                                                  background: '#dcfce7',
                                                  borderTop: '1px dashed #86efac',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '4px'
                                                }}
                                              >
                                                <span>+ Adicionar "{termoAdicional.trim()}" (R$ 0,00)</span>
                                              </div>
                                            )}
                                          </>
                                        )
                                      })()}
                                    </div>
                                    <div style={{
                                      padding: '5px 10px',
                                      fontSize: '10.5px',
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

                            {/* Botão Vermelho "- Remover" */}
                            <div className="container-remover-popover" style={{ position: 'relative' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setAdicionalItemAberto(null)
                                  setAutocompleteItemAberto(null)
                                  if (removerItemAberto === itemId) {
                                    setRemoverItemAberto(null)
                                    setTermoRemover('')
                                  } else {
                                    setRemoverItemAberto(itemId)
                                    setTermoRemover('')
                                    if (!isSmallScreen) {
                                      setTimeout(() => {
                                        const inp = document.getElementById(`input-remover-${itemId.replace(/[^a-zA-Z0-9]/g, '_')}`)
                                        if (inp) {
                                          inp.focus()
                                          inp.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                                        }
                                      }, 40)
                                    }
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  justifyContent: 'center',
                                  background: removerItemAberto === itemId ? '#fee2e2' : '#fef2f2',
                                  border: '1px solid #ef4444',
                                  color: '#dc2626',
                                  borderRadius: '8px',
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  whiteSpace: 'nowrap',
                                  boxSizing: 'border-box'
                                }}
                                title="Remover ingredientes deste lanche"
                              >
                                - Remover
                              </button>
                              {removerItemAberto === itemId && (
                                isSmallScreen ? (
                                  /* MODAL / BOTTOM SHEET MOBILE PARA RETIRAR INGREDIENTES */
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
                                      animation: 'fadeInBackdrop 0.2s ease-out'
                                    }}
                                    onClick={() => { setRemoverItemAberto(null); setTermoRemover(''); }}
                                  >
                                    <div
                                      style={{
                                        width: '100%',
                                        maxWidth: '480px',
                                        backgroundColor: '#ffffff',
                                        borderTopLeftRadius: '20px',
                                        borderTopRightRadius: '20px',
                                        boxShadow: '0 -10px 25px rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        maxHeight: '85vh',
                                        overflow: 'hidden',
                                        animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Cabeçalho do modal mobile */}
                                      <div style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid #f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: '#fff5f5'
                                      }}>
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
                                            {item.nome}
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => { setRemoverItemAberto(null); setTermoRemover(''); }}
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
                                      <div style={{ padding: '10px 16px', background: '#fffafb', borderBottom: '1px solid #fee2e2' }}>
                                        <input
                                          id={`input-remover-${itemId.replace(/[^a-zA-Z0-9]/g, "_")}`}
                                          type="text"
                                          value={termoRemover}
                                          onChange={(e) => setTermoRemover(e.target.value)}
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
                                          const ingredientesPossiveis = obterIngredientesDoProduto(item.nome)
                                          const remocoesAtuais = (item.remocoes || []).map(r => r.nome.toLowerCase())
                                          const ingredientesDisponiveis = ingredientesPossiveis.filter(([ing]) => !remocoesAtuais.includes(ing.toLowerCase()))

                                          const busca = (termoRemover || '').toLowerCase().trim()
                                          const filtrados = ingredientesDisponiveis.filter(([ing]) => ing.toLowerCase().includes(busca))

                                          if (filtrados.length === 0 && !busca) {
                                            return (
                                              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                                🎉 Todos os ingredientes padrão já foram retirados deste item.
                                              </div>
                                            )
                                          }

                                          const temMatchExato = filtrados.some(([ing]) => ing.toLowerCase() === busca)

                                          return (
                                            <>
                                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '8px' }}>
                                                {filtrados.map(([ing]) => (
                                                  <button
                                                    type="button"
                                                    key={ing}
                                                    onClick={() => {
                                                      adicionarRemocaoProduto(itemId, ing, 0)
                                                      setTermoRemover('')
                                                    }}
                                                    style={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'space-between',
                                                      padding: '10px 12px',
                                                      borderRadius: '10px',
                                                      border: '1.5px solid #fee2e2',
                                                      background: '#fffafb',
                                                      color: '#991b1b',
                                                      fontSize: '13px',
                                                      fontWeight: 600,
                                                      cursor: 'pointer',
                                                      textAlign: 'left',
                                                      boxSizing: 'border-box',
                                                      gap: '6px'
                                                    }}
                                                  >
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ing}</span>
                                                    <span style={{
                                                      fontSize: '12px',
                                                      fontWeight: 800,
                                                      color: '#dc2626',
                                                      background: '#fee2e2',
                                                      width: '20px',
                                                      height: '20px',
                                                      borderRadius: '50%',
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      flexShrink: 0
                                                    }}>−</span>
                                                  </button>
                                                ))}
                                              </div>

                                              {busca && !temMatchExato && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    adicionarRemocaoProduto(itemId, termoRemover.trim(), 0)
                                                    setTermoRemover('')
                                                  }}
                                                  style={{
                                                    marginTop: '6px',
                                                    padding: '10px 14px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    color: '#dc2626',
                                                    background: '#fee2e2',
                                                    border: '1.5px dashed #fca5a5',
                                                    borderRadius: '10px',
                                                    textAlign: 'center'
                                                  }}
                                                >
                                                  − Retirar "{termoRemover.trim()}"
                                                </button>
                                              )}
                                            </>
                                          )
                                        })()}

                                        {/* Ingredientes já retirados deste item (com botão desfazer) */}
                                        {(item.remocoes || []).length > 0 && (
                                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #fee2e2' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c', marginBottom: '8px' }}>
                                              Ingredientes retirados deste item ({item.remocoes.length}):
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
                                                    color: '#b91c1c',
                                                    border: '1px solid #fca5a5',
                                                    padding: '5px 8px',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: 700
                                                  }}
                                                >
                                                  <span>Sem {rem.nome}</span>
                                                  <button
                                                    type="button"
                                                    onClick={() => cancelarRemocaoProduto(itemId, rIdx)}
                                                    style={{
                                                      background: 'none',
                                                      border: 'none',
                                                      color: '#dc2626',
                                                      cursor: 'pointer',
                                                      fontWeight: 800,
                                                      fontSize: '13px',
                                                      padding: 0,
                                                      lineHeight: 1
                                                    }}
                                                    title="Desfazer"
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
                                          onClick={() => { setRemoverItemAberto(null); setTermoRemover(''); }}
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
                                    position: 'absolute', top: '100%', right: 0, zIndex: 99999,
                                    background: 'white', border: '1.5px solid #f87171', borderRadius: '12px',
                                    boxShadow: '0 8px 24px rgba(220,38,38,0.22)', minWidth: 'min(240px, calc(100vw - 32px))', maxWidth: 'min(280px, calc(100vw - 32px))', touchAction: 'manipulation',
                                    marginTop: '4px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
                                  }}>
                                    <div style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: 700, color: '#991b1b', background: '#fee2e2', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span>Retirar ingrediente:</span>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setRemoverItemAberto(null)
                                          setTermoRemover('')
                                        }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 800, fontSize: '14px', padding: '0 2px' }}
                                        title="Fechar"
                                      >✕</button>
                                    </div>
                                    <div style={{ padding: '6px 8px', background: '#fff5f5', borderBottom: '1px solid #fecaca' }}>
                                      <input
                                        id={`input-remover-${itemId.replace(/[^a-zA-Z0-9]/g, "_")}`}
                                        type="text"
                                        value={termoRemover}
                                        onChange={(e) => setTermoRemover(e.target.value)}
                                        placeholder=""
                                        style={{ width: '100%', fontSize: '11.5px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #fca5a5', outline: 'none', boxSizing: 'border-box' }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault()
                                            const textoTrim = termoRemover.trim()
                                            if (!textoTrim) return
                                            const ingredientesPossiveis = obterIngredientesDoProduto(item.nome)
                                            const match = ingredientesPossiveis.find(([ing]) => ing.toLowerCase() === textoTrim.toLowerCase())
                                            const nomeRem = match ? match[0] : textoTrim
                                            adicionarRemocaoProduto(itemId, nomeRem, 0)
                                            setTermoRemover('')
                                          }
                                        }}
                                      />
                                    </div>

                                    <div 
                                      className="popover-remover-lista" 
                                      style={{ 
                                        maxHeight: '260px', 
                                        overflowY: 'auto',
                                        WebkitOverflowScrolling: 'touch',
                                        overscrollBehavior: 'contain'
                                      }}
                                    >
                                      {(() => {
                                        const ingredientesPossiveis = obterIngredientesDoProduto(item.nome)
                                        const remocoesAtuais = (item.remocoes || []).map(r => r.nome.toLowerCase())
                                        const ingredientesDisponiveis = ingredientesPossiveis.filter(([ing]) => !remocoesAtuais.includes(ing.toLowerCase()))

                                        const busca = (termoRemover || '').toLowerCase().trim()
                                        const filtrados = ingredientesDisponiveis.filter(([ing]) => ing.toLowerCase().includes(busca))

                                        if (filtrados.length === 0 && !busca) {
                                          return (
                                            <div style={{ padding: '12px 10px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
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
                                                  adicionarRemocaoProduto(itemId, ing, 0)
                                                  setRemoverItemAberto(null)
                                                  setTermoRemover('')
                                                }}
                                                style={{
                                                  padding: '7px 10px',
                                                  minHeight: '36px',
                                                  boxSizing: 'border-box',
                                                  cursor: 'pointer',
                                                  fontSize: '12px',
                                                  fontWeight: 600,
                                                  color: '#b91c1c',
                                                  borderBottom: '1px solid #fef2f2',
                                                  display: 'flex',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  gap: '6px',
                                                  transition: 'background 0.15s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                              >
                                                <span>- {ing}</span>
                                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>Retirar</span>
                                              </div>
                                            ))}
                                            {busca && !temMatchExato && (
                                              <div
                                                onClick={() => {
                                                  adicionarRemocaoProduto(itemId, termoRemover.trim(), 0)
                                                  setRemoverItemAberto(null)
                                                  setTermoRemover('')
                                                }}
                                                style={{
                                                  padding: '8px 10px',
                                                  cursor: 'pointer',
                                                  fontSize: '11.5px',
                                                  fontWeight: 700,
                                                  color: '#b91c1c',
                                                  background: '#fee2e2',
                                                  borderTop: '1px dashed #fca5a5',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '4px'
                                                }}
                                              >
                                                <span>- Retirar "{termoRemover.trim()}"</span>
                                              </div>
                                            )}
                                          </>
                                        )
                                      })()}
                                    </div>
                                    {(() => {
                                      const ingredientesPossiveis = obterIngredientesDoProduto(item.nome)
                                      const remocoesAtuais = (item.remocoes || []).map(r => r.nome.toLowerCase())
                                      const countDisp = ingredientesPossiveis.filter(([ing]) => !remocoesAtuais.includes(ing.toLowerCase())).length
                                      return (
                                        <div style={{
                                          padding: '5px 10px',
                                          fontSize: '10.5px',
                                          color: '#991b1b',
                                          background: '#fff5f5',
                                          borderTop: '1px solid #fecaca',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          fontWeight: 600
                                        }}>
                                          <span>{countDisp} disponíveis</span>
                                          {countDisp > 5 && (
                                            <span style={{ fontSize: '10px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                              ↕ Role p/ ver todos
                                            </span>
                                          )}
                                        </div>
                                      )
                                    })()}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Tags dos adicionais aplicados */}
                      {(item.adicionais || []).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {(item.adicionais || []).map((ad, idx) => (
                            <span key={idx} style={{
                              background: '#dcfce7', color: '#15803d', fontSize: '11.5px', fontWeight: 600,
                              padding: '2px 8px', borderRadius: '6px', border: '1px solid #86efac',
                              display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}>
                              +{ad.quantidade > 1 ? `${ad.quantidade}x ` : ''}{ad.nome} (R${(ad.valor * (ad.quantidade || 1)).toFixed(2).replace('.', ',')})
                              <button
                                type="button"
                                onClick={() => removerAdicionalProduto(itemId, idx)}
                                style={{
                                  background: 'none', border: 'none', color: '#15803d', cursor: 'pointer',
                                  fontSize: '12px', fontWeight: 800, padding: 0, lineHeight: 1
                                }}
                              >✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Tags dos itens removidos */}
                      {(item.remocoes || []).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {(item.remocoes || []).map((rem, idx) => (
                            <span key={idx} style={{
                              background: '#fee2e2', color: '#b91c1c', fontSize: '11.5px', fontWeight: 600,
                              padding: '2px 8px', borderRadius: '6px', border: '1px solid #fca5a5',
                              display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}>
                              - Sem {rem.nome}
                              <button
                                type="button"
                                onClick={() => cancelarRemocaoProduto(itemId, idx)}
                                style={{
                                  background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer',
                                  fontSize: '12px', fontWeight: 800, padding: 0, lineHeight: 1
                                }}
                              >✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    )
                  })
                }
                </div>
              )}

              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
                </div>

                <button
                  type="button"
                  className="btn-send-order"
                  disabled={carrinho.length === 0 || salvando}
                  onClick={enviarPedido}
                >
                  <ChefHat size={18} strokeWidth={2.4} />
                  <span>Enviar Pedido para Cozinha</span>
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
      {renderModalInspecionar()}
      <ThermalReceiptArea />
    </div>
  )
}
