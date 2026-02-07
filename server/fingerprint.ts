import crypto from 'crypto';

/**
 * Génère une empreinte appareil à partir de l'user agent et d'autres données
 * Cette empreinte est utilisée pour détecter les votes multiples
 */
export function generateDeviceFingerprint(userAgent: string, ipAddress?: string): string {
  const components = [
    userAgent,
    ipAddress || 'unknown',
    // On peut ajouter d'autres composants pour une meilleure détection
  ];
  
  const combined = components.join('|');
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  
  return hash;
}

/**
 * Extrait l'adresse IP de la requête
 */
export function getClientIp(req: any): string | undefined {
  // Vérifier les en-têtes de proxy en premier
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules
    const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return (ips[0] || '').trim();
  }
  
  const clientIp = req.headers['x-client-ip'];
  if (clientIp) {
    return typeof clientIp === 'string' ? clientIp : clientIp[0];
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return typeof realIp === 'string' ? realIp : realIp[0];
  }
  
  // Fallback sur l'adresse IP de la socket
  return req.socket?.remoteAddress || req.connection?.remoteAddress;
}
