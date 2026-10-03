import React from 'react'

/**
 * Evita a "tela branca": se uma tela lançar erro ao renderizar, mostra um aviso
 * com botão de tentar novamente em vez de derrubar o aplicativo inteiro.
 * `resetKey` limpa o erro automaticamente quando muda (ex.: trocar de aba).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { erro: null }
  }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('[ErrorBoundary] Erro ao renderizar tela:', erro, info?.componentStack)
  }

  componentDidUpdate(prevProps) {
    if (this.state.erro && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ erro: null })
    }
  }

  render() {
    if (!this.state.erro) return this.props.children

    const emTelaCheia = this.props.telaCheia
    return (
      <div
        role="alert"
        style={{
          minHeight: emTelaCheia ? '100vh' : '260px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '24px',
          textAlign: 'center',
          color: '#0f172a',
          fontFamily: 'inherit'
        }}
      >
        <strong style={{ fontSize: '18px' }}>Algo deu errado ao abrir esta tela</strong>
        <span style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px' }}>
          Seus pedidos estão seguros. Tente novamente ou recarregue a página.
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => this.setState({ erro: null })}
            style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#f97316', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            Recarregar página
          </button>
        </div>
      </div>
    )
  }
}
