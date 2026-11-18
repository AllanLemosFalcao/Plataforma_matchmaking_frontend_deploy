import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { CabecalhoPagina } from '../components/CabecalhoPagina'
import { FotoPerfil } from '../components/FotoPerfil'
import { IconeCadeado } from '../components/icones'
import { Botao, Cartao, Selo, Tag } from '../components/ui'
import { ESTAGIOS, SEGMENTOS } from '../constants'
import { useAuth } from '../contexts/auth'
import * as api from '../services/api'
import type { FiltrosBusca, Perfil } from '../types'
import { formatarReais } from '../utils/formatar'
import { compatibilidadeVisual, destaque } from '../utils/perfil'

const filtroClasses =
  'w-full min-w-0 rounded-xl border border-borda bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-(--acento) sm:px-5 sm:py-4 sm:text-base'

function Filtro({
  valor,
  onChange,
  todos,
  opcoes,
  bloqueado = false,
  onClickBloqueado,
}: {
  valor: string
  onChange: (v: string) => void
  todos: string
  opcoes: readonly string[]
  bloqueado?: boolean
  onClickBloqueado?: () => void
}) {
  if (bloqueado) {
    return (
      <button
        type="button"
        onClick={onClickBloqueado}
        title="Filtro exclusivo do plano Premium"
        className={`${filtroClasses} flex items-center justify-between gap-2 bg-zinc-900/60 text-left text-zinc-400 opacity-80 hover:border-rosa/60 hover:text-white transition cursor-pointer`}
      >
        <span className="truncate">{todos}</span>
        <IconeCadeado width={16} height={16} className="shrink-0 text-rosa" />
      </button>
    )
  }

  return (
    <select
      aria-label={todos}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className={`${filtroClasses} appearance-none bg-fundo`}
    >
      <option value="" className="bg-zinc-900 text-white">
        {todos}
      </option>
      {opcoes.map((o) => (
        <option key={o} className="bg-zinc-900 text-white">
          {o}
        </option>
      ))}
    </select>
  )
}

export function Buscar() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [filtros, setFiltros] = useState<FiltrosBusca>({ texto: '', segmento: '', localizacao: '', estagio: '' })
  const [resultados, setResultados] = useState<Perfil[] | null>(null)
  const [locais, setLocais] = useState<string[]>([])

  const [enviados, setEnviados] = useState<Set<string>>(new Set())
  const [recebidos, setRecebidos] = useState<Set<string>>(new Set())
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [carregandoAcao, setCarregandoAcao] = useState<string | null>(null)
  const [avisoPlano, setAvisoPlano] = useState('')

  const ehPremium = usuario?.plano === 'premium'
  const totalMatches = Object.keys(matches).length
  const atingiuLimiteMatches = !ehPremium && totalMatches >= 3

  useEffect(() => {
    if (!usuario) return
    api.listarLocalizacoes(usuario.papel).then(setLocais)
    api.interessesEnviados(usuario.id).then((ids) => setEnviados(new Set(ids)))
    api.interessesPendentes(usuario.id).then((lista) => setRecebidos(new Set(lista.map((p) => p.id))))
    api
      .listarMatches(usuario.id)
      .then((lista) => setMatches(Object.fromEntries(lista.map(({ match, outro }) => [outro.id, match.id]))))
  }, [usuario])

  useEffect(() => {
    if (!usuario) return
    let atual = true
    api.buscar(usuario, filtros).then((r) => atual && setResultados(r))
    return () => {
      atual = false
    }
  }, [usuario, filtros])

  if (!usuario) return null
  const buscaStartups = usuario.papel === 'investidor'
  const mudar = (campos: Partial<FiltrosBusca>) => setFiltros((f) => ({ ...f, ...campos }))

  async function registrar(alvo: Perfil) {
    if (!usuario) return
    setAvisoPlano('')
    setCarregandoAcao(alvo.id)
    try {
      const match = await api.registrarInteresse(usuario.id, alvo.id)
      if (match) {
        setMatches((m) => ({ ...m, [alvo.id]: match.id }))
      } else {
        setEnviados((s) => new Set(s).add(alvo.id))
      }
    } catch (err) {
      setAvisoPlano((err as Error).message)
    } finally {
      setCarregandoAcao(null)
    }
  }

  async function aceitar(alvoId: string) {
    setAvisoPlano('')
    setCarregandoAcao(alvoId)
    try {
      const match = await api.aceitarPendente(alvoId)
      if (match) {
        setMatches((m) => ({ ...m, [alvoId]: match.id }))
        setRecebidos((prev) => {
          const next = new Set(prev)
          next.delete(alvoId)
          return next
        })
      }
    } catch (err) {
      setAvisoPlano((err as Error).message)
    } finally {
      setCarregandoAcao(null)
    }
  }

  return (
    <>
      <CabecalhoPagina
        titulo={buscaStartups ? 'Buscar startups' : 'Buscar investidores'}
        subtitulo="Filtre por critérios relevantes e registre interesse em quem fizer sentido"
      />

      <Cartao className="p-3 sm:p-6">
        <div className="grid gap-2 sm:grid-cols-3 sm:gap-5 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <input
            type="search"
            placeholder="Buscar por nome ou descrição."
            value={filtros.texto}
            onChange={(e) => mudar({ texto: e.target.value })}
            className={`${filtroClasses} bg-zinc-900 placeholder:text-zinc-300 sm:col-span-3 lg:col-span-1`}
          />
          <Filtro
            valor={filtros.segmento}
            onChange={(v) => mudar({ segmento: v })}
            todos="Todos os segmentos"
            opcoes={SEGMENTOS}
            bloqueado={!ehPremium}
            onClickBloqueado={() => navigate('/planos')}
          />
          <Filtro
            valor={filtros.localizacao}
            onChange={(v) => mudar({ localizacao: v })}
            todos="Todos os locais"
            opcoes={locais}
            bloqueado={!ehPremium}
            onClickBloqueado={() => navigate('/planos')}
          />
          <Filtro
            valor={filtros.estagio}
            onChange={(v) => mudar({ estagio: v })}
            todos="Todos os estágios"
            opcoes={ESTAGIOS}
            bloqueado={!ehPremium}
            onClickBloqueado={() => navigate('/planos')}
          />
        </div>

        {!ehPremium && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-borda/60 pt-3 text-xs sm:text-sm text-zinc-300">
            <span className="flex items-center gap-2">
              <IconeCadeado width={16} height={16} className="text-rosa shrink-0" />
              Filtros avançados, perfis acima de 40% de aderência e matches ilimitados são exclusivos do Premium (uso atual: {totalMatches}/3 matches).
            </span>
            <Link to="/planos" className="font-semibold text-rosa hover:underline">
              Fazer upgrade →
            </Link>
          </div>
        )}
      </Cartao>

      {(avisoPlano || atingiuLimiteMatches) && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rosa/40 bg-rosa/10 px-6 py-4 text-sm text-white">
          <p>
            {avisoPlano ||
              'Você atingiu o limite de 3 matches do plano Gratuito. Assine o Premium para continuar conectando!'}
          </p>
          <Botao variante="rosa" onClick={() => navigate('/planos')}>
            Assinar Premium
          </Botao>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {resultados === null && <p className="text-suave">Carregando…</p>}
        {resultados?.length === 0 && <p className="text-suave">Nenhum resultado com esses filtros.</p>}

        {resultados?.map((p) => {
          const matchId = matches[p.id]
          const isRecebido = recebidos.has(p.id)
          const isEnviado = enviados.has(p.id)
          const trancado = Boolean(p.bloqueadoPlano) || (!ehPremium && (p.score ?? 0) > 40 && !matchId)

          if (trancado) {
            return (
              <Cartao
                key={p.id}
                className="relative flex flex-col gap-6 p-6 sm:flex-row sm:p-11 border-rosa/30 bg-zinc-900/40"
              >
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-rosa/40 bg-rosa/15 text-rosa">
                  <IconeCadeado width={26} height={26} />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold select-none blur-[5px]" aria-hidden>
                      {p.papel === 'startup' ? 'Startup Alta Aderência' : 'Investidor Qualificado'}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rosa/40 bg-rosa/15 px-3 py-1 text-xs font-bold text-rosa">
                      <IconeCadeado width={13} height={13} /> Exclusivo Premium (40%+)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {p.papel === 'startup' ? (
                      <>
                        <Tag>{p.segmento}</Tag>
                        <Tag>{p.estagio}</Tag>
                      </>
                    ) : (
                      p.segmentosInteresse.slice(0, 3).map((s) => <Tag key={s}>{s}</Tag>)
                    )}
                    <Tag>{p.localizacao}</Tag>
                  </div>

                  <p className="max-w-2xl text-base text-zinc-400">
                    {p.papel === 'startup' ? p.descricao : p.tese}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                  <div className="flex flex-wrap justify-end gap-2">
                    {p.score !== undefined && compatibilidadeVisual(p.score) && (
                      <span className="px-3 py-1 rounded-full bg-rosa/20 text-rosa text-sm font-semibold border border-rosa/40 shadow-lg">
                        {compatibilidadeVisual(p.score)}
                      </span>
                    )}
                    {p.papel === 'startup' && <Selo>{destaque(p)}</Selo>}
                  </div>

                  <Botao
                    variante="rosa"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                    onClick={() => navigate('/planos')}
                  >
                    <IconeCadeado width={16} height={16} />
                    Desbloquear no Premium
                  </Botao>
                </div>
              </Cartao>
            )
          }

          return (
            <Cartao key={p.id} className="flex flex-col gap-6 p-6 sm:flex-row sm:p-11">
              <button
                type="button"
                onClick={() => navigate(`/perfil/${p.id}`)}
                className="shrink-0 transition hover:opacity-80 focus:outline-none"
                aria-label={`Ver perfil de ${p.nome}`}
              >
                <FotoPerfil perfil={p} tamanho="md" />
              </button>

              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold">{p.nome}</h2>
                  {matchId ? (
                    <span className="rounded-full bg-lima/20 text-lima px-3 py-1 text-xs font-bold border border-lima/30">
                      🔥 Match
                    </span>
                  ) : isRecebido ? (
                    <span className="rounded-full bg-(--acento)/20 text-(--acento) px-3 py-1 text-xs font-bold border border-(--acento)/30">
                      👀 Quer conectar
                    </span>
                  ) : isEnviado ? (
                    <span className="rounded-full bg-white/10 text-suave px-3 py-1 text-xs font-bold border border-white/20">
                      ⏳ Pendente
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {p.papel === 'startup' ? (
                    <>
                      <Tag>{p.segmento}</Tag>
                      <Tag>{p.estagio}</Tag>
                    </>
                  ) : (
                    p.segmentosInteresse.slice(0, 3).map((s) => <Tag key={s}>{s}</Tag>)
                  )}
                  <Tag>{p.localizacao}</Tag>
                </div>
                <p className="max-w-2xl text-lg text-zinc-300">{p.papel === 'startup' ? p.descricao : p.tese}</p>
                <p className="text-lg font-semibold text-zinc-300">
                  {p.papel === 'startup' ? `Busca ${formatarReais(p.valorInvestimento)}` : `Investe ${destaque(p)}`}
                </p>
              </div>

              <div className="flex flex-col items-end justify-start gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                <div className="flex flex-wrap justify-end gap-2">
                  {p.score !== undefined && compatibilidadeVisual(p.score) && (
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20 shadow-lg">
                      {compatibilidadeVisual(p.score)}
                    </span>
                  )}
                  {p.papel === 'startup' && <Selo>{destaque(p)}</Selo>}
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-auto mt-auto">
                  <Botao variante="contorno" onClick={() => navigate(`/perfil/${p.id}`)}>
                    Ver perfil
                  </Botao>
                  {matchId ? (
                    <Botao variante="branco" onClick={() => navigate(`/conversas/${matchId}`)}>
                      Ir para conversa
                    </Botao>
                  ) : isRecebido ? (
                    <Botao
                      onClick={() => (atingiuLimiteMatches ? navigate('/planos') : aceitar(p.id))}
                      disabled={carregandoAcao === p.id}
                    >
                      {atingiuLimiteMatches
                        ? 'Limite 3/3 — Ver Premium'
                        : carregandoAcao === p.id
                          ? 'Aceitando...'
                          : 'Aceitar e Conectar'}
                    </Botao>
                  ) : isEnviado ? (
                    <Botao variante="contorno" disabled>
                      Interesse registrado
                    </Botao>
                  ) : (
                    <Botao
                      variante={buscaStartups ? 'rosa' : 'acento'}
                      onClick={() => (atingiuLimiteMatches ? navigate('/planos') : registrar(p))}
                      disabled={carregandoAcao === p.id}
                    >
                      {atingiuLimiteMatches
                        ? 'Limite 3/3 — Ver Premium'
                        : carregandoAcao === p.id
                          ? 'Registrando...'
                          : 'Registrar interesse'}
                    </Botao>
                  )}
                </div>
              </div>
            </Cartao>
          )
        })}
      </div>
    </>
  )
}