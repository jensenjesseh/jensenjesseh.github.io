var AnimatedSprite = function(spec){
  that = {
    get spriteSheet() { return spec.spriteSheet; },
    get pixelWidth() { return spec.pixelWidth; },
    get pixelHeight() { return spec.spriteSheet.height; },
    get sprite() { return spec.sprite; }
  }

  //placeholder
  that.render = function(x, y){graphics.drawSprite(spec, x, y);};

  spec.sprite = Math.floor(Math.random() * (spec.spriteCount - 1));
  spec.elapsedTime = 0;

  //draw sprites
  that.render = function(x, y){
    graphics.drawSprite(spec, x, y);
  };

  that.update = function(elapsedTime){
    if(elapsedTime < 2000){
      spec.elapsedTime += elapsedTime;
    }

    if(spec.elapsedTime >= spec.spriteTime[spec.sprite]){
      spec.elapsedTime -= spec.spriteTime[spec.sprite];
      spec.sprite += 1;
      spec.sprite = spec.sprite % spec.spriteCount;
    }
  };

  that.returnSprite = function(){
    return spec.sprite;
  };

  return that;
}
