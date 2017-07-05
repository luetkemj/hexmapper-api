import { each, map, merge, sortBy, random, reverse } from 'lodash';
import * as hexMath from './hexMath';
import { terrains } from '../textures/terrains.textures';

export function isSeed(chanceToBeSeed) {
  return (random(1, 100) <= chanceToBeSeed) || false;
}

// TODO
// Write some tests for this here bit!
function primeRatios(array) {
  let ratios = [];

  each(array, (t) => {
    ratios = ratios.concat(map(t, (value, key) => ({
      name: key,
      value,
    })));
  });

  ratios = sortBy(ratios, ['value']);
  reverse(ratios);

  ratios.reduce((acc, ratio, index) => {
    ratios[index].value = (index > 0) ? ratio.value + ratios[index - 1].value : ratio.value;
    return ratios[index].value;
  }, 0);

  return ratios;
}


// TODO test this proper
export function makeTerrainSeed(index, seedRatios) {
  const roll = random(0, seedRatios[seedRatios.length - 1].value);
  let terrain;

  each(seedRatios, (seed) => {
    if (roll <= seed.value) {
      terrain = seed.name;

      return false;
    }

    return true;
  });

  return {
    terrain,
    terrainKey: index,
    texture: terrains.textures[terrain],
    isSeed: true,
  };
}

// get all hexes in a cardinal direction (up down left right) from a startHex for a given length
export function mapBoundary(hex, length, isColumn, odd, hexes) {
  const idMapBoundary = [hexMath.hexToId(hex)];
  if (hexes) {
    merge(hexes[hexMath.hexToId(hex)], { isBoundary: true });
  }

  let counter = 1;
  let currentHex = hex;
  while (counter < length) {
    let rowDirection;
    if (odd) {
      rowDirection = (counter % 2) ? 0 : 1;
    } else {
      rowDirection = (counter % 2) ? 1 : 0;
    }
    const direction = (isColumn) ? 2 : rowDirection;
    const nextHex = hexMath.hexNeighbor(currentHex, direction);

    idMapBoundary.push(hexMath.hexToId(nextHex));
    if (hexes) {
      merge(hexes[hexMath.hexToId(nextHex)], { isBoundary: true });
    }
    currentHex = nextHex;
    counter += 1;
  }

  return idMapBoundary;
}

// from a startHex get all boundary hexes for a rectangle with n columns and rows
export function mapBoundaries(hex, columns, rows, hexes) {
  let idMapBoundaries = [];
  let startHex = hex;

  // north boundary
  idMapBoundaries =
    idMapBoundaries.concat(mapBoundary(startHex, columns, false, false, hexes));

  // east boundary
  startHex = hexMath.hexNeighbor(hexMath.idToHex(idMapBoundaries[idMapBoundaries.length - 1]), 2);
  idMapBoundaries =
    idMapBoundaries.concat(mapBoundary(startHex, rows - 1, true, false, hexes));

  // west boundary
  startHex = hexMath.hexNeighbor(hex, 2);
  idMapBoundaries =
    idMapBoundaries.concat(mapBoundary(startHex, rows - 1, true, false, hexes));

  // southern boundary
  startHex = hexMath.hexNeighbor(hexMath.idToHex(idMapBoundaries[idMapBoundaries.length - 1]), 1);
  idMapBoundaries =
    idMapBoundaries.concat(mapBoundary(startHex, columns - 2, false, true, hexes));

  return idMapBoundaries;
}

export function growSeeds(hexes, idMapDirt, idMapSeeds, idMapTerrainKeys) {
  each(idMapDirt, (idDirt) => {
    const shortest = {};

    each(idMapSeeds, (idSeed) => {
      const distance = hexMath.distance(hexes[idDirt], hexes[idSeed]);

      if (!shortest.distance || distance < shortest.distance) {
        merge(shortest, {
          distance,
          idSeed,
        });
      }
    });

    // update idMapTerrainKeys
    idMapTerrainKeys[hexes[shortest.idSeed].terrainKey].push(idDirt);

    merge(hexes[idDirt].texture, {
      texture: hexes[shortest.idSeed].texture,
    });

    merge(hexes[idDirt], {
      texture: hexes[shortest.idSeed].texture,
      terrain: hexes[shortest.idSeed].terrain,
      terrainKey: hexes[shortest.idSeed].terrainKey,
    });
  });

  return hexes;
}

export function makeOceans(hexes, idMapTerrainKeys, idMapBoundaries) {
  const blackList = {};

  each(idMapBoundaries, (boundaryId) => {
    if (hexes[boundaryId]) {
      const terrainKey = hexes[boundaryId].terrainKey;

      // build black list
      if (!blackList[terrainKey]) {
        blackList[terrainKey] = terrainKey;
      }
    }

    // use blacklist to change terrain blobs to water
    each(blackList, (terrainKey) => {
      each(idMapTerrainKeys[terrainKey], (hexId) => {
        merge(hexes[hexId], {
          texture: terrains.textures.water,
          terrain: 'water',
        });
      });
    });
  });
}

// create a rectangular hexmap with as much inital data in one pass as possible
export function rectangle({ hex, gridColumns, gridRows, hexSize, seedChance, seedChanceRatios }) {
  // array for storing an ordered array of ids to use as a lookup for our hexes object
  const idMap = [];
  const idMapSeeds = [];
  const idMapDirt = [];
  const idMapTerrainKeys = {};

  // object containing all hexes keyed by ids stored in order within idMap
  const hexes = {};
  const seedRatios = primeRatios(seedChanceRatios);

  // the top left hex
  const originHex = hex || { x: 0, y: 0, z: 0 };
  const startHex = originHex;
  const initial = startHex.x;

  for (let i = initial; i < initial + gridColumns; i += 1) {
    startHex.x = i;
    startHex.y = Math.ceil((i * -1) / 2);

    for (let j = 0; j < gridRows; j += 1) {
      const x = startHex.x;
      const y = startHex.y + j;
      const z = hexMath.getThirdCoord(x, y);
      const hexId = `${x},${y},${z}`;
      let seed = {};

      if (isSeed(seedChance)) {
        seed = makeTerrainSeed(idMap.length + 1, seedRatios);

        if (idMapTerrainKeys[seed.terrainKey]) {
          idMapTerrainKeys[seed.terrainKey].push(hexId);
        } else {
          idMapTerrainKeys[seed.terrainKey] = [hexId];
        }

        idMapSeeds.push(hexId);
      } else {
        idMapDirt.push(hexId);
      }

      idMap.push(hexId);

      hexes[hexId] = {
        id: hexId,
        x,
        y,
        z,
        width: hexMath.hexWidth(hexSize),
        height: hexMath.hexHeight(hexSize),
        point: hexMath.hexToPixel({ x, y, z }, hexSize),
        ...seed,
      };
    }
  }

  const idMapBoundaries = mapBoundaries(hex || { x: 0, y: 0, z: 0 }, gridColumns, gridRows, hexes);

  growSeeds(hexes, idMapDirt, idMapSeeds, idMapTerrainKeys);
  makeOceans(hexes, idMapTerrainKeys, idMapBoundaries);

  return {
    idMap,
    idMapDirt,
    idMapBoundaries,
    idMapSeeds,
    idMapTerrainKeys,
    hexes,
  };
}
