<script setup lang="ts">
import { onMounted, ref } from 'vue'
import cr1000Url from '../../../template/CR1000s.svg?url'

// `code` : source de l'exemple (import ?raw). Il est exécuté côté client avec
// les variables : container, d3, WiringDiagram, loadScript, assets.
const props = defineProps<{ code: string }>()

const container = ref<HTMLElement | null>(null)
const error = ref('')

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Échec du chargement de ${src}`))
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  try {
    const d3 = await import('d3')
    // La bibliothèque buildée (npm run build) est requise.
    const WiringDiagram = await import('../../../dist/wiringdiagram.esm.js')
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    const run = new AsyncFunction('container', 'd3', 'WiringDiagram', 'loadScript', 'assets', props.code)
    await run(container.value, d3, WiringDiagram, loadScript, { CR1000: cr1000Url })
  } catch (e) {
    console.error(e)
    error.value = String(e)
  }
})
</script>

<template>
  <div class="demo">
    <div class="demo-render">
      <div ref="container" class="demo-container"></div>
      <p v-if="error" class="demo-error">{{ error }}</p>
    </div>
    <details class="demo-code" open>
      <summary>Code source</summary>
      <pre><code>{{ code }}</code></pre>
    </details>
  </div>
</template>

<style scoped>
.demo { border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 16px 0; }
.demo-render { padding: 12px; overflow: auto; }
.demo-container :deep(svg) { background: #fff; border: 1px solid var(--vp-c-divider); }
.demo-container :deep(svg text) { fill: #111; }
.demo-container :deep(button) { margin-bottom: 8px; padding: 6px 10px; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
.demo-error { color: var(--vp-c-danger-1); }
.demo-code { border-top: 1px solid var(--vp-c-divider); padding: 8px 12px; }
.demo-code pre { max-height: 400px; overflow: auto; font-size: 12px; background: var(--vp-c-bg-soft); padding: 8px; border-radius: 6px; }
</style>
