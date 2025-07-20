import type { Locator, Page } from '@playwright/test'

export class BasePage {
  constructor(public readonly page: Page) {}

  getSidebarGroupItems(label: string) {
    return this.#getSidebarChildrenItems(this.#getSidebarRootDetails(label).locator('> ul'))
  }

  get #sidebar() {
    return this.page.getByRole('navigation', { name: 'Main' }).locator('div.sidebar-content')
  }

  #getSidebarRootDetails(label: string) {
    return this.#sidebar.getByRole('listitem').locator(`details:has(summary > div > span:text-is("${label}"))`).last()
  }

  async #getSidebarChildrenItems(list: Locator): Promise<SidebarItem[]> {
    const items: SidebarItem[] = []

    for (const item of await list.locator('> li > :is(a, details)').all()) {
      const href = await item.getAttribute('href')

      if (href) {
        const name = await item.locator('span:first-child').textContent()

        const link: SidebarItemLink = { name: name ? name.trim() : null, badge: null }

        if (await item.locator('.sl-badge').isVisible()) {
          link.badge = await item.locator('.sl-badge').textContent()
        }

        items.push(link)
      } else {
        items.push({
          label: await item.locator(`> summary > div > span`).textContent(),
          items: await this.#getSidebarChildrenItems(item.locator('> ul')),
        })
      }
    }

    return items
  }
}

export type SidebarItem = SidebarItemGroup | SidebarItemLink

interface SidebarItemLink {
  name: string | null
  badge: string | null
}

export interface SidebarItemGroup {
  items: (SidebarItemGroup | SidebarItemLink)[]
  label: string | null
}
