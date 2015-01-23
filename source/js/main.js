// create world-grid array
// add requestanimationframe
// make direction buttons work

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

instructions = {};
instructions.forward = function(){
    console.log('forward');
}
instructions.left = function(){
    console.log('left');
}
instructions.right = function(){
    console.log('right');
}

position = {};
position.x = false;
position.y = false;
position.orientation = false;
position.toggleX = function(){
    console.log('setX');
    position.x = !position.x;
    position.y = false;
    position.orientation = false;
    numpad.showType();
}
position.toggleY = function(){
    console.log('setY');
    position.x = false;
    position.y = !position.y;
    position.orientation = false;
    numpad.showType();
}
position.toggleOrientation = function(){
    console.log('setOrientation');
    position.x = false;
    position.y = false;
    position.orientation = !position.orientation;
    numpad.showType();
}

numbers = {};
numbers.enterValue = function(numberValue, orientationValue, confirm){
    if (!confirm && !position.orientation){
        console.log('Number Value : ' + numberValue);
    } else if (!confirm && position.orientation && (orientationValue.length > 2)){
        console.log('Orientation Value : ' + orientationValue);
    } else if (confirm){
        console.log('confirm : ' + confirm);
    }
}

var numpad = {};
numpad.showType = function(){
    if (position.x) numpadButton.x.classList.add('is-active')
    else numpadButton.x.classList.remove('is-active');
    if (position.y) numpadButton.y.classList.add('is-active')
    else numpadButton.y.classList.remove('is-active');
    if (position.orientation){
        numpadButton.orientation.classList.add('is-active');
        numpadEl.classList.add('orientation-mode');
    }
    else {
        numpadButton.orientation.classList.remove('is-active');
        numpadEl.classList.remove('orientation-mode');
    }
}