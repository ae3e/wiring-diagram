import * as d3 from "d3";
import { createPattern } from "./pattern.js";
import { extractXMinMaxByText, layoutInLanes } from "./util.js";

/**
 * Create an SVG circle using D3.
 * @param {number} diameter - Circle diameter in pixels.
 * @param {string} color - Fill color (any valid CSS color).
 * @param {string|HTMLElement} [target="body"] - CSS selector or element to append to.
 * @returns {SVGCircleElement} The created circle element.
 */
export function createCircle(diameter, color, target = "body") {
  const radius = diameter / 2;
  const container =
    typeof target === "string" ? d3.select(target) : d3.select(target);

  const svg = container
    .append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("viewBox", `0 0 ${diameter} ${diameter}`);

  const circle = svg
    .append("circle")
    .attr("cx", radius)
    .attr("cy", radius)
    .attr("r", radius)
    .attr("fill", color);

  return circle.node();
}

/**
 * Create an SVG wiring diagram using D3.
 * @param {string} svgfile - SVG file.
 * @param {object} terminals - array of object including id,name, x, y.
 * @param {object} wirings - array of object including terminal name, color and text
 * @returns {SVGElement} The created SVG element.
 */
export async function createWiringDiagram(svgfile,terminals,wirings,config){
  //La taille du SVG doit être équivalente au svg importé.
  // On utilise donc les valeurs du viewBox du svg importé
  // Par défaut le svg a la dimension 300x150px si on ne précise rien
  //Il faut donc lire le svg importé et récupéré le viewbox - A faire! ici pseudocode
  //svgfile = "./template/CR1000s.svg";
  
  let svgDoc = await d3.xml(svgfile);
  const svgNode = svgDoc.documentElement;
  const viewBox = svgNode.getAttribute("viewBox").split(" ");
  const width = +viewBox[2];
  const height = +viewBox[3];
  
  const svg = d3.create("svg").attr("viewBox",`0 0 ${width} ${height}`);

  let bicolors = getUniqueColorsWithHyphen(wirings);
  const defs = svg.append("defs");
  bicolors.forEach(bicolor=>defs.append(()=>createPattern(bicolor).node()))

  const g = svg.append("g");

  const g1 = g.append("g");

  g1.append("image")
    .attr("height", height)
    .attr("width", width)
    .attr("href", svgfile);


  let ranges = extractXMinMaxByText(wirings,terminals);
  console.log(ranges)
  let defaultWidth = 150;
  let boxes = layoutInLanes(Object.entries(ranges).map(([text, { xmin, xmax, y, delta }]) => ({ x: (xmin + xmax) / 2, width: xmax-xmin>defaultWidth?xmax-xmin+20:defaultWidth, height: 24, text, delta })), { padY: 20, top: 0, leftMargin: 0 });
  console.log(boxes)


  const g2 =g.append("g").attr("id", "terminal-lines");

  // d3.line() = segment défini par 2 points
  const lineLen=40;
  const line = d3
    .line()
    .x((p) => p[0])
    .y((p) => p[1]);

  g2.selectAll("path.terminal-line")
    .data(wirings)
    .join("path")
    .attr("class", "terminal-line")
    .attr("d", (d) =>
      line([
        [terminals[d.t].x, terminals[d.t].y],//terminals[d.t].y + lineLen / 2 + 30],
        [terminals[d.t].x, boxes.nodes.find(item => item.text === d.text).delta+boxes.laneTops[boxes.nodes.find(item => item.text === d.text).lane]+5],
        
      ])
    )
    .attr("fill", "none")
    .attr("stroke", (d) =>
      d.color.indexOf('-') > 0 ? `url(#${d.color})` : d.color
    )
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round");

  
  //Object.entries(ranges).forEach(([text, { xmin, xmax, y }]) => {
  boxes.nodes.forEach(box => {
    //const cx = (xmin + xmax) / 2;
    const cx = (box.left + box.right) / 2;

    // groupe pour rect + text
    const gr = g.append("g")
      .attr("transform", `translate(${box.left}, ${box.delta+(boxes.laneTops[box.lane])})`);

    // rectangle autour du texte
    gr.append("rect")
      .attr("x", 0)//-(xmax-xmin+20*2)/2)//,xmin-20)
      .attr("y", 0)//-10)//,y+lineLen)
      .attr("width",box.width)
      .attr("height", box.height)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "#eee")
      .attr("stroke-width",2)
      .attr("stroke", "#000000");

        // texte (centré)
    const label = gr.append("text")
      .attr("x", box.width / 2)
      .attr("y", box.height / 2)
      /*.attr("font-family", "Arial, sans-serif")
      .attr("font-size", 12)
      .attr("fill", "#000")*/
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("dy", "1px")
      .text(box.text);
});

  svg.call(
    d3
      .zoom()
      .extent([
        [0, 0],
        [500, 500]
      ])
      .scaleExtent([0.1, 18])
      .on("zoom", zoomed)
  );

  function zoomed({ transform }) {
    g.attr("transform", transform);
  }

  return svg.node();
}

function getUniqueColorsWithHyphen(wirings) {
  return [...new Set(
    wirings
      .map(w => w.color)
      .filter(color => typeof color === "string" && color.includes("-"))
  )];
}
