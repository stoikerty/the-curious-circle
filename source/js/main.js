// create world-grid array
// add requestanimationframe
// make direction buttons work


// ----
// Element-related Events, functions & style-switching
// ----

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

var numpadEl = document.querySelector('.numpad');

var numpadButton = {};
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

        numpadInput.enterValue(
            e.target.getAttribute('data-number'),
            e.target.getAttribute('data-orientation'),
            confirm
        );
    });
}

// retrieve size of one grid-cell & the entire world-grid
var gridSize = document.querySelector('.robot').offsetWidth;
var worldSize = Math.floor(document.querySelector('.world-grid').offsetWidth / gridSize) - 1;

// handle robot instructions
var instructions = {};
instructions.forward = function(){
    robot.moveForward();
}
instructions.left = function(){
    robot.turnLeft();
}
instructions.right = function(){
    robot.turnRight();
}

// handle positioning for X, Y and orientation
var position = {};
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

// handle number & orientation input
var numpadInput = {};
numpadInput.enterValue = function(numberValue, orientationValue, confirm){
    if (!numpadEl.classList.contains('disabled-mode')){
        if (!confirm && !position.orientation){
            console.log('Number Value : ' + numberValue);
        } else if (!confirm && position.orientation && (orientationValue.length > 3)){
            robot.orientation(orientationValue);
        } else if (confirm && !position.orientation){
            console.log('confirm : ' + confirm);
        }
    }
}

// ----
// Utility Functions
// ----

function translate(element, x, y) {
    element.style["-webkit-transform"] = "translate(" + x + "px, " + y + "px)";
    element.style["-moz-transform"]    = "translate(" + x + "px, " + y + "px)";
    element.style["-ms-transform"]     = "translate(" + x + "px, " + y + "px)";
    element.style["-o-transform"]      = "translate(" + x + "px, " + y + "px)";
    element.style["transform"]         = "translate(" + x + "px, " + y + "px)";
}

// ----
// Robot & World Logic
// ----

function Robot(gridSize, worldSize, robotElement){
    this._gridSize = gridSize;
    this._worldSize = worldSize;
    this._robotElement = robotElement;
    this._pointerElement = this._robotElement.querySelector('.pointer');
    this._orientation = null;
    this._x = null;
    this._y = null;
    this._scentedPositions = [];

    this._init = function(){
        var self = this;
        self._robotElement.classList.add('is-dead');

        setTimeout(function(){
            self._moveTo(0, 0);
            self._turn('north');
            setTimeout(function(){
                self._robotElement.classList.remove('is-dead');
            }, 200);
        }, 200);
    };

    /**
     * Private Methods
     */

    this._moveForward = function(){
        if (this._orientation == 'north') this._move(0, +1);
        if (this._orientation == 'east')  this._move(+1, 0);
        if (this._orientation == 'south') this._move(0, -1);
        if (this._orientation == 'west')  this._move(-1, 0);
    };

    this._turn = function(toOrientation){
        var nextOrientation = '';
        this._pointerElement.classList.remove('north', 'east', 'south', 'west');

        if (toOrientation == 'left') {
            if (this._orientation == 'north') nextOrientation = 'west';
            if (this._orientation == 'east')  nextOrientation = 'north';
            if (this._orientation == 'south') nextOrientation = 'east';
            if (this._orientation == 'west')  nextOrientation = 'south';
        }
        if (toOrientation == 'right') {
            if (this._orientation == 'north') nextOrientation = 'east';
            if (this._orientation == 'east')  nextOrientation = 'south';
            if (this._orientation == 'south') nextOrientation = 'west';
            if (this._orientation == 'west')  nextOrientation = 'north';
        }
        if (['north', 'east', 'south', 'west'].indexOf(toOrientation) > -1) {
            nextOrientation = toOrientation;
        }

        this._orientation = nextOrientation;
        this._pointerElement.classList.add(this._orientation);
    };

    this._move = function(x, y){
        this._moveTo(this._x + x, this._y + y);
    };

    this._checkScentedPosition = function(x, y){
        //
    };

    this._addScentedPosition = function(x, y){
        this._scentedPositions.push({x, y});
        // create orange grid-cell
        console.log(this._scentedPositions);
    };

    this._moveTo = function(x, y){
        this._x = x;
        this._y = y;
        translate(this._robotElement, (this._x * this._gridSize), (-this._y * this._gridSize));
        
        var self = this;
        self._robotElement.classList.add('is-moving');
        setTimeout(function(){
            self._robotElement.classList.remove('is-moving');
        }, 200);

        if ((this._x > this._worldSize) || (this._x < 0) || (this._y > this._worldSize) || (this._y < 0)) {
            console.log('stepped outside', this._x, this._y);
            this._addScentedPosition(this._x, this._y);
            this._init();
        }
    };

    /**
     * Public Methods
     */

    this.moveForward = function(){
        this._moveForward();
    }

    this.turnLeft = function(){
        this._turn('left');
    }

    this.turnRight = function(){
        this._turn('right');
    }

    this.orientation = function(toOrientation){
        this._turn(toOrientation);
    }

    return this._init();
}

var robot = new Robot(gridSize, worldSize, document.querySelector('.robot'));

function World(worldSize, robot){
    this._size = worldSize;
    this._robot = robot;

    this._init = function(){
    };

    /**
     * Private Methods
     */

    this._privateMethod = function(){
    };

    /**
     * Public Methods
     */

    this.publicMethod = function(){
    }

    return this._init();
}

var world = new World(worldSize, robot);