import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroConfig } from 'astro'

import type { DraftIds } from './content'
import { stripLeadingAndTrailingSlash } from './path'

export async function filterDrafts(
  astroConfig: AstroConfig,
  starlightConfig: StarlightUserConfig,
  sidebar: StarlightSidebarUserConfig,
  draftIds: DraftIds,
): Promise<[sidebar: StarlightSidebarUserConfig, filteredItems: string[]]> {
  const result: StarlightSidebarUserConfig = []
  const filteredItems: string[] = []
  let slug: string | undefined

  for (const item of sidebar) {
    if (typeof item === 'string') {
      slug = item
    } else if ('slug' in item) {
      slug = item.slug
    } else if ('link' in item) {
      slug = stripLeadingAndTrailingSlash(item.link)
    } else if ('autogenerate' in item) {
      slug = undefined
    } else {
      const [items, groupFilteredItems] = await filterDrafts(astroConfig, starlightConfig, item.items, draftIds)
      filteredItems.push(...groupFilteredItems)
      result.push({ ...item, items })
      continue
    }

    if (slug !== undefined && draftIds.has(slug)) {
      filteredItems.push(slug)
      continue
    }

    result.push(item)
  }

  return [result, filteredItems]
}

type StarlightSidebarUserConfig = NonNullable<StarlightUserConfig['sidebar']>
