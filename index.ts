#!/usr/bin/env node

import { evaluateSearchQuery } from './src/evaluator'
import { parse } from './src/lexer'
import { prettify } from './src/prettyfier'

const tsConfigFilePath = process.argv[2]
const userSearchQuery = process.argv[3]

export function tsoogle (tsConfigFilePath: string, userSearchQuery: string): string {
  const searchQuery = parse(userSearchQuery)
  let output = ''
  evaluateSearchQuery(tsConfigFilePath, searchQuery).forEach(func => {
    output += `${prettify(func)}\n`
  })
  return output
}

console.log(tsoogle(tsConfigFilePath, userSearchQuery))
