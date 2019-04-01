function ParticleSystem(spec){
  'use strict';
  let that = {};
  let particles = {};
  let nextId = 0;

  that.createParticles = function(num, x, y, distribution){
    let partX, partY;
    for(let i = 0; i < num; i++){
      partX = math.gaussian(x, distribution);
      partY = math.gaussian(y, distribution);
      particles[nextId++] = Particle({
          x: partX, y: partY,
          size: spec.size,
          speed: spec.speed,
          lifetime: spec.lifetime
      });
    }
    if(nextId > 100) nextId = 0;
  };

  that.update = function(elapsedTime){
    //update particles
    for(let value in particles){
      if(particles.hasOwnProperty(value)){
        particles[value].update(elapsedTime);
        if (particles[value].alive > particles[value].lifetime){
            delete particles[value];
        }
      }
    }
  };

  that.render = function(){
    for(let value in particles){
      if(particles.hasOwnProperty(value)){
        particles[value].render();
      }
    }
  }; //filler function for before the image loads

  let image = new Image();
  image.onload = function() {
    //replace filler function
    that.render = function(){
      for(let value in particles){
        if(particles.hasOwnProperty(value)){
          particles[value].render();
        }
      }
    };
  };
  image.src = spec.image;

  function Particle(spec){
    let that = {
      x: spec.x,
      y: spec.y,
      size: math.gaussian(spec.size,5),
      direction: math.circleVector(),
      speed: math.gaussian(spec.speed,4),
      alive: 0,
      lifetime: math.gaussian(spec.lifetime.avg, spec.lifetime.dist),
      grow: 50
    };

    that.lifetime = Math.max(0, that.lifetime);
    that.size = Math.max(1, that.size);

    that.render = function(){
      graphics.drawParticle(image, that.x, that.y, that.size);
    };

    that.update = function(elapsedTime){
      elapsedTime = elapsedTime / 1000;
      that.alive += elapsedTime;
      that.x += elapsedTime * that.speed * that.direction.x;
      that.y += elapsedTime * that.speed * that.direction.y;
      that.size += elapsedTime * that.grow;
    };

    return that;
  };

  return that;
};
