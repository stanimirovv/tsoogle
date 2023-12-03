export interface ProjectFunction {
  name: string
  parameters: ProjectFunctionProperty[]
  paramString: string
  fileName: string
  fileLine: number
  returnType: string
}

export interface ProjectFunctionProperty {
  name: string
  type: string
}
