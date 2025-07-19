import type { StarlightPlugin } from '@astrojs/starlight/types'

export default function starlightAutoDrafts(): StarlightPlugin {
  return {
    name: 'starlight-auto-drafts',
    hooks: {
      'config:setup': () => {
        // TODO(HiDeoo)
      },
    },
  }
}
