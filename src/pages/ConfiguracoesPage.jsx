import React from 'react'
import {
  User,
  Lock,
  Check,
  X,
  Camera,
  LogOut,
  Trash2,
  KeyRound,
  ClipboardList
} from 'lucide-react'

export default function ConfiguracoesPage({
  emailUsuario,
  nomeUsuario,
  fotoPropria,
  atualizarFotoPropria,
  removerFotoPropria,
  novaSenha,
  setNovaSenha,
  confirmarNovaSenha,
  setConfirmarNovaSenha,
  handleTrocarSenha,
  salvandoSenha,
  msgSenha,
  sair
}) {
            return (
              <div className="config-page-container cafe-page-motion" key="config-geral">
                <div className="config-cards-grid">
                  {/* CARD DE PERSONALIZAÇÃO E PERFIL (CADA USUÁRIO EDITA O SEU PRÓPRIO) */}
                  <div className="config-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="config-card-header">
                      <div className="config-card-icon-wrap" style={{ background: '#ffedd5', color: '#ea580c' }}>
                        <User size={20} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h4 className="config-card-title">Personalização</h4>
                        <p className="config-card-subtitle">
                          Gerencie sua foto de perfil e a senha da sua conta.
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '20px',
                      marginTop: '16px'
                    }}>
                      {/* SUB-BLOCO 1: PERFIL COM E-MAIL */}
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ margin: '0 0 14px', fontSize: '13.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Perfil
                        </h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                          <div className="config-owner-avatar-wrap" style={{ width: '64px', height: '64px' }}>
                            {fotoPropria ? (
                              <img src={fotoPropria} alt={nomeUsuario} className="config-owner-avatar-img" />
                            ) : (
                              <div className="config-owner-avatar-placeholder" style={{ fontSize: '24px' }}>
                                {(nomeUsuario || 'U')[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a' }}>{nomeUsuario}</strong>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                              {emailUsuario}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <input
                            type="file"
                            id="upload-avatar-proprio"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={atualizarFotoPropria}
                          />
                          <label htmlFor="upload-avatar-proprio" className="cafe-pill-btn" style={{ cursor: 'pointer', margin: 0 }}>
                            <Camera size={14} strokeWidth={2} />
                            <span>{fotoPropria ? 'Trocar Foto' : 'Adicionar Foto'}</span>
                          </label>
                          {fotoPropria && (
                            <button
                              type="button"
                              className="cafe-pill-btn"
                              style={{ background: '#fef2f2', color: '#ef4444', borderColor: '#fecaca' }}
                              onClick={removerFotoPropria}
                              title="Remover foto de perfil"
                            >
                              <Trash2 size={14} strokeWidth={2} />
                              <span>Remover</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* SUB-BLOCO 3: SENHA */}
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ margin: '0 0 14px', fontSize: '13.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Segurança e Senha
                        </h5>
                        <form onSubmit={handleTrocarSenha} className="config-password-form">
                          <div className="config-form-group">
                            <label className="config-form-label">
                              <Lock size={14} strokeWidth={2} />
                              <span>Nova Senha</span>
                            </label>
                            <input
                              type="password"
                              className="cafe-search-input"
                              style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                              placeholder="Mínimo de 6 caracteres"
                              value={novaSenha}
                              onChange={(e) => setNovaSenha(e.target.value)}
                              required
                            />
                          </div>

                          <div className="config-form-group">
                            <label className="config-form-label">
                              <Lock size={14} strokeWidth={2} />
                              <span>Confirmar Nova Senha</span>
                            </label>
                            <input
                              type="password"
                              className="cafe-search-input"
                              style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                              placeholder="Repita a nova senha"
                              value={confirmarNovaSenha}
                              onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                              required
                            />
                          </div>

                          {msgSenha && (
                            <div className={`config-alert ${msgSenha.tipo === 'sucesso' ? 'config-alert-success' : 'config-alert-error'}`}>
                              {msgSenha.tipo === 'sucesso' ? <Check size={16} strokeWidth={2.5} /> : <X size={16} strokeWidth={2.5} />}
                              <span>{msgSenha.texto}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            className="btn-salvar-senha"
                            disabled={salvandoSenha}
                          >
                            <KeyRound size={16} strokeWidth={2.4} />
                            <span>{salvandoSenha ? 'Atualizando Senha...' : 'Salvar Nova Senha'}</span>
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* BOTÃO PARA SAIR DA CONTA NO FINAL DA PÁGINA DE AJUSTES (EXCLUSIVO PARA CELULAR) */}
                    <div className="btn-sair-ajustes-mobile" style={{ marginTop: '24px', paddingBottom: '24px' }}>
                      <button
                        type="button"
                        onClick={sair}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          padding: '14px 20px',
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1.5px solid #fecaca',
                          borderRadius: '12px',
                          fontSize: '15px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)',
                          transition: 'all 0.2s ease',
                          boxSizing: 'border-box'
                        }}
                      >
                        <LogOut size={18} strokeWidth={2.4} />
                        <span>Sair da Conta</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
}

