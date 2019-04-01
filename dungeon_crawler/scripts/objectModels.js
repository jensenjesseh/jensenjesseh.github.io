var objects = (function(){
  let that = {};

  let width, height;
       //variables used to find gaussian distribution
  let characterSizePercent, characterInventory, pots, potSizePercent;                  //array of breakable pots
  let movingLeft, movingRight,
      movingDown, movingUp;
  let imgBat, imgSlime, batSpec, slimeSpec;
  that.quadTree = {};

  let enemies, visible;
  //that.moreSlime = false;
  //that.moreBats = false;

    //categories for collision detection
    var defaultCategory = 0x0001;
    var characterCategory = 0x0002;
    var enemyCategory = 0x0003;

  that.initialize = function(gridWidth, gridHeight){
    width = gridWidth,
    height = gridHeight;
    //usePrevious = false
    characterInventory = {};    //contains an inventory of all items that the character holds
    pots = [];                  //array of breakable pots
    movingLeft = false;
    movingRight = false;
    movingDown = false;
    movingUp = false;
    characterSizePercent = {x:1,y:1};
    potSizePercent = {x:5, y:5}

    imgSlime = new Image();
    imgSlime.src = "assets/slime.png";

    imgBat = new Image();
    imgBat.src = "assets/bat.png";

    imgKey = new Image();
    imgKey.src = "assets/key.png";

    imgCoin = new Image();
     imgCoin.src = "assets/coin.png"

     that.coinSprite = AnimatedSprite({
                spriteSheet: imgCoin,
                 spriteCount: 8,
                 spriteTime: [200, 200, 200, 200, 200, 200, 200 ,200],
                 spriteSize: 50,
                 width: 50,
                 height: 50,
                 pixelWidth: 32,
                 pixelHeight: 32
      })
  };

  function randPotLocation(){
      let randLoc = {x:Math.random()*1000, y:Math.random()*1000};
        //This function needs to be changed. Pots should
        //only generate next to walls and in clusters.
        //could this generation be added to the Prim's generation algo?

      return randLoc;
  }

  that.initializeEnemies = function(avgEnemyCount, width, height, size){
      enemies = [];
      let dev = 10;
      for(let i = 0; i < math.gaussian(avgEnemyCount, dev); i++){
        let chooseSprite = Math.floor(Math.random()*2);
        let enemySprite;
        if(chooseSprite === 1){
          enemySprite = AnimatedSprite({
            spriteSheet: imgSlime,
            spriteCount: 4,
            spriteTime: [100, 250, 220, 300, 175],
            spriteSize: 50,
            width: 100,
            height: 100,
            pixelWidth: 32,
            pixelHeight: 32
          });
        }else{
          enemySprite = AnimatedSprite({
            spriteSheet: imgBat,
            spriteCount: 6,
            spriteTime: [100, 80, 75, 125, 75, 60],
            spriteSize: 50,
            width: 150,
            height: 100,
            pixelWidth: 48,
            pixelHeight: 32
          });
        }
          let randLoc = math.randomLocation(width, height, size);
          enemies.push(that.Character({
              sprite: enemySprite,
              enemyType: chooseSprite,
              view:{width:1000, height:1000},
              moveRate: 1/100000, //pixels per millisecond
              radius: 1500*(characterSizePercent.y/100),
              radiusSq: (1000*(characterSizePercent.y/100))*(1000*(characterSizePercent.y/100)) ,
              isDead: false,
              isHit: false,
              center: randLoc,
              direction: null,
              health: 2,
              tag: 'Enemy',
              body: physics.createRectangleBody(randLoc.x + 1, randLoc.y + 7, 60, 60)
          }));
      }

      for(let i = 0; i < enemies.length; i++) {
        physics.setRestitution(50, enemies[i]);
        physics.setID(enemies[i].returnCharacterBody(), i);
        enemies[i].addBodyToWorld();
      }


      //if we want to have a minimum # of enemies per room, this may need to be changed
      return enemies;
  };

  that.loadEnemies = function(spec){
    let enemies = [];
    for(let i = 0; i < spec.length; i++){
      let enemySprite;
      if(spec[i].chooseSprite === 1){
        enemySprite = AnimatedSprite({
          spriteSheet: imgSlime,
          spriteCount: 4,
          spriteTime: [100, 250, 220, 300, 175],
          spriteSize: 50,
          width: 100,
          height: 100,
          pixelWidth: 32,
          pixelHeight: 32
        });
      }else{
        enemySprite = AnimatedSprite({
          spriteSheet: imgBat,
          spriteCount: 6,
          spriteTime: [100, 80, 75, 125, 75, 60],
          spriteSize: 50,
          width: 150,
          height: 100,
          pixelWidth: 48,
          pixelHeight: 32
        });
      }
      enemies.push(that.Character({
          sprite: enemySprite,
          enemyType: spec[i].chooseSprite,
          view:{width:1000, height:1000},
          moveRate: 1/100000, //pixels per millisecond
          radius: 1500*(characterSizePercent.y/100),
          radiusSq: (1000*(characterSizePercent.y/100))*(1000*(characterSizePercent.y/100)) ,
          isDead: false,
          isHit: false,
          center: spec[i].center,
          health: spec[i].health,
          tag: 'Enemy',
          body: physics.createRectangleBody(spec[i].center.x + 1, spec[i].center.y + 7, 60, 60)
      }));
    }

    for(let i = 0; i < enemies.length; i++) {
      physics.setID(enemies[i].returnCharacterBody(), i);
      enemies[i].addBodyToWorld();
    }

    //if we want to have a minimum # of enemies per room, this may need to be changed
    return enemies;
  };


  that.updateSprite = function(spriteToPlay, elapsedTime){
     spriteToPlay.sprite.update(elapsedTime);
    }

   that.Coin = function(spec){
       var that = {
       get center(){return spec.center},
       get spec(){return spec},
       get width(){return spec.width},
       get height(){return spec.height},
       get radius(){return spec.radius},
       get isDead(){return spec.isDead},
       get tag(){return spec.tag}
       }

       that.update = function(elapsedTime, position){
         if(Math.abs(that.center.x - position.x) < 30 && Math.abs(that.center.y - position.y) < 50) spec.isDead = true;
     };
       that.render = function(elapsedTime){
           spec.sprite.render(spec.center.x, spec.center.y);
       }

      that.intersects = function(other) {
   		var distance = Math.pow((that.center.x - other.center.x), 2) + Math.pow((that.center.y - other.center.y), 2);
  		return (distance < Math.pow(that.radius + other.radius, 2));  	};
      return that;
};

that.updateCoinSprite = function(elapsedTime){
    objects.coinSprite.update(elapsedTime);
}

  that.loadCoins = function(array, maze){
             let coins = [];
             for(let i = 0; i < array.length; i++){
                 coins.push(that.Coin({center: array[i], radius:50/2, sprite: objects.coinSprite, isDead: false, tag: "coin"}, maze));
             }
             return coins;
     }


  //---------------------------------
  //Character model. spec must include:
  //    image: character image
  //    view:{width,height}
  //    radius: radius around object used in quadTree to determine if visible
  //    radiusSq : height squared
  //    moveRate: number in pixels per millisecond*/
  //    isDead: bool
  //    isHit:  bool    (could use number here instead that could be the damage taken if variable damage is possible depending on enemy)
  //    center: {x,y}
  //    health: number
  that.Character = function(spec){
      var that;

      spec.width = spec.view.width * (characterSizePercent.x/100);
      spec.height = spec.view.height * (characterSizePercent.y/100);



      that = {
          get left(){return spec.center.x - spec.width/2},
          get right(){return spec.center.x + spec.width/2},
          get top(){return spec.center.y - spec.height/ 2},
          get bottom(){return spec.center.y + spec.height/2},
          get center(){return spec.center},
          get width(){return spec.width},
          get radius(){return spec.radius},
          get radiusSq(){return spec.radiusSq},
          get isHit(){return spec.isHit},
          get isDead(){return spec.isDead},
          get body(){return spec.body},
          get enemyType(){ return spec.enemyType },
          get tag(){return spec.tag}
      };

      //adds the body to the physics world
      that.addBodyToWorld = function(){
        physics.setFrictionAir(0.075, spec.body);  //how much friction in the air when it moves
        physics.setRestitution(2, spec.body);      //how bouncy/elastic

        if(spec.tag === 'Character'){
            physics.addCollisionFilter(spec.body, characterCategory);
        }
        if(spec.tag === 'Enemy'){
            physics.addCollisionFilter(spec.body, enemyCategory);
        }
        physics.addToWorld(spec.body);
      };

      //returns the body of either the enemy or character
      that.returnCharacterBody = function(){
        return spec.body;
      };

      //returns the sensor body tied to the character
      that.returnSensor = function(){
          return spec.sensor;
      };

      //returns the category in which it can collide with
      that.returnCategory = function(){
        return spec.body.collisionFilter.category;
      };

      //returns the direciton in which the character is facing
      that.returnDirection = function(){
        return spec.direction;
      };

      //returns the amount of cooldown a character has before he can attack
      that.returnCoolDown = function(){
        return spec.coolDown;
      };

      //set the cooldown manually
      that.setCoolDown = function(CD){
        spec.coolDown = CD;
      };

      //manually sets the body position of the character
      that.setBodyPosition = function(myBody){
        spec.center.x = myBody.position.x;
        spec.center.y = myBody.position.y;
      };

      that.updatePosition = function(character){
          var charDistanceX = character.x - spec.center.x;
          var charDistanceY = character.y - spec.center.y;

          if(charDistanceX > 0){
            Matter.Body.applyForce(spec.body, spec.body.position, {x: 0.0005 * spec.body.mass, y:0});
            spec.direction = 'right';
          }

          else{
              Matter.Body.applyForce(spec.body, spec.body.position, {x: -0.0005 * spec.body.mass, y:0});
              spec.direction = 'left';
          }

          if(charDistanceY > 0){
              Matter.Body.applyForce(spec.body, spec.body.position, {x: 0, y:0.0005 * spec.body.mass});
              spec.direction = 'down';
          }

          else{
              Matter.Body.applyForce(spec.body, spec.body.position, {x: 0, y:-0.0005 * spec.body.mass});
              spec.direction = 'up';
          }

      };

      //sets if the character is in a state of attacking
      that.attack = function(state){
        spec.attacking = state;
        if(state){
            audio.playSound('assets/sword-swipe');
        }
      };

      //returns if the character is in a state of attacking
      that.returnAttackState = function(){
        return spec.attacking;
      };

      //allows the status of 'isHit' to be changed manually
      that.setHit = function(){
          spec.isHit = true;
      };

      that.setFalseHit = function(){
          spec.isHit = false;
      };

      that.returnIsHit = function(){
          return spec.isHit;
      };

      //checks if the character is hit
      that.checkIfHit = function(){
          if(spec.isHit){
              audio.playSound('assets/grunt');
          }
          //spec.isHit = false;


          return false;
          //WILL NEED TO BE CHANGED. JUST WRITTEN LIKE THIS FOR CHARACTER MOVEMENT TESTING
      };

      //allows the character or enemy to receive damage
      that.damaged = function(){
        spec.health--;
        if(game.upgrade['attack']) spec.health--;
      };

      that.returnHealth = function(){
        return spec.health;
      };

      that.checkHealth = function(object){
        if(spec.isHit !== false){
            spec.health -= 1;
            Stats.updateHealth(spec.health);
            spec.isHit = false;
        }

        if(spec.health <= 0){

            spec.isDead = true;
        }
      }

      //returns the amount of keys on the character
      that.returnKeyTotal = function(){
        return spec.keys;
      };

      that.addKey = function(){
        Stats.updateKeys(++spec.keys);
      };

      that.addCoin = function(){
           spec.coins += 1;
      }
       that.returnCoinTotal = function(){
           return spec.coins;
     }


//MOVEMENT:
      that.moveRight = function(elapsedTime){
          Matter.Body.applyForce(spec.body, spec.body.position, {x: 0.002 * spec.body.mass, y:0});
          game.dustParticles.createParticles(1, spec.center.x , spec.center.y + 20, 20);
          spec.direction = 'right';
      };

      that.moveLeft = function(elapsedTime){
          Matter.Body.applyForce(spec.body, spec.body.position, {x: -0.002 * spec.body.mass, y:0});
          game.dustParticles.createParticles(1, spec.center.x , spec.center.y + 20, 20);
          spec.direction = 'left';
      };

      that.moveUp = function(elapsedTime){
          Matter.Body.applyForce(spec.body, spec.body.position, {x: 0, y:-0.002 * spec.body.mass});
          game.dustParticles.createParticles(1, spec.center.x , spec.center.y + 20, 20);
          spec.direction = 'up';
      };

      that.moveDown = function(elapsedTime){
          Matter.Body.applyForce(spec.body, spec.body.position, {x: 0, y:0.002 * spec.body.mass});
          game.dustParticles.createParticles(1, spec.center.x , spec.center.y + 20, 20);
          spec.direction = 'down';
      };


//load ALL the animations and images related to the character
      that.loadAnimations = function(){
          //idle images
            let downIdle = new Image();
            downIdle.src = "assets/Character/downCharacter.png";

            let upIdle = new Image();
            upIdle.src = "assets/Character/upCharacter.png";

            let leftIdle = new Image();
            leftIdle.src = "assets/Character/leftCharacter.png";

            let rightIdle = new Image();
            rightIdle.src = "assets/Character/rightCharacter.png";

            //getting the animation sheets in
            let downSprite = new Image();
            downSprite.src = "assets/Character/down-animation.png";

            let upSprite = new Image();
            upSprite.src = "assets/Character/up-animation.png";

            let leftSprite = new Image();
            leftSprite.src = "assets/Character/left-animation.png";

            let rightSprite = new Image();
            rightSprite.src = "assets/Character/right-animation.png";

            //attack animations
            let downAttackSprite = new Image();
            downAttackSprite.src = "assets/Character/downAttackAnimation.png";

            let upAttackSprite = new Image();
            upAttackSprite.src = "assets/Character/upAttackAnimation.png";

            let leftAttackSprite = new Image();
            leftAttackSprite.src = "assets/Character/leftAttackAnimation.png";

            let rightAttackSprite = new Image();
            rightAttackSprite.src = "assets/Character/rightAttackAnimation.png";

            //hash array to hold the directions of animations
            var animationHash = {};

            // animationHash['downIdle'] = downIdle;
            // animationHash['upIdle'] = upIdle;
            // animationHash['leftIdle'] = leftIdle;
            // animationHash['rightIdle'] = rightIdle;

            animationHash['down'] = AnimatedSprite({
                spriteSheet: downSprite,
                spriteCount: 12,
                spriteTime: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
                spriteSize: 50,
                width: 100,
                height: 100,
                pixelWidth: 80,
                pixelHeight: 112
            });
            animationHash['up'] = AnimatedSprite({
                spriteSheet: upSprite,
                spriteCount: 12,
                spriteTime: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
                spriteSize: 50,
                width: 80,
                height: 100,
                pixelWidth: 64,
                pixelHeight: 113
            });
            animationHash['left'] = AnimatedSprite({
                spriteSheet: leftSprite,
                spriteCount: 12,
                spriteTime: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
                spriteSize: 50,
                width: 100,
                height: 100,
                pixelWidth: 96,
                pixelHeight: 112
            });
            animationHash['right'] = AnimatedSprite({
                spriteSheet: rightSprite,
                spriteCount: 12,
                spriteTime: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
                spriteSize: 50,
                width: 100,
                height: 100,
                pixelWidth: 96,
                pixelHeight: 112
            });

            //attack animations
            animationHash['attackDown'] = AnimatedSprite({
                spriteSheet: downAttackSprite,
                spriteCount: 7,
                spriteTime: [80, 80, 80, 80, 80, 80, 80],
                spriteSize: 50,
                width: 140,
                height: 160,
                pixelWidth: 128,
                pixelHeight: 168
            });
            animationHash['attackUp'] = AnimatedSprite({
                spriteSheet: upAttackSprite,
                spriteCount: 5,
                spriteTime: [80, 80, 80, 80, 80],
                spriteSize: 50,
                width: 140,
                height: 160,
                pixelWidth: 128,
                pixelHeight: 168
            });
            animationHash['attackRight'] = AnimatedSprite({
                spriteSheet: rightAttackSprite,
                spriteCount: 7,
                spriteTime: [80, 80, 80, 80, 80, 80, 80],
                spriteSize: 50,
                width: 180,
                height: 140,
                pixelWidth: 144,
                pixelHeight: 168
            });
            animationHash['attackLeft'] = AnimatedSprite({
                spriteSheet: leftAttackSprite,
                spriteCount: 7,
                spriteTime: [80, 80, 80, 80, 80, 80, 80],
                spriteSize: 50,
                width: 180,
                height: 140,
                pixelWidth: 144,
                pixelHeight: 168
            });

            //idle animations
            animationHash['downIdle'] = AnimatedSprite({
                spriteSheet: downIdle,
                spriteCount: 1,
                spriteTime: [0],
                spriteSize: 50,
                width: 90,
                height: 100,
                pixelWidth: 80,
                pixelHeight: 120
            });
            animationHash['upIdle'] = AnimatedSprite({
                spriteSheet: upIdle,
                spriteCount: 1,
                spriteTime: [0],
                spriteSize: 50,
                width: 90,
                height: 100,
                pixelWidth: 80,
                pixelHeight: 120
            });
            animationHash['rightIdle'] = AnimatedSprite({
                spriteSheet: rightIdle,
                spriteCount: 1,
                spriteTime: [0],
                spriteSize: 50,
                width: 100,
                height: 100,
                pixelWidth: 80,
                pixelHeight: 120
            });
            animationHash['leftIdle'] = AnimatedSprite({
                spriteSheet: leftIdle,
                spriteCount: 1,
                spriteTime: [0],
                spriteSize: 50,
                width: 100,
                height: 100,
                pixelWidth: 80,
                pixelHeight: 120
            });

            spec.spritesheet = animationHash;
      };


      that.update = function(elapsedTime, characterPos){


      //character/enemy update function

        // //determine if dead or not
        // if(spec.tag === 'Enemy' && spec.health <= 0){
        //     physics.removeFromWorld(spec.body);
        //     enemies.splice(spec.body.id, 1);
        // }
        // else{

        //need to add this so that the character doesnt skip to the body position
        if(spec.tag === 'Character'){
            spec.center.x = spec.body.position.x;
            spec.center.y = spec.body.position.y;

            that.checkIfHit();
            that.checkHealth();

            //change sensor position
            if(spec.direction === 'down'){
                //spec.image.src = "assets/Character/downCharacter.png";
                if(spec.attacking === true){
                    spec.image = spec.spritesheet['attackDown'];
                    spec.image.update(elapsedTime);
                    if(spec.image.returnSprite() === 0){
                        spec.attacking = false;
                    }
                }
                else if(spec.body.force.x === 0 && spec.body.force.y === 0){
                    spec.image = spec.spritesheet['downIdle'];
                    spec.image.update(elapsedTime);
                }
                else{
                    spec.image = spec.spritesheet['down'];
                    spec.image.update(elapsedTime);
                }
                physics.setPosition(spec.sensor, spec.center.x, spec.center.y + 85);
            }
            if(spec.direction === 'up'){
                //spec.image.src = "assets/Character/upCharacter.png";
                if(spec.attacking === true){
                    spec.image = spec.spritesheet['attackUp'];
                    spec.image.update(elapsedTime);
                    if(spec.image.returnSprite() === 0){
                        spec.attacking = false;
                    }
                }
                else if(spec.body.force.x === 0 && spec.body.force.y === 0){
                    spec.image = spec.spritesheet['upIdle'];
                    spec.image.update(elapsedTime);
                }
                else{
                    spec.image = spec.spritesheet['up'];
                    spec.image.update(elapsedTime);
                }
                physics.setPosition(spec.sensor, spec.center.x, spec.center.y - 85);
            }
            if(spec.direction === 'right'){
                //spec.image.src = "assets/Character/rightCharacter.png";
                if(spec.attacking === true){
                    spec.image = spec.spritesheet['attackRight'];
                    spec.image.update(elapsedTime);
                    if(spec.image.returnSprite() === 0){
                        spec.attacking = false;
                    }
                }
                else if(spec.body.force.x === 0 && spec.body.force.y === 0){
                    spec.image = spec.spritesheet['rightIdle'];
                    spec.image.update(elapsedTime);
                }
                else{
                    spec.image = spec.spritesheet['right'];
                    spec.image.update(elapsedTime);
                }
                physics.setPosition(spec.sensor, spec.center.x + 85, spec.center.y);
            }
            if(spec.direction === 'left'){
                //spec.image.src = "assets/Character/leftCharacter.png";
                if(spec.attacking === true){
                    spec.image = spec.spritesheet['attackLeft'];
                    if(spec.image.returnSprite() === 0){
                        spec.attacking = false;
                    }
                    spec.image.update(elapsedTime);

                }
                else if(spec.body.force.x === 0 && spec.body.force.y === 0){
                    spec.image = spec.spritesheet['leftIdle'];
                    spec.image.update(elapsedTime);
                }
                else{
                    spec.image = spec.spritesheet['left'];
                    spec.image.update(elapsedTime);
                }
                physics.setPosition(spec.sensor, spec.center.x - 85, spec.center.y);
            }
        }

        //sprite & enemy position
        if(spec.tag === 'Enemy'){
          spec.sprite.update(elapsedTime);
          // if enemy in viewport{
              let square = {
                  center:{x:characterPos.x , y:characterPos.y},
                  size: graphics.defineCamera(characterPos.x, characterPos.y).size - 300
              }

              if(math.objectInSquare(spec, square)) {
                  if(spec.enemyType === 1){
                        audio.sounds['assets/slime-sound'].loop = true;
                         audio.playSound('assets/slime-sound');
                }

                else if(spec.enemyType === 0){
                    audio.sounds['assets/bat-sound'].loop = true;
                    audio.playSound('assets/bat-sound');
                }

                    that.updatePosition(characterPos);
              }
              else{
                  audio.sounds['assets/slime-sound'].loop = false;
                  //audio.pauseSound('assets/slime-sound');
                  audio.sounds['assets/bat-sound'].loop = false;
                  //audio.pauseSound('assets/bat-sound');

              }

            if(spec.health < 1){
                spec.isDead = true;
            }
            else{
                spec.center.x = spec.body.position.x;
                spec.center.y = spec.body.position.y;
                spec.sprite.update(elapsedTime);
            }
        }

            // //need to write checkIfHit functions
            // if(that.checkIfHit === true){
            //     spec.isHit = true;
            // }
            // checkHealth(that);
            //}


      };


      that.render = function(){

          if(spec.tag === 'Character'){
            physics.setPosition(spec.body, spec.center.x, spec.center.y);

            if(spec.direction === 'right'){
                if(spec.attacking === true){
                    spec.image.render(spec.center.x + 20, spec.center.y - 23);
                }
                else{
                    spec.image.render(spec.center.x, spec.center.y);
                }
            }
            else if(spec.direction === 'left'){
                if(spec.attacking === true){
                    spec.image.render(spec.center.x - 20, spec.center.y - 23);
                }
                else{
                    spec.image.render(spec.center.x, spec.center.y);
                }
            }
            else if(spec.direction === 'up'){
                if(spec.attacking === true){
                    spec.image.render(spec.center.x, spec.center.y - 20);
                }
                else{
                    spec.image.render(spec.center.x, spec.center.y);
                }
            }
            else if(spec.direction === 'down'){
                if(spec.attacking === true){
                    spec.image.render(spec.center.x, spec.center.y + 20);
                }
                else{
                    spec.image.render(spec.center.x, spec.center.y);
                }
            }
          }
          else{
            //characters with a sprite
            spec.sprite.render(spec.center.x, spec.center.y);
          }
      };

      that.intersects = function(other){
          var distance = Math.pow((spec.center.x - other.center.x), 2) + Math.pow((spec.center.y - other.center.y), 2)

          return (distance < Math.pow(spec.radius + other.radius, 2));
      }

      return that;
  };

  that.buildQuadTree = function(maxObjectsPerNode, objects, rootSize){
      var objectToQuad = 0;

      that.quadTree = QuadTree(maxObjectsPerNode, rootSize);
      for(objectToQuad = 0; objectToQuad < objects.length; objectToQuad++){
          that.quadTree.insert(objects[objectToQuad]);
      }
  };

  that.Key = function(spec, maze){
    //keep the keys from generating in walls
    if(spec.x % maze.cellWidth < 125) spec.x += 125;
    if(spec.x % maze.cellWidth > 480) spec.x -= 20;
    if(spec.y % maze.cellHeight < 200) spec.y += 200;
    if(spec.y % maze.cellHeight > 475) spec.y -= 75;
    let that = {
      //x: spec.x, y:spec.y, image:imgKey
      center: {x: spec.x, y:spec.y},
      image: imgKey,
      width: 75, height: 75,
      radius: 75/2,
      isDead: false,
      tag: "key"
    };

    //pick up distance
    that.update = function(elapsedTime, position){
      if(Math.abs(that.center.x - position.x) < 30 && Math.abs(that.center.y - position.y) < 50) that.isDead = true;
    };
    //basic render
    that.render = function(){
      graphics.drawKey(that);
    };

    that.intersects = function(other) {
  		var distance = Math.pow((that.center.x - other.center.x), 2) + Math.pow((that.center.y - other.center.y), 2);

  		return (distance < Math.pow(that.radius + other.radius, 2));
  	};

    return that;
  }

  that.loadKeys = function(array, maze){
    let key = [];
    for(let i = 0; i < array.length; i++){
      key.push(that.Key(array[i], maze));
    }
    return key;
  }

  return that;
}());

var math = (function(){
    let that = {};
    let usePrevious = false;
    let y2, x1, x2, z;

  that.randomLocation = function(width,height, size){
        let randLoc;
        do{
          randLoc = {x:Math.random()*size*width, y:Math.random()*size*height};
        }while(randLoc.x < size && randLoc.y < size) //keeps enemies out of starting block for fairness sake

          return randLoc;
      }

   that.gaussian = function(mean, stdDev){   //performs a gaussian distribution.
        if(usePrevious){               //I use this function to initialize how many enemies are generated.
            usePrevious = false;
            return mean + y2*stdDev;
        }

        usePrevious = true;

        do{
            x1 = 2*Math.random() - 1;
            x2 = 2*Math.random() - 1;
            z = (x1*x1) + (x2*x2);
        } while(z>=1);

        z = Math.sqrt((-2*Math.log(z)));
        y1 = x1*z;
        y2 = x2*z;
        return mean + y1*stdDev;
    }

    that.circleVector = function() {
  		var angle = Math.random() * 2 * Math.PI;
  		return {
  			x: Math.cos(angle),
  			y: Math.sin(angle)
  		};
  	}



  that.Circle = function(spec) {
  	'use strict';
  	var radiusSq = spec.radius * spec.radius,	// This gets used by various mathematical operations to avoid a sqrt
  		that = {
  			get center() { return spec.center; },
  			get radius() { return spec.radius; },
  			get radiusSq() { return radiusSq; }
  		};

  	//------------------------------------------------------------------
  	//
  	// Checks to see if the two circles intersect each other.  Returns
  	// true if they do, false otherwise.
  	//
  	//------------------------------------------------------------------
  	that.intersects = function(other) {
  		var distance = Math.pow((spec.center.x - other.center.x), 2) + Math.pow((spec.center.y - other.center.y), 2);

  		return (distance < Math.pow(spec.radius + other.radius, 2));
  	};


      return that;
  };



  that.objectInSquare = function(objectToAdd, square){
          var squareDiv2 = square.size/2,
              objectDistanceX,
              objectDistanceY,
              distanceX,
              distanceY,
              cornerDistanceSq;

          objectDistanceX = Math.abs(objectToAdd.center.x - square.center.x);
          if(objectDistanceX > (squareDiv2 + objectToAdd.radius)) {return false;}
          objectDistanceY = Math.abs(objectToAdd.center.y - square.center.y);
          if(objectDistanceY > (squareDiv2 + objectToAdd.radius)) {return false};

          if(objectDistanceX <= squareDiv2) { return true;}
          if(objectDistanceY <= squareDiv2) { return true;}

          distanceX = (objectDistanceX - squareDiv2);
          distanceY = (objectDistanceY - squareDiv2);
          distanceX *= distanceX;
          distanceY *= distanceY;

          cornerDistanceSq = distanceX + distanceY;
          return ( cornerDistanceSq <= objectToAdd.radiusSq);
      }

  //Creates a circle around a given square
      that.circleFromSquare = function(pointA, pointB, pointC){
          var circleSpec = {
              center: {},
              radius: 0
          },

          midPointAB = {
              x: (pointA.x + pointB.x)/2,
              y: (pointA.y + pointB.y)/2
          },

          midPointAC = {
              x:(pointA.x + pointC.x)/2,
              y:(pointA.y + pointC.y)/2
          },
              slopeAB = (pointB.y - pointA.y)/(pointB.x - pointA.x),
              slopeAC = (pointC.y - pointA.y)/(pointC.x - pointA.x);
          slopeAB = -(1/slopeAB);
          slopeAC = -(1/slopeAC);

          circleSpec.center.x = midPointAC.x;
          circleSpec.center.y = midPointAB.y;
          circleSpec.radius = Math.sqrt(Math.pow(circleSpec.center.x - pointA.x, 2) + Math.pow(circleSpec.center.y - pointA.y, 2));

          return math.Circle(circleSpec);
      }

  return that;
}());
