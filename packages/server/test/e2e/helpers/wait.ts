export async function waitForReady(baseUrl: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  const url = `${baseUrl.replace(/\/+$/, '')}/health/ready`
  let lastError: unknown

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' })
      if (res.status === 200) {
        const body = (await res.json().catch(() => ({}))) as any
        if (body?.status === 'ok') {
          return
        }
      }
      lastError = new Error(`status ${res.status}`)
    } catch (err) {
      lastError = err
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  throw new Error(
    `Server at ${baseUrl} did not become ready within ${timeoutMs}ms (last error: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    })`
  )
}
