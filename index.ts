#!/usr/bin/env node

import { evaluateSearchQuery, type FunctionDetail } from './src/evaluator'
import { getMethodsAndFunctions } from './src/explorer/explorer'
import { parse } from './src/lexer'
import { prettify } from './src/prettyfier'

const tsConfigFilePath = process.argv[2]
const userSearchQuery = process.argv[3]

export async function tsoogle (tsConfigFilePath: string, userSearchQuery: string, useIndex = true): Promise<FunctionDetail[]> {
  const searchQuery = parse(userSearchQuery)
  const projectFunctions = await getMethodsAndFunctions(searchQuery.kind, tsConfigFilePath, useIndex)
  return evaluateSearchQuery(projectFunctions, searchQuery)
}

export async function tsoogleCmd (tsConfigFilePath: string, userSearchQuery: string, useIndex = true): Promise<string> {
  const searchQuery = parse(userSearchQuery)
  let output = ''
  const projectFunctions = await getMethodsAndFunctions(searchQuery.kind, tsConfigFilePath, useIndex)
  evaluateSearchQuery(projectFunctions, searchQuery).forEach(func => {
    output += `${prettify(func)}\n`
  })
  return output
}

async function main (): Promise<void> {
  if (tsConfigFilePath !== undefined && userSearchQuery !== undefined) {
    try {
      const response = await tsoogleCmd(tsConfigFilePath, userSearchQuery)
      console.log(response)
    } catch (error) {
      console.error('Error:', error)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
