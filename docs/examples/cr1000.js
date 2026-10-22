const { createWiringDiagram } = WiringDiagram;

let terminals = {
  "H1": {x: 164, y: 300, delta:70},
  "L1": {x: 180, y: 300},
  "G1": {x: 196, y: 300},
  "H2": {x: 216, y: 300, delta:70},
  "L2": {x: 232, y: 300, delta:70},
  "M2": {x: 248, y: 300, delta:70},
  "H3": {x: 268, y: 300, delta:70},
  "L3": {x: 284, y: 300, delta:70},
  "M3": {x: 300, y: 300, delta:70},
  "H4": {x: 320, y: 300, delta:70},
  "L4": {x: 336, y: 300, delta:70},
  "M4": {x: 352, y: 300, delta:70},
  "H5": {x: 372, y: 300, delta:70},
  "L5": {x: 388, y: 300, delta:70},
  "M5": {x: 404, y: 300, delta:70},
  "RS232": {x: 1530, y: 390, delta:500},
};

let wirings = [
  { t: "H1", color: "blue", text:"EST6000_TEM_01" },        
  { t: "L1", color: "yellow-black", text:"EST6000_TEM_01" },
  { t: "G1", color: "red-black", text:"EST6000_TEM_01" },
  { t: "H2", color: "red-black", text:"EST6000_PRA_01" },
  { t: "L2", color: "#F0F", text:"EST6000_PRA_01" },
  { t: "M2", color: "green", text:"EST6000_PRA_01" },
  { t: "H3", color: "red-black", text:"EST6000_HUM_01" },
  { t: "L3", color: "#F0F", text:"EST6000_HUM_01" },
  { t: "M3", color: "green", text:"EST6000_HUM_01" },
  { t: "H4", color: "red-black", text:"EST6000_VVE_01" },
  { t: "L4", color: "#F0F", text:"EST6000_VVE_01" },
  { t: "M4", color: "green", text:"EST6000_VVE_01" },
  { t: "H5", color: "red-black", text:"EST6000_DIR_01" },
  { t: "L5", color: "#F0F", text:"EST6000_DIR_01" },
  { t: "M5", color: "green", text:"EST6000_DIR_01" },
  { t: "RS232", color: "red", text:"EST6000_PLH_01" },
  { t: "RS232", color: "red", text:"EST6000_PLV_01" },
];

const svg = await createWiringDiagram(assets.CR1000, terminals, wirings);
svg.setAttribute("width", "100%");
svg.setAttribute("height", "400");
container.append(svg);
    