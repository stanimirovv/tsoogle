import { parseTypeQuery } from './lexer'
import { getMatcher } from './matcher'
import type { ProjectFunctionProperty, ProjectFunction } from './projectFunction.interface'
import type { SearchQuery } from './searchQuery.type'

export interface FunctionDetail {
  fileName: string
  functionName: string
  paramString: string
  line: number
  returnType: string
}

const doStringsMatch = getMatcher()

export function evaluateSearchQuery (projectFunctions: ProjectFunction[], searchQuery: SearchQuery): FunctionDetail[] {
  const results: FunctionDetail[] = []

  for (const func of projectFunctions) {
    const result = search(func, searchQuery)
    if (result !== undefined) {
      results.push(result)
    }
  }

  return results
}

function search (func: ProjectFunction, searchQuery: SearchQuery): FunctionDetail | undefined {
  if (isReturnTypeMatch(searchQuery, func) && isArgumentMatch(searchQuery, func)) {
    return {
      fileName: func.fileName,
      functionName: func.name,
      line: func.fileLine,
      paramString: removeDynamicImports(func.paramString),
      returnType: removeDynamicImports(func.returnType)
    }
  }

  return undefined
}

function isReturnTypeMatch (searchQuery: SearchQuery, func: ProjectFunction): boolean {
  for (const searchReturnType of searchQuery.returnTypes) {
    const stringsMatch = doStringsMatch(removeDynamicImports(func.returnType), searchReturnType)
    if (stringsMatch || searchReturnType === '*') {
      return true
    }

    // Symbol type match
    const searchParameterTypeFirstChar = searchReturnType[0]
    const searchParameterTypeLastChar = searchReturnType[searchReturnType.length - 1]
    if (searchParameterTypeFirstChar === '{' && searchParameterTypeLastChar === '}') {
      if (doReturnTypesMatch(searchReturnType, func)) {
        return true
      }
    }
  }

  return false
}

function isArgumentMatch (searchQuery: SearchQuery, func: ProjectFunction): boolean {
  // empty parameters means it matches everything
  if (searchQuery.parameterTypes.length === 0) {
    return true
  }

  const isFirstSearchQueryParamSpread = searchQuery.parameterTypes[0][0] === '...'
  if (isFirstSearchQueryParamSpread) {
    searchQuery.parameterTypes.shift()
  }

  // argument length may mismatch only if the spread operator is used
  if (searchQuery.parameterTypes.length !== func.parameters.length && !isFirstSearchQueryParamSpread) {
    return false
  }

  if (!isFirstSearchQueryParamSpread) {
    const argumentMatches: boolean[] = []
    for (let i = 0; i < searchQuery.parameterTypes.length; i++) {
      argumentMatches.push(isSingleArgumentMatch(searchQuery.parameterTypes[i], func.parameters[i]))
    }

    return argumentMatches.every((match) => match)
  } else {
    const argumentMatches: boolean[] = []
    for (let i = 0; i < searchQuery.parameterTypes.length; i++) {
      for (let k = 0; k < func.parameters.length; k++) {
        argumentMatches.push(isSingleArgumentMatch(searchQuery.parameterTypes[i], func.parameters[k]))
      }
    }

    // Restore, TODO: fix this
    searchQuery.parameterTypes.unshift(['...'])
    return argumentMatches.some((match) => match)
  }
}

function isSingleArgumentMatch (searchParameterTypes: string[], functionParameter: ProjectFunctionProperty): boolean {
  // Begin assuming it is false for each parameter
  const functionAndParameterName = `${functionParameter.name}: ${functionParameter.type}`

  if (searchParameterTypes.length === 1 && searchParameterTypes[0] === '*') {
    return true
  }

  for (const searchParameterType of searchParameterTypes) {
    // Symbol name match
    if (doStringsMatch(removeDynamicImports(functionAndParameterName), searchParameterType)) {
      return true
    }

    // TODO need to store a hash of every function parameter's type's properties
    // Symbol type match
    // const searchParameterTypeFirstChar = searchParameterType[0]
    // const searchParameterTypeLastChar = searchParameterType[searchParameterType.length - 1]
    // if (searchParameterTypeFirstChar === '{' && searchParameterTypeLastChar === '}') {
    //   if (doTypesMatch(searchParameterType, functionParameter)) {
    //     return true
    //   }
    // }
  }

  return false
}

function removeDynamicImports (inputStr: string): string {
  const importRegex = /import\([^)]+\)\./g
  return inputStr.replace(importRegex, '')
}

// TODO move to their own file ?
// showcase how we might add partial type checking
// function doTypesMatch (searchParameterType: string, functionParameter: ProjectFunctionProperty): boolean {
//   const mandatoryObjectKeys = parseTypeQuery(searchParameterType)
//   const properties = functionParameter.getType().getProperties()

//   const matches: boolean[] = []
//   for (const propName of mandatoryObjectKeys) {
//     let match = false
//     for (const tsProperty of properties) {
//       if (tsProperty.getName() === propName) {
//         match = true
//       }
//     }
//     matches.push(match)
//   }

//   return matches.every((match) => match)
// }

// TODO functions are very similar, maybe we can merge them
function doReturnTypesMatch (searchParameterType: string, func: ProjectFunction): boolean {
  const mandatoryObjectKeys = parseTypeQuery(searchParameterType)

  const matches: boolean[] = []
  for (const propName of mandatoryObjectKeys) {
    let match = false
    for (const tsProperty of func.parameters) {
      if (tsProperty.name === propName) {
        match = true
      }
    }
    matches.push(match)
  }

  return matches.every((match) => match)
}
