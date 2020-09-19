/*
Script: tic-tac-toe.js
Author: Nathan Stevenson
Description: Tic-tac-toe game, featuring a repeatable game of
tic-tac-toe with a GUI.

Work in progress...
*/
"use strict";

// ================================
//         GAMEMASTER CLASS
// ================================
/**
 * Track the state of the Tic-Tac-Toe game.
 * @typedef {object} GameMaster
 */
class GameMaster {
  /**
   * Create GameBoard and Tiles objects and
   * load Tiles into GameBoard.
   * @param {string} HtmlCanvasElementID
   */
  constructor(HtmlCanvasElementID) {
    // Get canvas and context
    this.canvas = document.getElementById(HtmlCanvasElementID);
    this.ctx = this.canvas.getContext("2d");
    // Create GameBoard and Tiles objects
    this.gameBoard = new GameBoard(this.canvas);
    this.tiles = new Tiles(this.gameBoard);
    this.gameBoard.loadTiles(this.tiles);
    console.log(this.gameBoard.tiles);
  }
}
// []============================[]
//      END OF GAMEMASTER CLASS
// []============================[]

// ================================
//         GAMEBOARD CLASS
// ================================
/**
 * Tic-Tac-Toe gameboard used to track and manage the gameboard
 * state.
 * @typedef {object} GameBoard
 * @todo add functionality: track which rows, columns, diagonals
 *       are full and if they are occupied by 3-of-a-kind
 */
class GameBoard {
  /**
   * Initialize gameboard properties and draw board on canvas.
   * @param {HTMLCanvasElement} HtmlCanvasElement
   */
  constructor(HtmlCanvasElement) {
    this.name = "GameBoard";
    this.canvas = HtmlCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.cHeight = this.canvas.clientHeight;
    this.cWidth = this.canvas.clientWidth;
    this.lines = {
      h1: {},
      h2: {},
      v1: {},
      v2: {},
    };
    this.tiles; // Tiles collection object
    this._init();
  }
  // --------------------------------
  //              METHODS
  // --------------------------------
  // ----- PRIVATE METHODS -----
  /**
   * Initialize GameBoard object and draw
   * representation on canvas element.
   */
  _init() {
    this._setLines();
    this._drawLines();
    // Event Listeners
    window.addEventListener("resize", this._handleCanvasResize.bind(this));
    this.canvas.addEventListener("click", this._canvasClickedEvent.bind(this));
  }
  /**
   * Set the endpoints of the gameboard's lines.
   */
  _setLines() {
    this.lines.v1 = {
      xStart: Math.floor(this.cWidth * (1 / 3)),
      xEnd: Math.floor(this.cWidth * (1 / 3)),
      yStart: 0,
      yEnd: this.cHeight,
    };
    this.lines.v2 = {
      xStart: Math.floor(this.cWidth * (2 / 3)),
      xEnd: Math.floor(this.cWidth * (2 / 3)),
      yStart: 0,
      yEnd: this.cHeight,
    };
    this.lines.h1 = {
      xStart: 0,
      xEnd: this.cWidth,
      yStart: Math.floor(this.cHeight * (1 / 3)),
      yEnd: Math.floor(this.cHeight * (1 / 3)),
    };
    this.lines.h2 = {
      xStart: 0,
      xEnd: this.cWidth,
      yStart: Math.floor(this.cHeight * (2 / 3)),
      yEnd: Math.floor(this.cHeight * (2 / 3)),
    };
  }
  /**
   * Draw lines on canvas using line objects'
   * endpoints.
   */
  _drawLines() {
    let { v1, v2, h1, h2 } = this.lines;
    this.ctx.beginPath();
    this.ctx.lineWidth = 10;
    for (let line of Array.of(v1, v2, h1, h2)) {
      this.ctx.moveTo(line.xStart, line.yStart);
      this.ctx.lineTo(line.xEnd, line.yEnd);
      this.ctx.stroke();
    }
    this.ctx.closePath();
  }
  /**
   * Draw a circle within the clicked tile
   * using the tile object's number for calculating
   * position.
   * @param {number} tileNo
   */
  _drawCircle(tileNo) {
    let left, offX, offY, tile, top;
    [offX, offY] = [this.canvas.offsetLeft, this.canvas.offsetTop];
    tile = this.tiles.tiles[tileNo];
    // Remove offset, drawing with context starts at P(0,0)
    top = tile.position.top - offY + tile.dimensions.h / 2;
    left = tile.position.left - offX + tile.dimensions.w / 2;
    // Draw circle
    this.ctx.beginPath();
    this.ctx.lineWidth = 15;
    this.ctx.arc(left, top, tile.dimensions.h / 3, 0, 360);
    this.ctx.stroke();
    this.ctx.closePath();
  }
  /**
   * Draw an 'X' within the clicked tile using
   * the tile object's number for calculating
   * position.
   * @param {number} tileNo
   */
  _drawX(tileNo) {
    let bottom, left, legAlter, offX, offY, right, tile, top;
    [offX, offY] = [this.canvas.offsetLeft, this.canvas.offsetTop];
    tile = this.tiles.tiles[tileNo];
    // Shorten legs for the drawn 'X'
    legAlter = Math.floor(tile.dimensions.h * (1 / 6));
    // Remove offset, drawing with context starts at P(0,0)
    top = tile.position.top - offY + legAlter;
    left = tile.position.left - offX + legAlter;
    bottom = tile.position.bottom - offY - legAlter;
    right = tile.position.right - offX - legAlter;
    // Draw X
    this.ctx.beginPath();
    this.ctx.lineWidth = 15;
    this.ctx.moveTo(left, top);
    this.ctx.lineTo(right, bottom);
    this.ctx.stroke();
    this.ctx.moveTo(right, top);
    this.ctx.lineTo(left, bottom);
    this.ctx.stroke();
    this.ctx.closePath();
  }
  // ----- PUBLIC METHODS -----
  /**
   * Clear the gameboard of player occupancy.
   */
  clearBoard() {
    this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);
    this._drawLines();
  }
  /**
   * Load Tiles object into GameBoard object.
   * @param {Tiles} tiles
   */
  loadTiles(tiles) {
    this.tiles = tiles;
  }
  // --------------------------------
  //         END OF METHODS
  // --------------------------------
  // --------------------------------
  //             EVENTS
  // --------------------------------
  /**
   * Perform an action depending on location
   * of click and current state of game.
   * @param {event} event
   */
  _canvasClickedEvent(event) {
    let [x, y] = [event["pageX"], event["pageY"]];
    // 'pageX' and 'pageY' instead of 'x' and 'y'
    // so clicks are relative to the edge of the
    // document instead of the browser/view (resolved
    // scrolling issue)
    console.log(x, y);
    let columns, rows;
    let tiles = this.tiles.tiles;
    console.log(tiles);
    columns = {
      1: x >= tiles[0].position.left && x <= tiles[0].position.right,
      2: x >= tiles[1].position.left && x <= tiles[1].position.right,
      3: x >= tiles[2].position.left && x <= tiles[2].position.right,
    };
    rows = {
      1: y >= tiles[0].position.top && y <= tiles[0].position.bottom,
      2: y >= tiles[3].position.top && y <= tiles[3].position.bottom,
      3: y >= tiles[6].position.top && y <= tiles[6].position.bottom,
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
      }
    } else if (columns[2]) {
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
      }
    } else if (columns[3]) {
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
      }
    } else {
      console.log("Did not click a tile!");
    }
  }
  /**
   * Ensure that mouse clicks register in the right
   * tile after the viewport has been resized.
   */
  _handleCanvasResize() {
    this.tiles.updateTiles();
  }
  // --------------------------------
  //          END OF EVENTS
  // --------------------------------
}
// []============================[]
//      END OF GAMEBOARD CLASS
// []============================[]

// ================================
//           TILES CLASS
// ================================
/**
 * A collection of tiles for use with the
 * Tic-Tac-Toe gameboard.
 * @typedef Tiles
 * @todo add functionality: ability to track which tiles are occupied
 *       by a player's 'X' or 'O'. and which player the tile belongs to.
 */
class Tiles {
  /**
   * Initialize Tiles object with 9
   * tiles for the gameboard in its
   * collection.
   */
  constructor(gameboard) {
    this.gameboard = gameboard;
    this.canvas = this.gameboard.canvas;
    this.tiles = [];
    this._newTile = () => {
      return {
        tileNo: 5,
        gameboard: null,
        marked: false,
        owner: null,
        factors: {
          x: null,
          y: null,
        },
        position: {
          top: null,
          right: null,
          bottom: null,
          right: null,
        },
        dimensions: {
          h: null,
          w: null,
        },
      };
    };
    this._initTiles();
  }
  // ------ ITERATION
  [Symbol.iterator]() {
    return this.iterator();
  }
  *iterator() {
    for (let tile of this.tiles) {
      yield tile;
    }
  }
  // --------------------------------
  //              METHODS
  // --------------------------------
  // ------- PRIVATE METHODS -------
  /**
   * Create the tiles for the Tiles collection
   * object, number them, associate them with
   * the GameBoard oject they are used in and
   * push them to the internalarray.
   */
  _initTiles() {
    for (let i = 0; i < 9; i++) {
      let newTile = this._newTile();
      newTile.gameboard = this.gameboard;
      newTile.tileNo = this.tiles.length;
      this.tiles.push(newTile);
    }
    this._setFactors();
    this.updateTiles();
  }
  /**
   * Set dimensions of a single tile, height and width,
   * based off of the current canvas dimensions.
   * @param {object} tile
   */
  _setDimensions(tile) {
    let h = Math.floor(this.canvas.clientHeight * (1 / 3));
    let w = Math.floor(this.canvas.clientWidth * (1 / 3));
    tile.dimensions = { h: h, w: w };
  }
  /**
   *  Set multiplyers for calculating
   *  tile position based on the tile's
   *  row and column.
   */
  _setFactors() {
    for (let tile of this.tiles) {
      if (tile.tileNo >= 0) {
        // set x factor
        switch (tile.tileNo) {
          case 0:
          case 3:
          case 6:
            tile.factors.x = 0;
            break;
          case 1:
          case 4:
          case 7:
            tile.factors.x = 1;
            break;
          case 2:
          case 5:
          case 8:
            tile.factors.x = 2;
        }
        // Set y factor
        switch (tile.tileNo) {
          case 0:
          case 1:
          case 2:
            tile.factors.y = 0;
            break;
          case 3:
          case 4:
          case 5:
            tile.factors.y = 1;
            break;
          case 6:
          case 7:
          case 8:
            tile.factors.y = 2;
        }
      }
    }
  }
  /**
   * Set position of a single tile; top, right
   * bottom and left, based off current canvas offsets
   * and dimensions.
   * @param {object} tile
   */
  _setPosition(tile) {
    let [offX, offY] = [this.canvas.offsetLeft, this.canvas.offsetTop];
    let [cHeight, cWidth] = [this.canvas.clientHeight, this.canvas.clientWidth];
    let top = Math.floor(offY + cHeight * (1 / 3) * tile.factors.y);
    let left = Math.floor(offX + cWidth * (1 / 3) * tile.factors.x);
    let right = Math.floor(left + tile.dimensions.w);
    let bottom = Math.floor(top + tile.dimensions.h);
    tile.position = {
      top: top,
      right: right,
      bottom: bottom,
      left: left,
    };
  }
  // ------- PUBLIC METHODS -------
  /**
   * Update dimensions and position of all tiles
   * in the collection.
   */
  updateTiles() {
    for (let i = 0; i < this.tiles.length; i++) {
      this._setDimensions(this.tiles[i]);
      this._setPosition(this.tiles[i]);
    }
  }
}
// []============================[]
//        END OF TILES CLASS
// []============================[]

// ============================================================
// ============================================================
//                      BEGIN TESTING
// ============================================================

let gMaster = new GameMaster("my-canvas");
