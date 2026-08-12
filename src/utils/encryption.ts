import crypto from "crypto";
import { checkEnvironmentVariable } from "../services/checkEnvironmentVariable";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Criptografa um texto (token) usando a chave simétrica ENCRYPTION_KEY.
 * Retorna no formato: iv:authTag:encryptedText
 */
export function encryptToken(text: string): string {
    if (!text) return text;
    
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString || keyString.length !== 64) {
        throw new Error("ENCRYPTION_KEY inválida. Deve ter 64 caracteres hexadecimais.");
    }
    
    const key = Buffer.from(keyString, "hex");
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
    // Isso é uma proteção caso o banco tenha tokens não criptografados misturados
    if (!encryptedData.includes(":")) {
        return encryptedData;
    }
    
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString || keyString.length !== 64) {
        throw new Error("ENCRYPTION_KEY inválida. Deve ter 64 caracteres hexadecimais.");
    }
    
    const key = Buffer.from(keyString, "hex");
    const parts = encryptedData.split(":");
    
    // Tokens do Telegram naturalmente possuem ':' (ex: 123456:ABCdef).
    // O token criptografado sempre terá 3 partes e os dois primeiros têm 32 caracteres (hex).
    if (parts.length !== 3 || parts[0].length !== 32 || parts[1].length !== 32) {
        return encryptedData;
    }
    
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
}
