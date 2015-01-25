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

        // save elements for later use
        var worldGridEl = document.querySelector('.world-grid');
        var instructionsEl = document.querySelector('.instructions');
        var commandInputEl = document.querySelector('.command-input');
        var historyEl = document.querySelector('.history');
        var numpadEl = document.querySelector('.numpad');

        var infoContainerEl = document.querySelector('.info-container');
        var buttonExplanation = document.querySelector('.info-container .toggle');

        var buttonForward = instructionsEl.querySelector('.forward');
        var buttonLeft = instructionsEl.querySelector('.left');
        var buttonRight = instructionsEl.querySelector('.right');
        
        var buttonTestSample = document.querySelector('.test-sample');
        var buttonDance = document.querySelector('.dance');

        // retrieve size of one grid-cell & the entire world-grid
        var gridSize = document.querySelector('.robot').offsetWidth;
        var worldSize = Math.floor(worldGridEl.offsetWidth / gridSize) - 1;

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
                return this._dead;
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

        var robot = new Robot(gridSize, worldSize, worldGridEl);

        // ----
        // Show Explanation
        // ----

        buttonExplanation.addEventListener("click", function(e){
            e.stopPropagation();

            infoContainerEl.classList.toggle('is-active');
            worldGridEl.classList.toggle('is-active');
            commandInputEl.classList.toggle('is-active');
        });

        // ----
        // Instruction Events
        // ----

        buttonForward.addEventListener("click", function(e){
            e.stopPropagation();

            commandInput.processInstructions('F');
        });
        buttonLeft.addEventListener("click", function(e){
            e.stopPropagation();

            commandInput.processInstructions('L');
        });
        buttonRight.addEventListener("click", function(e){
            e.stopPropagation();

            commandInput.processInstructions('R');
        });

        // ----
        // Test Sample Event & Logic
        // ----

        buttonTestSample.addEventListener("click", function(e){
            e.stopPropagation();
            var testData = [
                '5 3',
                '1 1 E',
                'RFRFRFRF',
                '-',
                '3 2 N',
                'FRRFLLFFRRFLL',
                '-',
                '0 3 W',
                'LLFFFLFLFL',
                null,
                'finish'
            ];

            runTestData(testData, 600);
        });

        buttonDance.addEventListener("click", function(e){
            e.stopPropagation();
            var testData = [

                // fist, set the scene (bottom row)
                '0 -1',
                '1 -1',
                '2 -1',
                '3 -1',
                '4 -1',
                '5 -1',
                '6 -1',
                '7 -1',
                '8 -1',
                '9 -1',
                '10 -1',
                '11 -1',
                '12 -1',
                '13 -1',

                // set the scene (top row)
                '0 50',
                '1 50',
                '2 50',
                '3 50',
                '4 50',
                '5 50',
                '6 50',
                '7 50',
                '8 50',
                '9 50',
                '10 50',
                '11 50',
                '12 50',
                '13 50',
                '-',

                // now dance!
                '6 3 E',
                '6 3 S',
                '6 3 N',
                '6 3 W',
                '6 3 E',
                '6 3 N',
                '6 3 N',
                '5 3 S',
                'F','F','F','F','L','L','F','F','F',
                'R','R','R','R','R','R',
                'L','L','L','L','L','L',
                '6 12 S',
                'F','F','F','F','R','F','F','F','F',
                'L','R','R',
                '9 5 E',
                '9 5 S',
                '9 5 N',
                '9 5 W',
                '12 4 E',
                '12 4 N',
                '12 4 W',
                '12 4 N',
                '12 4 S',
                null,
                'finish'
            ];

            runTestData(testData, 600);
        });

        function runTestData(testData, waitTime){

            for (var i=0; i < testData.length; i++){
                if (testData[i]){
                    var currentInputText = testData[i];

                    // pass current parameter to setTimeout using bind
                    setTimeout(function(currentInputText) {
                        if ((currentInputText !== 'finish') && (currentInputText !== '-'))
                            commandInput.processText(currentInputText);
                        else if (currentInputText == '-'){
                            historyEl.innerHTML = historyEl.innerHTML + '<br>';
                        } else {
                            historyEl.innerHTML = historyEl.innerHTML + '<br><br> { Test Data completed } <br>';
                            commandInput.processText('0 0 N');
                        }
                    }.bind(this, currentInputText), waitTime * i);
                }
            }
        }

        // ----
        // Cursor Key Logic
        // ----

        document.onkeydown = checkKey;
        function checkKey(e) {
            e = e || window.event;

            if (e.keyCode == '38') {
                buttonForward.click();
                buttonForward.classList.add('is-clicked');

                setTimeout(function(){
                    buttonForward.classList.remove('is-clicked');
                }, 200);
            }
            else if (e.keyCode == '37') {
                buttonLeft.click();
                buttonLeft.classList.add('is-clicked');

                setTimeout(function(){
                    buttonLeft.classList.remove('is-clicked');
                }, 200);
            }
            else if (e.keyCode == '39') {
                buttonRight.click();
                buttonRight.classList.add('is-clicked');

                setTimeout(function(){
                    buttonRight.classList.remove('is-clicked');
                }, 200);
            }
        }

        // ----
        // User Command-Input Event & Logic
        // ----

        commandInputEl.querySelector('.current-input').addEventListener("keydown", function(e){
            e.stopPropagation();
            var inputText = e.target.value;

            // When Enter key is pressed, the input is separated
            // and processed into position- and instruction-commands
            if (e.keyCode == 13) {
                e.target.value = '';
                commandInput.processText(inputText);
            }
        });


        function CommandInput(){
            this.processText = function(inputText){
                var inputWords = inputText.split(' ');

                // process input text as position
                if (parseInt(inputText[0], 10) >= 0) {
                    var currentX, currentY;
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

                    this.processPosition(currentX, currentY, currentOrientation);

                // process input text as instruction
                } else {
                    this.processInstructions(inputText);
                }
            }
            this.processPosition = function(x, y, orientation){
                // write position to the history-log
                if (historyEl.innerHTML !== '') historyEl.innerHTML = historyEl.innerHTML + '<br>';
                historyEl.appendChild(
                    document.createTextNode(
                        x + ' ' +
                        y + ' ' +
                        (orientation[0] ? orientation[0].toUpperCase() : '')
                    )
                );

                // process final position-command,
                // treat commands separately by passing true
                robot.moveTo(true, x, y);

                // output LOST message, or orient the robot
                if (robot.isDead()) {
                    historyEl.innerHTML = historyEl.innerHTML + ' LOST';
                } else if (orientation && (orientation !== 'none'))
                    robot.orientation(orientation);

                // scroll log for last command to be visbile
                historyEl.scrollTop = historyEl.scrollHeight;
            };

            this.processInstructions = function(instructionsString){
                var processedInstructions = '';

                for (var k = 0; k < instructionsString.length; k++) {
                    var currentLetter = instructionsString[k].toUpperCase();
                    if (currentLetter === 'F') robot.moveForward();
                    if (currentLetter === 'L') robot.turnLeft();
                    if (currentLetter === 'R') robot.turnRight();

                    processedInstructions += currentLetter;

                    // do not continue processing commands if robot has died
                    if (robot.isDead()) {
                        processedInstructions += ' LOST';
                        break;
                    }
                }

                // write instructions to the history-log
                if (historyEl.innerHTML !== '') historyEl.innerHTML = historyEl.innerHTML + '<br>';
                historyEl.appendChild(
                    document.createTextNode(processedInstructions.toUpperCase())
                );

                // scroll log for last command to be visbile
                historyEl.scrollTop = historyEl.scrollHeight;
            };
        }

        var commandInput = new CommandInput();
        
        // ----
        // Numpad (Position) Logic
        // ----

        function Numpad(numpadElement){
            // handle positioning for X, Y and orientation
            this._position = {
                x : false,
                y : false,
                orientation : false
            };

            this._numPadEl = numpadElement;
            this._numpadButton = {};

            /**
             * Private Methods
             */

            this._init = function(){
                this._position = {
                    x : false,
                    y : false,
                    orientation : false
                };

                this._numpadButton.x = this._numPadEl.querySelector('.position .x');
                this._numpadButton.y = this._numPadEl.querySelector('.position .y');
                this._numpadButton.orientation = this._numPadEl.querySelector('.position .orientation');

                this._numpadButton.x.addEventListener("click", function(e){
                    e.stopPropagation();

                    numpad.toggleX();
                });
                this._numpadButton.y.addEventListener("click", function(e){
                    e.stopPropagation();

                    numpad.toggleY();
                });
                this._numpadButton.orientation.addEventListener("click", function(e){
                    e.stopPropagation();

                    numpad.toggleOrientation();
                });

                var numpadButtons = this._numPadEl.querySelectorAll('.numbers button');
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
            }

            /**
             * Public Methods
             */

            this.toggleX = function(){
                this._position.x = !this._position.x;
                this._position.y = false;
                this._position.orientation = false;
                this.showType();
            };
            this.toggleY = function(){
                this._position.x = false;
                this._position.y = !this._position.y;
                this._position.orientation = false;
                this.showType();
            };
            this.toggleOrientation = function(){
                this._position.x = false;
                this._position.y = false;
                this._position.orientation = !this._position.orientation;
                this.showType();
            };

            // switch classes for using the appropriate version of the numpad
            this.showType = function(){
                if (this._position.x) {
                    this._numpadButton.x.classList.add('is-active');
                    this._numPadEl.classList.add('number-mode');
                }
                else {
                    this._numpadButton.x.classList.remove('is-active');
                    if (this._numPadEl.classList.contains('number-mode'))
                        this._numPadEl.classList.remove('number-mode');
                }

                if (this._position.y) {
                    this._numpadButton.y.classList.add('is-active');
                    this._numPadEl.classList.add('number-mode');
                }
                else {
                    this._numpadButton.y.classList.remove('is-active');
                    if ((!this._position.x) && (this._numPadEl.classList.contains('number-mode')))
                        this._numPadEl.classList.remove('number-mode');
                }

                if (this._position.orientation){
                    this._numpadButton.orientation.classList.add('is-active');
                    this._numPadEl.classList.add('orientation-mode');
                }
                else {
                    this._numpadButton.orientation.classList.remove('is-active');
                    if (this._numPadEl.classList.contains('orientation-mode'))
                        this._numPadEl.classList.remove('orientation-mode');
                }

                if (!this._numPadEl.classList.contains('number-mode')
                    && !this._numPadEl.classList.contains('orientation-mode')){
                    this._numPadEl.classList.add('disabled-mode');
                } else if (this._numPadEl.classList.contains('disabled-mode')) {
                    this._numPadEl.classList.remove('disabled-mode');
                }
            };

            // handle number & orientation input
            this.enterValue = function(numberValue, orientationValue, confirm){
                if (!this._numPadEl.classList.contains('disabled-mode')){
                    var activeButton = this._numPadEl.querySelector('.position .is-active');

                    if (!confirm && !this._position.orientation){
                        // a number has been entered

                        if (!(parseInt(activeButton.innerHTML, 10) >= 0)) activeButton.innerHTML = '';
                        activeButton.innerHTML = activeButton.innerHTML + numberValue;
                        activeButton.classList.add('is-modified');
                    
                    } else if (!confirm && this._position.orientation && (orientationValue.length > 2)){
                        // orientation value has been entered

                        activeButton.innerHTML = orientationValue;
                        activeButton.classList.add('is-modified');
                    
                    } else if (confirm){
                        // value has been confirmed

                        if (activeButton.classList.contains('is-modified')){
                            activeButton.disabled = true;

                            if (!this._position.orientation){
                                activeButton.innerHTML = Math.min(parseInt(activeButton.innerHTML, 10), 50);
                            }

                            // reset numpad
                            activeButton.classList.remove('is-active');
                            this._position = {
                                x : false,
                                y : false,
                                orientation : false
                            };
                            this.showType();

                            var disabledButtons = this._numPadEl.querySelectorAll('.position button:disabled');
                            if (disabledButtons.length == 3) {
                                for (var i=0; i<disabledButtons.length; i++){
                                    disabledButtons[i].disabled = false;
                                }

                                var self = this;

                                self._numPadEl.classList.add('is-resetting');
                                setTimeout(function(){
                                    commandInput.processPosition(
                                        parseInt(self._numpadButton.x.innerHTML, 10),
                                        parseInt(self._numpadButton.y.innerHTML, 10),
                                        self._numpadButton.orientation.innerHTML
                                    );

                                    self._numpadButton.x.innerHTML = 'X';
                                    self._numpadButton.y.innerHTML = 'Y';
                                    self._numpadButton.orientation.innerHTML = 'orientation';
                                    self._numPadEl.classList.remove('is-resetting');
                                }, 700);
                            }
                        } else {
                            // reset numpad
                            this._position = {
                                x : false,
                                y : false,
                                orientation : false
                            };

                            this.showType();
                        }
                    }
                }
            };

            this._init();
        }

        var numpad = new Numpad(numpadEl);

    })(document);
});
