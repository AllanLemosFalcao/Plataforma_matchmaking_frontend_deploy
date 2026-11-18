import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { CabecalhoPagina } from '../components/CabecalhoPagina'
import { FotoPerfil } from '../components/FotoPerfil'
import { IconeCadeado } from '../components/icones'
import { Botao, Cartao, Tag } from '../components/ui'
import { useAuth } from '../contexts/auth'
import * as api from '../services/api'
import { obterUrlEmbedYouTube, type Perfil } from '../types'
import { formatarReais } from '../utils/formatar'
import { compatibilidadeVisual, destaque, subtitulo } from '../utils/perfil'

export function VisualizarPerfil() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [bloqueioPlano, setBloqueioPlano] = useState<{ mensagem: string; score?: number } | null>(null)
  const [erroAcao, setErroAcao] = useState('')

  const [matchId, setMatchId] = useState<string | null>(null)
  const [enviouInteresse, setEnviouInteresse] = useState(false)
  const [recebeuInteresse, setRecebeuInteresse] = useState(false)
  const [carregandoAcao, setCarregandoAcao] = useState(false)
  const [modalVideoAberto, setModalVideoAberto] = useState(false)

  useEffect(() => {
    if (!id || !usuario) return

    async function carregarDados() {
      setLoading(true)
      setBloqueioPlano(null)
      try {
        const p = await api.buscarPerfilPorId(id!)
        setPerfil(p)

        const matches = await api.listarMatches(usuario!.id)
        const matchExistente = matches.find((m) => m.outro.id === id)
        if (matchExistente) setMatchId(matchExistente.match.id)

        const enviados = await api.interessesEnviados(usuario!.id)
        if (enviados.includes(id!)) setEnviouInteresse(true)

        const pendentes = await api.interessesPendentes(usuario!.id)
        if (pendentes.some((item) => item.id === id)) setRecebeuInteresse(true)
      } catch (error) {
        if (error instanceof api.ApiError && error.status === 403) {
          setBloqueioPlano({ mensagem: error.message, score: error.score })
        } else {
          console.error('Erro ao carregar perfil:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [id, usuario])

  if (loading) return <p className="p-6 text-suave">Carregando perfil...</p>

  if (bloqueioPlano) {
    return (
      <>
        <CabecalhoPagina titulo="Perfil Exclusivo" subtitulo="Conexão de alta compatibilidade identificada" />
        <Cartao className="mx-auto max-w-2xl flex flex-col items-center gap-6 px-8 py-14 text-center border-rosa/40">
          <div className="grid size-20 place-items-center rounded-full border border-rosa/40 bg-rosa/15 text-rosa">
            <IconeCadeado width={38} height={38} />
          </div>
          {bloqueioPlano.score !== undefined && (
            <span className="rounded-full border border-rosa/40 bg-rosa/20 px-4 py-1.5 text-sm font-bold text-rosa">
              {compatibilidadeVisual(bloqueioPlano.score)}
            </span>
          )}
          <h2 className="titulo text-3xl sm:text-4xl">Desbloqueie perfis 40%+</h2>
          <p className="max-w-md text-zinc-300">{bloqueioPlano.mensagem}</p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Botao variante="contorno" onClick={() => navigate(-1)}>
              Voltar
            </Botao>
            <Botao variante="rosa" onClick={() => navigate('/planos')}>
              Conhecer o plano Premium
            </Botao>
          </div>
        </Cartao>
      </>
    )
  }

  if (!perfil) return <p className="p-6 text-suave">Perfil não encontrado.</p>

  const ehMeuProprioPerfil = usuario?.id === perfil.id

  async function registrar() {
    if (!usuario || !perfil) return
    setErroAcao('')
    setCarregandoAcao(true)
    try {
      const match = await api.registrarInteresse(usuario.id, perfil.id)
      if (match) setMatchId(match.id)
      else setEnviouInteresse(true)
    } catch (err) {
      setErroAcao((err as Error).message)
    } finally {
      setCarregandoAcao(false)
    }
  }

  async function aceitar() {
    if (!usuario || !perfil) return
    setErroAcao('')
    setCarregandoAcao(true)
    try {
      const match = await api.aceitarPendente(perfil.id)
      if (match) setMatchId(match.id)
    } catch (err) {
      setErroAcao((err as Error).message)
    } finally {
      setCarregandoAcao(false)
    }
  }

  async function recusar() {
    if (!usuario || !perfil) return
    setCarregandoAcao(true)
    try {
      await api.recusarPendente(perfil.id)
      setRecebeuInteresse(false)
    } finally {
      setCarregandoAcao(false)
    }
  }

  return (
    <>
      <CabecalhoPagina titulo="Visão Geral" subtitulo={`Conheça mais sobre ${perfil.nome}`} />

      {erroAcao && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rosa/40 bg-rosa/10 px-6 py-4 text-sm text-white">
          <p>{erroAcao}</p>
          <Botao variante="rosa" onClick={() => navigate('/planos')}>
            Fazer upgrade
          </Botao>
        </div>
      )}

      <Cartao className="flex flex-col gap-8 p-6 sm:p-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-borda/50 pb-8">
          <div className="flex items-center gap-5">
            <FotoPerfil perfil={perfil} tamanho="xl" />
            <div>
              <h2 className="text-3xl font-bold">{perfil.nome}</h2>
              <p className="text-xl text-zinc-300 mt-1">{subtitulo(perfil)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Tag>{perfil.localizacao}</Tag>
                {perfil.score !== undefined && compatibilidadeVisual(perfil.score) && (
                  <Tag>{compatibilidadeVisual(perfil.score)}</Tag>
                )}
              </div>
            </div>
          </div>

          {!ehMeuProprioPerfil && (
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              {matchId ? (
                <>
                  <span className="text-lima text-sm font-semibold text-center sm:text-right">
                    Vocês são um Match! 🎉
                  </span>
                  <Botao variante="branco" onClick={() => navigate(`/conversas/${matchId}`)}>
                    Ir para conversa
                  </Botao>
                </>
              ) : recebeuInteresse ? (
                <>
                  <span className="text-(--acento) text-sm font-semibold text-center sm:text-right">
                    Tem interesse em você! 👀
                  </span>
                  <div className="flex gap-2">
                    <Botao variante="contorno" onClick={recusar} disabled={carregandoAcao}>
                      Recusar
                    </Botao>
                    <Botao onClick={aceitar} disabled={carregandoAcao}>
                      {carregandoAcao ? 'Aceitando...' : 'Aceitar e Conectar'}
                    </Botao>
                  </div>
                </>
              ) : enviouInteresse ? (
                <>
                  <span className="text-suave text-sm text-center sm:text-right">Aguardando resposta ⏳</span>
                  <Botao variante="contorno" disabled>
                    Interesse registrado
                  </Botao>
                </>
              ) : (
                <Botao onClick={registrar} disabled={carregandoAcao}>
                  {carregandoAcao ? 'Registrando...' : 'Registrar interesse'}
                </Botao>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8 text-lg">
          {perfil.papel === 'startup' ? (
            <>
              <section>
                <h3 className="font-semibold text-zinc-400 mb-2">Sobre a Startup</h3>
                <p>{perfil.descricao}</p>
              </section>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-zinc-400 mb-1">Mercado</h3>
                  <p>{perfil.mercado || 'Não informado'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-400 mb-1">Modelo de Negócio</h3>
                  <p>{perfil.modeloNegocio || 'Não informado'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-400 mb-1">Equipe</h3>
                  <p>{perfil.composicaoEquipe || 'Não informado'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-400 mb-1">Investimento Buscado</h3>
                  <p className="font-bold text-(--acento)">
                    {perfil.valorInvestimento ? formatarReais(perfil.valorInvestimento) : 'Não informado'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-400 mb-1">Participação Oferecida</h3>
                  <p className="font-bold text-(--acento)">{destaque(perfil)}</p>
                </div>
              </div>

              {(perfil.video_pitch_url || perfil.documento_canvas_url) && (
                <div className="mt-10 pt-8 border-t border-borda/50">
                  <h3 className="text-xl font-bold mb-6">Materiais de Apresentação</h3>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {perfil.video_pitch_url && (
                      <div className="rounded-2xl border border-borda bg-superficie p-5">
                        <h4 className="font-semibold text-zinc-400 mb-3">Vídeo de Pitch</h4>
                        <button
                          onClick={() => setModalVideoAberto(true)}
                          className="relative w-full h-40 rounded-xl bg-zinc-900 border border-white/10 flex flex-col items-center justify-center group overflow-hidden"
                        >
                          <div className="size-14 rounded-full bg-rosa flex items-center justify-center text-zinc-950 group-hover:scale-110 transition">
                            ▶
                          </div>
                          <span className="mt-3 text-sm font-medium text-white group-hover:text-rosa transition">
                            Assistir Pitch
                          </span>
                        </button>
                      </div>
                    )}

                    {perfil.documento_canvas_url && (
                      <div className="rounded-2xl border border-borda bg-superficie p-5 flex flex-col justify-center">
                        <h4 className="font-semibold text-zinc-400 mb-4">Documentos</h4>
                        <a
                          href={perfil.documento_canvas_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl border border-borda bg-white/5 hover:bg-white/10 transition"
                        >
                          <div className="size-12 rounded-lg bg-lima/20 text-lima flex items-center justify-center font-bold">
                            PDF
                          </div>
                          <div>
                            <p className="font-semibold text-white">Business Model / Deck</p>
                            <p className="text-xs text-suave mt-1">Abrir documento completo ↗</p>
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <section>
                <h3 className="font-semibold text-zinc-400 mb-2">Tese de Investimento</h3>
                <p>{perfil.tese}</p>
              </section>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-zinc-400 mb-2">Segmentos de Interesse</h3>
                  <div className="flex flex-wrap gap-2">
                    {perfil.segmentosInteresse?.map((s) => <Tag key={s}>{s}</Tag>)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-400 mb-2">Estágios Preferidos</h3>
                  <div className="flex flex-wrap gap-2">
                    {perfil.estagiosPreferidos?.map((e) => <Tag key={e}>{e}</Tag>)}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <h3 className="font-semibold text-zinc-400 mb-1">Ticket Médio (Faixa de Investimento)</h3>
                  <p className="font-bold text-(--acento)">{destaque(perfil)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </Cartao>

      {modalVideoAberto && perfil.papel === 'startup' && perfil.video_pitch_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-zinc-900 rounded-2xl overflow-hidden border border-borda shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalVideoAberto(false)}
              className="absolute top-4 right-4 z-10 text-white bg-black/60 rounded-full w-10 h-10 flex items-center justify-center hover:bg-rosa transition"
              aria-label="Fechar vídeo"
            >
              ✕
            </button>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={obterUrlEmbedYouTube(perfil.video_pitch_url) || ''}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}