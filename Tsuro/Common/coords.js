const { BOARD_SIZE, DIRECTIONS } = require('./utils/constants');

class Coords {
  /**
   * Creates a new Coords object.
   *
   * @param {number} x the x coordinate
   * @param {number} y the y coordinate
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this._updateHash();
  }

  /**
   * Creates a new copy of this Coords.
   *
   * @returns {Coords} a copy of this Coords
   */
  copy() {
    return new Coords(this.x, this.y);
  }

  /**
   * Gets the hash for this Coords.
   *
   * @returns {string} the hash for this Coords
   */
  getHash() {
    return this._hash;
  }

  /**
   * @private
   * Checks whether the given value is valid as a single
   * coordinate value.
   *
   * @param {number} value the value to check
   * @returns {boolean} whether the coordinate value is valid
   */
  _isValidCoordinate(value) {
    return value >= 0 && value < BOARD_SIZE;
  }

  /**
   * @private
   * Moves the coordinates along a single axis by the given value.
   *
   * @param {number} value the value to move by
   * @param {boolean} isHorizontalMove whether the move occurs along
   * the x-axis
   * @param {boolean} isPositive whether move is positive (increase)
   */
  _moveAlongAxis(value, isHorizontalMove, isPositive) {
    const key = isHorizontalMove ? 'x' : 'y';
    const multiplier = isPositive ? 1 : -1;
    const newVal = this[key] + multiplier * value;
    if (!this._isValidCoordinate(newVal)) {
      throw 'Cannot move this way';
    }
    this[key] = newVal;
  }

  /**
   * Moves this Coords in a given direction for a given value.
   *
   * @param {string} direction the direction to move
   * @param {number} value a positive value to move by
   * @returns {Coords} this Coords, moved
   */
  move(direction, value) {
    if (value < 0) {
      throw 'Value must be positive';
    } else if (value > 0) {
      if (direction === DIRECTIONS.NORTH || direction === DIRECTIONS.SOUTH) {
        this._moveAlongAxis(value, false, direction === DIRECTIONS.SOUTH);
      } else if (direction === DIRECTIONS.EAST || direction === DIRECTIONS.WEST) {
        this._moveAlongAxis(value, true, direction === DIRECTIONS.EAST);
      } else {
        throw 'Invalid direction';
      }
    }
    this._updateHash();
    return this;
  }

  /**
   * Moves this Coords in a given direction by one.
   *
   * @param {string} direction the direction to move
   * @returns {Coords} this Coords, moved
   */
  moveOne(direction) {
    return this.move(direction, 1);
  }

  /**
   * Computes the euclidean distance between two points in 2 dimensional space.
   *
   * @param {Coords} coord1 The coordinate on a cartesian plane of a point
   * @param {Coords} coord2 The coordinate on a cartesian plane of a point
   * @returns {number} the euclidean distance between the given 2 points.
   */
  static euclideanDistance(coord1, coord2) {
    return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2));
  }

  /**
   * Checks the equality of this coords and the given one.
   *
   * @param {Coords} coords the Coords to check equality against
   * @returns {boolean} whether the given coords is equal to this one
   */
  isEqualTo(coords) {
    return this.x === coords.x && this.y === coords.y;
  }

  /**
   * @private
   * Updates the hash for this Coords when the x and/or
   * y position changes.
   */
  _updateHash() {
    this._hash = `${this.x}${this.y}`;
  }

  /**
   * Converts this Coords object into JSON to be sent over
   * a TCP server connection.
   *
   * @returns {object} a JSON-ified Coords object
   */
  toJson() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  /**
   * @static
   * Creates a new Coords object from the JSON-ified version.
   *
   * @param {object} json the JSON-ified Coords object, as
   * created by the `toJson` method.
   */
  static fromJson(json) {
    const { x, y } = json;
    return new Coords(x, y);
  }
}

module.exports = Coords;
