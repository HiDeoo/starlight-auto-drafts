import type { StarlightPlugin } from '@astrojs/starlight/types'
import { AstroError } from 'astro/errors'

import { StarlightAutoDraftsConfigSchema, type StarlightAutoDraftsUserConfig } from './libs/config'
import { getDraftIds } from './libs/content'
import { filterDrafts } from './libs/sidebar'
import { vitePluginStarlightAutoDrafts } from './libs/vite'

export default function starlightAutoDrafts(userConfig?: StarlightAutoDraftsUserConfig): StarlightPlugin {
  const parsedConfig = StarlightAutoDraftsConfigSchema.safeParse(userConfig)

  if (!parsedConfig.success) {
    throw new AstroError(
      `The provided plugin configuration is invalid.\n${parsedConfig.error.issues.map((issue) => issue.message).join('\n')}`,
      `See the error report above for more informations.\n\nIf you believe this is a bug, please file an issue at https://github.com/HiDeoo/starlight-auto-drafts/issues/new/choose`,
    )
  }

  const config = parsedConfig.data

  return {
    name: 'starlight-auto-drafts',
    hooks: {
      'config:setup': async ({
        addIntegration,
        addRouteMiddleware,
        astroConfig,
        command,
        config: starlightConfig,
        logger,
        updateConfig,
      }) => {
        if (command !== 'dev' && command !== 'build') return
        if (!starlightConfig.sidebar) return

        const draftIds = await getDraftIds(astroConfig, starlightConfig)

        if (command === 'dev') {
          addRouteMiddleware({ entrypoint: 'starlight-auto-drafts/middleware' })

          addIntegration({
            name: 'starlight-auto-drafts-integration',
            hooks: {
              'astro:config:setup': ({ updateConfig }) => {
                updateConfig({
                  vite: {
                    plugins: [vitePluginStarlightAutoDrafts(config, draftIds)],
                  },
                })
              },
            },
          })

          updateConfig({
            customCss: ['starlight-auto-drafts/styles', ...(starlightConfig.customCss ?? [])],
          })

          return
        }

        const [sidebar, filteredItems] = await filterDrafts(
          astroConfig,
          starlightConfig,
          starlightConfig.sidebar,
          draftIds,
        )

        if (filteredItems.length > 0) {
          logger.info(`Filtered ${filteredItems.length} links to draft pages from the sidebar configuration:`)
          for (const [index, slug] of filteredItems.entries()) {
            logger.info(`\u001B[2m ${index === filteredItems.length - 1 ? '└─' : '├─'} ${slug}\u001B[0m`)
          }
        }

        updateConfig({ sidebar })
      },
    },
  }
}
