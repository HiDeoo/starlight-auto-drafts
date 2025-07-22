---
title: Configuration
description: An overview of all the configuration options supported by the Starlight Auto Drafts plugin.
tableOfContents:
  maxHeadingLevel: 4
---

The Starlight Auto Drafts plugin can be configured inside the `astro.config.mjs` configuration file of your project:

```js {12}
// astro.config.mjs
// @ts-check
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightAutoDrafts from 'starlight-auto-drafts'

export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        starlightAutoDrafts({
          // Configuration options go here.
        }),
      ],
      title: 'My Docs',
    }),
  ],
})
```

## Plugin configuration

The Starlight Auto Drafts plugin accepts the following configuration options:

### `highlights`

**type:** `{ badges?: boolean }`  
**default:** `true`

Configure Starlight Auto Drafts highlights for draft pages in the sidebar in development mode.
By default, draft pages are highlighted with an italicized label and a badge.

To learn more about highlights, check out the [“Custom Highlights”](/guides/custom-highlights/) guide.

#### `badges`

**type:** `boolean`  
**default:** `true`

Controls whether or not badges are added to draft pages in the sidebar in development mode.
If a draft page already has a badge, it will not be overridden by the plugin.

```ts
starlightAutoDrafts({
  highlights: {
    // Disable badges for draft pages in the sidebar.
    badges: false,
  },
})
```
