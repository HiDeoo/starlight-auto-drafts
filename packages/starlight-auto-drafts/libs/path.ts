export function stripLeadingAndTrailingSlash(path: string) {
  return stripLeadingSlash(stripTrailingSlash(path))
}

function stripLeadingSlash(path: string) {
  if (!path.startsWith('/')) return path
  return path.slice(1)
}

export function stripTrailingSlash(path: string) {
  if (!path.endsWith('/')) return path
  return path.slice(0, -1)
}

export function stripExtension(path: string) {
  const periodIndex = path.lastIndexOf('.')
  return path.slice(0, periodIndex === -1 ? undefined : periodIndex)
}
