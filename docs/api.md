# API

## `createWiringDiagram(svgfile, terminals, wirings, config)`

Retourne une `Promise` d'un élément SVG.

- `svgfile` : URL de l'image SVG de l'équipement. Son `viewBox` fixe la taille du schéma.
- `terminals` : objet associant un nom de borne à `{ x, y, delta? }`. `delta` (optionnel) décale la boîte du capteur vers le bas par rapport à sa lane.
- `wirings` : tableau de `{ t, color, text }` où `t` est le nom de la borne, `color` une couleur CSS ou deux couleurs séparées par `-` (fil rayé), et `text` le libellé du capteur. Les fils de même `text` partagent une boîte.
- `config` : réservé, non utilisé actuellement.

## `createCircle(diameter, color, target)`

Petite fonction utilitaire qui ajoute un cercle SVG à `target` (sélecteur CSS ou élément, `"body"` par défaut) et retourne le nœud `circle`.
