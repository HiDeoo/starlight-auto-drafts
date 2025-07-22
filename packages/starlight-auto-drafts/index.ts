import type { StarlightPlugin, StarlightUserConfig } from '@astrojs/starlight/types'

import { getDraftIds } from './libs/content'
import { filterDrafts } from './libs/sidebar'
import { vitePluginStarlightAutoDrafts } from './libs/vite'

export default function starlightAutoDrafts(): StarlightPlugin {
  return {
    name: 'starlight-auto-drafts',
    hooks: {
      'config:setup': async ({
        addIntegration,
        addRouteMiddleware,
        astroConfig,
        command,
        config,
        logger,
        updateConfig,
      }) => {
        if (command !== 'dev' && command !== 'build') return

        const starlightConfig = config as StarlightUserConfig
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
                    plugins: [vitePluginStarlightAutoDrafts(draftIds)],
                  },
                })
              },
            },
          })

          updateConfig({
            customCss: [...(starlightConfig.customCss ?? []), 'starlight-auto-drafts/styles'],
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
