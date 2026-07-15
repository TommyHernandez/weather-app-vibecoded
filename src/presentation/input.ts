import { createInterface } from "readline/promises"
import { stdin, stdout } from "process"

const readline = createInterface({ input: stdin, output: stdout })

export function closeInput(): void {
  readline.close()
}

export async function ask(question: string): Promise<string> {
  return readline.question(question)
}
