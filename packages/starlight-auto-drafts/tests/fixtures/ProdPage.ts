import { BasePage } from './BasePage'

export class ProdPage extends BasePage {
  goto() {
    return this.page.goto(`http://localhost:4322/getting-started/`)
  }
}
