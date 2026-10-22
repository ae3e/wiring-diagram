import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'WiringDiagram',
  description: 'JS library (D3) to draw wiring diagrams as SVG',
  lang: 'en-US',
  base: '/wiring-diagram/',
  themeConfig: {
    nav: [
      { text: 'Introduction', link: '/' },
      { text: 'Getting started', link: '/getting-started' },
      { text: 'API', link: '/api' },
      { text: 'Examples', link: '/examples/' }
    ],
    sidebar: [
      { text: 'Introduction', link: '/' },
      { text: 'Getting started', link: '/getting-started' },
      { text: 'API', link: '/api' },
      {
        text: 'Examples',
        link: '/examples/',
        items: [
          { text: 'CR1000', link: '/examples/cr1000' },
          { text: 'Anti-overlap', link: '/examples/anti-overlap' },
          { text: 'Dagre', link: '/examples/dagre' },
          { text: 'ELK', link: '/examples/elk' }
        ]
      }
    ],
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/ae3e/wiring-diagram' }]
  }
})
