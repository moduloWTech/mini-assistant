import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY || "mini_assistant_default_aes_256_encryption_key_2026";
  if (keyString.length === 64 && /^[0-9a-fA-F]+$/.test(keyString)) {
    return Buffer.from(keyString, "hex");
  }
  // Se for uma string comum, deriva uma chave de 32 bytes (256 bits) segura via SHA-256
  return crypto.createHash("sha256").update(keyString).digest();
}

/**
 * Criptografa um texto (token) usando a chave simétrica ENCRYPTION_KEY.
 * Retorna no formato: iv:authTag:encryptedText
 */
export function encryptToken(text: string): string {
  if (!text) return text;

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Descriptografa um texto (token) embaralhado previamente.
 */
export function decryptToken(encryptedData: string): string {
  if (!encryptedData) return encryptedData;

  // Se o texto não estiver no formato esperado (não foi criptografado ainda), retorna como está
  if (!encryptedData.includes(":")) {
    return encryptedData;
  }

  const parts = encryptedData.split(":");

  // O token criptografado sempre terá 3 partes e os dois primeiros têm 32 caracteres hexadecimais (16 bytes)
  if (parts.length !== 3 || parts[0].length !== 32 || parts[1].length !== 32) {
    return encryptedData;
  }

  try {
    const key = getKey();
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[Encryption] Erro ao descriptografar token:", error);
    return encryptedData;
  }
}
