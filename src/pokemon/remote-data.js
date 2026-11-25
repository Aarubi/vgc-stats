const MAX_BYTES = 4 * 1024 * 1024;

export async function fetchData(url) {
  const response = await fetch(url, {
    redirect: 'error',
    signal: AbortSignal.timeout(12_000)
  });

  if (!response.ok || !response.body) {
    await response.body?.cancel();
    const error = new Error(`Fonte retornou HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  let size = 0;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const chunks = [];
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > MAX_BYTES) throw new Error('Arquivo de dados acima do limite de tamanho.');
    chunks.push(decoder.decode(chunk, { stream: true }));
  }
  chunks.push(decoder.decode());
  return chunks.join('');
}

export function createDataCache(load, ttlMs, fallback = async () => undefined) {
  let value;
  let expiresAt = 0;
  let pending;

  return async function get() {
    if (Date.now() < expiresAt) return value;
    pending ??= (async () => {
      try {
        value = await load();
        expiresAt = Date.now() + ttlMs;
      } catch (error) {
        console.warn('Falha ao atualizar dados de Pokémon:', error.message);
        value ??= await fallback();
        expiresAt = Date.now() + 10 * 60_000;
      } finally {
        pending = undefined;
      }
      return value;
    })();
    return pending;
  };
}
