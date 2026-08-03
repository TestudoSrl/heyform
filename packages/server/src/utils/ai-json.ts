import { jsonrepair } from 'jsonrepair'

export function parseAIJson<T = unknown>(content: string): T {
  return JSON.parse(jsonrepair(content)) as T
}
