import { assertEquals, assertNotEquals } from "jsr:@std/assert"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import { CryptoService } from "../../../packages/core/src/services/CryptoService.ts"

export const cryptoServiceSuite: TestSuite = {
  name: "CryptoService",
  tests: [
    {
      name: "encrypts and decrypts symmetrically",
      fn: async () => {
        const service = new CryptoService("test-secret")
        const plaintext = "password123"

        const encrypted = await service.encrypt(plaintext)
        const decrypted = await service.decrypt(encrypted)

        assertEquals(decrypted, plaintext)
      },
    },
    {
      name: "uses the provided secret for deterministic encryption",
      fn: async () => {
        const secret = "deterministic-secret"
        const serviceA = new CryptoService(secret)
        const serviceB = new CryptoService(secret)
        const otherService = new CryptoService("other-secret")

        const input = "same-input"
        const encryptedA = await serviceA.encrypt(input)
        const encryptedB = await serviceB.encrypt(input)
        const encryptedOther = await otherService.encrypt(input)

        assertEquals(encryptedA, encryptedB)
        assertNotEquals(encryptedA, encryptedOther)
      },
    },
  ],
}
