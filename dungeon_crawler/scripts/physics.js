'use strict'

var physics = (function(){

    var that = {};

    //including my own input
    var myInput = input.Keyboard();

    var Engine = null,
        Render = null,
        World = null,
        Bodies = null,
        Events = null,
        engine = null;

    var defaultCategory = 0x0001;
    var characterCategory = 0x0002;
    var enemyCategory = 0x0003;

    //call first
    that.initialize = function(){

        //linking variables to Matter.js
        Engine = Matter.Engine;
        Render = Matter.Render;
        World = Matter.World;
        Bodies = Matter.Bodies;
        Events = Matter.Events;

        //creating the main engine to run all of our physics
//CHANGE BACK
        // engine = Engine.create({
        //     render: {
        //         element : document.body,
        //         canvas: graphics.returnCanvas(),   //where to render to
        //         options: {
        //             width: 1000,
        //             height: 1000,
        //             wireframes: false,
        //         }
        //     }
        // });

        // use this if you dont want to render
        engine = Engine.create({
             render: false
         });


        //sets the gravity to 0
        //we do this because its top down,
        //there should be no gravity in any direction
        engine.world.gravity.y = 0;

        // run the engine
        Engine.run(engine);

        // run the renderer
        //comment out for original game
        //Render.run(engine.render); //<----------CHANGE BACK

    };

    //allows the creation of a simple body
    that.createRectangleBody = function(x, y, w, h){
        var box = Bodies.rectangle(x, y, w, h);
        return box;
    };

    //allow the creation of a circle Body
    that.createCircleBody = function(x, y, r){
        var circle = Bodies.circle(x, y, r);
        return circle;
    };

    //creates a sensor body thats also a static body
    that.createSensorBody = function(x, y, w, h) {
        var collider = Bodies.rectangle(x,y,w,h, {
            isSensor: true,
            isStatic: true
        });

        World.add(engine.world, collider);
        return collider;
    };

    //allows the event if the character is hit by the enemy
    //allows the character to take damage now
    that.enemyDamageEvent = function(character, enemies){

        Events.on(engine, 'collisionStart', function(event){
            var pairs = event.pairs;

            for(var i = 0, j = pairs.length; i != j; i++){
                var pair = pairs[i];

                //if bodyA is the character and if the character isnt attacking
                if(pair.bodyA === character.returnCharacterBody() && character.returnAttackState() === false){
                    //bodyB is the enemy
                    if(enemyMatchingId(enemies, pair.bodyB.id) !== undefined){
                        character.setHit();

                        if(enemyMatchingId(enemies, pair.bodyB.id).returnDirection() === 'right'){
                            Matter.Body.setPosition(pair.bodyB, {x: pair.bodyB.position.x - 30, y: pair.bodyB.position.y});
                            Matter.Body.setVelocity(pair.bodyB, { x: 7, y: 3 });
                        }
                        if(enemyMatchingId(enemies, pair.bodyB.id).returnDirection() === 'left'){
                            Matter.Body.setPosition(pair.bodyB, {x: pair.bodyB.position.x + 30, y: pair.bodyB.position.y});
                            Matter.Body.setVelocity(pair.bodyB, { x: 7, y: 3 });
                        }
                        if(enemyMatchingId(enemies, pair.bodyB.id).returnDirection() === 'up'){
                            Matter.Body.setPosition(pair.bodyB, {x: pair.bodyB.position.x, y: pair.bodyB.position.y + 30});
                            Matter.Body.setVelocity(pair.bodyB, { x: 3, y: 7 });
                        }
                        if(enemyMatchingId(enemies, pair.bodyB.id).returnDirection() === 'down'){
                            Matter.Body.setPosition(pair.bodyB, {x: pair.bodyB.position.x, y: pair.bodyB.position.y - 30});
                            Matter.Body.setVelocity(pair.bodyB, { x: 3, y: 7 });
                        }
                    }
                    //character.setFalseHit();
                    //console.log('hit');
                }
                //if bodyB is the character and if the character isnt attacking
                else if(pair.bodyB === character.returnCharacterBody() && character.returnAttackState() === false){
                    //bodyA is the enemy
                    if(enemyMatchingId(enemies, pair.bodyA.id) !== undefined){
                        character.setHit();

                        if(enemyMatchingId(enemies, pair.bodyA.id).returnDirection() === 'right'){
                            Matter.Body.setPosition(pair.bodyA, {x: pair.bodyA.position.x - 30, y: pair.bodyA.position.y});
                            Matter.Body.setVelocity(pair.bodyA, { x: 7, y: 3 });
                        }
                        if(enemyMatchingId(enemies, pair.bodyA.id).returnDirection() === 'left'){
                            Matter.Body.setPosition(pair.bodyA, {x: pair.bodyA.position.x + 30, y: pair.bodyA.position.y});
                            Matter.Body.setVelocity(pair.bodyA, { x: 7, y: 3 });
                        }
                        if(enemyMatchingId(enemies, pair.bodyA.id).returnDirection() === 'up'){
                            Matter.Body.setPosition(pair.bodyA, {x: pair.bodyA.position.x, y: pair.bodyA.position.y + 30});
                            Matter.Body.setVelocity(pair.bodyA, { x: 3, y: 7 });
                        }
                        if(enemyMatchingId(enemies, pair.bodyA.id).returnDirection() === 'down'){
                            Matter.Body.setPosition(pair.bodyA, {x: pair.bodyA.position.x, y: pair.bodyA.position.y - 30});
                            Matter.Body.setVelocity(pair.bodyA, { x: 3, y: 7 });
                        }
                    }
                    //character.setFalseHit();
                    //console.log('hit');
                }
            }

        });

    };

    //at the start of a collision between two objects
    that.eventSensorStart = function(character, enemies){

        Events.on(engine, 'collisionStart', function(event){
            var pairs = event.pairs;

            for(var i = 0, j = pairs.length; i != j; i++){
                var pair = pairs[i];

                if(pair.bodyA === character.returnSensor()) {
                    //pair.bodyA.isStatic = false;
                    //console.log(enemies[pair.bodyB.id].returnHealth());
                    //console.log(pair.bodyB.id);
                    // console.log('hit start');
                }
                else if(pair.bodyB === character.returnSensor()) {
                    //pair.bodyB.isStatic = false;
                    //console.log(enemies[pair.bodyA.id].returnHealth());
                    //console.log(pair.bodyA.id);
                    // console.log('hit start');
                }
            }
        });

    };

    //while there is a collision between two objects that is active
    that.eventSensorActive = function(character, enemies){

        Events.on(engine, 'collisionActive', function(event){
            var pairs = event.pairs;

            for(var i = 0, j = pairs.length; i != j; i++){
                var pair = pairs[i];

                if(pair.bodyA === character.returnSensor()) {
                    if(character.returnDirection() === 'down' && character.returnAttackState()){
                        Matter.Body.setPosition(pair.bodyB, {x: pair.bodyB.position.x, y: pair.bodyB.position.y + 50});
                        Matter.Body.setVelocity(pair.bodyB, { x: 0, y: 10 });
                        // enemyMatchingId(enemies, pair.bodyB.id).damaged();
                        //console.log(enemies[pair.bodyB.id].returnHealth());
                        //console.log('hit active');
                        // if(enemies[pair.bodyB.id].returnHealth() <= 1){
                        //     physics.removeFromWorld(enemies[pair.bodyB.id].returnCharacterBody());
                        //     enemies.splice(pair.bodyB.id, 1);
                        //     pairs.splice(i, 1);
                        // }
                    }
                    if(character.returnDirection() === 'up' && character.returnAttackState()){
                        Matter.Body.setPosition(pair.bodyB, {x: pair.bodyB.position.x, y: pair.bodyB.position.y - 50});
                        Matter.Body.setVelocity(pair.bodyB, { x: 0, y: -10 });
                        // enemyMatchingId(enemies, pair.bodyB.id).damaged();
                        //console.log(enemies[pair.bodyB.id].returnHealth());
                        //console.log('hit active');
                        // if(enemies[pair.bodyB.id].returnHealth() <= 1){
                        //     physics.removeFromWorld(enemies[pair.bodyB.id].returnCharacterBody());
                        //     enemies.splice(pair.bodyB.id, 1);
                        //     pairs.splice(i, 1);
                        // }
                    }
                    if(character.returnDirection() === 'right' && character.returnAttackState()){
                        Matter.Body.setPosition(pair.bodyB, {x: pair.bodyB.position.x + 50, y: pair.bodyB.position.y});
                        Matter.Body.setVelocity(pair.bodyB, { x: 10, y: 0 });
                        // enemyMatchingId(enemies, pair.bodyB.id).damaged();
                        //console.log(enemies[pair.bodyB.id].returnHealth());
                        //console.log('hit active');
                        // if(enemies[pair.bodyB.id].returnHealth() <= 1){
                        //     physics.removeFromWorld(enemies[pair.bodyB.id].returnCharacterBody());
                        //     enemies.splice(pair.bodyB.id, 1);
                        //     pairs.splice(i, 1);
                        // }
                    }
                    if(character.returnDirection() === 'left' && character.returnAttackState()){
                        Matter.Body.setPosition(pair.bodyB, {x: pair.bodyB.position.x - 50, y: pair.bodyB.position.y});
                        Matter.Body.setVelocity(pair.bodyB, { x: -10, y: 0 });
                        // enemyMatchingId(enemies, pair.bodyB.id).damaged();
                        //console.log(enemies[pair.bodyB.id].returnHealth());
                        //console.log('hit active');
                        // if(enemies[pair.bodyB.id].returnHealth() <= 1){
                        //     physics.removeFromWorld(enemies[pair.bodyB.id].returnCharacterBody());
                        //     enemies.splice(pair.bodyB.id, 1);
                        //     pairs.splice(i, 1);
                        // }
                    }

                }
                else if(pair.bodyB === character.returnSensor()) {
                    //pair.bodyB.isStatic = false;
                    // Matter.Body.applyForce(pair.bodyA, pair.bodyA.position, {x: 100 * pair.bodyA.mass, y:0});
                    if(character.returnDirection() === 'down' && character.returnAttackState()){
                        Matter.Body.setVelocity(pair.bodyA, { x: 0, y: 10});
                        Matter.Body.setPosition(pair.bodyA, {x: pair.bodyA.position.x, y: pair.bodyA.position.y + 50});
                        // enemyMatchingId(enemies, pair.bodyA.id).damaged();
                        //console.log(enemies[pair.bodyA.id].returnHealth());
                        //console.log('hit active');
                        // if(enemies[pair.bodyA.id].returnHealth() <= 1){
                        //     physics.removeFromWorld(enemies[pair.bodyA.id].returnCharacterBody());
                        //     enemies.splice(pair.bodyA.id, 1);
                        //     pairs.splice(i, 1);
                        // }
                    }
                    if(character.returnDirection() === 'up' && character.returnAttackState()){
                        Matter.Body.setVelocity(pair.bodyA, { x: 0, y: -10});
                        Matter.Body.setPosition(pair.bodyA, {x: pair.bodyA.position.x, y: pair.bodyA.position.y - 50});
                        // enemyMatchingId(enemies, pair.bodyA.id).damaged();
                        //console.log(enemies[pair.bodyA.id].returnHealth());
                        //console.log('hit active');
                        // if(enemies[pair.bodyA.id].returnHealth() <= 1){
                        //     physics.removeFromWorld(enemies[pair.bodyA.id].returnCharacterBody());
                        //     enemies.splice(pair.bodyA.id, 1);
                        //     pairs.splice(i, 1);
                        // }
                    }
                    if(character.returnDirection() === 'right' && character.returnAttackState()){
                        Matter.Body.setVelocity(pair.bodyA, { x: 10, y: 0});
                        Matter.Body.setPosition(pair.bodyA, {x: pair.bodyA.position.x + 50, y: pair.bodyA.position.y});
                        // enemyMatchingId(enemies, pair.bodyA.id).damaged();
                        //console.log(enemies[pair.bodyA.id].returnHealth());
                        //console.log('hit active');
                        // if(enemies[pair.bodyA.id].returnHealth() <= 1){
                        //     physics.removeFromWorld(enemies[pair.bodyA.id].returnCharacterBody());
                        //     enemies.splice(pair.bodyA.id, 1);
                        //     pairs.splice(i, 1);
                        // }
                    }
                    if(character.returnDirection() === 'left' && character.returnAttackState()){
                        Matter.Body.setVelocity(pair.bodyA, { x: -10, y: 0});
                        Matter.Body.setPosition(pair.bodyA, {x: pair.bodyA.position.x - 50, y: pair.bodyA.position.y});
                        //enemyMatchingId(enemies, pair.bodyA.id).damaged();
                        //console.log(enemies[pair.bodyA.id].returnHealth());
                        //console.log('hit active');
                        // if(enemies[pair.bodyA.id].returnHealth() <= 1){
                        //     physics.removeFromWorld(enemies[pair.bodyA.id].returnCharacterBody());
                        //     enemies.splice(pair.bodyA.id, 1);
                        //     pairs.splice(i, 1);
                        // }
                    }
                }
            }
        });

    };

    //at the end of a collsion between two objects
    that.eventSensorEnd = function(character, enemies){

        Events.on(engine, 'collisionEnd', function(event){
            var pairs = event.pairs;

            for(var i = 0, j = pairs.length; i != j; i++){
                var pair = pairs[i];

                if(pair.bodyA === character.returnSensor()) {
                    if(character.returnDirection() === 'down' && character.returnAttackState()){
                        
                        if(pair.bodyB.label !== "pot"){
                            enemyMatchingId(enemies, pair.bodyB.id).damaged();
                        }
                        
                    }
                    if(character.returnDirection() === 'up' && character.returnAttackState()){
                        
                        if(pair.bodyB.label !== "pot"){
                            enemyMatchingId(enemies, pair.bodyB.id).damaged();
                        }                        
                    }
                    if(character.returnDirection() === 'right' && character.returnAttackState()){
                        
                        if(pair.bodyB.label !== "pot"){
                            enemyMatchingId(enemies, pair.bodyB.id).damaged();
                        }
                        
                    }
                    if(character.returnDirection() === 'left' && character.returnAttackState()){
                        
                        if(pair.bodyB.label !== "pot"){
                            enemyMatchingId(enemies, pair.bodyB.id).damaged();
                        }
                        
                    }

                }
                else if(pair.bodyB === character.returnSensor()) {
                    //pair.bodyB.isStatic = false;
                    // Matter.Body.applyForce(pair.bodyA, pair.bodyA.position, {x: 100 * pair.bodyA.mass, y:0});
                    if(character.returnDirection() === 'down' && character.returnAttackState()){
                        
                        if(pair.bodyA.label !== "pot"){
                            enemyMatchingId(enemies, pair.bodyA.id).damaged();
                        }
                        
                    }
                    if(character.returnDirection() === 'up' && character.returnAttackState()){
                        
                        if(pair.bodyA.label !== "pot"){
                            enemyMatchingId(enemies, pair.bodyA.id).damaged();
                        }
                        
                    }
                    if(character.returnDirection() === 'right' && character.returnAttackState()){
                        
                        if(pair.bodyA.label !== "pot"){
                            enemyMatchingId(enemies, pair.bodyA.id).damaged();
                        }
                        
                    }
                    if(character.returnDirection() === 'left' && character.returnAttackState()){
                        
                        if(pair.bodyA.label !== "pot"){
                            enemyMatchingId(enemies, pair.bodyA.id).damaged();
                        }
                        
                    }
                }
            }
        });

    };

    //find matching enemy
    function enemyMatchingId(enemies, id) {
      for(let i = 0; i < enemies.length; i++){
        if(enemies[i].body.id === id){
          return enemies[i];
        }
      }
      return undefined;
    }

    //find matching pots
    function matchingPotId(pots, id){
        for(let i = 0; i < pots.length; i++){
            if(pots[i].returnBody().id === id){
                return pots[i];
            }
        }
        return undefined;
    }


    //collision between character and pot
    that.potCollisionStart = function(character, pots, totCoins){

        Events.on(engine, 'collisionStart', function(event){
            var pairs = event.pairs;

            for(var i = 0, j = pairs.length; i != j; i++){
                var pair = pairs[i];

                if(pair.bodyA === character.returnSensor() && character.returnAttackState() && pair.bodyB.label === "pot") {
                    matchingPotId(pots, pair.bodyB.id).break(true);
                    console.log('You hit a pot');
                    console.log(matchingPotId(pots, pair.bodyB.id).isBroken());
                }
                else if(pair.bodyB === character.returnSensor() && character.returnAttackState() && pair.bodyA.label === "pot") {
                    matchingPotId(pots, pair.bodyA.id).break(true);
                    console.log('You hit a pot');
                    console.log(matchingPotId(pots, pair.bodyA.id).isBroken());
                }
            }
        });

    };



    //directly set the position of a body
    that.setPosition = function(myBody, x, y){
        Matter.Body.setPosition(myBody, {x: x, y: y});
    };

    that.rotateBody = function(myBody, degrees){
        Matter.Body.rotate(myBody, degrees);
    };

    //a functional call to add to the world
    that.addToWorld = function(myBody){
        World.add(engine.world, myBody);
    };

    //a functional call to remove a body from the world
    that.removeFromWorld = function(myBody){
        Matter.World.remove(engine.world, myBody);
    };

    //allows you to set the incoming body as static or not
    //static = true means it WILL NOT move
    //static = false means it WILL move
    that.setStaticBody = function(myBody, bool){
        myBody.isStatic = bool;
    };

    //apply custom fricitonAir
    that.setFrictionAir = function(unit, myBody){
        myBody.frictionAir = unit;
    };

    //apply custom bounce
    that.setRestitution = function(unit, myBody){
        myBody.restitution = unit;
    };

    //apply custom speed. I found that this function doesnt really work how you think it would... =D
    that.setSpeed = function(unit, myBody){
        myBody.speed = unit;
    };

    //apply manual velocity to body, used in parallel with setPosition
    //velocity must be a vector = {x: , y: }
    that.setVelocity = function(myBody, velocity){
        Matter.Body.setVelocity(myBody, velocity);
    };

    //add collision filtering
    that.addCollisionFilter = function(myBody, myCategory){
        myBody.collisionFilter.category = myCategory;
    };

    //ad the collision mask
    that.addCollisionMask = function(myBody, myMask){
        myBody.collisionFilter.mask = myMask;
    };

    //allows manually entry of a bodies unique id
    that.setID = function(myBody, value){
        myBody.id = value;
    };

    //returns the unique id of the body
    that.returnID = function(myBody){
        return myBody.id;
    };

    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    that.addMazeBodies = function (grid, pots){
        var count = 500;
        var percent = null;
        for(let col = 0; col < grid.length; col++){
          for(let row = 0; row < grid[0].length; row++){
            let cell = grid[col][row];
            let cellLeft = cell.x * grid.cellWidth;
            let cellTop = cell.y * grid.cellHeight;

            if(cell.edges.n !== false){
              cell.edges.n = physics.createRectangleBody((cellLeft + (grid.cellWidth)/2), cellTop + 35, grid.cellWidth, 70);
              physics.setID(cell.edges.n, count);
              physics.setStaticBody(cell.edges.n , true);
              physics.addToWorld(cell.edges.n);

              //create a pot in a random location next to wall
              percent = getRandomArbitrary(0, 10);
              if(percent === 0 || percent === 0){
              //if(percent > -1){
                var potImage = new Image();
                potImage.src = "assets/pot.png";

                pots.push(Pot({
                    img: potImage,
                    body: physics.createCircleBody((cellLeft + (grid.cellWidth)/2), cellTop + 130, 50),
                    position: {
                        x: (cellLeft + (grid.cellWidth)/2),
                        y: cellTop + 130
                    },
                    dimensions: {
                        width: 128,
                        height: 128
                    },
                    id: null
                }));
              }
            }

            if(cell.edges.w !== false){
              cell.edges.w = physics.createRectangleBody(cellLeft + 35, (cellTop + (grid.cellHeight)/2), 70, grid.cellHeight);
              physics.setID(cell.edges.w, count);
              physics.setStaticBody(cell.edges.w , true);
              physics.addToWorld(cell.edges.w);

              //create a pot in a random location next to wall
              percent = getRandomArbitrary(0, 10);
              if(percent === 0 || percent === 1){
                var potImage = new Image();
                potImage.src = "assets/pot.png";

                pots.push(Pot({
                    img: potImage,
                    body: physics.createCircleBody(cellLeft + 130, (cellTop + (grid.cellHeight)/2), 50),
                    position: {
                        x: cellLeft + 130,
                        y: (cellTop + (grid.cellHeight)/2)
                    },
                    dimensions: {
                        width: 128,
                        height: 128
                    },
                    id: null,
                    broken: false
                }));
              }
            }
            count++;
          }
        }

        for(let k = 0; k < pots.length; k++){
            pots[k].returnBody().frictionAir = 0.75;
            pots[k].returnBody().id = 2000 + k;
            pots[k].setId();
            pots[k].returnBody().label = "pot";
            World.add(engine.world, pots[k].returnBody());
        }


        let southWall = physics.createRectangleBody(0, grid.height * grid.cellHeight + 35, grid.width * grid.cellWidth * 2, 70);
        physics.setID(southWall, count);
        physics.setStaticBody(southWall, true);
        physics.addToWorld(southWall);

        count++;

        let northWall = physics.createRectangleBody(grid.width * grid.cellWidth + 35, 0, 70, grid.height * grid.cellHeight * 2);
        physics.setID(northWall, count);
        physics.setStaticBody(northWall, true);
        physics.addToWorld(northWall);
    };


    return that;

}());
