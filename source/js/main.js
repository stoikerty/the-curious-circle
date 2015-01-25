document.addEventListener("DOMContentLoaded", function(event) {
    (function (document){
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
        
        function isNumber(obj) {
            return toString.call(obj) === '[object Number]';
        };

        // ----
        // Important Variables
        // ----

        // retrieve size of one grid-cell & the entire world-grid
        var gridSize = document.querySelector('.robot').offsetWidth;
        var worldSize = Math.floor(document.querySelector('.world-grid').offsetWidth / gridSize) - 1;

        // save elements for later use
        var instructionsEl = document.querySelector('.instructions');
        var commandInputEl = document.querySelector('.command-input');
        var historyEl = document.querySelector('.history');
        var numpadEl = document.querySelector('.numpad');

        // ----
        // Robot Logic
        // ----

        function Robot(gridSize, worldSize, worldElement){
            this._gridSize = gridSize;
            this._worldSize = worldSize;
            this._worldElement = worldElement;
            this._gridCells = this._worldElement.querySelector('.grid-cells');
            this._gridElement = this._gridCells.querySelector('.cell');
            this._robotElement = this._worldElement.querySelector('.robot');
            this._pointerElement = this._robotElement.querySelector('.pointer');
            this._orientation = null;
            this._x = null;
            this._y = null;
            this._dead = null;
            this._scentedPositions = [];

            this._init = function(){
                var self = this;
                self._robotElement.classList.add('is-dead');
                self._dead = true;

                setTimeout(function(){
                    self._moveTo(0, 0);
                    self._turn('north');
                    setTimeout(function(){
                        self._robotElement.classList.remove('is-dead');
                        self._dead = false;
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

            this._moveTo = function(x, y){
                var self = this;
                self._robotElement.classList.add('is-moving');
                setTimeout(function(){
                    self._robotElement.classList.remove('is-moving');
                }, 200);

                if (((x > this._worldSize) || (x < 0))
                 || ((y > this._worldSize) || (y < 0))){
                    // robot has moved outside of world-grid

                    // if one of the values isn't a number, x & y are passed individually
                    // in which case we need to update one of them.
                    // Because the values are passed in individually, we should also check
                    // that the orientation of the robot is set correctly
                    if (!isNumber(x) || !isNumber(y)) {
                        if (isNumber(x)) {
                            this._checkOrientation(this._x, x, null, null);
                            this._x = Math.min(Math.max(x, 0), this._worldSize);
                        }
                        if (isNumber(y)) {
                            this._checkOrientation(null, null, this._y, y);
                            this._y = Math.min(Math.max(y, 0), this._worldSize);
                        }
                    }

                    // let's save the position
                    var currentPos = {
                        orientation : this._orientation,
                        x : Math.min(Math.max(this._x, 0), this._worldSize),
                        y : Math.min(Math.max(this._y, 0), this._worldSize)
                    }

                    // create a new scented Cell
                    var scentedCell = this._isPositionScented(currentPos.orientation, currentPos.x, currentPos.y);

                    // either add the existing scented Cell
                    if (!scentedCell){
                        this._addScentedPosition(
                            currentPos.orientation,
                            currentPos.x,
                            currentPos.y
                        );

                        // and re-initialize the robot
                        this._init();
                    } else {
                        translate(this._robotElement, (this._x * this._gridSize), (-this._y * this._gridSize));

                        // or show visually that the robot can't move forward
                        scentedCell.classList.add('is-stepped-on');
                        self._robotElement.classList.remove('is-moving');
                        self._robotElement.classList.add('is-not-moving');

                        setTimeout(function(){
                            scentedCell.classList.remove('is-stepped-on');
                            self._robotElement.classList.remove('is-not-moving');
                        }, 400);
                    }
                } else {
                    if (isNumber(x)) this._x = x;
                    if (isNumber(y)) this._y = y;

                    // move the robot to its position
                    translate(this._robotElement, (this._x * this._gridSize), (-this._y * this._gridSize));
                }
            };

            this._checkOrientation = function(previousX, currentX, previousY, currentY){
                if ((previousX && currentX) && (currentX > previousX)) this._turn('east');
                else this._turn('west');
                if ((previousY && currentY) && (currentY > previousY)) this._turn('south');
                else this._turn('north');
            };

            this._isPositionScented = function(orientation, x, y){
                var allowMultipleScents = false; // Allow 2 scented cells on world-corners
                var positionSteppedOn = false;
                
                this._scentedPositions.forEach(function(position) {
                    if ((position.x == x)
                        && (position.y == y)){

                        if (allowMultipleScents && (position.orientation == orientation)) {
                            positionSteppedOn = position.cell;
                        } else if (!allowMultipleScents) {
                            positionSteppedOn = position.cell;
                        }
                    }
                });

                return positionSteppedOn;
            };

            this._addScentedPosition = function(orientation, x, y){
                // create active grid-cell at correct position
                var scentedCell = this._gridElement.cloneNode(true);
                translate(scentedCell, (x * this._gridSize), (-y * this._gridSize));

                setTimeout(function(){
                    scentedCell.classList.add('is-active');
                }, 200);

                this._scentedPositions.push({
                    orientation : orientation,
                    x : x,
                    y : y,
                    cell : scentedCell
                });
                this._gridCells.appendChild(scentedCell);
            };

            /**
             * Public Methods
             */

            this.isDead = function(){
                return this._isDead;
            }

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

            this.moveTo = function(treatSeparately, x, y){
                if (treatSeparately) {
                    this._moveTo(x, null);
                    if (!this._dead) this._moveTo(null, y);
                } else {
                    this._moveTo(x, y);
                }
            }

            return this._init();
        }

        var robot = new Robot(gridSize, worldSize, document.querySelector('.world-grid'));

        // ----
        // Instruction Events
        // ----

        instructionsEl.querySelector('.forward').addEventListener("click", function(e){
            e.stopPropagation();

            robot.moveForward();
        });
        instructionsEl.querySelector('.left').addEventListener("click", function(e){
            e.stopPropagation();

            robot.turnLeft();
        });
        instructionsEl.querySelector('.right').addEventListener("click", function(e){
            e.stopPropagation();

            robot.turnRight();
        });

        // ----
        // User Command Input Event & Logic
        // ----

        commandInputEl.querySelector('.current-input').addEventListener("keydown", function(e){
            e.stopPropagation();
            var inputText = e.target.value;

            // When Enter key is pressed, the input is separated
            // and processed into position- and instruction-commands
            if (e.keyCode == 13) {
                e.target.value = '';
                inputWords = inputText.split(' ');

                // process input as position
                if (parseInt(inputText[0], 10) >= 0) {
                    var currentOrientation = '';
                    for (var i = 0; i < inputWords.length; i++) {
                        if (i < 2) {
                            var currentNumber = Math.min(parseInt(inputWords[i], 10), 50);
                            if (i == 0) currentX = currentNumber;
                            if (i == 1) currentY = currentNumber;
                        } else if (i == 2) {
                            var currentLetter = inputWords[i][0].toUpperCase();
                            if (currentLetter === 'N') currentOrientation = 'north';
                            if (currentLetter === 'E') currentOrientation = 'east';
                            if (currentLetter === 'W') currentOrientation = 'west';
                            if (currentLetter === 'S') currentOrientation = 'south';
                        }
                    }

                    commandInput.processPosition(currentX, currentY, currentOrientation);

                // process input as instruction
                } else {
                    commandInput.processInstructions(inputText);
                }
            }
        });


        function CommandInput(){
            this.processPosition = function(x, y, orientation){
                //

                // write command to the history-log
                if (historyEl.innerHTML !== '') historyEl.innerHTML = historyEl.innerHTML + '<br>';
                historyEl.appendChild(
                    document.createTextNode(
                        x + ' ' +
                        x + ' ' +
                        (orientation[0] ? orientation[0].toUpperCase() : '')
                    )
                );

                // process final position-command,
                // treat commands separately by passing true
                robot.moveTo(true, x, y);
                if (orientation && (orientation !== 'none')) robot.orientation(orientation);
            };

            this.processInstructions = function(instructionsString){
                for (var k = 0; k < instructionsString.length; k++) {
                    var currentLetter = instructionsString[k].toUpperCase();
                    if (currentLetter === 'F') robot.moveForward();
                    if (currentLetter === 'L') robot.turnLeft();
                    if (currentLetter === 'R') robot.turnRight();

                    // do not continue processing commands if robot has died
                    if (robot.isDead()) break;
                }

                if (historyEl.innerHTML !== '') historyEl.innerHTML = historyEl.innerHTML + '<br>';
                historyEl.appendChild(
                    document.createTextNode(instructionsString.toUpperCase())
                );
            };
        }

        var commandInput = new CommandInput();
        
        // ----
        // Numpad Logic
        // ----

        // this code can be a bit cleaner, similar to the robot logic

        var numpadButton = {};
        numpadButton.x = numpadEl.querySelector('.position .x');
        numpadButton.y = numpadEl.querySelector('.position .y');
        numpadButton.orientation = numpadEl.querySelector('.position .orientation');

        numpadButton.x.addEventListener("click", function(e){
            e.stopPropagation();

            numpad.toggleX();
        });
        numpadButton.y.addEventListener("click", function(e){
            e.stopPropagation();

            numpad.toggleY();
        });
        numpadButton.orientation.addEventListener("click", function(e){
            e.stopPropagation();

            numpad.toggleOrientation();
        });

        var numpadButtons = numpadEl.querySelectorAll('.numbers button');
        for (var i=0; i<numpadButtons.length; i++){
            numpadButtons[i].addEventListener("click", function(e){
                e.stopPropagation();
                var confirm = e.target.classList.contains('confirm');

                numpad.enterValue(
                    e.target.getAttribute('data-number'),
                    e.target.getAttribute('data-orientation'),
                    confirm
                );
            });
        }

        function Numpad(){
            // handle positioning for X, Y and orientation
            this.position = {
                x : false,
                y : false,
                orientation : false
            };

            this.toggleX = function(){
                this.position.x = !this.position.x;
                this.position.y = false;
                this.position.orientation = false;
                this.showType();
            };
            this.toggleY = function(){
                this.position.x = false;
                this.position.y = !this.position.y;
                this.position.orientation = false;
                this.showType();
            };
            this.toggleOrientation = function(){
                this.position.x = false;
                this.position.y = false;
                this.position.orientation = !this.position.orientation;
                this.showType();
            };

            // switch classes for using the appropriate version of the numpad
            this.showType = function(){
                if (this.position.x) {
                    numpadButton.x.classList.add('is-active');
                    numpadEl.classList.add('number-mode');
                }
                else {
                    numpadButton.x.classList.remove('is-active');
                    if (numpadEl.classList.contains('number-mode'))
                        numpadEl.classList.remove('number-mode');
                }

                if (this.position.y) {
                    numpadButton.y.classList.add('is-active');
                    numpadEl.classList.add('number-mode');
                }
                else {
                    numpadButton.y.classList.remove('is-active');
                    if ((!this.position.x) && (numpadEl.classList.contains('number-mode')))
                        numpadEl.classList.remove('number-mode');
                }

                if (this.position.orientation){
                    numpadButton.orientation.classList.add('is-active');
                    numpadEl.classList.add('orientation-mode');
                }
                else {
                    numpadButton.orientation.classList.remove('is-active');
                    if (numpadEl.classList.contains('orientation-mode'))
                        numpadEl.classList.remove('orientation-mode');
                }

                if (!numpadEl.classList.contains('number-mode')
                    && !numpadEl.classList.contains('orientation-mode')){
                    numpadEl.classList.add('disabled-mode');
                } else if (numpadEl.classList.contains('disabled-mode')) {
                    numpadEl.classList.remove('disabled-mode');
                }
            };

            // handle number & orientation input
            this.enterValue = function(numberValue, orientationValue, confirm){
                if (!numpadEl.classList.contains('disabled-mode')){
                    var activeButton = numpadEl.querySelector('.position .is-active');

                    if (!confirm && !this.position.orientation){
                        // a number has been entered

                        if (!(parseInt(activeButton.innerHTML, 10) >= 0)) activeButton.innerHTML = '';
                        activeButton.innerHTML = activeButton.innerHTML + numberValue;
                        activeButton.classList.add('is-modified');
                    
                    } else if (!confirm && this.position.orientation && (orientationValue.length > 2)){
                        // orientation value has been entered

                        activeButton.innerHTML = orientationValue;
                        activeButton.classList.add('is-modified');
                    
                    } else if (confirm){
                        // value has been confirmed

                        if (activeButton.classList.contains('is-modified')){
                            activeButton.disabled = true;

                            if (!this.position.orientation){
                                activeButton.innerHTML = Math.min(parseInt(activeButton.innerHTML, 10), 50);
                            }

                            // reset numpad
                            activeButton.classList.remove('is-active');
                            this.position = {
                                x : false,
                                y : false,
                                orientation : false
                            };
                            this.showType();

                            var disabledButtons = numpadEl.querySelectorAll('.position button:disabled');
                            if (disabledButtons.length == 3) {
                                for (var i=0; i<disabledButtons.length; i++){
                                    disabledButtons[i].disabled = false;
                                }

                                numpadEl.classList.add('is-resetting');
                                setTimeout(function(){
                                    commandInput.processPosition(
                                        parseInt(numpadButton.x.innerHTML, 10),
                                        parseInt(numpadButton.y.innerHTML, 10),
                                        numpadButton.orientation.innerHTML
                                    );

                                    numpadButton.x.innerHTML = 'X';
                                    numpadButton.y.innerHTML = 'Y';
                                    numpadButton.orientation.innerHTML = 'orientation';
                                    numpadEl.classList.remove('is-resetting');
                                }, 700);
                            }
                        } else {
                            // reset numpad
                            this.position = {
                                x : false,
                                y : false,
                                orientation : false
                            };

                            this.showType();
                        }
                    }
                }
            };
        }

        var numpad = new Numpad();

    })(document);
});
