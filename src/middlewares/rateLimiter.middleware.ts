import rateLimit from "express-rate-limit";

/**
 * Rate Limiter Global para proteção contra ataques de DoS / Brute Force
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // limite de 1000 requisições por IP por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas requisições originadas deste IP. Tente novamente em alguns minutos."
  }
});

/**
 * Rate Limiter Estrito para rotas públicas de IA e Webhooks
 */
export const apiPublicRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // 60 requisições por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Limite de mensagens por minuto excedido. Aguarde um instante."
  }
});

/**
 * Rate Limiter para Login / Autenticação
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 tentativas de login por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas tentativas de autenticação. Tente novamente mais tarde."
  }
});
