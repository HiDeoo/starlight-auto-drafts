import type { StarlightPlugin, StarlightUserConfig } from '@astrojs/starlight/types'

import { getDraftIds } from './libs/content'
import { filterDrafts } from './libs/sidebar'
import { vitePluginStarlightAutoDrafts } from './libs/vite'

export default function starlightAutoDrafts(): StarlightPlugin {
  return {
    name: 'starlight-auto-drafts',
    hooks: {
      'config:setup': async ({ addIntegration, addRouteMiddleware, astroConfig, command, config, updateConfig }) => {
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

        updateConfig({
          sidebar: await filterDrafts(astroConfig, starlightConfig, starlightConfig.sidebar, draftIds),
        })
      },
    },
  }
}
