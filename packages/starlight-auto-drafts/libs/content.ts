import { getCollection, type CollectionEntry } from 'astro:content'
import context from 'virtual:starlight-auto-drafts/context'

import { stripTrailingSlash } from './path'

export const defaultLocale = context.defaultLocale === 'root' ? undefined : context.defaultLocale

async function getDraftRoutes() {
  const routes = new Set<string>()

  let entries: CollectionEntry<'docs'>[] = await getCollection('docs')
  entries = entries.map((entry) => ({ ...entry, id: entry.id === 'index' ? '' : entry.id }))

  const draftEntries = entries.filter((entry) => entry.data.draft === true)

  for (const entry of draftEntries) routes.add(entry.id)

  if (context.isMultilingual) {
    const defaultLocaleEntries = filterEntriesByLocale(entries, defaultLocale)

    for (const locale in context.locales) {
      if (locale === defaultLocale || locale === 'root') continue
      const localeEntries = filterEntriesByLocale(entries, locale)

      for (const defaultLocaleEntry of defaultLocaleEntries) {
        const localeId = getLocalizedId(defaultLocaleEntry.id, locale)
        const hasLocaleEntry = localeEntries.some((entry) => entry.id === localeId)

        if (hasLocaleEntry || defaultLocaleEntry.data.draft !== true) continue

        routes.add(localeId)
      }
    }
  }

  return routes
}

// https://github.com/withastro/starlight/blob/bf58c60b9c3d5f5efdafbdba83cefa0566a367dc/packages/starlight/utils/routing/index.ts#L131
function filterEntriesByLocale(entries: CollectionEntry<'docs'>[], locale: Locale): CollectionEntry<'docs'>[] {
  if (!context.locales) return entries

  if (locale && locale in context.locales) {
    return entries.filter((entry) => entry.id === locale || entry.id.startsWith(`${locale}/`))
  } else if (context.locales.root) {
    const locales = Object.keys(context.locales).filter((locale) => locale !== 'root')
    const isLocaleIndex = new RegExp(`^(${locales.join('|')})$`)
    const isLocaleDirectory = new RegExp(`^(${locales.join('|')})/`)
    return entries.filter((entry) => !isLocaleIndex.test(entry.id) && !isLocaleDirectory.test(entry.id))
  }

  return entries
}

// https://github.com/withastro/starlight/blob/bf58c60b9c3d5f5efdafbdba83cefa0566a367dc/packages/starlight/utils/slugs.ts#L71
function getLocalizedId(id: string, locale: Locale): string {
  const idLocale = getLocaleFromId(id)
  if (idLocale === locale) return id
  locale = locale ?? ''
  if (idLocale === id) return locale
  if (idLocale) return stripTrailingSlash(id.replace(`${idLocale}/`, locale ? `${locale}/` : ''))
  return id ? `${locale}/${id}` : locale
}

// https://github.com/withastro/starlight/blob/bf58c60b9c3d5f5efdafbdba83cefa0566a367dc/packages/starlight/integrations/shared/slugToLocale.ts
function getLocaleFromId(id: string): Locale {
  const localesConfig = context.locales ?? {}
  const baseSegment = id.split('/')[0]
  if (baseSegment && localesConfig[baseSegment]) return baseSegment
  if (!localesConfig.root) return context.defaultLocale
  return undefined
}

export const drafts = await getDraftRoutes()

type Locale = string | undefined
