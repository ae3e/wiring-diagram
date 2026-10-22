# Introduction

WiringDiagram is a small JavaScript library (ES modules, [D3.js](https://d3js.org/) v7) that draws wiring diagrams as SVG: sensors connected to the terminals of a device, for example a Campbell CR1000 datalogger.

## Goals

- Show which sensor is wired to which terminal.
- Draw each wire with its color, including two-color wires (`red-black`).
- Group a sensor's wires in a named box, placed on non-overlapping lanes.
- Produce a pannable and zoomable SVG that can be embedded in any page.

See [Getting started](./getting-started), then the [examples](./examples/).
