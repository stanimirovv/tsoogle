// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SearchQuery = {
  kind: 'function' | 'method' | 'both'
  returnTypes: string[]
  parameterTypes: string[][]
}
