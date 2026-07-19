declare global {
  namespace NodeJS {
    interface ProcessEnv {
      UPTIMEFLARE_STATE: KVNamespace
    }
  }
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

export {}
