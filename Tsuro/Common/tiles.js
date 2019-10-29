const fs = require('fs');
const path = require('path');
const D3Node = require('d3-node');
const { COLORS, DIRECTIONS, DIRECTIONS_CLOCKWISE } = require('./utils/constants');
require('./utils/polyfills');

const STYLES = `
  .background, .port {
    stroke: ${COLORS.BLACK};
    stroke-width: 1;
  }

  .background {
    fill: ${COLORS.GRAY};
  }

  .port {
    fill: ${COLORS.WHITE};
  }

  .path {
    fill: none;
    stroke: ${COLORS.BLACK};
    stroke-width: 3;
  }
`;

class Tile {
  /**
   * Creates a new Tile, with the given paths.
   *
   * @param {Path[]} paths the paths of the tile
   */
  constructor(paths) {
    this.d3Node = new D3Node({ styles: STYLES });
    this.d3 = this.d3Node.d3;

    this.paths = paths;
  }

  /**
   * Returns a new copy of this tile.
   *
   * @param {number} [rotations] rotations to perform on the new copy
   * @returns {Tile} a copy of this tile
   */
  copy(rotations = 0) {
    const tileCopy = new Tile(this.paths.map(path => path.copy()));
    if (rotations > 0) {
      tileCopy.rotate(rotations);
    }
    return tileCopy;
  }

  /**
   * Gets the ending position of the given starting position on the tile.
   *
   * @param {Position} position the chosen starting position
   * @returns {Position} the respective ending position
   */
  getEndingPosition(position) {
    return this.paths.first(path => path.getEndingPosition(position));
  }

  /**
   * Checks exact match on pathways between this tile and the given one.
   *
   * @param {Tile} tile the tile to check equality against
   * @returns {boolean} whether the given tile is equal to this one
   */
  isEqualTo(tile) {
    return this.paths.every(path => tile.paths.some(otherPath => otherPath.isEqualTo(path)));
  }

  /**
   * Checks the equality of this tile versus the given, allowing for a
   * difference in rotations.
   *
   * @param {Tile} tile the tile to check equality against
   * @returns {boolean} whether the given tile is equal to this one
   */
  isEqualToRotated(tile) {
    return (
      this.isEqualTo(tile) ||
      this.isEqualTo(tile.copy(1)) ||
      this.isEqualTo(tile.copy(2)) ||
      this.isEqualTo(tile.copy(3))
    );
  }

  /**
   * Rotates the tile 90 degrees clockwise per number of
   * rotations given.
   *
   * @param {number} rotations the amount of 90-degree
   * clockwise rotations to perform
   */
  rotate(rotations) {
    const actualRotations = rotations % DIRECTIONS_CLOCKWISE.length;
    if (actualRotations > 0) {
      this.paths = this.paths.map(path => {
        path.rotate(actualRotations);
        return path;
      });
    }
  }

  ///////////////////////////////////
  // RENDER FUNCTIONS
  ///////////////////////////////////

  /**
   * Gets the linear scale for rendering on a single tile.
   *
   * @param {number} min the minimum point of the range
   * @param {number} size the size of the tile
   * @returns {d3.ScaleLinear<number, number>} the linear scale
   * of a given axis, from 0 to 1
   */
  _getRenderScale(min, size) {
    return this.d3
      .scaleLinear()
      .domain([0, 1])
      .range([min, min + size]);
  }

  /**
   * Renders a tile to the given D3 selection with the given
   * parameters.
   *
   * @param {d3.Selection} selection the current D3 selection
   * @param {number} x the starting X position
   * @param {number} y  the starting Y position
   * @param {number} size  the total size of the tile
   * (equivalent to width or height)
   */
  render(selection, x, y, size) {
    const scaleX = this._getRenderScale(x, size);
    const scaleY = this._getRenderScale(y, size);

    const PORT_POINTS = {
      [DIRECTIONS.NORTH]: [[1 / 3, 0], [2 / 3, 0]],
      [DIRECTIONS.EAST]: [[1, 1 / 3], [1, 2 / 3]],
      [DIRECTIONS.SOUTH]: [[2 / 3, 1], [1 / 3, 1]],
      [DIRECTIONS.WEST]: [[0, 2 / 3], [0, 1 / 3]],
    };

    const group = selection.append('g');

    /**
     * Renders the tile's background.
     */
    const renderBackground = () => {
      group
        .append('rect')
        .attr('class', 'background')
        .attr('x', x)
        .attr('y', y)
        .attr('width', size)
        .attr('height', size);
    };

    /**
     * Renders a path from a given starting point to a given
     * ending point.
     *
     * @param {number[]} start The starting point of the path
     * @param {number[]} end The ending point of the path
     * @param {string} color The color of the path
     */
    const renderPath = (start, end) => {
      /**
       * Gets the draw commands for an svg `path` from an array of
       * points. It draws a path using a basis curve.
       *
       * @param {number[][]} points an array of points to convert
       * to draw commands
       * @returns {string} the draw commands to pass to the `d`
       * attribute of a path
       */
      const getDrawCommands = this.d3
        .line()
        .x(([x]) => scaleX(x))
        .y(([, y]) => scaleY(y))
        .curve(this.d3.curveBasis);

      /**
       * Gets the mid points of a path. This is used to achieve
       * smoothly curved lines that blend into adjacent tiles.
       *
       * @returns {number[][]} an array of mid points
       */
      const getMidPoints = () => {
        let [midX1, midY1] = start;
        let [midX2, midY2] = end;

        /**
         * Gets the closest quarter value. If the value is 1, it'll
         * return 0.75; otherwise, it'll return 0.25.
         *
         * @param {number} val the value to check
         * @returns {number} the closest quarter value
         */
        const getClosestQuarterValue = val => (val === 1 ? 0.75 : 0.25);

        /**
         * Checks if value is 0 or 1, on a scale from 0 to 1.
         *
         * @param {number} val the value to check
         * @returns {boolean} whether value is 0 or 1
         */
        const isZeroOrOne = val => val % 1 === 0;

        if (midY1 === midY2 && isZeroOrOne(midY1)) {
          midY1 = midY2 = getClosestQuarterValue(midY1);
        } else if (isZeroOrOne(midX1) && isZeroOrOne(midX2)) {
          midX1 = getClosestQuarterValue(midX1);
          midX2 = getClosestQuarterValue(midX2);
        } else if (isZeroOrOne(midX1)) {
          midY2 = midY1;
        } else if (isZeroOrOne(midX2)) {
          midY1 = midY2;
        } else {
          midY1 = getClosestQuarterValue(midY1);
          midY2 = getClosestQuarterValue(midY2);
        }

        return [[midX1, midY1], [midX2, midY2]];
      };

      const points = [start, ...getMidPoints(), end];

      group
        .append('path')
        .attr('class', 'path')
        .attr('d', getDrawCommands(points));
    };

    /**
     * Renders a circle port on the tile.
     *
     * @param {number} x the x position of the port (from a
     * scale of 0 to 1)
     * @param {number} y the y position of the port (from a
     * scale of 0 to 1)
     */
    const renderPort = (x, y) => {
      group
        .append('circle')
        .attr('class', 'port')
        .attr('cx', scaleX(x))
        .attr('cy', scaleY(y))
        .attr('r', Math.min(size * 0.025, 8));
    };

    // Renders background
    renderBackground();

    // Renders paths
    this.paths.forEach(path => {
      const startPoint = PORT_POINTS[path.start.direction][path.start.port];
      const endPoint = PORT_POINTS[path.end.direction][path.end.port];
      renderPath(startPoint, endPoint);
    });

    // Renders ports
    Object.keys(PORT_POINTS).forEach(direction => {
      PORT_POINTS[direction].forEach(([x, y]) => {
        renderPort(x, y);
      });
    });
  }

  /**
   * Renders a tile to the render directory, given a filename.
   *
   * @param {string} fileName the name of the file (sans extension)
   * @param {string} size the size of the image
   */
  renderToFile(fileName, size = 250) {
    const svg = this.d3Node.createSVG(size, size);

    const padding = size * 0.05;
    this.render(svg, padding, padding, size - 2 * padding);

    const RENDER_DIR = path.resolve(__dirname, '..', '1');
    const svgFile = fs.createWriteStream(path.resolve(RENDER_DIR, `${fileName}.svg`));
    svgFile.write(this.d3Node.svgString());
    svgFile.end();
  }
}

module.exports = Tile;