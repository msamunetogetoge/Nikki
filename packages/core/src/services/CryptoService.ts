const encoder = new TextEncoder()
const decoder = new TextDecoder()

const deriveKey = async (secret: string) => {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("nikki-auth"),
      iterations: 1000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

const iv = new Uint8Array(16)

const toBase64 = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))

const fromBase64 = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

export class CryptoService {
  private readonly keyPromise: Promise<CryptoKey>

  constructor(private readonly secret: string) {
    this.keyPromise = deriveKey(secret)
  }

  async encrypt(value: string): Promise<string> {
    const key = await this.keyPromise
    const data = encoder.encode(value)
    const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, data)
    return toBase64(encrypted)
  }

  async decrypt(value: string): Promise<string> {
    const key = await this.keyPromise
    const decoded = fromBase64(value)
    const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, decoded)
    return decoder.decode(decrypted)
  }
}
