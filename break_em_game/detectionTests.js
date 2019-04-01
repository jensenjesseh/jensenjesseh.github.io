function brickCollide() {
    var rowBust = false;
    var colCount = 0;
    var brokenCount = 0;
    if ( y < 270){
            for(let col = 0; col<cols; col++){
                for(let row = 0; row<rows; row++){
                    colCount = 0;
                   
                    brokenCount = 0;
                    var toTest = blocks[row][col];
                    if(toTest.alive === true){
                        if((x+radius/2) > toTest.x && (x+radius/2) < toTest.x + 75 && (y-radius/2) > toTest.y && (y-radius/2) < toTest.y+20){
                            dy = -dy;
                            toTest.alive = false;
                            removedBricks += 1;
                            if(removedBricks === 4 || removedBricks === 12 || removedBricks === 36 || removedBricks === 62) {
                                dy = 1.25*dy;
                                dx = 1.25*dx;
                            }
                             while (colCount < cols){
                                if(blocks[row][colCount].alive === true){
                                      brokenCount += 1;
                                }
                                colCount += 1;
                             }
                             if ( brokenCount === 0){
                                 score += 25;
                            }
                            if (toTest.color === 'yellow'){
                                score = score + 1;
                            }
                            else if (toTest.color === 'orange'){
                                score = score + 2;
                            }
                            else if (toTest.color === 'blue'){
                                score = score + 3;
                            }
                            else if ( toTest.color === 'green'){
                                score = score + 5;
                            }
                            if (toTest.color === 'green' && toTest.y < 50){
                                paddle.width = 65;
                            }
                           particleStartTime = performance.now();
                           particleCenter = {x:x, y:y}
                           particleSpeed = {mean: 10,  stdev:4}
                           particleLife = {mean: 1, stdev:0.5 }

                           particles.push ( ParticleSystem( {
                                 image: 'leaves.png',
		                         center: particleCenter,
				                 speed: particleSpeed,
				                 lifetime: particleLife,
			                },
                           graphics))

                           livingParticles.push (particleStartTime);

                        }
                    }
                }
            }

    }
}

function wallCollide() {
        if((x+radius/2) > width || (x-radius/2) < 0){
               dx = -dx;
           } 
        if((y+radius/2) > height || (y-radius/2) < 0){
               dy = -dy;
           }
}

function paddleCollide(spec) {
    if((x+radius/2) > spec.x && (x+radius/2) < spec.x + spec.width && (y+radius/2) > spec.y && (y-radius/2) < spec.y+spec.height){
        dy = -dy;
        dx = 5*((x - (spec.x+(spec.width/2)))/ (spec.width/2));
    }
}

function keyDown(pressed){
    if(pressed.keyCode==39){
		right=true;
		}
	else if(pressed.keyCode==37){
		left=true;
		}
}

function keyUp(lifted){
    if(lifted.keyCode==39){
		right=false;
		}
	else if(lifted.keyCode==37){
		left=false;
		}
}

function testIfDead(spec){
    if (y > spec.y + 20 && paddleCount > 0){
        initializeBall();
        paddleCount -= 1;
        count = true;
    }
    
    initialTime = performance.now();
    if (paddleCount === 0){
        gameOver = true;
    }
}

function initializeBall(){
    x = xinit;
    y = yinit;
    dx = 4;
    dy = -4;
    paddle.x = xinit - 65;
    paddle.y = yinit + 1;
    paddle.width = 130;
}

function testWin(){
    let iterator = 0;
    for ( let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++){
            if(blocks[i][j].alive === true){
                iterator++;
            }
        }
    }

    if(iterator === 0){
        win = true;
    }

}