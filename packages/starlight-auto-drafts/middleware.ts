import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'

import { drafts } from './libs/content'
import { stripLeadingAndTrailingSlash } from './libs/path'

export const onRequest = defineRouteMiddleware(({ locals }) => {
  const { starlightRoute } = locals

  starlightRoute.sidebar = filterDrafts(starlightRoute.sidebar)
})

function filterDrafts(items: StarlightRouteData['sidebar']): StarlightRouteData['sidebar'] {
  const result: StarlightRouteData['sidebar'] = []

  for (const item of items) {
    if (item.type === 'group') {
      result.push({ ...item, entries: filterDrafts(item.entries) })
      continue
    }

    const slug = stripLeadingAndTrailingSlash(item.href)

    if (drafts.has(slug)) continue

    result.push(item)
  }

  return result
}
