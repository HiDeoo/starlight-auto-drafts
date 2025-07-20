import fs from 'node:fs/promises'

import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroConfig } from 'astro'
import { slug } from 'github-slugger'
import matter from 'gray-matter'
import { glob } from 'tinyglobby'

import { getDefaultLocale, getLocalizedId, isMultilingual, type Locale } from './i18n'
import { stripExtension, stripLeadingAndTrailingSlash } from './path'

// https://github.com/withastro/starlight/blob/bf58c60b9c3d5f5efdafbdba83cefa0566a367dc/packages/starlight/loaders.ts#L4-L6
// https://github.com/withastro/starlight/blob/bf58c60b9c3d5f5efdafbdba83cefa0566a367dc/packages/starlight/loaders.ts#L52
const docsExtensions = ['markdown', 'mdown', 'mkdn', 'mkd', 'mdwn', 'md', 'mdx', 'mdoc']

export async function getDraftIds(astroConfig: AstroConfig, starlightConfig: StarlightUserConfig): Promise<DraftIds> {
  const ids: DraftIds = new Set()
  const defaultLocale = getDefaultLocale(starlightConfig)

  const entries = await getEntries(astroConfig)
  const draftEntries = entries.filter((entry) => entry.draft === true)

  for (const entry of draftEntries) ids.add(entry.id)

  if (isMultilingual(starlightConfig)) {
    const defaultLocaleEntries = filterEntriesByLocale(starlightConfig, entries, defaultLocale)

    for (const locale in starlightConfig.locales) {
      if (locale === defaultLocale || locale === 'root') continue
      const localeEntries = filterEntriesByLocale(starlightConfig, entries, locale)

      for (const defaultLocaleEntry of defaultLocaleEntries) {
        const localeId = getLocalizedId(starlightConfig, defaultLocaleEntry.id, locale)
        const hasLocaleEntry = localeEntries.some((entry) => entry.id === localeId)

        if (hasLocaleEntry || defaultLocaleEntry.draft !== true) continue

        ids.add(localeId)
      }
    }
  }

  return ids
}

async function getEntries(astroConfig: AstroConfig): Promise<Entry[]> {
  const collectionUrl = new URL('content/docs', astroConfig.srcDir)

  const paths = await glob([`**/[^_]*.{${docsExtensions.join(',')}}`], {
    absolute: true,
    cwd: collectionUrl.pathname,
    onlyFiles: true,
  })

  const entries: Entry[] = []

  for (const path of paths) {
    const content = await readFrontmatter(path)
    const frontmatter = matter(content)
    const customSlug: unknown = frontmatter.data['slug']
    entries.push({
      id:
        typeof customSlug === 'string' && customSlug.length > 0
          ? stripLeadingAndTrailingSlash(customSlug)
          : getEntryId(path, collectionUrl),
      draft: frontmatter.data['draft'] === true,
    })
  }

  return entries
}

async function readFrontmatter(path: string): Promise<string> {
  let handle: fs.FileHandle | undefined

  try {
    handle = await fs.open(path, 'r')

    let didStartFrontmatter = false
    const buffer = new Uint8Array(1024)
    const decoder = new TextDecoder()
    let content = ''

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, null)
      if (bytesRead === 0) break

      const chunk = decoder.decode(buffer.subarray(0, bytesRead))
      content += chunk

      if (!didStartFrontmatter) {
        const separatorIndex = chunk.indexOf('---')
        if (separatorIndex !== -1) didStartFrontmatter = true
      }

      if (didStartFrontmatter) {
        const containsEndSeparator = /\r?\n---(?:\r?\n|$)/.test(content)
        if (containsEndSeparator) break
      }
    }

    return content
  } finally {
    await handle?.close()
  }
}

function getEntryId(path: string, collectionUrl: URL): string {
  const idPath = path.replace(collectionUrl.pathname, '')
  const segments = stripLeadingAndTrailingSlash(stripExtension(idPath)).split('/')
  const idSegments = segments.map((segment) => slug(segment))
  const id = idSegments.join('/')
  return id === 'index' ? '' : id
}

// https://github.com/withastro/starlight/blob/bf58c60b9c3d5f5efdafbdba83cefa0566a367dc/packages/starlight/utils/routing/index.ts#L131
function filterEntriesByLocale(starlightConfig: StarlightUserConfig, entries: Entry[], locale: Locale): Entry[] {
  if (!starlightConfig.locales) return entries

  if (locale && locale in starlightConfig.locales) {
    return entries.filter((entry) => entry.id === locale || entry.id.startsWith(`${locale}/`))
  } else if (starlightConfig.locales.root) {
    const locales = Object.keys(starlightConfig.locales).filter((locale) => locale !== 'root')
    const isLocaleIndex = new RegExp(`^(${locales.join('|')})$`)
    const isLocaleDirectory = new RegExp(`^(${locales.join('|')})/`)
    return entries.filter((entry) => !isLocaleIndex.test(entry.id) && !isLocaleDirectory.test(entry.id))
  }

  return entries
}

interface Entry {
  id: string
  draft: boolean
}

export type DraftIds = Set<string>
