import { type FunctionDeclaration, Project, type SourceFile, type MethodDeclaration, type ParameterDeclaration } from 'ts-morph'
import type { SearchQuery } from './searchQuery.type'

export interface FunctionDetail {
  fileName: string
  functionName: string
  paramString: string
  line: number
  returnType: string
}

export function getMatchingFunctions (tsconfigPath: string, searchQuery: SearchQuery): FunctionDetail[] {
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

  if (isReturnTypeMatch(searchQuery, returnTypeText) && isArgumentMatch(searchQuery, func)) {
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

function isReturnTypeMatch (searchQuery: SearchQuery, returnType: string): boolean {
  for (const searchReturnType of searchQuery.returnTypes) {
    if (removeDynamicImports(returnType).includes(searchReturnType) || searchReturnType === '*') {
      return true
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

  if (searchQuery.parameterTypes.length !== functionParameters.length) {
    return false
  }

  const argumentMatches: boolean[] = []
  for (let i = 0; i < searchQuery.parameterTypes.length; i++) {
    argumentMatches.push(isSingleArgumentMatch(searchQuery.parameterTypes[i], functionParameters[i]))
  }

  const areAllArgumentMatchesTrue = argumentMatches.every((match) => match)

  return areAllArgumentMatchesTrue
}

function isSingleArgumentMatch (searchParameterTypes: string[], functionParameter: ParameterDeclaration): boolean {
  // Begin assuming it is false for each parameter
  const functionParameterType = functionParameter.getType().getText()

  if (searchParameterTypes.length === 1 && searchParameterTypes[0] === '*') {
    return true
  }

  for (const searchParameterType of searchParameterTypes) {
    if (removeDynamicImports(functionParameterType).includes(searchParameterType)) {
      return true
    }
  }

  return false
}

function removeDynamicImports (inputStr: string): string {
  const importRegex = /import\([^)]+\)\./g
  return inputStr.replace(importRegex, '')
}

// showcase how we might add partial type checking
// function _getMatchingFunctions (tsconfigPath: string, obj: object): FunctionDetail[] {
//   const project = new Project({ tsConfigFilePath: tsconfigPath })

//   const results: FunctionDetail[] = []

//   for (const sourceFile of project.getSourceFiles()) {
//     for (const func of sourceFile.getFunctions()) {
//       const firstParam = func.getParameters()[0]
//       if (firstParam !== undefined) {
//         const paramType = firstParam.getType()
//         const properties = paramType.getProperties()

//         console.log('properties', paramType.getText())

//         const allPropsExist = Object.keys(obj).every(propName =>
//           properties.some(tsProperty => tsProperty.getName() === propName)
//         )

//         if (allPropsExist) {
//           results.push({
//             fileName: sourceFile.getFilePath(),
//             functionName: func.getName() ?? 'Anonymous',
//             line: func.getStartLineNumber()
//           })
//         }
//       }
//     }
//   }

//   return results
// }
