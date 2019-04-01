function addScore(newScore){
    var score = newScore;

    $.ajax({
        url: 'http://localhost:3000/v1/scores?score=' + score,
        type: 'POST',
        error: function() {alert('POST failed');},
        success:function(){
            showScores();
        }
    });
}


function showScores(){
    $.ajax({
        url: 'http://localhost:3000/v1/scores',
        cache: false,
        type: 'GET',
        error: function() {alert('GET failed'); },
        success: function(data) {
            var list = $("#id-scores"),
            value,
            scoreValue;
            var displayScores = [];
            var maxScores = 10;

            list.empty();
            for(value = 0; value < data.length; value++){
                scoreValue = Number(data[value].score);
                for(let i = 0; i <= displayScores.length && i < maxScores; i++){
                    if(displayScores[i] === undefined){
                        displayScores[i] = scoreValue;
                        break;
                    }
                    if(scoreValue > displayScores[i]){
                        let temp = displayScores[i];
                        displayScores[i] = scoreValue;
                        scoreValue = temp;
                    }
                }
            }
            for(let i = 0; i < displayScores.length; i++){
                list.append($('<li>', { text : i + 1 + ".   " + displayScores[i]}));
            }
        }
    });
}