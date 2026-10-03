import React from 'react'
import {
  TrendingUp,
  Calendar,
  CheckCheck,
  Search,
  X,
  Package,
  ShoppingBag,
  UtensilsCrossed,
  Bike,
  Store,
  CheckCircle2,
  ChefHat,
  Flame
} from 'lucide-react'
import { calcularRelatorioControle } from '../utils/relatorioControle'

export default function RelatoriosPage({
  pedidos,
  pedidosHistoricoCompleto,
  filtroPeriodoTodosPedidos,
  setFiltroPeriodoTodosPedidos,
  startTransitionPeriodo,
  subAbaRelatorio,
  setSubAbaRelatorio,
  buscaItemControle,
  setBuscaItemControle,
  filtroCategoriaControle,
  setFiltroCategoriaControle,
  mostrarTodosProducao,
  setMostrarTodosProducao,
  setModalDetalhesFat,
  calcularDiscriminacaoPagamento,
  formatarMoeda,
  formatarNumero,
  renderOrderCard,
  isOwner
}) {
            const pedidosEmProducao = pedidosHistoricoCompleto.filter(p => !p.status || p.status === 'new' || p.status === 'accepted' || p.status === 'preparing')
            const pedidosProntos = pedidosHistoricoCompleto.filter(p => p.status === 'ready')
            const pedidosEntregues = pedidosHistoricoCompleto.filter(p => p.status === 'completed')

            // REGRA ESTRITA: Vendas Totais somam SOMENTE pedidos prontos para saída (ready) ou entregues finalizados (completed).
            // Pedidos em produção NÃO entram no cálculo financeiro.
            const pedidosFaturados = pedidosHistoricoCompleto.filter(p => 
              (p.status === 'ready' || p.status === 'completed') && 
              p.status !== 'cancelled' && 
              p.payment_method !== 'archived'
            )

            // Total das taxas de entrega de todos os entregadores no período
            const totalTaxasEntrega = pedidosFaturados.reduce((sum, p) => sum + Number(p.delivery_fee || 0), 0)

            // Vendas Totais: somar o valor de todos os pedidos prontos/entregues MENOS a quantidade total da taxa de entrega
            const totalBrutoFaturado = pedidosFaturados.reduce((sum, p) => sum + Number(p.total || 0), 0)
            const totalVendasTotais = Math.max(0, totalBrutoFaturado - totalTaxasEntrega)
            const qtdVendasTotais = pedidosFaturados.length

            // Faturamento Entrega (descontando a taxa de entrega para somar o valor dos produtos vendidos)
            const pedidosEntrega = pedidosFaturados.filter(p => p.order_type === 'delivery' || p.manual_delivery || Boolean(p.delivery_address))
            const totalEntrega = pedidosEntrega.reduce((sum, p) => sum + Math.max(0, Number(p.total || 0) - Number(p.delivery_fee || 0)), 0)
            const qtdEntrega = pedidosEntrega.length

            // Faturamento Mesa (não possui taxa de entrega)
            const pedidosMesa = pedidosFaturados.filter(p => 
              !(p.order_type === 'delivery' || p.manual_delivery || Boolean(p.delivery_address)) && 
              (p.order_type === 'dine_in' || (p.source === 'table' && p.order_type !== 'pickup'))
            )
            const totalMesa = pedidosMesa.reduce((sum, p) => sum + Number(p.total || 0), 0)
            const qtdMesa = pedidosMesa.length

            // Faturamento Retirada (não possui taxa de entrega)
            const pedidosRetirada = pedidosFaturados.filter(p => 
              !(p.order_type === 'delivery' || p.manual_delivery || Boolean(p.delivery_address)) && 
              !(p.order_type === 'dine_in' || (p.source === 'table' && p.order_type !== 'pickup'))
            )
            const totalRetirada = pedidosRetirada.reduce((sum, p) => sum + Number(p.total || 0), 0)
            const qtdRetirada = pedidosRetirada.length

            // Discriminação por Forma de Pagamento (Cartão, Pix, Dinheiro)
            const totalPix = pedidosFaturados
              .filter(p => (p.payment_method || '').toLowerCase().includes('pix'))
              .reduce((sum, p) => sum + Number(p.total || 0), 0)
            const qtdPix = pedidosFaturados.filter(p => (p.payment_method || '').toLowerCase().includes('pix')).length

            const totalCartao = pedidosFaturados
              .filter(p => {
                const m = (p.payment_method || '').toLowerCase()
                return m.includes('cartao') || m.includes('cartão') || m.includes('credit') || m.includes('debit') || m.includes('crédito') || m.includes('débito') || m.includes('mastercard') || m.includes('visa') || m.includes('elo')
              })
              .reduce((sum, p) => sum + Number(p.total || 0), 0)
            const qtdCartao = pedidosFaturados.filter(p => {
              const m = (p.payment_method || '').toLowerCase()
              return m.includes('cartao') || m.includes('cartão') || m.includes('credit') || m.includes('debit') || m.includes('crédito') || m.includes('débito') || m.includes('mastercard') || m.includes('visa') || m.includes('elo')
            }).length

            const totalDinheiro = pedidosFaturados
              .filter(p => {
                const m = (p.payment_method || '').toLowerCase()
                return m.includes('dinheiro') || m.includes('cash')
              })
              .reduce((sum, p) => sum + Number(p.total || 0), 0)
            const qtdDinheiro = pedidosFaturados.filter(p => {
              const m = (p.payment_method || '').toLowerCase()
              return m.includes('dinheiro') || m.includes('cash')
            }).length

            const rotuloPeriodoFat = filtroPeriodoTodosPedidos === 'hoje' ? 'Hoje (últimas 14h)' : filtroPeriodoTodosPedidos === '7dias' ? '7 dias' : '30 dias'

            // calcularDiscriminacaoPagamento agora é global no topo de App.jsx
            return (
              <div className="todos-pedidos-view" key="faturamento-root">
                {/* SELETOR PRINCIPAL DE RELATÓRIOS: FATURAMENTO vs CONTROLE */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f1f5f9',
                  padding: '5px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '18px',
                  width: 'fit-content',
                  maxWidth: '100%'
                }}>
                  <button
                    type="button"
                    onClick={() => setSubAbaRelatorio('faturamento')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: subAbaRelatorio === 'faturamento' ? '#ffffff' : 'transparent',
                      color: subAbaRelatorio === 'faturamento' ? '#ea580c' : '#64748b',
                      boxShadow: subAbaRelatorio === 'faturamento' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    <TrendingUp size={16} strokeWidth={2.4} />
                    <span>Faturamento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubAbaRelatorio('controle')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: subAbaRelatorio === 'controle' ? '#ffffff' : 'transparent',
                      color: subAbaRelatorio === 'controle' ? '#ea580c' : '#64748b',
                      boxShadow: subAbaRelatorio === 'controle' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    <Package size={16} strokeWidth={2.4} />
                    <span>Controle</span>
                  </button>
                </div>

                {subAbaRelatorio === 'faturamento' ? (
                  <>
                    {/* BARRA SUPERIOR DE FILTRO DE PERÍODO (Hoje, 7 dias, 30 dias) */}
                    <div className="todos-pedidos-topbar" style={{ marginBottom: '16px' }}>
                  <div className="periodo-pills-row" style={{ margin: 0 }}>
                    <span className="periodo-pills-label">
                      <Calendar size={14} strokeWidth={2.2} />
                      <span>Filtrar por:</span>
                    </span>
                    <button
                      type="button"
                      className={`periodo-pill-btn ${filtroPeriodoTodosPedidos === 'hoje' ? 'active' : ''}`}
                      onClick={() => startTransitionPeriodo(() => setFiltroPeriodoTodosPedidos('hoje'))}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      className={`periodo-pill-btn ${filtroPeriodoTodosPedidos === '7dias' ? 'active' : ''}`}
                      onClick={() => startTransitionPeriodo(() => setFiltroPeriodoTodosPedidos('7dias'))}
                    >
                      7 dias
                    </button>
                    <button
                      type="button"
                      className={`periodo-pill-btn ${filtroPeriodoTodosPedidos === '30dias' ? 'active' : ''}`}
                      onClick={() => startTransitionPeriodo(() => setFiltroPeriodoTodosPedidos('30dias'))}
                    >
                      30 dias
                    </button>
                  </div>
                </div>

                {/* CARDS DE RESUMO NO MESMO ESTILO DA PÁGINA DE ENTREGAS */}
                <div className="faturamento-summary-grid">
                  {/* CARD DESTAQUE: VENDAS TOTAIS */}
                  <div className="entregues-stat-card card-total-geral">
                    <div className="stat-card-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="stat-pill-label">Vendas Totais</span>
                      <button
                        type="button"
                        className="btn-fat-detalhes"
                        onClick={() => setModalDetalhesFat({
                          modalidade: 'total',
                          titulo: 'Vendas Totais',
                          subtitulo: `Faturamento líquido do período (${rotuloPeriodoFat})`,
                          icone: 'TrendingUp',
                          cor: '#0f172a',
                          bgCor: '#f1f5f9',
                          totalValor: totalVendasTotais,
                          totalPedidos: qtdVendasTotais,
                          ...calcularDiscriminacaoPagamento(pedidosFaturados, true)
                        })}
                      >
                        <span>Detalhes</span>
                      </button>
                    </div>
                    <div className="stat-card-body-primary">
                      <div className="stat-main-number-fat" style={{ color: '#0f172a' }}>R$ {formatarMoeda(totalVendasTotais)}</div>
                      <div className="stat-main-label">{formatarNumero(qtdVendasTotais)} {qtdVendasTotais === 1 ? 'pedido faturado' : 'pedidos faturados'}</div>
                    </div>
                    <div className="stat-card-divider"></div>
                    <div className="stat-card-footer-amount">
                      <span className="stat-footer-caption">Total em Taxas:</span>
                      <strong className="stat-footer-value" style={{ fontSize: '13px', color: '#0284c7' }}>R$ {formatarMoeda(totalTaxasEntrega)}</strong>
                    </div>
                  </div>

                  {/* CARDS DAS MODALIDADES: ENTREGA, RETIRADA E MESA */}
                  <div className="faturamento-channels-cards-row">
                    {/* ENTREGA */}
                    <div className="entregues-stat-card card-fat-entrega">
                      <div className="stat-card-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="driver-name-tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                          <Bike size={14} strokeWidth={2.4} />
                          <span>Entrega</span>
                        </span>
                        <button
                          type="button"
                          className="btn-fat-detalhes"
                          onClick={() => setModalDetalhesFat({
                            modalidade: 'entrega',
                            titulo: 'Entrega',
                            subtitulo: `Pedidos de delivery entregues (${rotuloPeriodoFat})`,
                            icone: 'Bike',
                            cor: '#0369a1',
                            bgCor: '#e0f2fe',
                            totalValor: totalEntrega,
                            totalPedidos: qtdEntrega,
                            ...calcularDiscriminacaoPagamento(pedidosEntrega, true)
                          })}
                        >
                          <span>Detalhes</span>
                        </button>
                      </div>
                      <div className="stat-card-body-primary">
                        <div className="stat-main-number-fat-sub" style={{ color: '#0369a1' }}>R$ {formatarMoeda(totalEntrega)}</div>
                        <div className="stat-main-label">{formatarNumero(qtdEntrega)} {qtdEntrega === 1 ? 'pedido' : 'pedidos'}</div>
                      </div>
                      <div className="stat-card-divider"></div>
                      <div className="stat-card-footer-amount">
                        <span className="stat-footer-caption">Participação:</span>
                        <strong className="stat-footer-value">{totalVendasTotais > 0 ? `${Math.round((totalEntrega / totalVendasTotais) * 100)}%` : '0%'}</strong>
                      </div>
                    </div>

                    {/* RETIRADA */}
                    <div className="entregues-stat-card card-fat-retirada">
                      <div className="stat-card-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="driver-name-tag" style={{ background: '#fef3c7', color: '#b45309' }}>
                          <ShoppingBag size={14} strokeWidth={2.4} />
                          <span>Retirada</span>
                        </span>
                        <button
                          type="button"
                          className="btn-fat-detalhes"
                          onClick={() => setModalDetalhesFat({
                            modalidade: 'retirada',
                            titulo: 'Retirada',
                            subtitulo: `Pedidos retirados no balcão (${rotuloPeriodoFat})`,
                            icone: 'ShoppingBag',
                            cor: '#b45309',
                            bgCor: '#fef3c7',
                            totalValor: totalRetirada,
                            totalPedidos: qtdRetirada,
                            ...calcularDiscriminacaoPagamento(pedidosRetirada, false)
                          })}
                        >
                          <span>Detalhes</span>
                        </button>
                      </div>
                      <div className="stat-card-body-primary">
                        <div className="stat-main-number-fat-sub" style={{ color: '#b45309' }}>R$ {formatarMoeda(totalRetirada)}</div>
                        <div className="stat-main-label">{formatarNumero(qtdRetirada)} {qtdRetirada === 1 ? 'pedido' : 'pedidos'}</div>
                      </div>
                      <div className="stat-card-divider"></div>
                      <div className="stat-card-footer-amount">
                        <span className="stat-footer-caption">Participação:</span>
                        <strong className="stat-footer-value">{totalVendasTotais > 0 ? `${Math.round((totalRetirada / totalVendasTotais) * 100)}%` : '0%'}</strong>
                      </div>
                    </div>

                    {/* MESA */}
                    <div className="entregues-stat-card card-fat-mesa">
                      <div className="stat-card-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="driver-name-tag" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                          <UtensilsCrossed size={14} strokeWidth={2.4} />
                          <span>Mesa</span>
                        </span>
                        <button
                          type="button"
                          className="btn-fat-detalhes"
                          onClick={() => setModalDetalhesFat({
                            modalidade: 'mesa',
                            titulo: 'Mesa',
                            subtitulo: `Consumo nas mesas do salão (${rotuloPeriodoFat})`,
                            icone: 'UtensilsCrossed',
                            cor: '#7e22ce',
                            bgCor: '#f3e8ff',
                            totalValor: totalMesa,
                            totalPedidos: qtdMesa,
                            ...calcularDiscriminacaoPagamento(pedidosMesa, false)
                          })}
                        >
                          <span>Detalhes</span>
                        </button>
                      </div>
                      <div className="stat-card-body-primary">
                        <div className="stat-main-number-fat-sub" style={{ color: '#7e22ce' }}>R$ {formatarMoeda(totalMesa)}</div>
                        <div className="stat-main-label">{formatarNumero(qtdMesa)} {qtdMesa === 1 ? 'pedido' : 'pedidos'}</div>
                      </div>
                      <div className="stat-card-divider"></div>
                      <div className="stat-card-footer-amount">
                        <span className="stat-footer-caption">Participação:</span>
                        <strong className="stat-footer-value">{totalVendasTotais > 0 ? `${Math.round((totalMesa / totalVendasTotais) * 100)}%` : '0%'}</strong>
                      </div>
                    </div>
                  </div>
                </div>



                {/* KANBAN COMPLETO IDÊNTICO À CENTRAL DE PEDIDOS */}
                <div className="anota-kanban-grid anota-kanban-grid-3col">
                  {/* COLUNA 1: EM PRODUÇÃO */}
                  <div className="kanban-col kanban-col-producao">
                    <div className="kanban-col-header header-producao">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <ChefHat size={16} strokeWidth={2.2} />
                        <span>Em produção</span>
                      </span>
                      <span className="kanban-col-count">{pedidosEmProducao.length}</span>
                    </div>
                    <div className="kanban-cards-body">
                      {pedidosEmProducao.length === 0 ? (
                        <div className="kanban-cards-empty">
                          <span>Nenhum pedido em produção no período.</span>
                        </div>
                      ) : (
                        <>
                          {(mostrarTodosProducao ? pedidosEmProducao : pedidosEmProducao.slice(0, 20)).map(p => renderOrderCard(p, 'producao'))}
                          {pedidosEmProducao.length > 20 && (
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                              <button
                                type="button"
                                className="cafe-pill-btn"
                                style={{ margin: '0 auto', fontSize: '12px', padding: '6px 14px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1' }}
                                onClick={() => setMostrarTodosProducao(prev => !prev)}
                              >
                                {mostrarTodosProducao ? 'Mostrar menos' : `Ver mais (+${pedidosEmProducao.length - 20} pedidos)`}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* COLUNA 2: PRONTOS */}
                  <div className="kanban-col kanban-col-pronto-local">
                    <div className="kanban-col-header header-pronto-local">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} strokeWidth={2.2} />
                        <span>Prontos para saída</span>
                      </span>
                      <span className="kanban-col-count">{pedidosProntos.length}</span>
                    </div>
                    <div className="kanban-cards-body">
                      {pedidosProntos.length === 0 ? (
                        <div className="kanban-cards-empty">
                          <span>Nenhum pedido pronto no período.</span>
                        </div>
                      ) : (
                        pedidosProntos.map(p => renderOrderCard(p, 'pronto'))
                      )}
                    </div>
                  </div>

                  {/* COLUNA 3: ENTREGUES / FINALIZADOS */}
                  <div className="kanban-col kanban-col-entregue">
                    <div className="kanban-col-header header-entregue">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCheck size={16} strokeWidth={2.2} />
                        <span>Entregues / Finalizados</span>
                      </span>
                      <span className="kanban-col-count">{pedidosEntregues.length}</span>
                    </div>
                    <div className="kanban-cards-body">
                      {pedidosEntregues.length === 0 ? (
                        <div className="kanban-cards-empty">
                          <span>Nenhum pedido entregue no período.</span>
                        </div>
                      ) : (
                        pedidosEntregues.slice(0, 40).map(p => renderOrderCard(p, 'entregue'))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="controle-view-root" key="controle-root">
                {/* 1. BARRA SUPERIOR DE FILTRO DE PERÍODO (Hoje, 7 dias, 30 dias) */}
                <div className="todos-pedidos-topbar" style={{ marginBottom: '20px' }}>
                  <div className="periodo-pills-row" style={{ margin: 0 }}>
                    <span className="periodo-pills-label">
                      <Calendar size={14} strokeWidth={2.2} />
                      <span>Filtrar por:</span>
                    </span>
                    <button
                      type="button"
                      className={`periodo-pill-btn ${filtroPeriodoTodosPedidos === 'hoje' ? 'active' : ''}`}
                      onClick={() => startTransitionPeriodo(() => setFiltroPeriodoTodosPedidos('hoje'))}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      className={`periodo-pill-btn ${filtroPeriodoTodosPedidos === '7dias' ? 'active' : ''}`}
                      onClick={() => startTransitionPeriodo(() => setFiltroPeriodoTodosPedidos('7dias'))}
                    >
                      7 dias
                    </button>
                    <button
                      type="button"
                      className={`periodo-pill-btn ${filtroPeriodoTodosPedidos === '30dias' ? 'active' : ''}`}
                      onClick={() => startTransitionPeriodo(() => setFiltroPeriodoTodosPedidos('30dias'))}
                    >
                      30 dias
                    </button>
                  </div>
                </div>

                {/* DADOS CALCULADOS DE CONTROLE */}
                {(() => {
                  const relControle = calcularRelatorioControle(pedidos, filtroPeriodoTodosPedidos)
                  const { metricasPaes, metricasGerais } = relControle
                  const totalPaes = metricasPaes.totalPaes || 0
                  const paesHamb = metricasPaes.paesHamburguer ?? metricasPaes.paesTradicionais ?? 0
                  const paesDog = metricasPaes.paesHotDog ?? metricasPaes.paesHotdogFrances ?? 0
                  const percHamb = totalPaes > 0 ? Math.round((paesHamb / totalPaes) * 100) : 0
                  const percDog = totalPaes > 0 ? Math.round((paesDog / totalPaes) * 100) : 0

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* CARD MASTER: CONSUMO TOTAL DE PÃES */}
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #fed7aa',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 16px rgba(234, 88, 12, 0.06)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                          marginBottom: '20px',
                          borderBottom: '1px solid #ffedd5',
                          paddingBottom: '14px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '12px',
                              background: '#fff7ed',
                              color: '#ea580c',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <UtensilsCrossed size={24} strokeWidth={2.2} />
                            </div>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                                Consumo Total de Pães
                              </h3>
                              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                                Contagem exata de pães demandados para produção no período ({rotuloPeriodoFat})
                              </p>
                            </div>
                          </div>

                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            gap: '8px',
                            background: '#fff7ed',
                            padding: '8px 18px',
                            borderRadius: '12px',
                            border: '1px solid #fed7aa'
                          }}>
                            <span style={{ fontSize: '28px', fontWeight: 900, color: '#ea580c', lineHeight: 1 }}>
                              {totalPaes}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#c2410c' }}>
                              pães no total
                            </span>
                          </div>
                        </div>

                        {/* SUB-CARDS DOS TIPOS DE PÃES (APENAS HAMBÚRGUER E HOT DOG) */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: '14px'
                        }}>
                          {/* PÃO DE HAMBÚRGUER */}
                          <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                                🍔 Pão Hambúrguer
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ea580c', background: '#ffedd5', padding: '2px 8px', borderRadius: '6px' }}>
                                {percHamb}%
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                              <span style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>
                                {paesHamb}
                              </span>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>unidades</span>
                            </div>
                            <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                              X-Burguer, Artesanais 150g/300g, Especiais, Bauru e tradicionais
                            </span>
                          </div>

                          {/* PÃO HOT DOG */}
                          <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                                🌭 Pão Hot Dog
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ea580c', background: '#ffedd5', padding: '2px 8px', borderRadius: '6px' }}>
                                {percDog}%
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                              <span style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>
                                {paesDog}
                              </span>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>unidades</span>
                            </div>
                            <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                              Cachorro-Quente e variações
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* GRID DE RESUMO GERAL DE ITENS */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '14px'
                      }}>
                        {/* 1. TOTAL DE LANCHES */}
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: '#ffedd5',
                            color: '#ea580c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Flame size={22} strokeWidth={2.4} />
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              Total de Lanches
                            </span>
                            <span style={{ display: 'block', fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>
                              {metricasGerais.totalLanches}
                            </span>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>
                              Normais, artesanais e combos
                            </span>
                          </div>
                        </div>

                        {/* 2. TOTAL DE COMBOS */}
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: '#ede9fe',
                            color: '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <ShoppingBag size={22} strokeWidth={2.4} />
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              Total de Combos
                            </span>
                            <span style={{ display: 'block', fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>
                              {metricasGerais.totalCombos}
                            </span>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>
                              Casal, Família, Amigos, etc.
                            </span>
                          </div>
                        </div>

                        {/* 3. TOTAL DE BEBIDAS */}
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: '#e0f2fe',
                            color: '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Store size={22} strokeWidth={2.4} />
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              Total de Bebidas
                            </span>
                            <span style={{ display: 'block', fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>
                              {metricasGerais.totalBebidas}
                            </span>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>
                              Refri, cervejas, sucos e águas
                            </span>
                          </div>
                        </div>

                        {/* 4. TOTAL DE ITENS VENDIDOS */}
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: '#dcfce7',
                            color: '#16a34a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Package size={22} strokeWidth={2.4} />
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              Itens Produzidos
                            </span>
                            <span style={{ display: 'block', fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>
                              {metricasGerais.totalItens}
                            </span>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>
                              Soma de todos os produtos
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SEÇÃO: TABELA DETALHADA DE ITENS VENDIDOS */}
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px'
                      }}>
                        {/* CABEÇALHO DA TABELA COM FILTROS DE CATEGORIA E BUSCA */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '14px',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '16px'
                        }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                              Detalhamento de Itens Vendidos
                            </h4>
                            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                              Lista completa de produtos demandados para a produção no período ({rotuloPeriodoFat})
                            </p>
                          </div>

                          {/* CAMPO DE BUSCA RÁPIDA DE ITEM */}
                          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
                            <Search size={16} strokeWidth={2.2} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                              type="text"
                              placeholder="Pesquisar produto na lista..."
                              value={buscaItemControle}
                              onChange={(e) => setBuscaItemControle(e.target.value)}
                              className="cafe-search-input"
                              style={{
                                width: '100%',
                                height: '38px',
                                paddingLeft: '36px',
                                paddingRight: buscaItemControle ? '32px' : '12px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13px'
                              }}
                            />
                            {buscaItemControle && (
                              <button
                                type="button"
                                onClick={() => setBuscaItemControle('')}
                                style={{
                                  position: 'absolute',
                                  right: '8px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#94a3b8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* PÍLULAS DE FILTRO POR CATEGORIA */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
                            Categoria:
                          </span>
                          {[
                            { id: 'todos', label: 'Todos os Itens' },
                            { id: 'lanches', label: '🍔 Lanches (Normais & Artesanais)' },
                            { id: 'combos', label: '🛍️ Combos' },
                            { id: 'bebidas', label: '🥤 Bebidas & Cervejas' },
                            { id: 'porcoes', label: '🍟 Batatas / Porções' },
                            { id: 'outros', label: '📦 Outros' }
                          ].map(cat => {
                            const isAtivo = filtroCategoriaControle === cat.id
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setFiltroCategoriaControle(cat.id)}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  border: isAtivo ? '1px solid #ea580c' : '1px solid #e2e8f0',
                                  background: isAtivo ? '#fff7ed' : '#ffffff',
                                  color: isAtivo ? '#ea580c' : '#475569',
                                  fontSize: '12.5px',
                                  fontWeight: isAtivo ? 700 : 500,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {cat.label}
                              </button>
                            )
                          })}
                        </div>

                        {/* FILTRAGEM DOS ITENS */}
                        {(() => {
                          const itensFiltrados = (relControle.listaItens || []).filter(item => {
                            // Filtro de texto
                            if (buscaItemControle.trim()) {
                              const t = buscaItemControle.toLowerCase().trim()
                              if (!item.nome.toLowerCase().includes(t) && !item.categoria.toLowerCase().includes(t)) {
                                return false
                              }
                            }
                            // Filtro de categoria
                            if (filtroCategoriaControle === 'lanches') {
                              return item.categoriaSlug === 'lanches_tradicionais' || item.categoriaSlug === 'artesanais' || item.categoriaSlug === 'hotdog_variados'
                            }
                            if (filtroCategoriaControle === 'combos') {
                              return item.categoriaSlug === 'combos'
                            }
                            if (filtroCategoriaControle === 'bebidas') {
                              return item.categoriaSlug === 'bebidas'
                            }
                            if (filtroCategoriaControle === 'porcoes') {
                              return item.categoriaSlug === 'porcoes'
                            }
                            if (filtroCategoriaControle === 'outros') {
                              return item.categoriaSlug === 'outros'
                            }
                            return true
                          })

                          if (itensFiltrados.length === 0) {
                            return (
                              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                                <Search size={32} strokeWidth={1.5} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#475569' }}>
                                  Nenhum item encontrado com os filtros atuais.
                                </p>
                                <small style={{ color: '#94a3b8' }}>Tente mudar o período ou limpar o termo de pesquisa.</small>
                              </div>
                            )
                          }

                          return (
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                <thead>
                                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Produto</th>
                                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Categoria</th>
                                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Tipo de Pão</th>
                                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Qtd. Vendida</th>
                                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Total Pães</th>
                                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Total (R$)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {itensFiltrados.map((item, idx) => {
                                    const rotuloPao = (item.tipoPao === 'hamburguer' || item.tipoPao === 'tradicional' || item.tipoPao === 'artesanal')
                                      ? '🍔 Pão Hambúrguer'
                                      : (item.tipoPao === 'hotdog' || item.tipoPao === 'hotdog_frances')
                                      ? '🌭 Pão Hot Dog'
                                      : '—'

                                    return (
                                      <tr key={idx} style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                                        transition: 'background 0.15s ease'
                                      }}>
                                        {/* PRODUTO */}
                                        <td style={{ padding: '12px', fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                                          {item.nome}
                                        </td>

                                        {/* CATEGORIA */}
                                        <td style={{ padding: '12px', fontSize: '12.5px', color: '#475569' }}>
                                          <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: '#f1f5f9',
                                            fontSize: '11.5px',
                                            fontWeight: 600,
                                            color: '#475569'
                                          }}>
                                            {item.categoria}
                                          </span>
                                        </td>

                                        {/* TIPO DE PÃO */}
                                        <td style={{ padding: '12px', fontSize: '12.5px', color: item.tipoPao ? '#c2410c' : '#94a3b8' }}>
                                          {rotuloPao}
                                        </td>

                                        {/* QTD VENDIDA */}
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                          <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minWidth: '32px',
                                            height: '26px',
                                            padding: '0 8px',
                                            borderRadius: '999px',
                                            background: '#f8fafc',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '13px',
                                            fontWeight: 800,
                                            color: '#0f172a'
                                          }}>
                                            {item.quantidade}
                                          </span>
                                        </td>

                                        {/* TOTAL PÃES */}
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                          {item.totalPaes > 0 ? (
                                            <span style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              minWidth: '32px',
                                              height: '26px',
                                              padding: '0 8px',
                                              borderRadius: '999px',
                                              background: '#fff7ed',
                                              border: '1px solid #fed7aa',
                                              fontSize: '13px',
                                              fontWeight: 800,
                                              color: '#ea580c'
                                            }}>
                                              {item.totalPaes}
                                            </span>
                                          ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: '13px' }}>—</span>
                                          )}
                                        </td>

                                        {/* TOTAL R$ */}
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                                          R$ {formatarMoeda(item.valorTotal)}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )
      }
