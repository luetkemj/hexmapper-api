import { cloneDeep, each, isUndefined, orderBy, pullAll, random } from 'lodash';
import * as hexMath from './hexMath';
import * as hexMap from './hexMap';
import { terrains } from '../textures/terrains.textures';

function chance(percent) {
  return (random(1, 100) <= percent) || false;
}

export function mutate(hex, hexes) {
  let walls = 0;
  const threshold = hex.terrain === 'mountains' ? 2 : 3;
  const neighbors = hexMath.hexNeighbors(hex);
  let updatedHex;

  each(neighbors, (neighbor) => {
    const hexId = hexMath.hexToId(neighbor);
    if (hexes[hexId] && hexes[hexId].terrain === 'mountains') {
      walls += 1;
    }

    if (walls > threshold) {
      updatedHex = Object.assign(cloneDeep(hex), {
        terrain: 'mountains',
        texture: terrains.textures.mountains,
      });
      // return false;
    } else {
      updatedHex = Object.assign(cloneDeep(hex), {
        terrain: 'hills',
        texture: terrains.textures.hills,
      });
    }

    // return true;
  });

  return updatedHex;
}

export function walkDirt(unsearchedDirt) {
  const startHexId = unsearchedDirt[0];

  const frontier = {
    explored: {},
    unexplored: [startHexId],
  };

  while (frontier.unexplored.length > 0) {
    const currentHexId = frontier.unexplored[0];

    const neighbors = hexMath.hexNeighbors(hexMath.idToHex(currentHexId));

    each(neighbors, (neighbor) => {
      const neighborId = hexMath.hexToId(neighbor);

      // console.log({
      //   hex: neighborId,
      //   frontierExplored: frontier.explored,
      //   0: unsearchedDirt.includes(neighborId),
      //   1: isUndefined(frontier.explored[neighborId]),
      // });

      if (unsearchedDirt.includes(neighborId) && isUndefined(frontier.explored[neighborId])) {
        frontier.unexplored.push(neighborId);
        // console.log('pushed');
      }
    });

    // change terrain of explored stuff for testing purposes
    // Object.assign(hexes[currentHexId], {
    //   terrain: 'plains',
    //   texture: terrains.textures.plains,
    // });

    // console.log(frontier.unexplored[0]);
    // const explored = frontier.unexplored.shift();
    // console.log(explored);
    frontier.explored[currentHexId] = true;
    frontier.unexplored.shift();
    // console.log(frontier.unexplored.length);
  }

  // console.log('walked');
  // console.log(frontier.explored);
  return Object.keys(frontier.explored);
}


export function cellularAutomata({
  hex,
  gridColumns,
  gridRows,
  hexSize,
  iterations,
  percentOpen,
}) {
  // array for storing an ordered array of ids to use as a lookup for our hexes object
  const idMap = [];
  const idMapSeeds = [];
  const idMapTerrainKeys = {};

  // object containing all hexes keyed by ids stored in order within idMap
  const hexes = {};

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
      idMap.push(hexId);

      const terrain = chance(percentOpen) ? 'hills' : 'mountains';

      hexes[hexId] = {
        id: hexId,
        x,
        y,
        z,
        width: hexMath.hexWidth(hexSize),
        height: hexMath.hexHeight(hexSize),
        point: hexMath.hexToPixel({ x, y, z }, hexSize),
        terrain,
        texture: terrains.textures[terrain],
      };
    }
  }

  for (let i = 0; i < iterations; i += 1) {
    each(idMap, (hexId) => {
      const updatedHex = mutate(hexes[hexId], hexes);

      if (updatedHex) {
        hexes[hexId] = Object.assign(hexes[hexId], {
          terrain: updatedHex.terrain,
          texture: updatedHex.texture,
        });
      }
    });
  }

  const idMapBoundaries = hexMap.mapBoundaries(hex || { x: 0, y: 0, z: 0 },
    gridColumns, gridRows, hexes);

  each(idMapBoundaries, (hexId) => {
    hexes[hexId].terrain = 'mountains';
    hexes[hexId].texture = terrains.textures.mountains;
  });

  const idMapTunnels = [];
  each(hexes, (currentHex) => {
    if (currentHex.terrain !== 'mountains') {
      idMapTunnels.push(currentHex.id);
    }
  });

  // breadth first search
  // http://www.redblobgames.com/pathfinding/a-star/introduction.html#algorithms
  // Use this algorithm to find the largest cave structure and turn the rest to walls
  const idMapCaveStructures = [];

  // walk the dirt
  while (idMapTunnels.length) {
    // console.log(idMapTunnels.length);
    // console.log(idMapTunnels);
    // console.log(walkDirt(idMapTunnels, idMapCaveStructures, hexes));
    // idMapTunnels.length = 0;
    const caveStructure = walkDirt(idMapTunnels, hexes);
    idMapCaveStructures.push({
      length: caveStructure.length,
      structure: caveStructure,
    });
    pullAll(idMapTunnels, caveStructure);
    console.log(idMapTunnels.length);
  }

  // console.log(idMapCaveStructures);

  const orderedIdMapCaveStructures = orderBy(idMapCaveStructures, ['length'], ['desc']);

  const primaryCave = orderedIdMapCaveStructures[0];

  each(primaryCave.structure, (tile) => {
    hexes[tile].texture = terrains.textures.swamp;
    hexes[tile].terrain = 'swamp';
  });

  each(orderedIdMapCaveStructures, (structure, index) => {
    if (index > 0) {
      each(structure.structure, (tile) => {
        hexes[tile].texture = terrains.textures.mountains;
        hexes[tile].terrain = 'mountains';
      });
    }
  });

  return {
    idMap,
    idMapBoundaries,
    idMapTunnels,
    idMapSeeds,
    idMapTerrainKeys,
    hexes,
  };
}
