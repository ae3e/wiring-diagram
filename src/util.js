import * as d3 from "d3";

export function extractXMinMaxByText(wirings, terminals) {
  const result = {};

  wirings.forEach(({ t, text }) => {
    if (!text) return; // ignore les entrées sans text

    const x = terminals[t]?.x;
    if (x == null) return;

    const y = terminals[t]?.y;
    if (y == null) return;

    if (!result[text]) {
      result[text] = { xmin: x, xmax: x, y:y, delta:terminals[t]?.delta || 0 };
    } else {
      result[text].xmin = Math.min(result[text].xmin, x);
      result[text].xmax = Math.max(result[text].xmax, x);
    }
  });

  return result;
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
 * Entrée: items [{x, width, height, text}]
 * Sortie: items enrichis {left, right, lane, y, ...} + meta lanes
 */
export function layoutInLanes(items, cfg) {
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