import { validateTargetUrl } from './security/ssrf.js';

export interface SafeFetchResult {
  ok: boolean;
  html?: string;
  finalUrl?: string;
  statusCode?: number;
  durationMs: number;
  error?: string;
}

const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5 MB
const TIMEOUT_MS = 12000; // 12 seconds

export async function safeFetchHtml(rawTargetUrl: string): Promise<SafeFetchResult> {
  const startTime = Date.now();
  let currentUrl = rawTargetUrl;
  let redirectsCount = 0;

  while (redirectsCount <= MAX_REDIRECTS) {
    const validation = await validateTargetUrl(currentUrl);
    if (!validation.valid || !validation.url) {
      return {
        ok: false,
        durationMs: Date.now() - startTime,
        error: validation.error || 'URL não permitida.',
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(validation.url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
        },
        redirect: 'manual', // We handle redirects manually to re-verify SSRF!
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Handle Redirects
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        redirectsCount++;
        if (redirectsCount > MAX_REDIRECTS) {
          return {
            ok: false,
            durationMs: Date.now() - startTime,
            error: 'Muitos redirecionamentos encontrados (limite de 5 excedido).',
          };
        }

        const location = response.headers.get('location');
        if (!location) {
          return {
            ok: false,
            durationMs: Date.now() - startTime,
            error: 'Redirecionamento sem cabeçalho Location.',
          };
        }

        // Resolve relative redirect
        try {
          const nextUrl = new URL(location, validation.url).toString();
          currentUrl = nextUrl;
          continue;
        } catch {
          return {
            ok: false,
            durationMs: Date.now() - startTime,
            error: `URL de redirecionamento inválida: ${location}`,
          };
        }
      }

      if (!response.ok) {
        return {
          ok: false,
          statusCode: response.status,
          durationMs: Date.now() - startTime,
          error: `O servidor retornou o status HTTP ${response.status} (${response.statusText || 'Erro'}). Verifique se a página é pública e acessível.`,
        };
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        return {
          ok: false,
          statusCode: response.status,
          durationMs: Date.now() - startTime,
          error: `O recurso solicitado não parece ser uma página web HTML (Content-Type retornado: "${contentType || 'desconhecido'}").`,
        };
      }

      // Read response with size limit
      const reader = response.body?.getReader();
      if (!reader) {
        const text = await response.text();
        return {
          ok: true,
          html: text,
          finalUrl: validation.url.toString(),
          statusCode: response.status,
          durationMs: Date.now() - startTime,
        };
      }

      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_BODY_BYTES) {
            reader.cancel();
            return {
              ok: false,
              durationMs: Date.now() - startTime,
              error: 'O tamanho da página excede o limite máximo permitido de 5 MB para análise.',
            };
          }
          chunks.push(value);
        }
      }

      const merged = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      const decoder = new TextDecoder('utf-8');
      const html = decoder.decode(merged);

      return {
        ok: true,
        html,
        finalUrl: validation.url.toString(),
        statusCode: response.status,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        return {
          ok: false,
          durationMs: Date.now() - startTime,
          error: 'Tempo limite esgotado ao tentar acessar o site (timeout de 12 segundos). O site pode estar lento ou bloqueando acessos.',
        };
      }
      return {
        ok: false,
        durationMs: Date.now() - startTime,
        error: `Erro de conexão ao acessar a página: ${err.message || 'Falha de rede'}.`,
      };
    }
  }

  return {
    ok: false,
    durationMs: Date.now() - startTime,
    error: 'Número excessivo de redirecionamentos.',
  };
}
