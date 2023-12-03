import { type MethodDeclaration, type FunctionDeclaration, type ArrowFunction, Project, SyntaxKind, type SourceFile} from 'ts-morph'
import { type ProjectFunction } from '../projectFunction.interface'
import { getCommitHash } from './getCommitHash'
import { doesDatabaseExist, initializeDatabase, getFunctionsFromDb, storeFunctionInDatabase } from './indexer'

type tsMorphFunction = MethodDeclaration | FunctionDeclaration | ArrowFunction
type FunctionFetcher = (sourceFile: SourceFile) => tsMorphFunction[]

export async function getMethodsAndFunctions (kind: 'both' | 'function' | 'method', tsconfigPath: string, useIndex: boolean): Promise<ProjectFunction[]> {
  if (!useIndex) {
    return _getMethodsAndFunctions(kind, tsconfigPath)
  }

  if (!doesDatabaseExist(tsconfigPath)) {
    await initializeDatabase(tsconfigPath)
  }

  const currentGitCommitId = await getCommitHash()
  let functions = await getFunctionsFromDb(tsconfigPath, currentGitCommitId)

  if (functions.length === 0) {
    functions = _getMethodsAndFunctions(kind, tsconfigPath)
    for (const func of functions) {
      await storeFunctionInDatabase(tsconfigPath, currentGitCommitId, func)
    }
  }
  return functions
}

function _getMethodsAndFunctions (kind: 'both' | 'function' | 'method', tsconfigPath: string): ProjectFunction[] {
  const project = new Project({ tsConfigFilePath: tsconfigPath })
  const functionFetcher = getSourceFileFunctionFetcher(kind)

  const projectFunctions: ProjectFunction[] = []
  for (const sourceFile of project.getSourceFiles()) {
    const tsMorphFunctions = functionFetcher(sourceFile)
    const projectFunctionsForFile: ProjectFunction[] = tsMorphFunctions.map((func) => {
      let funcName = 'Anonymous'
      if ('getName' in func) {
        funcName = func.getName() ?? 'Anonymous'
      }
      return {
        name: funcName,
        parameters: func.getParameters().map((prop) => {
          return {
            name: prop.getName(),
            type: prop.getType().getText()
          }
        }),
        paramString: func.getParameters().map((p) => `${p.getName()}: ${p.getType().getText()}`).join(','),
        returnType: func.getReturnType().getText(),
        fileName: sourceFile.getFilePath(),
        fileLine: func.getStartLineNumber()
      }
    })
    projectFunctions.push(...projectFunctionsForFile)
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

const fetchAll = (sourceFile: SourceFile): tsMorphFunction[]  => {
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
