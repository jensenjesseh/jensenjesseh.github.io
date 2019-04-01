game.Maze = function(spec, pots){
  let grid = [];
  grid.width = spec.width;
  grid.height = spec.height;
  grid.cellHeight = spec.cellHeight;
  grid.cellWidth = spec.cellWidth;
  let braidPercent = .95;

  //create Empty Grid
  for(let col = 0; col < spec.width; col++){
    grid.push([]);
    for(let row = 0; row < spec.height; row++){
      grid[col].push({
        x: col, y: row,
        biome: null,
        edges: {
          n: null,
          s: null,
          e: null,
          w: null
        },
        //this is only used for generating mazes
        visited: false
      });
    }
  }

  //pick seed biome locations
  let biomeSeeds = [];
  for(let i = 0; i < spec.biomes; i++){
    let x, y;
    do{
      x = getRandom(spec.width);
      y = getRandom(spec.height);
    }
    while(grid[x][y].biome !== null);
    grid[x][y].biome = i;

    biomeSeeds.push(NeighborList(x,y));
    biomeSeeds[i].addId(i);
  }

  //use prims algorithm to expand seeded areas
  //TODO: add min or max for each area?
  while(biomeSeeds.length > 0){
    let biome = getRandom(biomeSeeds.length);
    let nextCell = getRandom(biomeSeeds[biome].length);
    let x = biomeSeeds[biome][nextCell].x;
    let y = biomeSeeds[biome][nextCell].y;
    if(grid[x][y].biome === null){
      grid[x][y].biome = biomeSeeds[biome].id;
      biomeSeeds[biome].addNeighbors(x,y);
    }
    biomeSeeds[biome].splice(nextCell, 1);
    if(biomeSeeds[biome].length === 0){
      biomeSeeds.splice(biome, 1);
    }
  }

  //overlay maze
  let neighbors = NeighborList(0,0);
  grid[0][0].visited = true;
  while(neighbors.length !== 0){
    let rand = getRandom(neighbors.length);
    let nextCell = neighbors[rand];
    if(grid[nextCell.x][nextCell.y].visited !== true){
      grid[nextCell.x][nextCell.y].visited = true;
      //connect walls
      connectWalls(nextCell.x, nextCell.y, nextCell.dir)
      neighbors.addNeighbors(nextCell.x, nextCell.y);
    }
    neighbors.splice(rand, 1);
  }

  //braid walls
  let deadEnds = [];
  for(let col = 0; col < grid.length; col++){
    for(let row = 0; row < grid[0].length; row++){
      let wallCount = 0;
      if(grid[col][row].edges.n === null){
        wallCount++;

      }
      if(grid[col][row].edges.s === null){
        wallCount++;

      }
      if(grid[col][row].edges.e === null){
        wallCount++;

      }
      if(grid[col][row].edges.w === null){
        wallCount++;

      }
      if(wallCount === 3) deadEnds.push({x: col, y: row})
    }
  }

  for(i = braidPercent * deadEnds.length; i > 0; i--){
    let rand = getRandom(deadEnds.length);
    let nextCell = deadEnds[rand];
    let dir = getRandom(4);
    //check for out of bounds
    if(dir === 0 && nextCell.y === 0) dir = 1;
    else if(dir === 1 && nextCell.y === grid[0].length - 1) dir = 0;
    else if(dir === 2 && nextCell.x === 0) dir = 3;
    else if(dir === 3 && nextCell.x === grid.length - 1) dir = 2;
    connectWalls(nextCell.x, nextCell.y, dir);
    deadEnds.splice(rand, 1);
  }

  //add physics bodies
  physics.addMazeBodies(grid, pots);

  //we don't use the references for anything, so false just means no wall
  //easier to save data this way
  function connectWalls(x,y,dir){
    if(dir === 'n' || dir === 0){
      grid[x][y].edges.n = false;
      grid[x][y - 1].edges.s = false;
    }
    else if(dir === 's' || dir === 1){
      grid[x][y].edges.s = false;
      grid[x][y + 1].edges.n = false;
    }
    else if(dir === 'w' || dir === 2){
      grid[x][y].edges.w = false;
      grid[x - 1][y].edges.e = false;
    }
    else if(dir === 'e' || dir === 3){
      grid[x][y].edges.e = false;
      grid[x + 1][y].edges.w = false;
    }
  }

  //array object that knows how to add neighbors
  //initialize with a beginning location in the grid
  function NeighborList(x,y){
    let that = [];

    that.addId = function(id){
      that.id = id;
    }

    that.addNeighbors = function(x,y){
      if(x > 0){
        that.push({x: x - 1, y: y, dir: 'e'});
      }
      if(x + 1 < spec.width){
        that.push({x: x + 1, y: y, dir: 'w'});
      }
      if(y > 0){
        that.push({x: x, y: y - 1, dir: 's'});
      }
      if(y + 1 < spec.height){
        that.push({x: x, y: y + 1, dir: 'n'});
      }
    }

    that.addNeighbors(x,y);

    return that;
  }

  function getRandom(limit){
    return Math.floor(Math.random() * limit);
  }

  return grid;
};
