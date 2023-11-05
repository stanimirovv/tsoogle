import { type FunctionDeclaration, Project, type SourceFile, type MethodDeclaration, type ParameterDeclaration, Type } from 'ts-morph'
import { parseTypeQuery } from './lexer'
import type { SearchQuery } from './searchQuery.type'

export interface FunctionDetail {
  fileName: string
  functionName: string
  paramString: string
  line: number
  returnType: string
}

export function evaluateSearchQuery (tsconfigPath: string, searchQuery: SearchQuery): FunctionDetail[] {
  const project = new Project({ tsConfigFilePath: tsconfigPath })

  const results: FunctionDetail[] = []

  for (const sourceFile of project.getSourceFiles()) {
    const methodsAndFunctions = getMethodsAndFunctions(searchQuery.kind, sourceFile)
    for (const func of methodsAndFunctions) {
      const result = search(sourceFile, func, searchQuery)
      if (result !== undefined) {
        results.push(result)
      }
    }
  }

  return results
}

// TODO optimize the internal implementation. it is ugly
function getMethodsAndFunctions (kind: 'both' | 'function' | 'method', sourceFile: SourceFile): Array<MethodDeclaration | FunctionDeclaration> {
  if (kind === 'both') {
    const methods = sourceFile
      .getClasses()
      .map((c) =>
        c.getMethods()).flat()

    const functions = sourceFile.getFunctions()
    return [...methods, ...functions]
  } else if (kind === 'function') {
    return sourceFile.getFunctions()
  } else {
    return sourceFile
      .getClasses()
      .map((c) =>
        c.getMethods()).flat()
  }
}

function search (sourceFile: SourceFile, func: MethodDeclaration | FunctionDeclaration, searchQuery: SearchQuery): FunctionDetail | undefined {
  const returnType = func.getReturnType()
  const returnTypeText = returnType.getText()

  const paramString = func.getParameters().map((p) => p.getType().getText()).join(',')

  if (isReturnTypeMatch(searchQuery, func) && isArgumentMatch(searchQuery, func)) {
    return {
      fileName: sourceFile.getFilePath(),
      functionName: func.getName() ?? 'Anonymous',
      line: func.getStartLineNumber(),
      paramString: removeDynamicImports(paramString),
      returnType: removeDynamicImports(returnTypeText)
    }
  }

  return undefined
}

function isReturnTypeMatch (searchQuery: SearchQuery, func: MethodDeclaration | FunctionDeclaration): boolean {
  const returnType = func.getReturnType()
  const returnTypeText = returnType.getText()

  for (const searchReturnType of searchQuery.returnTypes) {
    if (removeDynamicImports(returnTypeText).includes(searchReturnType) || searchReturnType === '*') {
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

function isArgumentMatch (searchQuery: SearchQuery, func: MethodDeclaration | FunctionDeclaration): boolean {
  // empty parameters means it matches everything
  if (searchQuery.parameterTypes.length === 0) {
    return true
  }

  const functionParameters = func.getParameters()

  const isFirstSearchQueryParamSpread = searchQuery.parameterTypes[0][0] === '...'
  if (isFirstSearchQueryParamSpread) {
    searchQuery.parameterTypes.shift()
  }

  // argument length may mismatch only if the spread operator is used
  if (searchQuery.parameterTypes.length !== functionParameters.length && !isFirstSearchQueryParamSpread) {
    return false
  }

  if (!isFirstSearchQueryParamSpread) {
    const argumentMatches: boolean[] = []
    for (let i = 0; i < searchQuery.parameterTypes.length; i++) {
      argumentMatches.push(isSingleArgumentMatch(searchQuery.parameterTypes[i], functionParameters[i]))
    }

    return argumentMatches.every((match) => match)
  } else {
    const argumentMatches: boolean[] = []
    for (let i = 0; i < searchQuery.parameterTypes.length; i++) {
      for (let k = 0; k < functionParameters.length; k++) {
        argumentMatches.push(isSingleArgumentMatch(searchQuery.parameterTypes[i], functionParameters[k]))
      }
    }

    // Restore, TODO: fix this
    searchQuery.parameterTypes.unshift(['...'])
    return argumentMatches.some((match) => match)
  }
}

function isSingleArgumentMatch (searchParameterTypes: string[], functionParameter: ParameterDeclaration): boolean {
  // Begin assuming it is false for each parameter
  const functionParameterType = functionParameter.getType().getText()

  if (searchParameterTypes.length === 1 && searchParameterTypes[0] === '*') {
    return true
  }

  for (const searchParameterType of searchParameterTypes) {
    // Symbol name match
    if (removeDynamicImports(functionParameterType).includes(searchParameterType)) {
      return true
    }

    // Symbol type match
    const searchParameterTypeFirstChar = searchParameterType[0]
    const searchParameterTypeLastChar = searchParameterType[searchParameterType.length - 1]
    if (searchParameterTypeFirstChar === '{' && searchParameterTypeLastChar === '}') {
      if (doTypesMatch(searchParameterType, functionParameter)) {
        return true
      }
    }
  }

  return false
}

function removeDynamicImports (inputStr: string): string {
  const importRegex = /import\([^)]+\)\./g
  return inputStr.replace(importRegex, '')
}

// TODO move to their own file ?
// showcase how we might add partial type checking
function doTypesMatch (searchParameterType: string, functionParameter: ParameterDeclaration): boolean {
  const mandatoryObjectKeys = parseTypeQuery(searchParameterType)
  const properties = functionParameter.getType().getProperties()

  const matches: boolean[] = []
  for (const propName of mandatoryObjectKeys) {
    let match = false
    for (const tsProperty of properties) {
      if (tsProperty.getName() === propName) {
        match = true
      }
    }
    matches.push(match)
  }

  return matches.every((match) => match)
}

// TODO functions are very similar, maybe we can merge them
function doReturnTypesMatch (searchParameterType: string, func: MethodDeclaration | FunctionDeclaration): boolean {
  const mandatoryObjectKeys = parseTypeQuery(searchParameterType)
  const properties = func.getReturnType().getProperties()

  const matches: boolean[] = []
  for (const propName of mandatoryObjectKeys) {
    let match = false
    for (const tsProperty of properties) {
      if (tsProperty.getName() === propName) {
        match = true
      }
    }
    matches.push(match)
  }

  return matches.every((match) => match)
}
