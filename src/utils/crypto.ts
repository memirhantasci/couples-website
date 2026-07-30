import crypto from "crypto";

// For a real production app, this should be a 32-byte string stored in .env
// We use a fallback if not provided to prevent crashes.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "couples-website-secret-key-12345"; // Must be 32 bytes
// Ensure the key is exactly 32 bytes for AES-256-CBC
const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);

const ALGORITHM = "aes-256-cbc";

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // Format: "enc:IV:EncryptedText" so we can identify encrypted strings
  return `enc:${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string {
  try {
    if (!text.startsWith("enc:")) return text; // Not encrypted

    const parts = text.split(":");
    if (parts.length !== 3) return text;

    const iv = Buffer.from(parts[1], "hex");
    const encryptedText = Buffer.from(parts[2], "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText, undefined, "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err);
    return "";
  }
}
