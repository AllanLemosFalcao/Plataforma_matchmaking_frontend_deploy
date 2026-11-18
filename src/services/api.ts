import { db } from '../mocks/data'
import type {
  DadosCadastro,
  FiltrosBusca,
  Match,
  Mensagem,
  Perfil,
  Plano,
  ResumoAtividade,
} from '../types'

const urlBase = import.meta.env.VITE_API_URL
export const API_URL = urlBase ? `${urlBase}/api` : 'http://localhost:3000/api'

export class ApiError extends Error {
  status: number
  codigo?: string
  score?: number

  constructor(message: string, status: number, codigo?: string, score?: number) {
    super(message)
    this.status = status
    this.codigo = codigo
    this.score = score
  }
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const erroJson = await res.json().catch(() => ({}))
    throw new ApiError(
      erroJson.error || `Erro ${res.status} em ${path}`,
      res.status,
      erroJson.codigo,
      erroJson.score,
    )
  }

  return res.json() as Promise<T>
}

// ---------- Autenticação e Assinatura ----------

export async function login(email: string, senha: string): Promise<Perfil> {
  const resposta = await http<{ token: string } & Perfil>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })

  if (resposta.token) {
    localStorage.setItem('token', resposta.token)
  }

  return resposta
}

export async function cadastrar(dados: DadosCadastro): Promise<Perfil> {
  const resposta = await http<{ token: string } & Perfil>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dados),
  })

  if (resposta.token) {
    localStorage.setItem('token', resposta.token)
  }

  return resposta
}

export async function atualizarPerfil(perfil: Perfil): Promise<Perfil> {
  const resposta = await http<{ message: string; perfil: Perfil }>('/perfil', {
    method: 'PUT',
    body: JSON.stringify(perfil),
  })

  return resposta.perfil
}

export async function alterarPlano(plano: Plano): Promise<Plano> {
  const resposta = await http<{ message: string; plano: Plano }>('/perfil/plano', {
    method: 'PATCH',
    body: JSON.stringify({ plano }),
  })
  return resposta.plano
}

// ---------- Busca ----------

export async function buscar(_usuario: Perfil, filtros: FiltrosBusca): Promise<Perfil[]> {
  return await http<Perfil[]>('/buscar', {
    method: 'POST',
    body: JSON.stringify(filtros),
  })
}

export async function listarLocalizacoes(papel: Perfil['papel']): Promise<string[]> {
  try {
    return await http<string[]>('/locais', { method: 'GET' })
  } catch {
    const alvo = papel === 'investidor' ? 'startup' : 'investidor'
    return [...new Set(db.perfis.filter((p) => p.papel === alvo).map((p) => p.localizacao))].sort()
  }
}

export async function recomendacoes(_usuario: Perfil, limite = 4): Promise<Perfil[]> {
  try {
    const resultados = await http<Perfil[]>('/recomendacoes', { method: 'GET' })
    return resultados.slice(0, limite)
  } catch (error) {
    console.error('Erro ao buscar recomendações:', error)
    return []
  }
}

// ---------- Interesses e matches ----------

export async function registrarInteresse(deId: string, paraId: string): Promise<Match | null> {
  const usuarioStr = localStorage.getItem('usuario')
  if (!usuarioStr) return null

  const usuario = JSON.parse(usuarioStr) as Perfil
  const id_startup = usuario.papel === 'startup' ? deId : paraId
  const id_investidor = usuario.papel === 'investidor' ? deId : paraId

  const resposta = await http<{ match?: Match }>('/match/interesse', {
    method: 'POST',
    body: JSON.stringify({
      id_startup,
      id_investidor,
      iniciado_por: usuario.papel,
      mensagem: 'Olá! Vi seu perfil na plataforma e gostaria de conectar.',
    }),
  })

  return resposta.match ?? null
}

export async function aceitarPendente(alvoId: string): Promise<Match | null> {
  const resposta = await http<{ match: Match }>('/match/aceitar', {
    method: 'POST',
    body: JSON.stringify({ alvoId }),
  })
  return resposta.match
}

export async function interessesEnviados(_usuarioId: string): Promise<string[]> {
  return await http<string[]>('/match/enviados', { method: 'GET' })
}

export async function interessesPendentes(_usuarioId: string): Promise<Perfil[]> {
  return await http<Perfil[]>('/match/pendentes', { method: 'GET' })
}

export async function resumoAtividade(_usuarioId: string): Promise<ResumoAtividade> {
  return await http<ResumoAtividade>('/dashboard', { method: 'GET' })
}

export async function listarMatches(_usuarioId: string): Promise<Array<{ match: Match; outro: Perfil }>> {
  try {
    return await http<Array<{ match: Match; outro: Perfil }>>('/match/listar', {
      method: 'GET',
    })
  } catch (error) {
    console.error('Erro ao listar matches:', error)
    return []
  }
}

// ---------- Conversas e Perfil ----------

export async function listarMensagens(matchId: string): Promise<Mensagem[]> {
  try {
    return await http<Mensagem[]>(`/mensagens/${matchId}`, { method: 'GET' })
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error)
    return []
  }
}

export async function enviarMensagem(matchId: string, _autorId: string, texto: string): Promise<Mensagem> {
  return await http<Mensagem>('/mensagens', {
    method: 'POST',
    body: JSON.stringify({ matchId, texto }),
  })
}

export async function buscarPerfilPorId(id: string): Promise<Perfil> {
  return await http<Perfil>(`/perfil/${id}`, { method: 'GET' })
}

export async function recusarPendente(alvoId: string): Promise<void> {
  await http('/match/recusar', {
    method: 'POST',
    body: JSON.stringify({ alvoId }),
  })
}

export async function detalhesDashboard(_usuarioId: string): Promise<any> {
  return await http<any>('/dashboard/detalhes', { method: 'GET' })
}