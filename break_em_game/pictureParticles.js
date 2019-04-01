function ParticleSystem(spec, graphics) {
	'use strict';
	var that = {},
		nextPart = 1,	
		particles = {},	
        imageSrc = spec.image;

        spec.image = new Image();
        spec.image.onload = function() {
            that.render = function(){
                var value,
                    particle;

                for (value in particles){
                    if(particles.hasOwnProperty(value)){
                        particle = particles[value];
                        graphics.drawImage(particle);
                    }
                }
            };
        };
        spec.image.src = imageSrc;

	that.create = function() {
		var p = {

                image: spec.image,
                size: Random.nextGaussian(30, 8),
                center: {x:spec.center.x, y:spec.center.y},
                direction: Random.nextPosCircleVector(),
				speed: Random.nextGaussian(spec.speed.mean, spec.speed.stdev), 
				rotation: 0,
				lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev),	
				alive: 0
			};

            p.size = Math.max(1, p.size);
            p.lifetime = Math.max(0.01, p.lifetime);
	        particles[nextPart++] = p;
	};
	
	that.update = function(elapsedTime) {
		var removeMe = [],
            value,
			particle;

		elapsedTime = elapsedTime / 1000;

        for(value in particles) {
            if(particles.hasOwnProperty(value)){
                particle = particles[value];

			particle.alive += elapsedTime;
			

			particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
			particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
			

			particle.rotation += particle.speed / 500;

			if (particle.alive > particle.lifetime) {
				removeMe.push(value);
			    }
            }
        }

		for (particle = 0; particle < removeMe.length; particle++) {
			delete particles[removeMe[particle]];
		}
		removeMe.length = 0;
	};
	

	that.render = function() {
		/*Object.getOwnPropertyNames(particles).forEach( function(value, index, array) {
			var particle = particles[value];
			graphics.drawRectangle(particle);
		});*/
	};
	
	return that;
}
