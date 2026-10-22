# Prise en main

## Installation et build

```bash
npm install
npm run build
```

Le build (Rollup) écrit la bibliothèque dans `dist/` :

- `dist/wiringdiagram.esm.js` (module ES)
- `dist/wiringdiagram.cjs` (CommonJS)
- `dist/wiringdiagram.umd.js` (UMD, global `WiringDiagram`)

## Utilisation

```js
import { createWiringDiagram } from "./dist/wiringdiagram.esm.js";

const terminals = {
  H1: { x: 90, y: 90, delta: 160 },
  L1: { x: 170, y: 90 },
  G1: { x: 250, y: 90 },
};

const wirings = [
  { t: "H1", color: "blue", text: "sensor1" },
  { t: "L1", color: "yellow-black", text: "sensor1" },
  { t: "G1", color: "red-black", text: "sensor1" },
];

const svg = await createWiringDiagram("./template/CR1000s.svg", terminals, wirings);
document.querySelector("#stage").append(svg);
```

## Documentation locale

```bash
npm run build        # la bibliothèque doit être buildée avant les démos
npm run docs:dev
```
