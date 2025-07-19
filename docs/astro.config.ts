import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightAutoDrafts from 'starlight-auto-drafts'

export default defineConfig({
  integrations: [
    starlight({
      description: '// TODO(HiDeoo) ',
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-auto-drafts/edit/main/docs/',
      },
      locales: {
        root: { label: 'English', lang: 'en' },
        fr: { label: 'Français', lang: 'fr' },
      },
      plugins: [starlightAutoDrafts()],
      sidebar: [
        {
          label: 'Start Here',
          items: ['getting-started'],
        },
        // TODO(HiDeoo)
        // {
        //   label: 'Resources',
        //   items: [{ label: 'Plugins and Tools', slug: 'resources/starlight' }],
        // },
      ],
      social: [
        { href: 'https://bsky.app/profile/hideoo.dev', icon: 'blueSky', label: 'Bluesky' },
        { href: 'https://github.com/HiDeoo/starlight-auto-drafts', icon: 'github', label: 'GitHub' },
      ],
      title: 'Starlight Auto Drafts',
    }),
  ],
  site: 'https://starlight-auto-drafts.netlify.app/',
  trailingSlash: 'always',
})
