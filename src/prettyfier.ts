import { type FunctionDetail } from './evaluator'
import kleur from 'kleur'

export function prettify (functionDetail: FunctionDetail): string {
  const { fileName, functionName, paramString, line } = functionDetail

  const coloredFileName = kleur.blue(fileName)
  const coloredLine = kleur.yellow(line)
  const coloredFunctionName = kleur.green(functionName)
  const coloredParamString = kleur.cyan(paramString)

  return `${coloredFileName}:${coloredLine} ${coloredFunctionName}(${coloredParamString}): ${functionDetail.returnType}`
}
