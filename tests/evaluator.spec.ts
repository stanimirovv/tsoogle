import { evaluateSearchQuery } from '../src/evaluator'

describe('getMatchingFunctions everything defined', () => {
  it('should correctly parse "function:string?string,string"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'function', returnTypes: ['string'], parameterTypes: [['string'], ['string']] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse "method:string?string,string"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'method', returnTypes: ['string'], parameterTypes: [['string'], ['string']] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse ":string?string,string"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'both', returnTypes: ['string'], parameterTypes: [['string'], ['string']] })
    expect(result.length).toEqual(2)
  })

  it('should correctly parse ":string?string,*"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'both', returnTypes: ['string'], parameterTypes: [['string'], ['*']] })
    expect(result.length).toEqual(3)
  })

  it('should correctly parse ":string?string,string|number"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'both', returnTypes: ['string'], parameterTypes: [['string'], ['string', 'number']] })
    expect(result.length).toEqual(3)
  })

  it('should correctly parse "function:string?string,number"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'function', returnTypes: ['string'], parameterTypes: [['string'], ['number']] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse "function:Record<string, string>?"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'function', returnTypes: ['Record<string, string>'], parameterTypes: [] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse "function:Record<string, string>|boolean?"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'function', returnTypes: ['Record<string, string>', 'boolean'], parameterTypes: [] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse ":?...,string"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'both', returnTypes: [''], parameterTypes: [['...'], ['string']] })
    expect(result.length).toEqual(3)
  })

  it('should correctly parse ":?{a&b}"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'both', returnTypes: [''], parameterTypes: [['{a&b}']] })
    expect(result.length).toEqual(1)
  })

  it('should correctly parse ":?{a&c}"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'both', returnTypes: [''], parameterTypes: [['{a&c}']] })
    expect(result.length).toEqual(0)
  })

  it('should correctly parse ":?{a}"', () => {
    const result = evaluateSearchQuery('testproject.tsconfig.json', { kind: 'both', returnTypes: [''], parameterTypes: [['{a}']] })
    expect(result.length).toEqual(1)
  })
})
