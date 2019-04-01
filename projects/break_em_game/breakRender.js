var graphics = (function() {
    //'use strict';

    function clear() {
        context.clear();
    }


    function drawPaddle(spec) {
        if(spec.x > 0 && left){
            spec.x -= 8;
        }
        if(spec.x + spec.width < width && right){
            spec.x += 8;
        }
        context.beginPath();
        context.rect(spec.x, spec.y, spec.width, spec.height);
        context.fillStyle = 'rgb(160, 194, 171)';
        context.fill();
        context.closePath();
    }

     function drawLives() {
        let currx = 20;
        let curry = 425;
        for( let i =0; i < paddleCount; i++){
        context.beginPath();
        context.rect(currx, curry-(20*i), 60, 7);
        context.fillStyle = 'rgb(160, 194, 171)';
        context.fill();
        context.closePath();
        }
    }

    function drawBricks(spec) {
       
       
        if(spec.alive === true) {
            if(spec.init === false){
                 var xpos = (spec.x*(75 + 10) + 30);
                 var ypos = (spec.y*(20 + 10) + 30);
                 spec.x = xpos;
                 spec.y = ypos;
                 spec.init = true;
            }
            else{
                var xpos = spec.x;
                var ypos = spec.y;
            }

        context.beginPath();
        context.rect(xpos, ypos, 75, 20);
         if(spec.color === 'yellow'){
             context.fillStyle = 'rgb(255, 255, 102)';
         }

         else if(spec.color === 'orange'){
            context.fillStyle = 'rgb(255, 153, 51)';
         }

         else if(spec.color === 'blue'){
             context.fillStyle = 'rgb(102, 153, 255)';
         }

         else if(spec.color === 'green'){
             context.fillStyle = 'rgb(153, 255, 153)';
         }

         context.fill()
         context.closePath();
         context.lineWidth = 2;
         context.strokeStyle = '#191970';
         context.stroke();
        }
    }

 function drawBall() {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI*2);
        context.fillStyle = '#4D5666';
        context.fill();
        context.closePath();

    }

    function drawRectangle(spec) {
		context.save();
		context.translate(spec.position.x + spec.width / 2, spec.position.y + spec.height / 2);
		context.rotate(spec.rotation);
		context.translate(-(spec.position.x + spec.width / 2), -(spec.position.y + spec.height / 2));
		
		context.fillStyle = spec.fill;
		context.fillRect(spec.position.x, spec.position.y, spec.width, spec.height);
		
		context.strokeStyle = spec.stroke;
		context.strokeRect(spec.position.x, spec.position.y, spec.width, spec.height);

		context.restore();
	}

    function drawImage(spec) {
		context.save();
		
		context.translate(spec.center.x, spec.center.y);
		context.rotate(spec.rotation);
		context.translate(-spec.center.x, -spec.center.y);
		
		context.drawImage(
			spec.image, 
			spec.center.x - spec.size/2, 
			spec.center.y - spec.size/2,
			spec.size, spec.size);
		
		context.restore();
	}

    function Text(spec) {
        var that = {};

        that.updateRotation = function(angle) {
            spec.rotation += angle;
        };

    //that.measureTextHeight = function(spec){
    function measureTextHeight(spec){
        context.save();

        context.font = spec.font;
        context.fillStyle = spec.fill;
        context.strokeStyle = spec.stroke;

        var height = context.measureText('m').width;

        context.restore();

        return height;
    }

    function measureTextWidth(spec) {
    //that.measureTextWidth = function(spec){
        context.save();

        context.font = spec.font;
        context.fillStyle = spec.fill;
        context.strokeStyle = spec.stroke;

        var width = context.measureText(spec.text).width;

        context.restore();

        return width;
    }

    that.draw = function() {
        context.save();

        context.font = spec.font;
        context.fillStyle = spec.fill;
        context.strokeStyle = spec.stroke;
        context.textBaseline = 'top';

        context.translate(spec.pos.x + that.width/2, spec.pos.y + that.height/2);
        context.rotate(spec.rotation);
        context.translate(-(spec.pos.x + that.width/2), -(spec.pos.y + that.height/2));

        context.fillText(spec.text, spec.pos.x, spec.pos.y);
        context.strokeText(spec.text, spec.pos.x, spec.pos.y);

        context.restore();
    };

    that.height = measureTextHeight(spec);
    that.width = measureTextWidth(spec);
    that.pos = spec.pos;


    return that;
    }

    return {
        clear : clear,
        drawBricks : drawBricks,
        drawBall : drawBall,
        drawPaddle : drawPaddle,
        drawLives : drawLives,
        drawImage : drawImage,
        drawRectangle : drawRectangle,
        Text : Text
    };

}());

var particles = [];