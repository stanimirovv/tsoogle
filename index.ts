#!/usr/bin/env node

import { evaluateSearchQuery, type FunctionDetail } from './src/evaluator'
import { parse } from './src/lexer'
import { prettify } from './src/prettyfier'

const tsConfigFilePath = process.argv[2]
const userSearchQuery = process.argv[3]

export function tsoogle (tsConfigFilePath: string, userSearchQuery: string): FunctionDetail[] {
  const searchQuery = parse(userSearchQuery)
  return evaluateSearchQuery(tsConfigFilePath, searchQuery)
}

export function tsoogleCmd (tsConfigFilePath: string, userSearchQuery: string): string {
  const searchQuery = parse(userSearchQuery)
  let output = ''
  evaluateSearchQuery(tsConfigFilePath, searchQuery).forEach(func => {
    output += `${prettify(func)}\n`
  })
  return output
}

if (tsConfigFilePath !== undefined && userSearchQuery !== undefined) {
  console.log(tsoogleCmd(tsConfigFilePath, userSearchQuery))
}
