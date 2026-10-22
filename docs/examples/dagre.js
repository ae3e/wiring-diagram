await loadScript("https://unpkg.com/dagre@0.8.5/dist/dagre.min.js");

// ----------------------------
// 1) Data + FIXED positions
// ----------------------------
const NODE_W = 110, NODE_H = 44;
const SENSOR_W = 140, SENSOR_H = 44;

const mainOrder = ["H1","L1","M1","H2","L2","RS232"];

// "Fixed" = we set x/y ourselves
const mainY = 240;
const mainX0 = 120;
const mainGap = 140;

const fixedPos = new Map();
mainOrder.forEach((id, i) => {
  fixedPos.set(id, { x: mainX0 + i * mainGap, y: mainY, w: NODE_W, h: NODE_H, label: id, kind: "main" });
});

// Sensors above, anchored by default on L1 and RS232
fixedPos.set("SENSOR1", { x: fixedPos.get("L1").x, y: 90, w: SENSOR_W, h: SENSOR_H, label: "SENSOR 1", kind: "sensor" });
fixedPos.set("SENSOR2", { x: fixedPos.get("RS232").x, y: 90, w: SENSOR_W, h: SENSOR_H, label: "SENSOR 2", kind: "sensor" });

const edges = [
  { id: "e_s1_h1", source: "SENSOR1", target: "H1" },
  { id: "e_s1_l1", source: "SENSOR1", target: "L1" },
  { id: "e_s1_m1", source: "SENSOR1", target: "M1" },
  { id: "e_s2_rs", source: "SENSOR2", target: "RS232" },
];

// -----------------------------------
// 2) (Optionnel) Utiliser Dagre pour
//    keep an order / sizes.
//    Here we "build" the Dagre graph,
//    but we do NOT use the x/y
//    it computes: we keep the fixed positions.
// -----------------------------------
const gDagre = new dagre.graphlib.Graph();
gDagre.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 70 });
gDagre.setDefaultEdgeLabel(() => ({}));

// Add nodes with sizes
for (const [id, n] of fixedPos.entries()) {
  gDagre.setNode(id, { width: n.w, height: n.h, label: n.label });
}
edges.forEach(e => gDagre.setEdge(e.source, e.target, { id: e.id }));

// Dagre layout (useful if you want routing info later)
// Here we only call it to show "dagrejs used", then keep our fixed positions.
dagre.layout(gDagre);

// ----------------------------
// 3) SVG rendering with D3
// ----------------------------
const svg = d3.select(container).append("svg").style("width", "100%").style("height", "400px");
const root = svg.append("g");

// Zoom/Pan
svg.call(d3.zoom().on("zoom", (event) => root.attr("transform", event.transform)));

// Arrow marker
svg.append("defs").append("marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 10).attr("refY", 0)
  .attr("markerWidth", 7).attr("markerHeight", 7)
  .attr("orient", "auto")
  .append("path")
  .attr("d", "M0,-5L10,0L0,5");

// Helpers: positions (Dagre uses centers, so do we)
function nodeCenter(id) {
  const n = fixedPos.get(id);
  return { cx: n.x, cy: n.y, w: n.w, h: n.h };
}

// Orthogonal routing simple (Manhattan):
// start: bas du source -> down to a "busY" -> horizontal -> down/up -> haut du target
function orthogonalPath(sourceId, targetId) {
  const s = nodeCenter(sourceId);
  const t = nodeCenter(targetId);

  // Exit/entry points (source bottom center, target top center)
  const x1 = s.cx;
  const y1 = s.cy + s.h / 2;

  const x4 = t.cx;
  const y4 = t.cy - t.h / 2;

  // A horizontal "bus" line between the rows
  // (adjust if you want a shared bus per sensor)
  const busY = (y1 + y4) / 2;

  // Chemin en 3 segments (vertical -> horizontal -> vertical)
  return `M${x1},${y1} L${x1},${busY} L${x4},${busY} L${x4},${y4}`;
}

// Draw edges behind nodes
const edgeG = root.append("g").attr("class", "edges");
edgeG.selectAll("g.edge")
  .data(edges)
  .join("g")
  .attr("class", "edge")
  .append("path")
  .attr("d", d => orthogonalPath(d.source, d.target))
  .attr("marker-end", "url(#arrow)");

// Draw nodes
const nodes = Array.from(fixedPos.entries()).map(([id, n]) => ({ id, ...n }));

const nodeG = root.append("g").attr("class", "nodes");
const nodeSel = nodeG.selectAll("g.node")
  .data(nodes, d => d.id)
  .join("g")
  .attr("class", d => d.kind === "sensor" ? "node sensor" : "node")
  .attr("transform", d => `translate(${d.x - d.w/2},${d.y - d.h/2})`); // top-left for rect

nodeSel.append("rect")
  .attr("width", d => d.w)
  .attr("height", d => d.h);

nodeSel.append("text")
  .attr("x", d => d.w / 2)
  .attr("y", d => d.h / 2)
  .text(d => d.label);

// Fit viewBox
const padding = 60;
const xs = nodes.flatMap(n => [n.x - n.w/2, n.x + n.w/2]);
const ys = nodes.flatMap(n => [n.y - n.h/2, n.y + n.h/2]);
const minX = Math.min(...xs) - padding;
const maxX = Math.max(...xs) + padding;
const minY = Math.min(...ys) - padding;
const maxY = Math.max(...ys) + padding;
svg.attr("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
  