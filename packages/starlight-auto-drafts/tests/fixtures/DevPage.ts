import { BasePage } from './BasePage'

export class DevPage extends BasePage {
  async goto() {
    await this.page.goto(`http://localhost:4321/getting-started/`)
    await this.page.waitForLoadState('networkidle')
  }
}
