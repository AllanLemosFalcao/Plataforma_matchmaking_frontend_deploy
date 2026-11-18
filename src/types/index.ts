import type { ESTAGIOS, SEGMENTOS } from '../constants'

export type Papel = 'startup' | 'investidor'
export type Plano = 'basico' | 'premium'
export type Segmento = (typeof SEGMENTOS)[number]
export type Estagio = (typeof ESTAGIOS)[number]

interface UsuarioBase {
  id: string
  nome: string
  email: string
  papel: Papel
  plano?: Plano
  /** URL ou data URL da foto/logo */
  foto?: string
  localizacao: string
  score?: number
  bloqueadoPlano?: boolean
}

export interface PerfilStartup extends UsuarioBase {
  papel: 'startup'
  descricao: string
  segmento: Segmento
  estagio: Estagio
  composicaoEquipe: string
  mercado: string
  modeloNegocio: string
  valorInvestimento: number
  participacaoOferecida: number
  video_pitch_url?: string
  documento_canvas_url?: string
  pitch_deck_url?: string
}

export interface PerfilInvestidor extends UsuarioBase {
  papel: 'investidor'
  tese: string
  segmentosInteresse: Segmento[]
  estagiosPreferidos: Estagio[]
  investimentoMinimo: number
  investimentoMaximo: number
}

export type Perfil = PerfilStartup | PerfilInvestidor

type SemId<T> = T extends unknown ? Omit<T, 'id'> : never
export type DadosCadastro = SemId<Perfil> & {
  senha: string
  aceiteTermos?: boolean
}

export interface Interesse {
  deId: string
  paraId: string
  criadoEm: string
}

export interface Match {
  id: string
  usuarios: [string, string]
  criadoEm: string
}

export interface Mensagem {
  id: string
  matchId: string
  autorId: string
  texto: string
  enviadaEm: string
}

export interface FiltrosBusca {
  texto: string
  segmento: string
  localizacao: string
  estagio: string
}

export interface ResumoAtividade {
  interessesEnviados: number
  interessesRecebidos: number
  matches: number
}

export function obterUrlEmbedYouTube(url?: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2]?.length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
    : null
}