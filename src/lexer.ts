import type { SearchQuery } from './searchQuery.type'

export function parse (input: string): SearchQuery {
  input = input.replace(/\s+/g, '')

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

function calculateKind (match: string): 'function' | 'method' | 'both' {
  if (match === '') {
    return 'both'
  } else if (match === 'function') {
    return 'function'
  } else {
    return 'method'
  }
}
