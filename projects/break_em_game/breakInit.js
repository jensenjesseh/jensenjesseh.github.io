var blocks =[];
var ball;
var cols = 14;
var rows = 8;
var dx = 4;
var dy = -4;
var xinit;
var yinit;
var radius = 5;
let inputStage = {};
var lifted;
var left = false;
var right = false;
var x = 0;
var y = 0;
var paddle;
var width;
var height;
var paddleCount = 3;
var score = 0;
var highScores = [];
var removedBricks = 0;
var particleCenter = {x:null , y:null}
var particleSpeed = {mean:null, stdev:null}
var particleLife = {mean:null, stdev:null}
var livingParticles = [];
var context;
var count = false;
var countThree;
var countTwo;
var countOne;
var winText;
var initialTime;
var gameOverText;
var gameOver = false;
var highScores = [];
var win = false;

function createBlocks(){
    var layer;
    for ( let i = 0; i < rows; i++){
        blocks.push([]);
        for(let j = 0; j < cols; j++){
            if(i === 7 || i === 6){
                layer = 'yellow';
            }

            else if(i === 5 || i === 4){
                layer = 'orange';
            }

            else if(i === 3 || i === 2){
                layer = 'blue';
            }

             else if(i === 1 || i === 0){
                layer = 'green';
            }

            blocks[i].push({x:j, y:i, color:layer, alive:true, init:false})
        }
    }
}

function initialize(){

    document.getElementById('goBack').addEventListener(
        'click',
        function() {
            cancelNextRequest = true;
            Navigate.showScreen('main-menu');
        })
    var canvas = document.getElementById('canvas-main');
        context = canvas.getContext('2d');

    left = false;
    right = false;
    cols = 14;
    rows = 8;
    dx = 4;
    dy = -4;
    radius = 5;
    x = canvas.width/2;
    y = canvas.height - 30;
    xinit = x;
    yinit = y;
    paddle = {x:x - 65, y:y + 1, width:130, height:15};
    width = canvas.width;
    height = canvas.height;
    score = 0;
    removedBricks = 0;
    scalar = 1;
    nextSecond = 1;
    highScores = [0, 0, 0, 0, 0];
    cancelRequest = false;
    gameOver = false;
    paddleCount = 3;
    win = false;


    countThree = graphics.Text({
                text : '3',
                fill : 'rgba (145,99,56)',
                font : '50px Trebuchet MS',
                pos : { x: xinit - 25, y:265},
                rotation : 0
            });

    countTwo = graphics.Text({
                text : '2',
                fill : 'rgba (145,99,56)',
                font : '50px Trebuchet MS',
                pos : { x: xinit - 25, y:265},
                rotation : 0
            });

    countOne = graphics.Text({
                text : '1',
                fill : 'rgba (145,99,56)',
                font : '50px Trebuchet MS',
                pos : { x: xinit - 25, y:265},
                rotation : 0
            });

    gameOverText = graphics.Text({
                text : 'Game Over',
                fill : 'rgba (145,99,56)',
                font : '50px Trebuchet MS',
                pos : { x: xinit - 125, y:265},
                rotation : 0
            });

    winText = graphics.Text({
                text : 'You Win',
                fill : 'rgba (91,154,255)',
                font : '50px Trebuchet MS',
                pos : { x: xinit - 95, y:265},
                rotation : 0
            });

            
    var previousScores = localStorage.getItem('highScores');
        if(previousScores !== null){
            highScores = JSON.parse(previousScores);
        }
    renderScores();
    createBlocks();

    CanvasRenderingContext2D.prototype.clear = function() {
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.clearRect(0, 0, canvas.width, canvas.height);
        this.restore();
    };

    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);
    requestAnimationFrame(gameLoop);
}

function newGame(){
    for(let i = 0; i < rows; i++){
        blocks.pop()
    }

    initialize();

}