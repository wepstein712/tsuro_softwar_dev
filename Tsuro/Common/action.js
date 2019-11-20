class Action {
  /**
   *
   * @param {Tile} tile
   * @param {Coords} coords
   */
  constructor(tile, coords) {
    this.tile = tile;
    this.coords = coords;
  }

  toJson() {
    return {
      tile: this.tile.index,
      coords: this.coords,
    };
  }
}

class InitialAction extends Action {
  /**
   *
   * @param {Tile} tile
   * @param {Coords} coords
   * @param {Position} position
   */
  constructor(tile, coords, position) {
    super(tile, coords);
    this.position = position;
  }

  toJson() {
    const json = super.toJson();
    return Object.assign(json, { position: this.position });
  }
}

class IntermediateAction extends Action {}

exports.InitialAction = InitialAction;
exports.IntermediateAction = IntermediateAction;
