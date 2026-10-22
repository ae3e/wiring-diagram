# WiringDiagram

WiringDiagram is a small ES6 JavaScript library, built on [D3.js](https://d3js.org/) v7, that draws wiring diagrams as SVG: sensors connected to the terminals of a device such as a datalogger.

## Goals

- Display which sensor is wired to which terminal of a device (for example a Campbell CR1000 datalogger).
- Draw each wire with its color, including bi-colored wires (for example `red-black`).
- Group the wires of a sensor under a single labeled box, and place the boxes in lanes so they do not overlap.
- Provide a pannable and zoomable SVG that can be embedded in any web page.

## Installation

```bash
npm install
npm run build
```

The build uses Rollup and writes the library to `dist/` (not committed to git):

- `dist/wiringdiagram.esm.js` (ES module)
- `dist/wiringdiagram.cjs` (CommonJS)
- `dist/wiringdiagram.umd.js` (UMD, global `WiringDiagram`)

There is no lint or automated test setup yet. Check rendering visually with the example pages.

## Usage

```js
import { createWiringDiagram } from "./dist/wiringdiagram.esm.js";

// Position of each terminal on the device image (SVG coordinates).
// `delta` (optional) shifts the sensor box down from its lane.
const terminals = {
  H1: { x: 90, y: 90, delta: 160 },
  L1: { x: 170, y: 90 },
  G1: { x: 250, y: 90 },
};

// One entry per wire: terminal, wire color, and the sensor it goes to.
const wirings = [
  { t: "H1", color: "blue", text: "sensor1" },
  { t: "L1", color: "yellow-black", text: "sensor1" },
  { t: "G1", color: "red-black", text: "sensor1" },
];

const svg = await createWiringDiagram("./template/CR1000s.svg", terminals, wirings);
document.querySelector("#stage").append(svg);
```

### API

`createWiringDiagram(svgfile, terminals, wirings, config)` returns a `Promise` of an SVG element.

- `svgfile`: URL of the SVG image of the device. Its `viewBox` sets the size of the diagram.
- `terminals`: object mapping a terminal name to `{ x, y, delta? }`.
- `wirings`: array of `{ t, color, text }`, where `t` is a terminal name, `color` is any CSS color or two colors joined by `-` for a striped wire, and `text` is the sensor label. Wires with the same `text` share one box.
- `config`: reserved, currently unused.

The library also exports `createCircle(diameter, color, target)`, a small helper that appends an SVG circle.

## Examples

Build first, then serve the repository root with any static web server (for example `npx serve .`) and open:

- `example.html`: simple diagram with a few sensors.
- `CR1000.html`: CR1000 datalogger with weather sensors.
- `anti-overlap.html`, `dev.html`, `dagre.html`, `elk.html`, `elk-2.html`: layout experiments.

Device images live in `template/` and `src/template/`.

## Project layout

- `src/index.js`: entry point (`createWiringDiagram`, `createCircle`)
- `src/pattern.js`: SVG patterns for bi-colored wires
- `src/util.js`: lane layout of sensor boxes
- `template/`: SVG device templates
- `rollup.config.js`: build configuration
