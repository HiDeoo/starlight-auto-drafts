import { z } from 'astro/zod'

export const StarlightAutoDraftsConfigSchema = z
  .object({
    /** Configure highlights for draft pages in the sidebar in development mode. */
    highlights: z
      .object({
        /** Controls whether or not badges are added to draft pages in the sidebar in development mode. */
        badges: z.boolean().default(true),
      })
      .default({}),
  })
  .default({})

export type StarlightAutoDraftsUserConfig = z.input<typeof StarlightAutoDraftsConfigSchema>
export type StarlightAutoDraftsConfig = z.output<typeof StarlightAutoDraftsConfigSchema>
