import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'WiringDiagram',
  description: 'Bibliothèque JS (D3) pour dessiner des schémas de câblage en SVG',
  lang: 'fr-FR',
  base: '/wiring-diagram/',
  themeConfig: {
    nav: [
      { text: 'Introduction', link: '/' },
      { text: 'Prise en main', link: '/getting-started' },
      { text: 'API', link: '/api' },
      { text: 'Exemples', link: '/examples/' }
    ],
    sidebar: [
      { text: 'Introduction', link: '/' },
      { text: 'Prise en main', link: '/getting-started' },
      { text: 'API', link: '/api' },
      {
        text: 'Exemples',
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
