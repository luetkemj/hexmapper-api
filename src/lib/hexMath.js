// http://www.redblobgames.com/grids/hexagons/#neighbors
// returns hex to use for calulating directions
//     5
//  4    0
//  3    1
//    2
export function hexDirection(direction) {
  const directions = [
    { x: 1, y: -1, z: 0 },
    { x: 1, y: 0, z: -1 },
    { x: 0, y: 1, z: -1 },
    { x: -1, y: 1, z: 0 },
    { x: -1, y: 0, z: 1 },
    { x: 0, y: -1, z: 1 },
  ];

  return directions[direction];
}

export function addHexes(hex1, hex2) {
  const x = hex1.x + hex2.x;
  const y = hex1.y + hex2.y;
  const z = hex1.z + hex2.z;

  return { x, y, z };
}

// http://www.redblobgames.com/grids/hexagons/#neighbors
// returns neighbor hex coords based on direction provided
//     5
//  4    0
//  3    1
//    2
export function hexNeighbor(hex, direction) {
  return addHexes(hex, hexDirection(direction));
}

// returns all neighbors of a given hex
export function hexNeighbors(hex) {
  const neighbors = [];
  for (let i = 0; i < 6; i += 1) {
    neighbors.push(addHexes(hex, hexDirection(i)));
  }

  return neighbors;
}

// http://www.redblobgames.com/grids/hexagons/#distances
export function distance(hex1, hex2) {
  return (Math.abs(hex1.x - hex2.x) + Math.abs(hex1.y - hex2.y) + Math.abs(hex1.z - hex2.z)) / 2;
}

// http://www.redblobgames.com/grids/hexagons/#basics
export function hexWidth(size) {
  return size * 2;
}

// http://www.redblobgames.com/grids/hexagons/#basics
export function hexHeight(size) {
  return (Math.sqrt(3) / 2) * (size * 2);
}

// http://www.redblobgames.com/grids/hexagons/#hex-to-pixel
export function hexToPixel(hex, size) {
  const x = size * (3 / 2) * hex.x;
  const y = size * Math.sqrt(3) * (hex.y + (hex.x / 2));
  return { x, y };
}

// http://www.redblobgames.com/grids/hexagons/#coordinates
export function getThirdCoord(c1, c2) {
  return (-c1 - c2 === -0) ? 0 : -c1 - c2;
}

export function hexToId(hex) {
  return `${hex.x},${hex.y},${hex.z}`;
}

export function idToHex(id) {
  const array = id.split(',');

  return {
    x: parseInt(array[0], 10),
    y: parseInt(array[1], 10),
    z: parseInt(array[2], 10),
  };
}
