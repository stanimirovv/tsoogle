import { type FunctionDeclaration, type MethodDeclaration, type ArrowFunction } from 'ts-morph'

export type ProjectFunction = MethodDeclaration | FunctionDeclaration | ArrowFunction
