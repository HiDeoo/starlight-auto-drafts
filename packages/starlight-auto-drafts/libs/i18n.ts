import type { StarlightUserConfig } from '@astrojs/starlight/types'

import { stripTrailingSlash } from './path'

export function getDefaultLocale(starlightConfig: StarlightUserConfig): Locale {
  return starlightConfig.defaultLocale === 'root' ? undefined : starlightConfig.defaultLocale
}

export function isMultilingual(starlightConfig: StarlightUserConfig): boolean {
  return Object.keys(starlightConfig.locales ?? {}).length > 1
}

// https://github.com/withastro/starlight/blob/bf58c60b9c3d5f5efdafbdba83cefa0566a367dc/packages/starlight/utils/slugs.ts#L71
export function getLocalizedId(starlightConfig: StarlightUserConfig, id: string, locale: Locale): string {
  const idLocale = getLocaleFromId(starlightConfig, id)
  if (idLocale === locale) return id
  locale = locale ?? ''
  if (idLocale === id) return locale
  if (idLocale) return stripTrailingSlash(id.replace(`${idLocale}/`, locale ? `${locale}/` : ''))
  return id ? `${locale}/${id}` : locale
}

// https://github.com/withastro/starlight/blob/bf58c60b9c3d5f5efdafbdba83cefa0566a367dc/packages/starlight/integrations/shared/slugToLocale.ts
function getLocaleFromId(starlightConfig: StarlightUserConfig, id: string): Locale {
  const localesConfig = starlightConfig.locales ?? {}
  const baseSegment = id.split('/')[0]
  if (baseSegment && localesConfig[baseSegment]) return baseSegment
  if (!localesConfig.root) return starlightConfig.defaultLocale
  return undefined
}

export type Locale = string | undefined
