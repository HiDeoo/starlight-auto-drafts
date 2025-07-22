import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'
import context from 'virtual:starlight-auto-drafts/context'

import { stripLeadingAndTrailingSlash } from './libs/path'

export const onRequest = defineRouteMiddleware(({ locals }) => {
  const { starlightRoute } = locals

  starlightRoute.sidebar = highlightDrafts(starlightRoute.sidebar)
})

function highlightDrafts(items: StarlightRouteData['sidebar']): StarlightRouteData['sidebar'] {
  return items.map((item) => {
    if (item.type === 'group') {
      return { ...item, entries: highlightDrafts(item.entries) }
    } else if (!context.draftIds.has(stripLeadingAndTrailingSlash(item.href))) {
      return item
    }

    if (!item.badge && context.config.highlights.badges) {
      item.badge = {
        text: 'Draft',
        variant: 'caution',
      }
    }

    item.attrs = { ...item.attrs, 'data-starlight-auto-drafts': 'true' }

    return item
  })
}
