document.addEventListener("DOMContentLoaded",function(){!function(t){function i(t,i,e){t.style["-webkit-transform"]="translate("+i+"px, "+e+"px)",t.style["-moz-transform"]="translate("+i+"px, "+e+"px)",t.style["-ms-transform"]="translate("+i+"px, "+e+"px)",t.style["-o-transform"]="translate("+i+"px, "+e+"px)",t.style.transform="translate("+i+"px, "+e+"px)"}function e(t){return"[object Number]"===toString.call(t)}function o(t,o,n){return this._gridSize=t,this._worldSize=o,this._worldElement=n,this._gridCells=this._worldElement.querySelector(".grid-cells"),this._gridElement=this._gridCells.querySelector(".cell"),this._robotElement=this._worldElement.querySelector(".robot"),this._pointerElement=this._robotElement.querySelector(".pointer"),this._orientation=null,this._x=null,this._y=null,this._dead=null,this._scentedPositions=[],this._init=function(){var t=this;t._robotElement.classList.add("is-dead"),t._dead=!0,setTimeout(function(){t._moveTo(0,0),t._turn("north"),setTimeout(function(){t._robotElement.classList.remove("is-dead"),t._dead=!1},200)},200)},this._moveForward=function(){"north"==this._orientation&&this._move(0,1),"east"==this._orientation&&this._move(1,0),"south"==this._orientation&&this._move(0,-1),"west"==this._orientation&&this._move(-1,0)},this._turn=function(t){var i="";this._pointerElement.classList.remove("north","east","south","west"),"left"==t&&("north"==this._orientation&&(i="west"),"east"==this._orientation&&(i="north"),"south"==this._orientation&&(i="east"),"west"==this._orientation&&(i="south")),"right"==t&&("north"==this._orientation&&(i="east"),"east"==this._orientation&&(i="south"),"south"==this._orientation&&(i="west"),"west"==this._orientation&&(i="north")),["north","east","south","west"].indexOf(t)>-1&&(i=t),this._orientation=i,this._pointerElement.classList.add(this._orientation)},this._move=function(t,i){this._moveTo(this._x+t,this._y+i)},this._moveTo=function(t,o){var n=this;if(n._robotElement.classList.add("is-moving"),setTimeout(function(){n._robotElement.classList.remove("is-moving")},200),t>this._worldSize||0>t||o>this._worldSize||0>o){e(t)&&e(o)||(e(t)&&(this._checkOrientation(this._x,t,null,null),this._x=t),e(o)&&(this._checkOrientation(null,null,this._y,o),this._y=o));var s={orientation:this._orientation,x:Math.min(Math.max(this._x,0),this._worldSize),y:Math.min(Math.max(this._y,0),this._worldSize)},r=this._isPositionScented(s.orientation,s.x,s.y);r?(r.classList.add("is-stepped-on"),n._robotElement.classList.remove("is-moving"),n._robotElement.classList.add("is-not-moving"),setTimeout(function(){r.classList.remove("is-stepped-on"),n._robotElement.classList.remove("is-not-moving")},400)):(this._addScentedPosition(s.orientation,s.x,s.y),this._init())}else e(t)&&(this._x=t),e(o)&&(this._y=o),i(this._robotElement,this._x*this._gridSize,-this._y*this._gridSize)},this._checkOrientation=function(t,i,e,o){t&&i&&i>t?this._turn("east"):this._turn("west"),e&&o&&o>e?this._turn("south"):this._turn("north")},this._isPositionScented=function(t,i,e){var o=!1;return this._scentedPositions.forEach(function(n){n.orientation==t&&n.x==i&&n.y==e&&(o=n.cell)}),o},this._addScentedPosition=function(t,e,o){var n=this._gridElement.cloneNode(!0);i(n,e*this._gridSize,-o*this._gridSize),setTimeout(function(){n.classList.add("is-active")},200),this._scentedPositions.push({orientation:t,x:e,y:o,cell:n}),this._gridCells.appendChild(n)},this.isDead=function(){return this._isDead},this.moveForward=function(){this._moveForward()},this.turnLeft=function(){this._turn("left")},this.turnRight=function(){this._turn("right")},this.orientation=function(t){this._turn(t)},this.moveTo=function(t,i,e){t?(this._moveTo(i,null),this._dead||this._moveTo(null,e)):this._moveTo(i,e)},this._init()}function n(){this.processPosition=function(i,e,o){""!==c.innerHTML&&(c.innerHTML=c.innerHTML+"<br>"),c.appendChild(t.createTextNode(i+" "+i+" "+(o[0]?o[0].toUpperCase():""))),u.moveTo(!0,i,e),o&&"none"!==o&&u.orientation(o)},this.processInstructions=function(i){for(var e=0;e<i.length;e++){var o=i[e].toUpperCase();if("F"===o&&u.moveForward(),"L"===o&&u.turnLeft(),"R"===o&&u.turnRight(),u.isDead())break}""!==c.innerHTML&&(c.innerHTML=c.innerHTML+"<br>"),c.appendChild(t.createTextNode(i.toUpperCase()))}}function s(){this.position={x:!1,y:!1,orientation:!1},this.toggleX=function(){this.position.x=!this.position.x,this.position.y=!1,this.position.orientation=!1,this.showType()},this.toggleY=function(){this.position.x=!1,this.position.y=!this.position.y,this.position.orientation=!1,this.showType()},this.toggleOrientation=function(){this.position.x=!1,this.position.y=!1,this.position.orientation=!this.position.orientation,this.showType()},this.showType=function(){this.position.x?(p.x.classList.add("is-active"),d.classList.add("number-mode")):(p.x.classList.remove("is-active"),d.classList.contains("number-mode")&&d.classList.remove("number-mode")),this.position.y?(p.y.classList.add("is-active"),d.classList.add("number-mode")):(p.y.classList.remove("is-active"),!this.position.x&&d.classList.contains("number-mode")&&d.classList.remove("number-mode")),this.position.orientation?(p.orientation.classList.add("is-active"),d.classList.add("orientation-mode")):(p.orientation.classList.remove("is-active"),d.classList.contains("orientation-mode")&&d.classList.remove("orientation-mode")),d.classList.contains("number-mode")||d.classList.contains("orientation-mode")?d.classList.contains("disabled-mode")&&d.classList.remove("disabled-mode"):d.classList.add("disabled-mode")},this.enterValue=function(t,i,e){if(!d.classList.contains("disabled-mode")){var o=d.querySelector(".position .is-active");if(e||this.position.orientation){if(!e&&this.position.orientation&&i.length>2)o.innerHTML=i,o.classList.add("is-modified");else if(e)if(o.classList.contains("is-modified")){o.disabled=!0,this.position.orientation||(o.innerHTML=Math.min(parseInt(o.innerHTML,10),50)),o.classList.remove("is-active"),this.position={x:!1,y:!1,orientation:!1},this.showType();var n=d.querySelectorAll(".position button:disabled");if(3==n.length){for(var s=0;s<n.length;s++)n[s].disabled=!1;d.classList.add("is-resetting"),setTimeout(function(){m.processPosition(parseInt(p.x.innerHTML,10),parseInt(p.y.innerHTML,10),p.orientation.innerHTML),p.x.innerHTML="X",p.y.innerHTML="Y",p.orientation.innerHTML="orientation",d.classList.remove("is-resetting")},700)}}else this.position={x:!1,y:!1,orientation:!1},this.showType()}else parseInt(o.innerHTML,10)>=0||(o.innerHTML=""),o.innerHTML=o.innerHTML+t,o.classList.add("is-modified")}}}var r=t.querySelector(".robot").offsetWidth,a=Math.floor(t.querySelector(".world-grid").offsetWidth/r)-1,h=t.querySelector(".instructions"),l=t.querySelector(".command-input"),c=t.querySelector(".history"),d=t.querySelector(".numpad"),u=new o(r,a,t.querySelector(".world-grid"));h.querySelector(".forward").addEventListener("click",function(t){t.stopPropagation(),u.moveForward()}),h.querySelector(".left").addEventListener("click",function(t){t.stopPropagation(),u.turnLeft()}),h.querySelector(".right").addEventListener("click",function(t){t.stopPropagation(),u.turnRight()}),l.querySelector(".current-input").addEventListener("keydown",function(t){t.stopPropagation();var i=t.target.value;if(13==t.keyCode)if(t.target.value="",inputWords=i.split(" "),parseInt(i[0],10)>=0){for(var e="",o=0;o<inputWords.length;o++)if(2>o){var n=Math.min(parseInt(inputWords[o],10),50);0==o&&(currentX=n),1==o&&(currentY=n)}else if(2==o){var s=inputWords[o][0].toUpperCase();"N"===s&&(e="north"),"E"===s&&(e="east"),"W"===s&&(e="west"),"S"===s&&(e="south")}m.processPosition(currentX,currentY,e)}else m.processInstructions(i)});var m=new n,p={};p.x=d.querySelector(".position .x"),p.y=d.querySelector(".position .y"),p.orientation=d.querySelector(".position .orientation"),p.x.addEventListener("click",function(t){t.stopPropagation(),v.toggleX()}),p.y.addEventListener("click",function(t){t.stopPropagation(),v.toggleY()}),p.orientation.addEventListener("click",function(t){t.stopPropagation(),v.toggleOrientation()});for(var _=d.querySelectorAll(".numbers button"),f=0;f<_.length;f++)_[f].addEventListener("click",function(t){t.stopPropagation();var i=t.target.classList.contains("confirm");v.enterValue(t.target.getAttribute("data-number"),t.target.getAttribute("data-orientation"),i)});var v=new s}(document)});