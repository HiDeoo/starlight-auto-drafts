import { test as base } from '@playwright/test'

import { DevPage } from './fixtures/DevPage'
import { ProdPage } from './fixtures/ProdPage'

export { expect } from '@playwright/test'

export const test = base.extend<Fixtures>({
  devPage: async ({ page }, use) => {
    const devPage = new DevPage(page)

    await use(devPage)
  },
  prodPage: async ({ page }, use) => {
    const prodPage = new ProdPage(page)

    await use(prodPage)
  },
})

interface Fixtures {
  devPage: DevPage
  prodPage: ProdPage
}
