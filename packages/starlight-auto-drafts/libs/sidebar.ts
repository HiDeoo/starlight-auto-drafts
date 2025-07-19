import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroConfig } from 'astro'

import type { DraftIds } from './content'
import { stripLeadingAndTrailingSlash } from './path'

export async function filterDrafts(
  astroConfig: AstroConfig,
  starlightConfig: StarlightUserConfig,
  sidebar: StarlightSidebarUserConfig,
  draftIds: DraftIds,
): Promise<StarlightSidebarUserConfig> {
  const result: StarlightSidebarUserConfig = []

  for (const item of sidebar) {
    if (typeof item === 'string') {
      if (draftIds.has(item)) continue
    } else if ('slug' in item) {
      if (draftIds.has(item.slug)) continue
    } else if ('link' in item) {
      if (draftIds.has(stripLeadingAndTrailingSlash(item.link))) continue
    } else if (!('autogenerate' in item)) {
      result.push({
        ...item,
        items: await filterDrafts(astroConfig, starlightConfig, item.items, draftIds),
      })
      continue
    }

    result.push(item)
  }

  return result
}

type StarlightSidebarUserConfig = NonNullable<StarlightUserConfig['sidebar']>
