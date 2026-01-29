import * as d3 from "d3";

export function createPattern(param){
    let colors = param.split("-");
    let pattern = d3.create("svg:pattern")
    
    pattern.attr("id", param)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 10)
    .attr("height", 20)
    //.attr("patternTransform", "rotate(45)")
    .call((p) => {
      p.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colors[0]);

      p.append("rect")
        .attr("x", 0)
        .attr("y", 10)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colors[1]);
    });
    return pattern;
}