import { parse } from '../src/lexer'

describe('parseTypeString', () => {
  it('should correctly parse "function:void?Product,Service"', () => {
    const result = parse('function:void?Product,Service')
    expect(result).toEqual({
      kind: 'function',
      returnTypes: ['void'],
      parameterTypes: [['Product'], ['Service']]
    })
  })

  it('should correctly parse "function:void?Product,Service|number"', () => {
    const result = parse('function:void?Product,Service|number')
    expect(result).toEqual({
      kind: 'function',
      returnTypes: ['void'],
      parameterTypes: [['Product'], ['Service', 'number']]
    })
  })

  it('should correctly parse ":void?Product,Service|number"', () => {
    const result = parse(':void?Product,Service|number')
    expect(result).toEqual({
      kind: 'both',
      returnTypes: ['void'],
      parameterTypes: [['Product'], ['Service', 'number']]
    })
  })

  it('should correctly parse "method:void?Product|Service,number"', () => {
    const result = parse('method:void?Product,Service|number')
    expect(result).toEqual({
      kind: 'method',
      returnTypes: ['void'],
      parameterTypes: [['Product'], ['Service', 'number']]
    })
  })

  it('should correctly parse "number"', () => {
    const result = parse('number')
    expect(result).toEqual({
      kind: 'both',
      returnTypes: ['number'],
      parameterTypes: []
    })
  })

  it('should correctly parse ":number"', () => {
    const result = parse(':number')
    expect(result).toEqual({
      kind: 'both',
      returnTypes: ['number'],
      parameterTypes: []
    })
  })

  it('should correctly parse "number?"', () => {
    const result = parse(':number')
    expect(result).toEqual({
      kind: 'both',
      returnTypes: ['number'],
      parameterTypes: []
    })
  })

  it('should correctly parse "number?number"', () => {
    const result = parse('number?number')
    expect(result).toEqual({
      kind: 'both',
      returnTypes: ['number'],
      parameterTypes: [['number']]
    })
  })

  it('should correctly parse "number,number"', () => {
    const result = parse('number,number')
    expect(result).toEqual({
      kind: 'both',
      returnTypes: ['*'],
      parameterTypes: [['number'], ['number']]
    })
  })
})
