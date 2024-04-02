import { v4 as uuidv4 } from 'uuid'

export function matchFilters(metadata: any, filters: any): boolean {
  for (const key in filters) {
    if (typeof filters[key] === 'object') {
      // If the filter value is an object, recursively check its nested properties
      if (!this.matchFilters(metadata[key], filters[key])) {
        return false
      }
    } else {
      // If the filter value is a primitive type, check for equality
      if (metadata[key] !== filters[key]) {
        return false
      }
    }
  }

  // If all filter criteria match, return true
  return true
}

export function getFutureTimeStamp(hoursFromNow: number): number {
  const currentTimestamp = Date.now() // Get current timestamp in milliseconds
  const futureTimestamp = currentTimestamp + hoursFromNow * 60 * 60 * 1000 // Add 20 hours in milliseconds
  return futureTimestamp
}

export function generateUrlUUID(): string {
  return uuidv4()
}
