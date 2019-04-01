var memory = (function(){
  let that = {};

  let gameState = {};
  let previousGame = localStorage.getItem('gameState');
  if(previousGame !== null){
    gameState = JSON.parse(previousGame);
  }

  let controls = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    attack: 32
  };
  let previousControls = localStorage.getItem('controls');
  if(previousControls !== null){
    controls = JSON.parse(previousControls);
  }

  that.saveGame = function(spec){
    gameState = spec;
    localStorage['gameState'] = JSON.stringify(gameState);
  };

  that.resetGame = function(){
    gameState = {};
    localStorage['gameState'] = JSON.stringify(highScores);
  };

  that.loadGame = function(){
    return gameState;
  };

  that.getControls = function(){
    return controls;
  };

  that.setControls = function(value){
    controls = value;
    localStorage['controls'] = JSON.stringify(value);
  };

  return that;
}());
