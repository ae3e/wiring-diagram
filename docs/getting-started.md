# Getting started

## Install and build

```bash
npm install
npm run build
```

The build (Rollup) writes the library to `dist/`:

- `dist/wiringdiagram.esm.js` (ES module)
- `dist/wiringdiagram.cjs` (CommonJS)
- `dist/wiringdiagram.umd.js` (UMD, global `WiringDiagram`)

## Usage

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

## Local documentation

```bash
npm run build        # the library must be built before the demos
npm run docs:dev
```
