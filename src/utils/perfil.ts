import type { Perfil } from '../types'
import { formatarReais } from '../utils/formatar'

export function subtitulo(perfil: Perfil) {
  return perfil.papel === 'startup'
    ? `${perfil.segmento} - ${perfil.estagio}`
    : perfil.segmentosInteresse.slice(0, 3).join(', ')
}

export function destaque(perfil: Perfil) {
  return perfil.papel === 'startup'
    ? `${perfil.participacaoOferecida}% de Equity`
    : `${formatarReais(perfil.investimentoMinimo)} – ${formatarReais(perfil.investimentoMaximo)}`
}

export function compatibilidadeVisual(score?: number) {
  if (score === undefined || score === null) return null

  const percentual = Math.min(Math.max(score, 0), 100)

  if (percentual >= 80) return `🔥 ${percentual}% aderência`
  if (percentual >= 50) return `👍 ${percentual}% aderência`
  return `${percentual}% aderência`
}