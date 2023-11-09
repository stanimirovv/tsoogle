import type { SearchQuery } from './searchQuery.type'

export function parse (input: string): SearchQuery {
  input = input.replace(/\s+/g, '')

  input = simpleQueryToFullQuery(input)

  const fnType = input.split(':')[0]
  const kind = calculateKind(fnType)

  let returnTypeAndArgs = input.split(':')[0]
  if (input.split(':').length === 2) {
    returnTypeAndArgs = input.split(':')[1]
  }

  const returnTypes = returnTypeAndArgs.split('?')[0].split('|')
  const parameterTypes = returnTypeAndArgs.split('?')[1].split(',').map((arg) => arg.split('|'))

  if (parameterTypes.length === 1 && parameterTypes[0].length === 1 && parameterTypes[0][0] === '') {
    parameterTypes.pop()
  }

  return {
    kind,
    returnTypes,
    parameterTypes
  }
}

// takes as input a string like {a,b,c} converts to ['a', 'b', 'c']
export function parseTypeQuery (input: string): string[] {
  return input.replace('{', '').replace('}', '').split('&')
}

function simpleQueryToFullQuery (input: string): string {
  if (!input.includes(':') && !input.includes(',')) {
    input = `:${input}`
  }

  if (!input.includes('?') && !input.includes(',')) {
    input = `${input}?`
  }

  if (input.includes(',') && !input.includes(':') && !input.includes('?')) {
    return `:*?${input}`
  }

  return input
}

function calculateKind (match: string): 'function' | 'method' | 'both' {
  if (match === '') {
    return 'both'
  } else if (match === 'function') {
    return 'function'
  } else {
    return 'method'
  }
}
