import { distance } from 'fastest-levenshtein'

type StringMatcher = (str1: string, str2: string) => boolean
const LEVENSHTEIN_THRESHOLD = 3

export function getMatcher (): StringMatcher {
  if (process.env.MATCHER === 'includes') return includesMatcher
  return levenMatcher
}

const includesMatcher = (str1: string, str2: string): boolean => str1.includes(str2)

const levenMatcher = (str1: string, str2: string): boolean => {
  return includesMatcher(str1, str2) || distance(str1, str2) < LEVENSHTEIN_THRESHOLD
}
