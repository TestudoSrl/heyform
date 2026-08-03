import { OpUnitType, QUnitType } from 'dayjs'
import _dayjs from 'dayjs'
import type _ms from 'ms'

import { hs } from './second'

export function timestamp(): number {
  return Math.floor(Date.now() / 1e3)
}

export const dayjs = _dayjs
export const date = dayjs

export function unixDate(t: number) {
  return dayjs.unix(t)
}

export function isDateExpired(start: number, end: number, expire: string): boolean {
  return end - start > hs(expire as _ms.StringValue)!
}

export function unixDiff(start: number, end: number, unit: QUnitType | OpUnitType = 'day'): number {
  if (start > end || start < 0 || end < 0) {
    return 0
  }
  return unixDate(end).diff(unixDate(start), unit)
}

export function datePeriod(start: number, value = 1, unit: OpUnitType = 'month'): number {
  return unixDate(start)
    .add(value, unit as unknown as any)
    .unix()
}
