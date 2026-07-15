export interface ConsoleColors {
  blue: (text: string) => string
  cyan: (text: string) => string
  green: (text: string) => string
  yellow: (text: string) => string
  red: (text: string) => string
  dim: (text: string) => string
  bold: (text: string) => string
}

export const colors: ConsoleColors = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
}
