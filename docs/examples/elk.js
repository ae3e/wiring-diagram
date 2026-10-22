// -----------------------------
// 1) Define FIXED node positions
// -----------------------------
const W = 110, H = 44;
const mainY = 240;
const sensorY = 90;

// fixed x positions so they are horizontally aligned
const mainOrder = ["H1","L1","M1","H2","L2","RS232"];
const mainX0 = 120;
const mainGap = 140;

const fixed = {};
mainOrder.forEach((id, i) => fixed[id] = { x: mainX0 + i * mainGap, y: mainY });

// place sensors above; you can change these
fixed["SENSOR1"] = { x: fixed["L1"].x,   y: sensorY };
fixed["SENSOR2"] = { x: fixed["RS232"].x, y: sensorY };

// -----------------------------
// 2) Build an ELK graph using fixed positions
//    We'll ask ELK to route edges orthogonally.
// -----------------------------
await loadScript("https://cdn.jsdelivr.net/npm/elkjs@0.11.0/lib/elk.bundled.js");
const elk = new ELK();

const nodes = [
  { id: "SENSOR1", width: 140, height: H, x: fixed["SENSOR1"].x, y: fixed["SENSOR1"].y, labels: [{ text: "SENSOR 1" }]},
  { id: "SENSOR2", width: 140, height: H, x: fixed["SENSOR2"].x, y: fixed["SENSOR2"].y, labels: [{ text: "SENSOR 2" }]},
  { id: "SENSOR3", width: 140, height: H, x: fixed["H2"].x, y: sensorY, labels: [{ text: "SENSOR 3" }]},

  // main row (fixed + aligned)
  ...mainOrder.map(id => ({
    id,
    width: W,
    height: H,
    x: fixed[id].x,
    y: fixed[id].y,
    labels: [{ text: id }],
    nodeLayoutOptions: {
        "elk.algorithm": "fixed"
    }
  })),
];

// Edges you requested:
// SENSOR 1 : H1, L1, M1
// SENSOR 2 : RS232
const edges = [
  { id: "e_s1_h1", sources: ["SENSOR1"], targets: ["H1"] },
  { id: "e_s1_l1", sources: ["SENSOR1"], targets: ["L1"] },
  { id: "e_s1_m1", sources: ["SENSOR1"], targets: ["M1"] },
  { id: "e_s3_h2", sources: ["SENSOR3"], targets: ["H2"] },
  { id: "e_s3_l2", sources: ["SENSOR3"], targets: ["L2"] },
  { id: "e_s2_rs", sources: ["SENSOR2"], targets: ["RS232"] },
];

const elkGraph = {
  id: "root",
  layoutOptions: {
    // Keep the given x/y (fixed positions) and let ELK compute edge routes.
    // ELK "fixed" layout respects pre-defined node positions.
    "elk.algorithm": "fixed",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.spacing.nodeNode": "30",
    "elk.layered.edgeRouting": "ORTHOGONAL",
  },
  children: nodes,
  edges
};

// -----------------------------
// 3) Render with D3
// -----------------------------
const svg = d3.select(container).append("svg").style("width", "100%").style("height", "400px");
const g = svg.append("g");

// Arrow marker
svg.append("defs").append("marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 10).attr("refY", 0)
  .attr("markerWidth", 7).attr("markerHeight", 7)
  .attr("orient", "auto")
  .append("path")
  .attr("d", "M0,-5L10,0L0,5");

// Zoom / pan
svg.call(d3.zoom().on("zoom", (event) => g.attr("transform", event.transform)));

// Helper: build a path from ELK edge sections (orthogonal bend points)
function edgePathFromElk(edge) {
  // ELK may provide multiple sections; we’ll draw the first.
  const sec = edge.sections && edge.sections[0];
  if (!sec) return null;

  const pts = [];
  pts.push([sec.startPoint.x, sec.startPoint.y]);
  (sec.bendPoints || []).forEach(p => pts.push([p.x, p.y]));
  pts.push([sec.endPoint.x, sec.endPoint.y]);

  // Straight segments between orthogonal points
  return d3.line()(pts);
}

// Fallback (if for some reason sections are missing): straight line center-to-center
function fallbackEdgePath(edge, nodeById) {
  const s = nodeById.get(edge.sources[0]);
  const t = nodeById.get(edge.targets[0]);
  const sx = s.x + s.width / 2, sy = s.y + s.height / 2;
  const tx = t.x + t.width / 2, ty = t.y + t.height / 2;
  return `M${sx},${sy} L${tx},${ty}`;
}

function draw(layout) {
  // Index nodes for fallback routing + styling
  const nodeById = new Map(layout.children.map(n => [n.id, n]));

  // --- Edges (behind nodes)
  const edgeG = g.append("g").attr("class", "edges");

  edgeG.selectAll("g.edge")
    .data(layout.edges)
    .join("g")
    .attr("class", "edge")
    .each(function(edge) {
      const d = edgePathFromElk(edge) || fallbackEdgePath(edge, nodeById);
      d3.select(this)
        .append("path")
        .attr("d", d)
        .attr("marker-end", "url(#arrow)");
    });

  // --- Nodes
  const nodeG = g.append("g").attr("class", "nodes");

  const n = nodeG.selectAll("g.node")
    .data(layout.children)
    .join("g")
    .attr("class", d => (d.id.startsWith("SENSOR") ? "node sensor" : "node"))
    .attr("transform", d => `translate(${d.x},${d.y})`);

  n.append("rect")
    .attr("width", d => d.width)
    .attr("height", d => d.height);

  n.append("text")
    .attr("x", d => d.width / 2)
    .attr("y", d => d.height / 2)
    .text(d => (d.labels && d.labels[0] ? d.labels[0].text : d.id));

  // Fit view (simple)
  const padding = 40;
  const xs = layout.children.map(d => [d.x, d.x + d.width]).flat();
  const ys = layout.children.map(d => [d.y, d.y + d.height]).flat();
  const minX = Math.min(...xs) - padding, maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding, maxY = Math.max(...ys) + padding;

  const vb = [minX, minY, (maxX - minX), (maxY - minY)];
  svg.attr("viewBox", vb.join(" "));
}

// Run ELK layout (fixed positions + orthogonal routing), then draw
elk.layout(elkGraph).then(draw).catch(err => {
  console.error(err);
  // As a last resort, draw without ELK edge routes:
  draw(elkGraph);
});
  