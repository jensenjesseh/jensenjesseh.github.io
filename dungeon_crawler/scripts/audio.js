var audio = (function(){
 var that = {};

 that.initialize = function initialize() {
     function loadSound(source) {
        let sound = new Audio();
        sound.addEventListener('canplay', function(){
//            console.log(`${source} is ready to play`);
        });
        sound.addEventListener('play', function(){
//            console.log(`${source} started playing`);
        });
        sound.addEventListener('canplaythrough', function(){
//            console.log(`${source} can play through`);
        });
        sound.addEventListener('progress', function(){
//            console.log(`${source} progress in loading`);
        });
        sound.addEventListener('timeupdate', function(){
//            console.log(`${source} time update: ${this.currentTime}`);
        });
        sound.src = source;
        return sound;
 };

function loadAudio(){
    that.sounds = {};
    that.sounds['assets/sword-swipe'] = loadSound('assets/sword-swipe.wav');
    that.sounds['assets/grunt'] = loadSound('assets/grunt.wav');
    that.sounds['assets/main-menu-music'] = loadSound('assets/main-menu-music.mp3');
    that.sounds['assets/song-1'] = loadSound('assets/song-1.mp3');
    that.sounds['assets/slime-sound'] = loadSound('assets/slime-sound.wav');
    that.sounds['assets/bat-sound'] = loadSound('assets/bat-sound3.wav');
    that.sounds['assets/coin-sound'] = loadSound('assets/coin-sound.wav');

    that.sounds['assets/main-menu-music'].volume = 0.05;
    that.sounds['assets/song-1'].volume = 0.05;
    that.sounds['assets/sword-swipe'].volume = 0.05;
    that.sounds['assets/slime-sound'].volume = 0.50;
    that.sounds['assets/bat-sound'].volume = 0.07;
    that.sounds['assets/coin-sound'].volume = 0.50;
};

loadAudio();
};

that.playSound = function(soundToPlay){
    that.sounds[soundToPlay].play();
};

that.pauseSound = function(soundToPause){
    that.sounds[soundToPause].pause();
}

return that;
}());
