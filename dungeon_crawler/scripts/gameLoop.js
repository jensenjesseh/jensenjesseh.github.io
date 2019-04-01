var game = (function(){
  let that = {};
  let time, canceled, maze, keyboard;
  let boxA;

  let pots = [];
  let score = 500;


  let keyStats = [];
  let exitKeys = [];
  let maxKeys;
  let visibleObjects = [];
  that.upgrade = {
    health: false,
    item: false,
    attack: false
  };

  that.y = {};
  let renderGraphics;
  let character, enemies, particles;
  that.dustParticles;
  that.level = 1;
  let totCoins = [];
  let dropPercent;

    //categories:
    var defaultCategory = 0x0001;
    var characterCategory = 0x0002;
    var enemyCategory = 0x0003;

  that.initialize = function(load){
    renderGraphics = true;
    canceled = false;
    time = performance.now();


    //physics initialize
    physics.initialize();

    let previousGame = memory.loadGame();
    if(load){ that.level = previousGame.level}

    let imgChar = new Image();
    imgChar.src = "assets/Character/downCharacter.png";
    //should never have upgrades on first level
    if(that.level === 1){ maxKeys = 2;
    that.upgrade = {
      health: false,
      item: false,
      attack: false
    };}
    else if(that.level === 2){ maxKeys = 3;}
    else if(that.level === 3){ maxKeys = 5;}
    Stats.initialize(maxKeys);

    //not a save game
    if (!load || previousGame === undefined || previousGame === {}){
      let numEnemies;

      if(that.level === 1){
        score = 0;
        maze = that.Maze({
          height: 5,
          width: 8,
          biomes: 4,
          cellHeight: 500,
          cellWidth: 500
        }, pots);

        numEnemies = 20;
      }
      else if(that.level === 2){
        maze = that.Maze({
          height: 7,
          width: 9,
          biomes: 4,
          cellHeight: 500,
          cellWidth: 500
        }, pots);

        numEnemies = 45;
      }else if(that.level === 3){
        maze = that.Maze({
          height: 16,
          width: 16,
          biomes: 4,
          cellHeight: 500,
          cellWidth: 500
        }, pots);

        numEnemies = 100;
      }
      Stats.updateCoins(score);
      objects.initialize(maze.width, maze.height);

      let health = 5;
      if (that.upgrade["health"]) health = 10;

      character = objects.Character({
          image: imgChar,
          spritesheet: null,
          view:{width:1000, height:1000},
          moveRate: 450/1000, //pixels per millisecond
          radius: 1000*(1/100),
          radiusSq: (1000*(1/100)*(1000*(1/100))),
          isDead: false,
          isHit:false,
          body: physics.createCircleBody((maze.cellWidth/2) + 60, (maze.cellHeight/2) + 70, 40),
          sensor: physics.createSensorBody((maze.cellWidth/2) + 60, (maze.cellHeight/2) + 70, 75, 75),
          direction: 'down',
          attacking: false,
          coolDown: 0,
          tag: 'Character',
          center: {x:1000/2, y:1000/2},
          health: health,
          keys: 0,
          coins: score
      });

      Stats.updateHealth(health);

      character.loadAnimations();

      enemies = objects.initializeEnemies(numEnemies, maze.width, maze.height, maze.cellWidth);

      for(let amount = 0; amount < maxKeys; amount++){
        exitKeys[amount] = objects.Key(math.randomLocation(maze.width, maze.height, maze.cellWidth), maze);
      }
    }
    //load game
    else{
      score = 0;
      that.upgrade = previousGame.upgrade;
      navigation.screens['levelUp'].registerUpgrades();

      maze = previousGame.maze;
      maze.width = maze.length;
      maze.height = maze[0].length;
      maze.cellHeight = 500;
      maze.cellWidth = 500;
      physics.addMazeBodies(maze, pots);

      objects.initialize(maze.width, maze.height);

      character = objects.Character({
          image: imgChar,
          spritesheet: null,
          view:{width:1000, height:1000},
          moveRate: 450/1000, //pixels per millisecond
          radius: 1000*(1/100),
          radiusSq: (1000*(1/100)*(1000*(1/100))),
          isDead: false,
          isHit:false,
          body: physics.createCircleBody(previousGame.character.center.x, previousGame.character.center.y, 40),
          sensor: physics.createSensorBody(previousGame.character.center.x, previousGame.character.center.y, 75, 75),
          direction: 'down',
          attacking: false,
          coolDown: 0,
          tag: 'Character',
          center: previousGame.character.center,
          health: previousGame.character.health,
          keys: 0,
          coins: 0
      });

      character.loadAnimations();

      Stats.updateHealth(previousGame.character.health);
      for(let i = 0; i < previousGame.character.keys; i++){
        character.addKey();
      }

      for(let j = 0; j < previousGame.coins; j++){
       character.addCoin();
        score += 1;
      }
      Stats.updateCoins(score);

      enemies = objects.loadEnemies(previousGame.enemies);

      exitKeys = objects.loadKeys(previousGame.keys, maze);
      totCoins = objects.loadCoins(previousGame.coins, maze);
    }

    graphics.initialize(maze);

    //physics character body:
    physics.addCollisionFilter(character.returnSensor(), enemyCategory);
    character.addBodyToWorld();
    //end

    keyboard = input.Keyboard();
    setupControlScheme();

    particles = [];
    //initialize dust trail
    that.dustParticles = ParticleSystem({
      image: "assets/dust.png",
      size: 50,
      speed: 10,
      lifetime: {avg:0, dist: 1}
    });

    //gives more information on what collides with the player
    physics.eventSensorStart(character, enemies);
    physics.eventSensorActive(character, enemies);
    physics.eventSensorEnd(character, enemies);
    physics.potCollisionStart(character, pots, totCoins);

    //allow enemies to damage character
    physics.enemyDamageEvent(character, enemies);

    canExit = false;
    dropPercent = 40;
    if(that.upgrade["item"]) dropPercent = 85; 

    gameLoop();
  };

  function setupControlScheme(){
    window.addEventListener("keydown", keyboard.keyPress, false);
    window.addEventListener("keyup", keyboard.keyRelease, false);

    let controlScheme = memory.getControls();
    keyboard.registerCommand(controlScheme.left, character.moveLeft);
    keyboard.registerCommand(controlScheme.right, character.moveRight);
    keyboard.registerCommand(controlScheme.up, character.moveUp);
    keyboard.registerCommand(controlScheme.down, character.moveDown);
    //key for attacking
    keyboard.registerCommand(controlScheme.attack, coolDownCheck);
  }

  //checking cooldown of attack
  function coolDownCheck(){
    character.attack(true);
  }

  function gameLoop(){
    let newTime = performance.now();
    let elapsedTime = newTime - time;
    //console.log(character.returnAttackState());
    //console.log(time);
    handleInput(elapsedTime);

    update(elapsedTime);
    render(elapsedTime);

    time = newTime;

    if(!canceled) requestAnimationFrame(gameLoop);
  }

  function handleInput(elapsedTime){
    keyboard.update(elapsedTime);
  };

  function update(elapsedTime){
    let count1 = 0;
    let count2 = 0;

    let square = {
          center:{x:character.center.x , y:character.center.y},
          size: graphics.defineCamera(character.center.x, character.center.y).size - 300
        }
    //console.log(character.returnIsHit());
    //console.log(character.returnAttackState());
    //console.log(pots[0].returnPosition().x);

    character.update(elapsedTime);

    graphics.setOffset(character.center.x, character.center.y);

    //we pass all the objects we want to be in the visible objects in one array
    objects.buildQuadTree(8, exitKeys.concat(totCoins).concat(enemies), maze.width*maze.cellWidth);
    visibleObjects = objects.quadTree.visibleObjects(graphics.defineCamera(character.center.x, character.center.y));


    for(let j = 0; j < visibleObjects.length; j++){
        if(math.objectInSquare(visibleObjects[j], square)){
          if(visibleObjects[j].enemyType === 1){
            count1++;
          }
          else if(visibleObjects[j].enemyType === 0){
            count2++;
          }
        }
      }

    if(count1 === 0){
      audio.sounds['assets/slime-sound'].pause()
    }
    if(count2 === 0){
      audio.sounds['assets/bat-sound'].pause()
    }

    that.dustParticles.update(elapsedTime);
    for(let i = 0; i < particles.length; i++){
      particles[i].update(elapsedTime);
      //delete unneeded particles
      if(particles[i].length === 0){
        particles.splice(i--, 0);
      }
    }

    for(let enemy = 0; enemy < visibleObjects.length; enemy++){
      visibleObjects[enemy].update(elapsedTime, character.center);
      if(visibleObjects[enemy].isDead === true){
        //enemy killed
        if(visibleObjects[enemy].tag === "Enemy"){
          //make ParticleSystem
          let enemiesDissolve = ParticleSystem({
            image: "assets/enemyDeath.png",
            size: 20,
            speed: 30,
            lifetime: {avg: .3, dist: .2}
          });

          toDrop = Math.random()*100;
          if(toDrop < (dropPercent)){
              totCoins.push(objects.Coin({
                sprite: objects.coinSprite,
                center: visibleObjects[enemy].center,
                radius: 50/2,
                isDead: false,
                tag: "coin"
              }));
          }
          enemiesDissolve.createParticles(20, visibleObjects[enemy].center.x, visibleObjects[enemy].center.y, 25);
          particles.push(enemiesDissolve);
          //remove dead enemy from world
          let index = enemies.indexOf(visibleObjects[enemy]);
          physics.removeFromWorld(enemies[index].body);
          enemies.splice(index, 1);
        }
        //pick up key
        else if(visibleObjects[enemy].tag === "key"){
          let index = exitKeys.indexOf(visibleObjects[enemy]);
          audio.playSound('assets/coin-sound');
          exitKeys.splice(index, 1);
          character.addKey();
        }
        else if(visibleObjects[enemy].tag === "coin"){
           let index2 = totCoins.indexOf(visibleObjects[enemy]);
           audio.playSound('assets/coin-sound');
           totCoins.splice(index2, 1);
           character.addCoin();
           score += 1;
           Stats.updateCoins(score);
         }
        visibleObjects.splice(enemy--, 1);
      }
    }



    //set the offset to the body position
    //we dont use quite use offset anymore
    graphics.setOffset(character.returnCharacterBody().position.x, character.returnCharacterBody().position.y);

    //open the exit
    if(character.returnKeyTotal() === maxKeys){
      graphics.openDoor();
      //let the character exit
      let distanceToDoorX = Math.abs(character.center.x - maze.width * maze.cellWidth + maze.cellWidth / 2);
      if(distanceToDoorX < 20 && character.center.y < 120){
        if(that.level < 3){
          navigation.showScreen('levelUp');
          that.level++;
        }else{
          navigation.showScreen('win');
          addScore(score);
          document.getElementById("win-score").innerHTML = "You Scored " + score + " points";
        }
        that.quit();
      }
    }
     if(character.isDead){
       that.quit();
       addScore(score);
       navigation.showScreen('game-over');
       document.getElementById("lose-score").innerHTML = "You Scored " + score + " points";
     }

     objects.updateCoinSprite(elapsedTime);

     //update the pots!
     for(let pot = 0; pot < pots.length; pot++){
       pots[pot].update(totCoins);
       if(pots[pot].isBroken() === true){
          physics.removeFromWorld(pots[pot].returnBody());
          pots.splice(pot, 1);
       }
     }

  };

  function render(elapsedTime){
    //only render background when character moves
    //TODO: move this to update only when the OFFSET changes!!!
    graphics.renderTiles(maze, character);
    //TODO: only render this (and tiles) if character moves
    //Added a key listener to the 'G' and 'H' Key
    //'G' -> Turns off rendering of Graphics
    //'H' -> Turns on rendering of Graphics
    if(renderGraphics === true){

      //translates the context to where the characters center is
      graphics.drawCamera(character);

      graphics.renderMaze(maze, character); //<------THIS IS WHAT YOU NEED TO CHANGE TO TURN OFF GRAPHICS
    }

    that.dustParticles.render();
    for(let i = 0; i < particles.length; i++){
      particles[i].render();
    }

    for(let object = 0; object < visibleObjects.length; object++){
      visibleObjects[object].render(elapsedTime);
    }

    for(let pot = 0; pot < pots.length; pot++){
      graphics.renderPots(pots[pot]);
    }

    character.render(elapsedTime);
    Stats.render();
  };

  that.saveGame = function(){
    let saveMaze = [];
    //make smaller, saveable maze
    for(let i = 0; i < maze.length; i++){
      saveMaze[i] = [];
      for(let j = 0; j < maze[i].length; j++){
        let n = (maze[i][j].edges.n === false) ? false : null;
        let s = (maze[i][j].edges.s === false) ? false : null;
        let w = (maze[i][j].edges.w === false) ? false : null;
        let e = (maze[i][j].edges.e === false) ? false : null;
        saveMaze[i][j] = {
          x: i, y: j,
          biome: maze[i][j].biome,
          edges: {
            n: n,
            s: s,
            e: e,
            w: w
          }
        }
      }
    }

    let saveKeys = [];
    for(let i = 0; i < exitKeys.length; i++){
      let current = exitKeys[i];
      saveKeys.push(current.center);
    }

    let saveCoins = [];
     for(let j = 0; j < totCoins.length; j++){
       let current2 = totCoins[j];
      saveCoins.push(current2.center);
    }

    let saveEnemies = [];
    for(let i = 0; i < enemies.length; i++){
      let current = enemies[i];
      let newEnemy = {};
      newEnemy.chooseSprite = current.enemyType;
      newEnemy.health = current.returnHealth();
      newEnemy.center = current.center;
      saveEnemies.push(newEnemy);
    }

    let saveCharacter = {
      center: character.center,
      health: character.returnHealth(),
      keys: character.returnKeyTotal()
    }
    //all needed perpetuated data
    let spec =
    {
      maze: saveMaze,
      character: saveCharacter,
      enemies: saveEnemies,
      keys: saveKeys,
      level: that.level,
      upgrade: that.upgrade,
      coins: score
    }
    memory.saveGame(spec);
  }

  that.quit = function(){
       canceled = true;
  }

  return that;
}());
