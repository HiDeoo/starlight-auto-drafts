import { BasePage } from './BasePage'

export class DevPage extends BasePage {
  goto() {
    return this.page.goto(`http://localhost:4321/getting-started/`)
  }
}
