import { evaluateSearchQuery } from '../src/evaluator'
import { getMethodsAndFunctions } from '../src/explorer/exporer'
const tsConfigFilePath = 'testproject.tsconfig.json'

const projectFunctions = getMethodsAndFunctions('function', tsConfigFilePath, false)
const projectFunctionsAndMethods = getMethodsAndFunctions('both', tsConfigFilePath, false)
const projectMethods = getMethodsAndFunctions('method', tsConfigFilePath, false)

describe('getMatchingFunctions everything defined', () => {
  it('should correctly parse "function:string?string,string"', () => {
    const result = evaluateSearchQuery(projectFunctions, { kind: 'function', returnTypes: ['string'], parameterTypes: [['string'], ['string']] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse "method:string?string,string"', () => {
    const result = evaluateSearchQuery(projectMethods, { kind: 'method', returnTypes: ['string'], parameterTypes: [['string'], ['string']] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse ":string?string,string"', () => {
    const result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: ['string'], parameterTypes: [['string'], ['string']] })
    expect(result.length).toEqual(2)
  })

  it('should correctly parse ":string?string,*"', () => {
    const result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: ['string'], parameterTypes: [['string'], ['*']] })
    expect(result.length).toEqual(3)
  })

  it('should correctly parse ":string?string,string|number"', () => {
    const result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: ['string'], parameterTypes: [['string'], ['string', 'number']] })
    expect(result.length).toEqual(3)
  })

  it('should correctly parse "function:string?string,number"', () => {
    const result = evaluateSearchQuery(projectFunctions, { kind: 'function', returnTypes: ['string'], parameterTypes: [['string'], ['number']] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse "function:Record<string, string>?"', () => {
    const result = evaluateSearchQuery(projectFunctions, { kind: 'function', returnTypes: ['Record<string, string>'], parameterTypes: [] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse "function:Record<string, string>|boolean?"', () => {
    const result = evaluateSearchQuery(projectFunctions, { kind: 'function', returnTypes: ['Record<string, string>', 'boolean'], parameterTypes: [] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse ":?...,string"', () => {
    const result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: [''], parameterTypes: [['...'], ['string']] })
    expect(result.length).toEqual(4)
  })

  it('should correctly parse ":?{a&b}"', () => {
    const result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: [''], parameterTypes: [['{a&b}']] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse ":?{a&c}"', () => {
    const result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: [''], parameterTypes: [['{a&c}']] })
    expect(result.length).toEqual(0)
  })

  it('should correctly parse ":?{a}"', () => {
    const result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: [''], parameterTypes: [['{a}']] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse ":{a}?"', () => {
    const result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: ['{a}'], parameterTypes: [] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse arrow functions', () => {
    const result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: ['void'], parameterTypes: [] })
    expect(result.length).toEqual(2)
  })

  it('should correctly match with Levenshtein distances', () => {
    let result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: ['vod'], parameterTypes: [] })
    expect(result.length).toEqual(2)

    result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: ['vood'], parameterTypes: [] })
    expect(result.length).toEqual(2)

    result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: ['mood'], parameterTypes: [] })
    expect(result.length).toEqual(2)

    result = evaluateSearchQuery(projectFunctionsAndMethods, { kind: 'both', returnTypes: ['voi'], parameterTypes: [] })
    expect(result.length).toEqual(2)
  })
})
