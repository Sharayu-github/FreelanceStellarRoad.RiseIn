/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ESCROW_CONTRACT_ID: string
  readonly VITE_REPUTATION_CONTRACT_ID: string
  readonly VITE_STELLAR_NETWORK: string
  readonly VITE_NATIVE_TOKEN_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}