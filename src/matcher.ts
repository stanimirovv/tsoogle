type StringMatcher = (str1: string, str2: string) => boolean
export function getMatcher (): StringMatcher {
  return includesMatcher
}

const includesMatcher = (str1: string, str2: string): boolean => str1.includes(str2)
