export function parseRoles(rawRoles: unknown): string[] {
  if (Array.isArray(rawRoles)) return rawRoles as string[]
  if (typeof rawRoles === 'string') {
    return rawRoles
      .replace(/^\{|\}$/g, '')
      .split(',')
      .map(r => r.trim().replace(/^"|"$/g, ''))
      .filter(Boolean)
  }
  return []
}
