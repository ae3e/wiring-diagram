/**********************
 * 1) Entrée (exemple)
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
 * 2) Algorithme de placement sans superposition (X)
 ****************************************************/
// Détecte chevauchement en X entre deux intervalles [l1, r1] et [l2, r2]
function overlaps1D(l1, r1, l2, r2, padX = 0) {
  // padX ajoute un peu d'espace entre les boxes
  return (l1 < (r2 + padX)) && (l2 < (r1 + padX));
}

/**
 * Place les boxes en "lanes" (lignes) pour éviter les chevauchements horizontaux.
 * Entrée: items [{x, width, height}]
 * Sortie: items enrichis {left, right, lane, y, ...} + meta lanes
 */
function layoutInLanes(items, cfg) {
  const {
    padX = 8,      // espace min en X entre 2 boxes dans la même lane
    padY = 10,     // espace vertical entre lanes
    top = 24,      // marge top
    leftMargin = 24 // marge gauche (si vous ajoutez une échelle plus tard)
  } = cfg || {};

  // Normalise: calcule left/right à partir de x milieu
  const nodes = items.map(d => {
    const left = (d.x - d.width / 2);
    const right = (d.x + d.width / 2);
    return { ...d, left, right };
  });

  // Tri par bord gauche (greedy classique)
  nodes.sort((a, b) => (a.left - b.left) || (a.right - b.right));

  // lanes = tableau de tableaux ; chaque lane stocke les nodes placés dedans
  const lanes = [];

  // Affectation gloutonne lane par lane
  for (const node of nodes) {
    let placed = false;

    for (let li = 0; li < lanes.length; li++) {
      const lane = lanes[li];

      // Vérifie collision avec tout ce qui est déjà dans la lane
      // (optimisable: ne vérifier que le dernier si lane triée, mais restons simples)
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

  // Calcule la hauteur de chaque lane (max height des nodes de cette lane)
  const laneHeights = lanes.map(lane => d3.max(lane, d => d.height) || 0);

  // Calcule la position y de chaque lane (empilement vertical)
  const laneTops = [];
  let acc = top;
  for (let i = 0; i < laneHeights.length; i++) {
    laneTops[i] = acc;
    acc += laneHeights[i] + padY;
  }

  // Assigne y + x (convertit en coordonnées SVG)
  for (const node of nodes) {
    node.xSvg = leftMargin + node.left;         // x du coin gauche dans le SVG
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
const regen = root.append("button").text("Régénérer des données");
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

  // Optionnel: baseline (y de référence)
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

  // Ajuste la hauteur du SVG si nécessaire (sans dépasser H si tu veux fixer)
  const needed = layout.totalHeight + 20;
  if (needed > H) svg.attr("height", needed);
  else svg.attr("height", H);
}

/**********************
 * 4) Démo
 **********************/
let data = makeRandomData(10, W);
render(data);

regen.on("click", () => {
  data = makeRandomData(10, W);
  render(data);
});
  