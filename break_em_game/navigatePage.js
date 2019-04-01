var Navigate = {
    screens: {}
};

Navigate.showScreen = function(id){
    var screen = 0;
    var active = null;

    active = document.getElementsByClassName('active');
    for (screen = 0; screen < active.length; screen++) {
        active[screen].classList.remove('active');
    }

   //Navigate.screens[id].run();

    document.getElementById(id).classList.add('active')
}

Navigate.initialize = function(){
    var screen = null;

    for (screen in this.screens) {
        this.screens[screen].initialize();
    }

    this.showScreen('main-menu');
    //game.initialize();
}

Navigate.screens['high-scores'] = function() {
    let that = {};
    that.initialize = function(){
        document.getElementById('Back').addEventListener('click', function() {
            Navigate.showScreen('main-menu');
        });
    };
    return that;
}();

/*Navigate.screens['new-game'] = function() {
     let that = {};
    that.initialize = function(){
        document.getElementById('back').addEventListener('click', function() {
            Navigate.showScreen('main-menu');
        });
    };
    return that;
}();*/

Navigate.screens['credits'] = function(){
     let that = {};
    that.initialize = function(){
        document.getElementById('goBack').addEventListener('click', function() {
            Navigate.showScreen('main-menu');
        });
    };
    return that;
}();

Navigate.screens['main-menu'] = function(){
    let that = {};
    that.initialize = function(){
        document.getElementById('new-game').addEventListener('click',
        function() {
            newGame();
            Navigate.showScreen('game');
        });
    document.getElementById('high-score').addEventListener('click', function(){
        Navigate.showScreen('high-scores');
    });

    document.getElementById('credit').addEventListener('click', function(){
        Navigate.showScreen('credits');
    });
 };
 return that;
}();

Navigate.screens['game'] = function(){
    let that = {};
    that.initialize = function(){
        document.getElementById('back').addEventListener('click', function() {
            cancelRequest = true;
            Navigate.showScreen('main-menu');
        });
    };
    return that;
}();
