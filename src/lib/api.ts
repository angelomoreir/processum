const TOKEN_KEY = 'processum_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export const PORTAL_TOKEN_KEY = 'processum_portal_token'

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {}
  const t = token === undefined ? getToken() : token
  if (t) headers.Authorization = `Bearer ${t}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && !path.startsWith('/auth') && !path.startsWith('/portal')) {
    setToken(null)
    window.location.href = '/login'
    throw new Error('Sessão expirada')
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.erro || `Erro ${res.status}`)
  }
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),

  portalGet: <T>(path: string) =>
    request<T>('GET', path, undefined, localStorage.getItem(PORTAL_TOKEN_KEY)),
  portalPost: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, body, localStorage.getItem(PORTAL_TOKEN_KEY)),

  upload: async (path: string, formData: FormData) => {
    const headers: Record<string, string> = {}
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
    const res = await fetch(`/api${path}`, { method: 'POST', headers, body: formData })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.erro || `Erro ${res.status}`)
    return data
  },
}

/**
 * Busca uma coleção ao servidor. Se a tabela estiver vazia e existirem
 * dados locais (mocks/seeds), envia-os via /api/bootstrap e mantém os locais.
 */
export async function fetchOrSeed<T extends object>(
  path: string,
  table: string,
  localRows: T[]
): Promise<T[]> {
  try {
    const rows = await api.get<T[]>(path)
    if (rows.length > 0) return rows
    if (localRows.length > 0) {
      api.post('/bootstrap', { [table]: localRows }).catch(() => {})
    }
  } catch (e) {
    console.error(`fetchOrSeed ${table}:`, e)
  }
  return localRows
}
