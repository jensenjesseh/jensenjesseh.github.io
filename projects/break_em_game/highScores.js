
function addScore(high){
    let counter = 0;
    if(highScores[0] === null){
        highScores.push(high);
    }
    for(let i = 0; i < 5; i++){
        if(high < highScores[i]){
            counter++;
        }
    }

        highScores.splice(counter, 0, high);
    if(highScores[5] !== null){
        deleteScore(highScores[highScores.length]);
        }
        localStorage['highScores'] = JSON.stringify(highScores);
}

function deleteScore(value){
    delete highScores[value];
    localStorage['highScores'] = JSON.stringify(highScores)
}

function reset(){
    highScores = {};
    localStorage['highScores'] = JSON.stringify(highScores)
}

function renderScores(){
    for(let i = 0; i < 5; i++){
        if(highScores[i] === null){
            highScores[i] = 0;
        }
    }
    document.getElementById('First').innerHTML = highScores[0];
    document.getElementById('Second').innerHTML = highScores[1];
    document.getElementById('Third').innerHTML = highScores[2];
    document.getElementById('Fourth').innerHTML = highScores[3];
    document.getElementById('Fifth').innerHTML = highScores[4];
}

