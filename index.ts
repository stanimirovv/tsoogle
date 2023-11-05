#!/usr/bin/env node

import { evaluateSearchQuery } from './src/evaluator'
import { parse } from './src/lexer'
import { prettify } from './src/prettyfier'

const tsFilePath = process.argv[2]
const userSearchQuery = process.argv[3]

const searchQuery = parse(userSearchQuery)
evaluateSearchQuery(tsFilePath, searchQuery).forEach(func => {
  console.log(prettify(func))
})
