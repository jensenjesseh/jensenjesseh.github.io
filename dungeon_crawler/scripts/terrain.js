
//the terrain should be implemented as array of terrains
//that will be used in the maze.js

//spec should include:
    // - type of terrain
        // - forest
        // - mountain
        // - castle
        // - grassland
    
    // - what sprite it is:
    // - spec.sprite = null; - initialized
        // - forest.png
        // - mountain.png
        // - castle.png
        // - grassland.png
    
// - (NOT DETERMINED BY SPEC)
    //number of enemies allowed based on terrain
        // - forest = 2-4 enemies
        // - mountain = 2-3 enemies
        // - castle = 1-2 enemies (harder)
        // - grassland = 4 enemies

//maybe determined by spec
    // - number of exits
        // - forest exits = 3
        // - mountain exits = 2
        // - castle exits = 4
        // - grassland exits = 4

var terrain = (function(spec){

    var that = {};

    var exits, enemyCount;

    //main initialization
    that.initialize = function(){
        configureTerrain(spec.terrainType);
    };


    //return statements
    that.returnTerrainType = function(){
        return spec.terrainType;
    };

    that.returnSpriteType = function(){
        return spec.sprite;
    };

    that.returnEnemyCount = function(){
        return enemyCount;
    };

    that.returnExits = function(){
        return exits;
    };

    that.returnItems = function(){
        return spec.items;
    };

    //configures based on what type of terrain
    function configureTerrain(type){
        if(type === 'forest'){
            exits = 3;
            enemies = Math.floor(Math.random()*(4-2+1)+2);
            spec.sprite = 'forest.png';
        }
        if(type === 'mountain'){
            exits = 2;
            enemies = Math.floor(Math.random()*(3-2+1)+2);
            spec.sprite = 'mountain.png';
        }
        if(type === 'castle'){
            exits = 4;
            enemies = Math.floor(Math.random()*(2-1+1)+1);
            spec.sprite = 'castle.png';
        }
        if(type === 'grassland'){
            exits = 4;
            enemies = 4;
            spec.sprite = 'grassland.png';
        }
    }

    return that;

}());