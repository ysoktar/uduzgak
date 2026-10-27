export function normalizeSelfHostedUrl(raw: string): string {
  let url: URL
  try { url = new URL(raw.trim()) } catch { throw new Error('Invalid server URL') }
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
    !['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid server URL')
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    throw new Error('HTTPS is required')
  return url.origin
}

export async function checkSelfHostedServer(
  url: string, token: string, fetchImpl: typeof fetch = fetch,
): Promise<{ storage: string }> {
  const origin = normalizeSelfHostedUrl(url)
  if (!token.trim()) throw new Error('Access token is required')
  const response = await fetchImpl(`${origin}/v1/session`, {
    method: 'GET',
    redirect: 'error',
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (response.status === 401 || response.status === 403) throw new Error('Server authentication failed')
  if (!response.ok) throw new Error('Server connection failed')
  let body: unknown
  try { body = await response.json() } catch { throw new Error('Incompatible Uduzgak server') }
  if (typeof body !== 'object' || !body || !('protocol' in body) ||
    body.protocol !== 'uduzgak-sync-v1' || !('storage' in body) ||
    typeof body.storage !== 'string') throw new Error('Incompatible Uduzgak server')
  return { storage: body.storage }
}
