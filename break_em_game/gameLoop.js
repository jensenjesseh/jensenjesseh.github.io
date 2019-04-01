var cancelRequest = false;
var timeLast = null;
var particleTime;
var totalParticleTime = 500;
var particleStartTime;

var cancelRequest = false;
function gameLoop() {
    var timeNow = performance.now();
    var duration = (timeNow - timeLast);

    collectInput(duration);

    update (duration);

    render();
    timeLast = timeNow;;

    if(!cancelRequest) {
        requestAnimationFrame(gameLoop);
    }
};

function update(duration){
    if(count !== true && win !== true){
        
    x = x + dx;
    y = y + dy;
    brickCollide();
    wallCollide();
    paddleCollide(paddle);
    testIfDead(paddle);
    testWin();
    particleTime = performance.now();

        for(let i = 0; i< particles.length; i++){
            particles[i].update(duration);
            
            if(particleTime - livingParticles[i] < totalParticleTime){
                for (particle = 0; particle < 1; particle++) {
                    particles[i].create();
                }
            }
        }
    }

}



function render() {
    graphics.clear();
    let timeNow = performance.now();
            if(count === true && gameOver !== true){
            if(timeNow - initialTime < 1000){
                countThree.draw();
            }
            else if(timeNow - initialTime > 1000 && timeNow - initialTime < 2000){
                countTwo.draw();
            }
            else if(timeNow - initialTime > 2000 && timeNow - initialTime < 3000){
                countOne.draw();
            }
            else{
                count = false;
            }
    }
    else if(win === true){
        winText.draw();
    }
    if (gameOver === true){
        gameOverText.draw();
        addScore(score);
        cancelRequest = true;
    }
    /*context.strokeStyle = '#191970';
    context.lineWidth = 2;
*/
    for(let row = 0;  row < rows ; row++){
        for(let col = 0; col < cols; col++) {
            graphics.drawBricks(blocks[row][col]);
        }
    }
   //context.stroke();
   graphics.drawBall();
   graphics.drawPaddle(paddle);
   graphics.drawLives();
   renderScores();

for(let i = 0; i<particles.length; i++){
    particles[i].render()
}

   document.getElementById('score').innerHTML = score;

}



function collectInput(duration) {
    

}

function run() {

    cancelRequest = false;
    requestAnimationFrame(gameLoop);
}
