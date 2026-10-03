import React from 'react'
import {
  Bike,
  CheckCheck
} from 'lucide-react'

export default function EntreguesPage({
  emailUsuario,
  session,
  DRIVER_RENAN_ID,
  DRIVER_FELIPE_ID,
  pedidosFiltrados,
  isDriver,
  filtroEntregador,
  setFiltroEntregador,
  filtroPeriodoEntregues,
  formatarMoeda,
  formatarNumero,
  calcularDiscriminacaoPagamento,
  setModalDetalhesEntregador,
  renderOrderCard
}) {
            const isRenanDriver = (emailUsuario || '').toLowerCase().includes('renan') || session?.user?.id === DRIVER_RENAN_ID
            const driverNome = isRenanDriver ? 'Renan' : 'Felipe'
            const pedidosDoDriver = pedidosFiltrados
            const driverQtd = pedidosDoDriver.length
            const driverValor = pedidosDoDriver.reduce((soma, p) => soma + Number(p.delivery_fee || 0), 0)

            const entreguesRenan = pedidosFiltrados.filter(p => p.driver_id === DRIVER_RENAN_ID)
            const entreguesFelipe = pedidosFiltrados.filter(p => p.driver_id === DRIVER_FELIPE_ID)

            const renanQtd = entreguesRenan.length
            const renanValor = entreguesRenan.reduce((soma, p) => soma + Number(p.delivery_fee || 0), 0)

            const felipeQtd = entreguesFelipe.length
            const felipeValor = entreguesFelipe.reduce((soma, p) => soma + Number(p.delivery_fee || 0), 0)

            const totalQtdGeral = renanQtd + felipeQtd
            const totalValorGeral = renanValor + felipeValor

            const mostrarRenan = filtroEntregador === 'todos' || filtroEntregador === 'renan'
            const mostrarFelipe = filtroEntregador === 'todos' || filtroEntregador === 'felipe'

            const gridClass = (mostrarRenan && mostrarFelipe)
              ? "anota-kanban-grid"
              : "anota-kanban-grid kanban-grid-single"

            const rotuloPeriodo = filtroPeriodoEntregues === 'hoje'
              ? 'Hoje'
              : filtroPeriodoEntregues === '7dias'
              ? '7 dias'
              : '30 dias'

            return (
              <div className="entregues-view-container cafe-page-motion" key={`entregues-${filtroPeriodoEntregues}-${filtroEntregador}-${isDriver ? driverNome : 'dono'}`}>
                {/* TOPO: CARDS DE RESUMO FINANCEIRO E DE ENTREGAS */}
                {isDriver ? (
                  /* VISÃO DO ENTREGADOR LOGADO: EXCLUSIVAMENTE SUAS MÉTRICAS NO PERÍODO */
                  <div className="entregues-summary-single">
                    <div className={`entregues-stat-card card-single-driver ${isRenanDriver ? 'card-renan' : 'card-felipe'}`}>
                      <div className="stat-card-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`driver-name-tag ${isRenanDriver ? 'tag-renan' : 'tag-felipe'} prominent`}>
                          <Bike size={16} strokeWidth={2.4} />
                          <span>{driverNome}</span>
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="stat-period-tag">{rotuloPeriodo}</span>
                          <button
                            type="button"
                            className="btn-fat-detalhes"
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalDetalhesEntregador({
                                entregadorNome: driverNome,
                                titulo: `Entregas — ${driverNome}`,
                                subtitulo: `Entregas realizadas no período (${rotuloPeriodo})`,
                                icone: 'Bike',
                                cor: isRenanDriver ? '#0284c7' : '#16a34a',
                                bgCor: isRenanDriver ? '#e0f2fe' : '#dcfce7',
                                totalValor: driverValor,
                                totalPedidos: driverQtd,
                                ...calcularDiscriminacaoPagamento(pedidosDoDriver, false, true)
                              })
                            }}
                          >
                            <span>Detalhes</span>
                          </button>
                        </div>
                      </div>
                      <div className="stat-card-body-primary">
                        <div className="stat-main-number">{formatarNumero(driverQtd)}</div>
                        <div className="stat-main-label">{driverQtd === 1 ? 'entrega realizada' : 'entregas realizadas'}</div>
                      </div>
                      <div className="stat-card-divider"></div>
                      <div className="stat-card-footer-amount">
                        <span className="stat-footer-caption">Total em Taxas:</span>
                        <strong className="stat-footer-value">R$ {formatarMoeda(driverValor)}</strong>
                      </div>
                    </div>
                  </div>
                ) : filtroEntregador === 'todos' ? (
                  <div className="entregues-summary-grid">
                    {/* CARD LADO ESQUERDO: TOTAL GERAL */}
                    <div className="entregues-stat-card card-total-geral">
                      <div className="stat-card-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-pill-label">Total Geral</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="stat-period-tag">{rotuloPeriodo}</span>
                          <button
                            type="button"
                            className="btn-fat-detalhes"
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalDetalhesEntregador({
                                entregadorNome: 'Total Geral',
                                titulo: 'Total Geral de Entregas',
                                subtitulo: `Todas as entregas do período (${rotuloPeriodo})`,
                                icone: 'Bike',
                                cor: '#0f172a',
                                bgCor: '#f1f5f9',
                                totalValor: totalValorGeral,
                                totalPedidos: totalQtdGeral,
                                ...calcularDiscriminacaoPagamento(pedidosFiltrados, false, true)
                              })
                            }}
                          >
                            <span>Detalhes</span>
                          </button>
                        </div>
                      </div>
                      <div className="stat-card-body-primary">
                        <div className="stat-main-number">{formatarNumero(totalQtdGeral)}</div>
                        <div className="stat-main-label">{totalQtdGeral === 1 ? 'entrega realizada' : 'entregas realizadas'}</div>
                      </div>
                      <div className="stat-card-divider"></div>
                      <div className="stat-card-footer-amount">
                        <span className="stat-footer-caption">Total em Taxas:</span>
                        <strong className="stat-footer-value">R$ {formatarMoeda(totalValorGeral)}</strong>
                      </div>
                    </div>

                    {/* CARDS LADO DIREITO: RENAN E FELIPE */}
                    <div className="entregues-drivers-cards-row">
                      {/* RENAN */}
                      <div
                        className="entregues-stat-card card-driver-item card-renan"
                        onClick={() => setFiltroEntregador('renan')}
                        title="Filtrar somente entregas do Renan"
                        role="button"
                        tabIndex={0}
                      >
                        <div className="stat-card-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="driver-name-tag tag-renan">
                            <Bike size={14} strokeWidth={2.4} />
                            <span>Renan</span>
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="stat-period-tag">{rotuloPeriodo}</span>
                            <button
                              type="button"
                              className="btn-fat-detalhes"
                              onClick={(e) => {
                                e.stopPropagation()
                                setModalDetalhesEntregador({
                                  entregadorNome: 'Renan',
                                  titulo: 'Entregas por Renan',
                                  subtitulo: `Entregas realizadas no período (${rotuloPeriodo})`,
                                  icone: 'Bike',
                                  cor: '#0284c7',
                                  bgCor: '#e0f2fe',
                                  totalValor: renanValor,
                                  totalPedidos: renanQtd,
                                  ...calcularDiscriminacaoPagamento(entreguesRenan, false, true)
                                })
                              }}
                            >
                              <span>Detalhes</span>
                            </button>
                          </div>
                        </div>
                        <div className="stat-card-body-primary">
                          <div className="stat-main-number">{formatarNumero(renanQtd)}</div>
                          <div className="stat-main-label">{renanQtd === 1 ? 'entrega' : 'entregas'}</div>
                        </div>
                        <div className="stat-card-divider"></div>
                        <div className="stat-card-footer-amount">
                          <span className="stat-footer-caption">Total em Taxas:</span>
                          <strong className="stat-footer-value">R$ {formatarMoeda(renanValor)}</strong>
                        </div>
                      </div>

                      {/* FELIPE */}
                      <div
                        className="entregues-stat-card card-driver-item card-felipe"
                        onClick={() => setFiltroEntregador('felipe')}
                        title="Filtrar somente entregas do Felipe"
                        role="button"
                        tabIndex={0}
                      >
                        <div className="stat-card-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="driver-name-tag tag-felipe">
                            <Bike size={14} strokeWidth={2.4} />
                            <span>Felipe</span>
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="stat-period-tag">{rotuloPeriodo}</span>
                            <button
                              type="button"
                              className="btn-fat-detalhes"
                              onClick={(e) => {
                                e.stopPropagation()
                                setModalDetalhesEntregador({
                                  entregadorNome: 'Felipe',
                                  titulo: 'Entregas por Felipe',
                                  subtitulo: `Entregas realizadas no período (${rotuloPeriodo})`,
                                  icone: 'Bike',
                                  cor: '#16a34a',
                                  bgCor: '#dcfce7',
                                  totalValor: felipeValor,
                                  totalPedidos: felipeQtd,
                                  ...calcularDiscriminacaoPagamento(entreguesFelipe, false, true)
                                })
                              }}
                            >
                              <span>Detalhes</span>
                            </button>
                          </div>
                        </div>
                        <div className="stat-card-body-primary">
                          <div className="stat-main-number">{formatarNumero(felipeQtd)}</div>
                          <div className="stat-main-label">{felipeQtd === 1 ? 'entrega' : 'entregas'}</div>
                        </div>
                        <div className="stat-card-divider"></div>
                        <div className="stat-card-footer-amount">
                          <span className="stat-footer-caption">Total em Taxas:</span>
                          <strong className="stat-footer-value">R$ {formatarMoeda(felipeValor)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : filtroEntregador === 'renan' ? (
                  /* QUANDO CLICAR NO RENAN: MOSTRA SOMENTE O DELE NO TOPO */
                  <div className="entregues-summary-single">
                    <div className="entregues-stat-card card-single-driver card-renan">
                      <div className="stat-card-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="driver-name-tag tag-renan prominent">
                          <Bike size={16} strokeWidth={2.4} />
                          <span>Renan</span>
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="stat-period-tag">{rotuloPeriodo}</span>
                          <button
                            type="button"
                            className="btn-fat-detalhes"
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalDetalhesEntregador({
                                entregadorNome: 'Renan',
                                titulo: 'Entregas por Renan',
                                subtitulo: `Entregas realizadas no período (${rotuloPeriodo})`,
                                icone: 'Bike',
                                cor: '#0284c7',
                                bgCor: '#e0f2fe',
                                totalValor: renanValor,
                                totalPedidos: renanQtd,
                                ...calcularDiscriminacaoPagamento(entreguesRenan, false, true)
                              })
                            }}
                          >
                            <span>Detalhes</span>
                          </button>
                          <button
                            type="button"
                            className="btn-clear-single-driver"
                            onClick={() => setFiltroEntregador('todos')}
                            title="Voltar para todos"
                          >
                            Ver todos
                          </button>
                        </div>
                      </div>
                      <div className="stat-card-body-primary">
                        <div className="stat-main-number">{formatarNumero(renanQtd)}</div>
                        <div className="stat-main-label">{renanQtd === 1 ? 'entrega realizada' : 'entregas realizadas'}</div>
                      </div>
                      <div className="stat-card-divider"></div>
                      <div className="stat-card-footer-amount">
                        <span className="stat-footer-caption">Total em Taxas:</span>
                        <strong className="stat-footer-value">R$ {formatarMoeda(renanValor)}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* QUANDO CLICAR NO FELIPE: MOSTRA SOMENTE O DELE NO TOPO */
                  <div className="entregues-summary-single">
                    <div className="entregues-stat-card card-single-driver card-felipe">
                      <div className="stat-card-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="driver-name-tag tag-felipe prominent">
                          <Bike size={16} strokeWidth={2.4} />
                          <span>Felipe</span>
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="stat-period-tag">{rotuloPeriodo}</span>
                          <button
                            type="button"
                            className="btn-fat-detalhes"
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalDetalhesEntregador({
                                entregadorNome: 'Felipe',
                                titulo: 'Entregas por Felipe',
                                subtitulo: `Entregas realizadas no período (${rotuloPeriodo})`,
                                icone: 'Bike',
                                cor: '#16a34a',
                                bgCor: '#dcfce7',
                                totalValor: felipeValor,
                                totalPedidos: felipeQtd,
                                ...calcularDiscriminacaoPagamento(entreguesFelipe, false, true)
                              })
                            }}
                          >
                            <span>Detalhes</span>
                          </button>
                          <button
                            type="button"
                            className="btn-clear-single-driver"
                            onClick={() => setFiltroEntregador('todos')}
                            title="Voltar para todos"
                          >
                            Ver todos
                          </button>
                        </div>
                      </div>
                      <div className="stat-card-body-primary">
                        <div className="stat-main-number">{formatarNumero(felipeQtd)}</div>
                        <div className="stat-main-label">{felipeQtd === 1 ? 'entrega realizada' : 'entregas realizadas'}</div>
                      </div>
                      <div className="stat-card-divider"></div>
                      <div className="stat-card-footer-amount">
                        <span className="stat-footer-caption">Total em Taxas:</span>
                        <strong className="stat-footer-value">R$ {formatarMoeda(felipeValor)}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* EMBAIXO: AS ENTREGAS NORMALMENTE */}
                {isDriver ? (
                  /* VISÃO DO ENTREGADOR: APENAS A SUA COLUNA OCUPANDO 100% DA LARGURA */
                  <div className="anota-kanban-grid kanban-grid-single">
                    <div className={`kanban-col ${isRenanDriver ? 'kanban-col-entregue-renan' : 'kanban-col-entregue-felipe'}`}>
                      <div className={`kanban-col-header ${isRenanDriver ? 'header-entregue-renan' : 'header-entregue-felipe'}`}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Bike size={16} strokeWidth={2.2} />
                          <span>Entregues por {driverNome}</span>
                        </span>
                        <span className="kanban-col-count">{driverQtd}</span>
                      </div>
                      <div className="kanban-cards-body">
                        {pedidosDoDriver.length === 0 ? (
                          <div className="kanban-cards-empty">
                            <div className="kanban-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                              <CheckCheck size={36} strokeWidth={1.5} color="#cbd5e1" />
                            </div>
                            <span>Nenhuma entrega ({rotuloPeriodo.toLowerCase()}).</span>
                            <small style={{ color: '#94a3b8' }}>Pedidos entregues por você aparecerão aqui</small>
                          </div>
                        ) : (
                          pedidosDoDriver.map(p => renderOrderCard(p, 'entregue'))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={gridClass}>
                    {/* COLUNA: ENTREGUES POR RENAN */}
                    {mostrarRenan && (
                      <div className="kanban-col kanban-col-entregue-renan">
                        <div className="kanban-col-header header-entregue-renan">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Bike size={16} strokeWidth={2.2} />
                            <span>Entregues por Renan</span>
                          </span>
                          <span className="kanban-col-count">{entreguesRenan.length}</span>
                        </div>
                        <div className="kanban-cards-body">
                          {entreguesRenan.length === 0 ? (
                            <div className="kanban-cards-empty">
                              <div className="kanban-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                                <CheckCheck size={36} strokeWidth={1.5} color="#cbd5e1" />
                              </div>
                              <span>Nenhuma entrega de Renan ({rotuloPeriodo.toLowerCase()}).</span>
                              <small style={{ color: '#94a3b8' }}>Pedidos despachados para Renan aparecerão aqui</small>
                            </div>
                          ) : (
                            entreguesRenan.map(p => renderOrderCard(p, 'entregue'))
                          )}
                        </div>
                      </div>
                    )}

                    {/* COLUNA: ENTREGUES POR FELIPE */}
                    {mostrarFelipe && (
                      <div className="kanban-col kanban-col-entregue-felipe">
                        <div className="kanban-col-header header-entregue-felipe">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Bike size={16} strokeWidth={2.2} />
                            <span>Entregues por Felipe</span>
                          </span>
                          <span className="kanban-col-count">{entreguesFelipe.length}</span>
                        </div>
                        <div className="kanban-cards-body">
                          {entreguesFelipe.length === 0 ? (
                            <div className="kanban-cards-empty">
                              <div className="kanban-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                                <CheckCheck size={36} strokeWidth={1.5} color="#cbd5e1" />
                              </div>
                              <span>Nenhuma entrega de Felipe ({rotuloPeriodo.toLowerCase()}).</span>
                              <small style={{ color: '#94a3b8' }}>Pedidos despachados para Felipe aparecerão aqui</small>
                            </div>
                          ) : (
                            entreguesFelipe.map(p => renderOrderCard(p, 'entregue'))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          }
