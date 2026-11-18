import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../contexts/auth'
import type { Plano } from '../types'
import { Balao } from './Balao'
import { Botao } from './ui'

const planos: Array<{
  id: Plano
  nome: string
  preco: string
  sufixo?: string
  cor: string
  itens: string[]
}> = [
  {
    id: 'basico',
    nome: 'Gratuito',
    preco: 'R$ 0',
    cor: 'text-lima',
    itens: [
      'Cadastro e perfil completo',
      'Busca básica por palavra-chave',
      'Visualização de perfis com até 40% de aderência',
      'Direito a realizar até 3 matches',
    ],
  },
  {
    id: 'premium',
    nome: 'Premium',
    preco: 'R$ 49',
    sufixo: '/mês',
    cor: 'text-rosa',
    itens: [
      'Filtros avançados na busca (segmento, local e estágio)',
      'Visualização total incluindo perfis 40%+ de aderência',
      'Matches e conexões ilimitados',
      'Recomendações de alta aderência desbloqueadas',
      'Destaque e maior visibilidade na plataforma',
    ],
  },
]

export function Planos({ className = 'bg-fundo' }: { className?: string }) {
  const { usuario, alterarPlano } = useAuth()
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState<Plano | null>(null)
  const [mensagem, setMensagem] = useState('')

  const planoAtual: Plano = usuario?.plano ?? 'basico'

  async function escolherPlano(novoPlano: Plano) {
    if (!usuario) {
      navigate('/cadastro')
      return
    }
    setCarregando(novoPlano)
    setMensagem('')
    try {
      await alterarPlano(novoPlano)
      setMensagem(
        novoPlano === 'premium'
          ? 'Parabéns! Sua conta agora é Premium com acesso ilimitado.'
          : 'Sua conta voltou para o plano Gratuito.',
      )
    } finally {
      setCarregando(null)
    }
  }

  return (
    <div>
      {mensagem && (
        <div className="mb-6 rounded-2xl border border-lima/40 bg-lima/10 px-5 py-3 text-center text-sm font-medium text-lima">
          {mensagem}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 md:gap-16">
        {planos.map((p) => {
          const ativo = Boolean(usuario) && planoAtual === p.id

          return (
            <Balao
              key={p.nome}
              className={`${className} flex flex-col justify-between px-10 py-12 text-white sm:px-14`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className={`titulo text-xl uppercase ${p.cor}`}>{p.nome}</p>
                  {ativo && (
                    <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold">
                      Plano atual
                    </span>
                  )}
                </div>

                <p className="titulo mt-1 text-5xl sm:text-6xl">
                  {p.preco}
                  {p.sufixo && <span className="ml-1 text-xl text-zinc-400">{p.sufixo}</span>}
                </p>

                <ul className="mt-6 list-disc space-y-2 pl-5 text-lg font-bold">
                  {p.itens.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 pt-4">
                {!usuario ? (
                  <Botao
                    variante={p.id === 'premium' ? 'rosa' : 'contorno'}
                    className="w-full py-3"
                    onClick={() => navigate('/cadastro')}
                  >
                    {p.id === 'premium' ? 'Começar com Premium' : 'Começar grátis'}
                  </Botao>
                ) : ativo ? (
                  <Botao variante="contorno" className="w-full py-3" disabled>
                    Assinatura ativa
                  </Botao>
                ) : (
                  <Botao
                    variante={p.id === 'premium' ? 'rosa' : 'contorno'}
                    className="w-full py-3"
                    disabled={carregando !== null}
                    onClick={() => escolherPlano(p.id)}
                  >
                    {carregando === p.id
                      ? 'Atualizando…'
                      : p.id === 'premium'
                        ? 'Fazer upgrade para Premium'
                        : 'Mudar para o plano Gratuito'}
                  </Botao>
                )}
              </div>
            </Balao>
          )
        })}
      </div>
    </div>
  )
}