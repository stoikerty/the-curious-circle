// create world-grid array
// add requestanimationframe
// make direction buttons work

// ---

// bind events, save elements for later use
document.querySelector('.instructions .forward').addEventListener("click", function(e){
    e.stopPropagation();

    instructions.forward();
});
document.querySelector('.instructions .left').addEventListener("click", function(e){
    e.stopPropagation();

    instructions.left();
});
document.querySelector('.instructions .right').addEventListener("click", function(e){
    e.stopPropagation();

    instructions.right();
});

numpadEl = document.querySelector('.numpad');

numpadButton = {};
numpadButton.x = numpadEl.querySelector('.position .x');
numpadButton.y = numpadEl.querySelector('.position .y');
numpadButton.orientation = numpadEl.querySelector('.position .orientation');
numpadButton.x.addEventListener("click", function(e){
    e.stopPropagation();

    position.toggleX();
});
numpadButton.y.addEventListener("click", function(e){
    e.stopPropagation();

    position.toggleY();
});
numpadButton.orientation.addEventListener("click", function(e){
    e.stopPropagation();

    position.toggleOrientation();
});

var numpadButtons = document.querySelectorAll('.numpad .numbers .button');
for (var i=0; i<numpadButtons.length; i++){
    numpadButtons[i].addEventListener("click", function(e){
        e.stopPropagation();
        var confirm = e.target.classList.contains('confirm');

        numbers.enterValue(
            e.target.getAttribute('data-number'),
            e.target.getAttribute('data-orientation'),
            confirm
        );
    });
}

pointer = document.querySelector('.robot .pointer');

// retrieve size of one grid-cell & the entire world-grid
gridSize = document.querySelector('.robot').offsetWidth;
worldSize = Math.floor(document.querySelector('.world-grid').offsetWidth / gridSize);

// handle robot instructions
instructions = {};
instructions.forward = function(){
}
instructions.left = function(){
}
instructions.right = function(){
}

// handle positioning for X, Y and orientation
position = {};
position.x = false;
position.y = false;
position.orientation = false;
position.toggleX = function(){
    position.x = !position.x;
    position.y = false;
    position.orientation = false;
    numpad.showType();
}
position.toggleY = function(){
    position.x = false;
    position.y = !position.y;
    position.orientation = false;
    numpad.showType();
}
position.toggleOrientation = function(){
    position.x = false;
    position.y = false;
    position.orientation = !position.orientation;
    numpad.showType();
}

// switch classes for using the appropriate version of the numpad
var numpad = {};
numpad.showType = function(){
    if (position.x) {
        numpadButton.x.classList.add('is-active');
        numpadEl.classList.add('number-mode');
    }
    else {
        numpadButton.x.classList.remove('is-active');
        if (numpadEl.classList.contains('number-mode')) numpadEl.classList.remove('number-mode');
    }

    if (position.y) {
        numpadButton.y.classList.add('is-active');
        numpadEl.classList.add('number-mode');
    }
    else {
        numpadButton.y.classList.remove('is-active');
        if ((!position.x) && (numpadEl.classList.contains('number-mode'))) numpadEl.classList.remove('number-mode');
    }

    if (position.orientation){
        numpadButton.orientation.classList.add('is-active');
        numpadEl.classList.add('orientation-mode');
    }
    else {
        numpadButton.orientation.classList.remove('is-active');
        if (numpadEl.classList.contains('orientation-mode')) numpadEl.classList.remove('orientation-mode');
    }

    if (!numpadEl.classList.contains('number-mode') && !numpadEl.classList.contains('orientation-mode')){
        numpadEl.classList.add('disabled-mode');
    } else if (numpadEl.classList.contains('disabled-mode')) {
        numpadEl.classList.remove('disabled-mode');
    }
}

// handle number input
numbers = {};
numbers.enterValue = function(numberValue, orientationValue, confirm){
    if (!confirm && !position.orientation){
        console.log('Number Value : ' + numberValue);
    } else if (!confirm && position.orientation && (orientationValue.length > 3)){
        console.log('Orientation Value : ' + orientationValue);
        pointer.classList.remove('north', 'east', 'south', 'west');
        pointer.classList.add(orientationValue);
    } else if (confirm && !position.orientation){
        console.log('confirm : ' + confirm);
    }
}

// ----

// Logic