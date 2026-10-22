/**********************
 * 1) Input (example)
 **********************/
// Tableau attendu: [{x, width, height}, ...]
// x = milieu (en pixels dans cet exemple)
function makeRandomData(n = 28, svgW = 1100) {
  const minW = 60, maxW = 190;
  const minH = 26, maxH = 70;

  const data = d3.range(n).map(i => {
    const width = 150;//Math.round(minW + Math.random() * (maxW - minW));
    const height = 30;//Math.round(minH + Math.random() * (maxH - minH));
    const x = Math.round(60 + Math.random() * (svgW - 120)); // milieu
    return { id: i, x, width, height };
  });

  return data;
}

/****************************************************
 * 2) Placement algorithm with no overlap (X)
 ****************************************************/
// Detects an X overlap between two intervals [l1, r1] et [l2, r2]
function overlaps1D(l1, r1, l2, r2, padX = 0) {
  // padX adds some space between boxes
  return (l1 < (r2 + padX)) && (l2 < (r1 + padX));
}

/**
 * Places boxes on "lanes" (rows) to avoid horizontal overlaps.
 * Input: items [{x, width, height}]
 * Sortie: items enrichis {left, right, lane, y, ...} + meta lanes
 */
function layoutInLanes(items, cfg) {
  const {
    padX = 8,      // min X gap between 2 boxes in the same lane
    padY = 10,     // espace vertical entre lanes
    top = 24,      // marge top
    leftMargin = 24 // left margin (in case you add a scale later)
  } = cfg || {};

  // Normalize: compute left/right from the middle x
  const nodes = items.map(d => {
    const left = (d.x - d.width / 2);
    const right = (d.x + d.width / 2);
    return { ...d, left, right };
  });

  // Tri par bord gauche (greedy classique)
  nodes.sort((a, b) => (a.left - b.left) || (a.right - b.right));

  // lanes = array of arrays; each lane stores the nodes placed in it
  const lanes = [];

  // Affectation gloutonne lane par lane
  for (const node of nodes) {
    let placed = false;

    for (let li = 0; li < lanes.length; li++) {
      const lane = lanes[li];

      // Check for collisions with everything already in the lane
      // (could be optimized: only check the last one if the lane is sorted, but keep it simple)
      let collide = false;
      for (const other of lane) {
        if (overlaps1D(node.left, node.right, other.left, other.right, padX)) {
          collide = true;
          break;
        }
      }

      if (!collide) {
        node.lane = li;
        lane.push(node);
        placed = true;
        break;
      }
    }

    if (!placed) {
      node.lane = lanes.length;
      lanes.push([node]);
    }
  }

  // Compute each lane height (max node height in that lane)
  const laneHeights = lanes.map(lane => d3.max(lane, d => d.height) || 0);

  // Compute each lane y position (vertical stacking)
  const laneTops = [];
  let acc = top;
  for (let i = 0; i < laneHeights.length; i++) {
    laneTops[i] = acc;
    acc += laneHeights[i] + padY;
  }

  // Assign y + x (convert to SVG coordinates)
  for (const node of nodes) {
    node.xSvg = leftMargin + node.left;         // x of the left corner in the SVG
    node.ySvg = laneTops[node.lane];            // y du coin haut
  }

  return {
    nodes,
    lanes,
    laneHeights,
    laneTops,
    totalHeight: acc + top
  };
}

/**********************
 * 3) Rendu D3 (SVG)
 **********************/
const root = d3.select(container);
const regen = root.append("button").text("Regenerate data");
const svg = root.append("svg").attr("width", 1100).attr("height", 520)
  .attr("viewBox", "0 0 1100 520").style("width", "100%").style("height", "auto");
const W = +svg.attr("width");
const H = +svg.attr("height");

const g = svg.append("g");

function render(data) {
  g.selectAll("*").remove();

  const cfg = {
    padX: 10,
    padY: 12,
    top: 32,
    leftMargin: 40
  };

  const layout = layoutInLanes(data, cfg);

  // Optional: baseline (reference y)
  g.append("line")
    .attr("class", "baseline")
    .attr("x1", 0)
    .attr("x2", W)
    .attr("y1", cfg.top - 10)
    .attr("y2", cfg.top - 10);

  // Optionnel: lignes de lanes
  g.selectAll(".laneLine")
    .data(layout.laneTops)
    .enter()
    .append("line")
    .attr("class", "laneLine")
    .attr("x1", 0)
    .attr("x2", W)
    .attr("y1", d => d)
    .attr("y2", d => d);

  // Groupe par node
  const nodeG = g.selectAll(".node")
    .data(layout.nodes, d => d.id)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.xSvg}, ${d.ySvg})`);

  // Rectangles
  nodeG.append("rect")
    .attr("class", "box")
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("width", d => d.width)
    .attr("height", d => d.height);

  // Labels
  nodeG.append("text")
    .attr("class", "label")
    .attr("x", 8)
    .attr("y", d => Math.min(d.height - 8, 16))
    .text(d => `id:${d.id} lane:${d.lane}`);

  // Tooltip simple (title SVG)
  nodeG.append("title")
    .text(d => `id=${d.id}\nx(center)=${d.x}\nwidth=${d.width}\nheight=${d.height}\nlane=${d.lane}`);

  // Adjust the SVG height if needed (without exceeding H if you want it fixed)
  const needed = layout.totalHeight + 20;
  if (needed > H) svg.attr("height", needed);
  else svg.attr("height", H);
}

/**********************
 * 4) Demo
 **********************/
let data = makeRandomData(10, W);
render(data);

regen.on("click", () => {
  data = makeRandomData(10, W);
  render(data);
});
  