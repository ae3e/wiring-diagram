# Introduction

WiringDiagram est une petite bibliothèque JavaScript (modules ES6, [D3.js](https://d3js.org/) v7) qui dessine des schémas de câblage en SVG : des capteurs reliés aux bornes d'un équipement, par exemple une centrale d'acquisition Campbell CR1000.

## Objectifs

- Afficher quel capteur est câblé sur quelle borne.
- Dessiner chaque fil avec sa couleur, y compris les fils bicolores (`red-black`).
- Regrouper les fils d'un capteur dans une boîte nommée, placée sur des « lanes » sans chevauchement.
- Produire un SVG déplaçable et zoomable, intégrable dans n'importe quelle page.

Voir la [prise en main](./getting-started) puis les [exemples](./examples/).
