#!/usr/bin/env node

import { evaluateSearchQuery, type FunctionDetail } from './src/evaluator'
import { getMethodsAndFunctions } from './src/explorer/exporer'
import { parse } from './src/lexer'
import { prettify } from './src/prettyfier'

const tsConfigFilePath = process.argv[2]
const userSearchQuery = process.argv[3]

export function tsoogle (tsConfigFilePath: string, userSearchQuery: string, useIndex = true): FunctionDetail[] {
  const searchQuery = parse(userSearchQuery)
  const projectFunctions = getMethodsAndFunctions(searchQuery.kind, tsConfigFilePath, useIndex)
  return evaluateSearchQuery(projectFunctions, searchQuery)
}

export function tsoogleCmd (tsConfigFilePath: string, userSearchQuery: string, useIndex = true): string {
  const searchQuery = parse(userSearchQuery)
  let output = ''
  const projectFunctions = getMethodsAndFunctions(searchQuery.kind, tsConfigFilePath, useIndex)
  evaluateSearchQuery(projectFunctions, searchQuery).forEach(func => {
    output += `${prettify(func)}\n`
  })
  return output
}

if (tsConfigFilePath !== undefined && userSearchQuery !== undefined) {
  console.log(tsoogleCmd(tsConfigFilePath, userSearchQuery))
}
