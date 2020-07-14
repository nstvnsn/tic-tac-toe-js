/*
Script: tic-tac-toe.js
Author: Nathan Stevenson
Description: Tic-tac-toe game, featuring a repeatable game of 
tic-tac-toe with a GUI.
*/
"use strict"
// Set global variables
const canvas = document.getElementById("my-canvas");
const ctx = canvas.getContext("2d"); // Don't fully understand this yet, used for drawing and stuff
const [cHeight, cWidth] = [canvas.clientHeight, canvas.clientWidth]; // Used throughout for sizing and positioning
/*
  Set offset for canvas positioning and correct tracking of canvas clicks
  **Side note for future self, drawing on the canvas starts at 0,0
  not the offset.**
*/
let [offLeft, offTop] = [canvas.offsetLeft, canvas.offsetTop];


// ------> Window Element Event Listeners and Callbacks <--------
window.addEventListener("resize", updateCanvasCoord);

/**
 * updateCanvasCoord - Change canvas positionion on window
 * resize to maintain accurate click (x,y) event tracking
 */
function updateCanvasCoord() {
  [offLeft, offTop] = [canvas.offsetLeft, canvas.offsetTop];
  console.log(offLeft, offTop);
  for(let i = 0; i < newGameBoard.tiles.length; i++){
    newGameBoard.tiles[i].updateTile();
  };
};
// ------> End of Window element callbacks


/* -----> GameBoard constructor function <-------
  GameBoard constructor function
*/
/**
 * @constructor GameBoard 
 */
function GameBoard() {
  this.name = "GameBoard";
  this.dimensions = {
    "h": null,
    "w": null
  };
  this.position = {
    "top": null,
    "left": null,
    "bottom": null,
    "right": null
  };
  this.lines = {
    h1: {},
    h2: {},
    v1: {},
    v2: {}
  };
  this.tiles = []; // array of tile objects that belong to gameboard
  // Initialize object when created
  this._initializeObj();
  // So I don't scratch my head wondering why 'this' is referencing the canvas element instead >.<
  canvas.addEventListener("click", GameBoard.prototype.canvasClickedEvent.bind(this));
};
/**
 * _initializeObj - Initialize GameBoard object and draw
 * representation on canvas element.
 */
GameBoard.prototype._initializeObj = function() {
  this._setDimensions();
  this._setPosition();
  this._setLines();
  this._drawLines();
  this._positionTiles();
};
/**
 * _setPosition - Sets position of GameBoard object relative to
 * position of canvas. Uses canvas offset to acheive this.
 */
GameBoard.prototype._setPosition = function() {
  this.top = Math.floor(offTop);
  this.bottom = Math.floor(this.top + this.dimensions.h);
  this.left = Math.floor(offLeft);
  this.right = Math.floor(this.left + this.dimensions.w);
};
/**
 * _setDimensions - Sets dimension of GameBoard object relative to
 * size of canvas.
 */
GameBoard.prototype._setDimensions = function() {
  this.dimensions.h = cHeight;
  this.dimensions.w = cWidth;
};
/**
 * _setLines - Set the endpoints of the gameboard's lines
 */
GameBoard.prototype._setLines = function() {
  this.lines.v1 = {
    "xStart": Math.floor(this.dimensions.w * (1/3)),
    "xEnd": Math.floor(this.dimensions.w * (1/3)),
    "yStart": 0,
    "yEnd": this.dimensions.h
  };
  this.lines.v2 = {
    "xStart": Math.floor(this.dimensions.w * (2/3)),
    "xEnd": Math.floor(this.dimensions.w * (2/3)),
    "yStart": 0,
    "yEnd": this.dimensions.h
  };
  this.lines.h1 = {
    "xStart": 0,
    "xEnd": this.dimensions.w,
    "yStart": Math.floor(this.dimensions.h * (1/3)),
    "yEnd": Math.floor(this.dimensions.h * (1/3))
  };
  this.lines.h2 = {
    "xStart": 0,
    "xEnd": this.dimensions.w,
    "yStart": Math.floor(this.dimensions.h* (2/3)),
    "yEnd": Math.floor(this.dimensions.h * (2/3))
  };
};
/**
 * _drawLines - Draw lines on canvas using line objects'
 * endpoints
 */
GameBoard.prototype._drawLines = function() {
  let {
        v1, 
        v2,
        h1,
        h2
   } = this.lines;  
  ctx.beginPath();
  ctx.lineWidth = 10;
  for (let line of Array.of(v1, v2, h1, h2)) {
    ctx.moveTo(line.xStart, line.yStart);
    ctx.lineTo(line.xEnd, line.yEnd);
    ctx.stroke();
  }
  ctx.closePath();
};
/**
 * _drawCircle - Draws a circle within the clicked tile
 * using the GameTile object's number for calculating position.
 * @param {number} tileNo 
 */
GameBoard.prototype._drawCircle = function(tileNo) {
  let  tile, top, left;
  tile = this.tiles[tileNo];
  // Remove offset, drawing with context starts at P(0,0)
  top = tile.position.top - offTop + tile.dimensions.h / 2;
  left = tile.position.left - offLeft + tile.dimensions.w / 2;
  // Draw circle
  ctx.beginPath();
  ctx.lineWidth = 15;
  ctx.arc(left, top, tile.dimensions.h / 3 , 0, 360);
  ctx.stroke();
  ctx.closePath();
};
/**
 * _drawX - Draws an 'X' within the clicked tile using
 * the GameTile object's number for calculating position.
 * @param {number} tileNo
 */
GameBoard.prototype._drawX = function(tileNo) {
    let tile, top, left, bottom, right, legAlter;
    tile = this.tiles[tileNo];
    // Shorten legs for the drawn 'X'
    legAlter = Math.floor(tile.dimensions.h * (1/6));
    // Remove offset, drawing with context starts at P(0,0)
    top = tile.position.top - offTop + legAlter;
    left = tile.position.left - offLeft + legAlter;
    bottom = tile.position.bottom - offTop - legAlter;
    right = tile.position.right - offLeft - legAlter;
    // Draw X
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.moveTo(left, top);
    ctx.lineTo(right, bottom);
    ctx.stroke();
    ctx.moveTo(right, top);
    ctx.lineTo(left, bottom);
    ctx.stroke();
    ctx.closePath();
};
/**
 * _positionTiles - populate tiles array with new 
 * GameTile objects.
 */
GameBoard.prototype._positionTiles = function() {
  for (let i = 0; i < 9; i++) {
    let gameTile = new GameTile(this, i);
    this.tiles.push(gameTile);
  };
};
/**
 * canvasClickedEvent - performs an action depending on location
 * of click and current state of game.
 */
GameBoard.prototype.canvasClickedEvent = function (event) {
  "use strict"
  let [x, y] = [event['x'], event['y']];
  console.log(x, y);
  console.log(this);
  let columns, rows;
  columns = {
    "1": (x >= this.tiles[0].position.left) && (x <= this.tiles[0].position.right),
    "2": (x >= this.tiles[1].position.left) && (x <= this.tiles[1].position.right),
    "3": (x >= this.tiles[2].position.left) && (x <= this.tiles[2].position.right)
  };
  rows = {
    "1": (y >= this.tiles[0].position.top) && (y <= this.tiles[0].position.bottom),
    "2": (y >= this.tiles[3].position.top) && (y <= this.tiles[3].position.bottom),
    "3": (y >= this.tiles[6].position.top) && (y <= this.tiles[6].position.bottom)
  };
  if (columns[1]) {
    if (rows[1]) {
      console.log("You have clicked the top-left square!");
      this._drawCircle(0);
    } else if (rows[2]) {
        console.log("You have clicked the middle-left square!");
      this._drawX(3);
    } else if (rows[3]) {
        console.log("You have clicked the bottom-left square!");
      this._drawCircle(6);
    } else {
        console.log("Did not click a tile!");
    };
  } else if (columns[2])  {
      if (rows[1]) {
        console.log("You have clicked the top-center square!");
      this._drawX(1);
    } else if (rows[2]) {
        console.log("You have clicked the middle-center square!");
      this._drawCircle(4);
    } else if (rows[3]) {
        console.log("You have clicked the bottom-center square!");
      this._drawX(7);
    } else {
      console.log("Did not click a tile!");
    };
  } else if (columns[3]){
    if (rows[1]) {
      console.log("You have clicked the top-right square!");
      this._drawCircle(2);
    } else if (rows[2]) {
      console.log("You have clicked the middle-right square!");
      this._drawX(5);
    } else if (rows[3]) {
      console.log("You have clicked the bottom-right square!");
      this._drawCircle(8);
    } else {
      console.log("Did not click a tile!");
    };
  } else {
      console.log("Did not click a tile!");
  };
};
/**
 * clearBoard - clears gameboard of 'X's and 'O's
 */
GameBoard.prototype.clearBoard = function() {
  ctx.clearRect(0, 0, cWidth, cHeight);
  newGameBoard._drawLines();
};
// -----------> End of GameBoard C'tor <---------- 


// -----> GameTile constructor function < -------
/**
 * GameTile constructor function -
 * Takes tile number as an argument.
 * Tiles 0-8 to be initialized using
 * loop count variable. (Increasing 
 * left to right, top to bottom)
 * @constructor
 * @param {GameBoard} gameboard 
 * @param {number} tileNo 
 */
function GameTile(gameboard, tileNo) {
  this.tileNo = tileNo;
  this.gameboard = gameboard;
  this.factors = {
    "x": null,
    "y": null
  };
  this.position = {
    "top": null,
    "right": null,
    "bottom": null,
    "left": null
  };
  this.dimensions = {
    "h": null,
    "w": null
  };
  this._initializeObj();
};
/**
 * _initializeObj - 
 * Initialize GameTile object
 */
GameTile.prototype._initializeObj = function() {
  this._setFactors();
  this._setDimensions();
  this._setPosition();
};
/**
 * updateTile -
 * Needs to be called when/if canvas resizes
 */
GameTile.prototype.updateTile = function() {
  this._setDimensions();
  this._setPosition();
};
/**
 * _setPosition -
 * Sets positions of the GameTile object's sides
 */
GameTile.prototype._setPosition = function() {
  if (this.dimensions.h !== null && this.dimensions.w !== null) {
    this.position.top = Math.floor(
      offTop + (this.gameboard.dimensions.h * (1/3) * this.factors.y)
      );
    this.position.left = Math.floor(
      offLeft + (this.gameboard.dimensions.w * (1/3) * this.factors.x)
      );
    this.position.right = Math.floor(
      this.position.left + this.dimensions.w
      );
    this.position.bottom = Math.floor(
      this.position.top + this.dimensions.h
      );
  };    
};
/**
 * _setDimensions -
 * Sets dimensions of GameTile object, height and width
 */
GameTile.prototype._setDimensions = function() {
  this.dimensions.h = Math.floor(this.gameboard.dimensions.h * (1/3));
  this.dimensions.w = Math.floor(this.gameboard.dimensions.w * (1/3));
};
/**
 * _setFactors - Sets the factors to multiply GameTile position calculations
 * by, to easily set the measurements for tiles in rows/columns 
 * 2 and 3
 */
GameTile.prototype._setFactors = function() {
  if (this.tileNo >= 0) {
    // set x factor
    switch(this.tileNo) {
      case(0):
      case(3):
      case(6):
        this.factors.x = 0;
        break;
      case(1):
      case(4):
      case(7):
        this.factors.x = 1;
        break;
      case(2):
      case(5):
      case(8):
        this.factors.x = 2;
        break;
    };
    // Set y factor
    switch(this.tileNo) {
      case(0):
      case(1):
      case(2):
        this.factors.y = 0;
        break;
      case(3):
      case(4):
      case(5):
        this.factors.y = 1;
        break;
      case(6):
      case(7):
      case(8):
        this.factors.y = 2;
    };
  } else {
    throw Error(`Error: 'tic-tac-toe.js' > 'GameTile._setFactors()'\n` +
                 `'tileNo' not set. Pass in index of array when tiles are created by\n` +
                 `GameBoard.`);
  }
};
// -----> End of GameTile C'tor < -------

let clicks = 0;
// Testing ongoing development
let newGameBoard = new GameBoard();



