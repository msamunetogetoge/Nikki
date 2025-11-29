declare const Deno:
  | {
      env?: {
        get(key: string): string | undefined
        set?(key: string, value: string): void
        delete?(key: string): void
      }
    }
  | undefined
