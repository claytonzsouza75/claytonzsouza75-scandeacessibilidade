import dns from 'node:dns/promises';
import { URL } from 'node:url';

/**
 * Checks whether an IPv4 address string falls into private, loopback, or metadata ranges.
 */
export function isPrivateOrRestrictedIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return true;

  // Handle IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
  if (ip.startsWith('::ffff:')) {
    const ipv4 = ip.replace('::ffff:', '');
    return isPrivateOrRestrictedIp(ipv4);
  }

  // IPv6 address validation
  if (ip.includes(':')) {
    const lower = ip.toLowerCase();
    // Loopback or unspecified
    if (lower === '::1' || lower === '::' || lower === '0:0:0:0:0:0:0:1' || lower === '0:0:0:0:0:0:0:0') {
      return true;
    }
    // Link-local: fe80::/10 (starts with fe8, fe9, fea, feb)
    if (/^fe[89ab]/i.test(lower)) {
      return true;
    }
    // Unique local (private): fc00::/7 (starts with fc or fd)
    if (/^f[cd]/i.test(lower)) {
      return true;
    }
    // Discard prefix (100::/64)
    if (lower.startsWith('100::')) {
      return true;
    }
    // Documentation prefix (2001:db8::/32)
    if (lower.startsWith('2001:db8:')) {
      return true;
    }
    // Valid public IPv6
    return false;
  }

  // IPv4 address validation
  const parts = ip.split('.').map(p => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some(p => Number.isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IPv4, block it
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private-Use Networks)
  if (a === 10) return true;

  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private-Use Networks)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-Local, AWS/GCP/Azure instance metadata)
  if (a === 169 && b === 254) return true;

  // 100.64.0.0/10 (Shared Address Space / Carrier-Grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && parts[2] === 0) return true;

  // 198.18.0.0/15 (Network Benchmark Tests)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved)
  if (a >= 240) return true;

  return false;
}

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  url?: URL;
  resolvedIp?: string;
}

/**
 * Validates a target URL against SSRF and protocol restrictions.
 */
export async function validateTargetUrl(rawUrl: string): Promise<UrlValidationResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'A URL é obrigatória.' };
  }

  let normalized = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { valid: false, error: 'Formato de URL inválido. Certifique-se de incluir um domínio válido (ex: https://exemplo.com.br).' };
  }

  // Protocol restriction: only http: and https:
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Apenas os protocolos HTTP e HTTPS são permitidos.' };
  }

  // Disallow user authentication in URL (e.g. http://admin:pass@host)
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'Credenciais de usuário na URL não são permitidas por segurança.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Explicit hostnames check
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.corp') ||
    hostname.endsWith('.home') ||
    hostname === 'metadata.google.internal' ||
    hostname === 'instance-data'
  ) {
    return { valid: false, error: 'Acesso a endereços locais e de redes internas é estritamente bloqueado.' };
  }

  // Validate port if explicitly set
  if (parsed.port) {
    const portNum = Number.parseInt(parsed.port, 10);
    const allowedPorts = [80, 443, 8080, 8443];
    if (!allowedPorts.includes(portNum)) {
      return { valid: false, error: `A porta ${parsed.port} não é permitida. Use as portas padrão 80 ou 443.` };
    }
  }

  // DNS resolution to verify actual IP
  try {
    const lookupResult = await dns.lookup(hostname, { all: true });
    if (!lookupResult || lookupResult.length === 0) {
      return { valid: false, error: `Não foi possível encontrar o servidor para o domínio "${hostname}".` };
    }

    for (const entry of lookupResult) {
      if (isPrivateOrRestrictedIp(entry.address)) {
        return {
          valid: false,
          error: `O endereço IP resolvido (${entry.address}) pertence a uma rede interna ou reservada e foi bloqueado por segurança (SSRF).`,
        };
      }
    }

    return {
      valid: true,
      url: parsed,
      resolvedIp: lookupResult[0].address,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Falha ao resolver o domínio "${hostname}". Verifique se o endereço está correto e se o site está online.`,
    };
  }
}
