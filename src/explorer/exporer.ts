import { type MethodDeclaration, type FunctionDeclaration, type ArrowFunction, Project, SyntaxKind, type SourceFile, ts } from 'ts-morph'
import { type ProjectFunction } from '../projectFunction.type'

type FunctionFetcher = (sourceFile: SourceFile) => ProjectFunction[]

export async function getMethodsAndFunctions (kind: 'both' | 'function' | 'method', tsconfigPath: string, useIndex: boolean): Promise<ProjectFunction[]> {
  if (!useIndex) {
    return _getMethodsAndFunctions(kind, tsconfigPath)
  }

  // if (!doesDatabaseExist(tsconfigPath)) {
  //   await initializeDatabase(tsconfigPath)
  // }

  // const functions = await getFunctions(kind, tsconfigPath)

  // if (functions.length === 0) {
  //   const functions = _getMethodsAndFunctions(kind, tsconfigPath)
  //   const currentGitCommitId = '12345'
  //   for (const func of functions) {
  //     await storeFunctionInDatabase(tsconfigPath, currentGitCommitId, func)
  //   }
  //   // store functions to DB
  //   return functions
  // }
  return _getMethodsAndFunctions(kind, tsconfigPath)
}

function _getMethodsAndFunctions (kind: 'both' | 'function' | 'method', tsconfigPath: string): ProjectFunction[] {
  const project = new Project({ tsConfigFilePath: tsconfigPath })
  const functionFetcher = getSourceFileFunctionFetcher(kind)

  const projectFunctions: Array<MethodDeclaration | FunctionDeclaration | ArrowFunction> = []
  for (const sourceFile of project.getSourceFiles()) {
    projectFunctions.push(...functionFetcher(sourceFile))
  }

  return projectFunctions
}

function getSourceFileFunctionFetcher (kind: 'both' | 'function' | 'method'): FunctionFetcher {
  if (kind === 'both') {
    return fetchAll
  } else if (kind === 'function') {
    return fetchFunctions
  } else {
    return fetchMethods
  }
}

const fetchAll = (sourceFile: SourceFile): ProjectFunction[] => {
  const methods = sourceFile
    .getClasses()
    .map((c) =>
      c.getMethods()).flat()

  const functions = sourceFile.getFunctions()

  const arrowFunctions = sourceFile.getVariableDeclarations().filter(variable => {
  // Check if the initializer is an arrow function.
    const initializer = variable.getInitializer()
    return initializer != null && initializer.getKindName() === 'ArrowFunction'
  }).map(variable => {
    const arrowFunction = variable.getInitializerIfKind(SyntaxKind.ArrowFunction) as ArrowFunction
    return arrowFunction
  })

  return [...methods, ...functions, ...arrowFunctions]
}

const fetchFunctions = (sourceFile: SourceFile): FunctionDeclaration[] => {
  return sourceFile.getFunctions()
}

const fetchMethods = (sourceFile: SourceFile): MethodDeclaration[] => {
  return sourceFile
    .getClasses()
    .map((c) =>
      c.getMethods()).flat()
}

function removeDynamicImports (inputStr: string): string {
  const importRegex = /import\([^)]+\)\./g
  return inputStr.replace(importRegex, '')
}
