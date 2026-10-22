import DefaultTheme from 'vitepress/theme'
import Demo from './Demo.vue'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Demo', Demo)
  }
} satisfies Theme
