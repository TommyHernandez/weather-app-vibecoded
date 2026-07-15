import { colors } from "./colors.ts"

export function info(message: string): void {
  console.log(colors.cyan(message))
}

export function success(message: string): void {
  console.log(colors.green(message))
}

export function warning(message: string): void {
  console.log(colors.yellow(message))
}

export function error(message: string): void {
  console.log(colors.red(message))
}

export function muted(message: string): void {
  console.log(colors.dim(message))
}
