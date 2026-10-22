# API

## `createWiringDiagram(svgfile, terminals, wirings, config)`

Returns a `Promise` of an SVG element.

- `svgfile`: URL of the device's SVG image. Its `viewBox` sets the size of the diagram.
- `terminals`: object mapping a terminal name to `{ x, y, delta? }`. The optional `delta` shifts the sensor box down relative to its lane.
- `wirings`: array of `{ t, color, text }` where `t` is the terminal name, `color` is a CSS color or two colors separated by `-` (striped wire), and `text` is the sensor label. Wires sharing the same `text` share a box.
- `config`: reserved, currently unused.

## `createCircle(diameter, color, target)`

Small utility that appends an SVG circle to `target` (CSS selector or element, `"body"` by default) and returns the `circle` node.
