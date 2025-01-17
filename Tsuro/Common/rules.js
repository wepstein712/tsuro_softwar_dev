const Board = require('./board');

class RuleChecker {
  /**
   * Takes in the board state (boardState), the player who is acting (Player), and the (TilePlacement) and
   * checks whether that player can take a tilePlacement action. It must be a legal tilePlacement move and
   * then must be a valid tilePlacement option.
   *
   * @param {BoardState} boardState is a representation of the board and the current state of the game
   * @param {TilePlacement} tilePlacement is what is about to be done (eg. tile placement)
   * @param {Player} player is the player intending on the action
   * @returns {boolean} whether the action is valid
   */
  static canTakeAction(boardState, tilePlacement, player) {
    // Check if we can put the tile here
    if (this.checkPlacementLegality(boardState, tilePlacement, player)) {
      // Check the death cases of validity for this tile placement
      return this.checkHandValidity(boardState, tilePlacement, player);
    }

    return false;
  }

  /**
   * Returns whether the tilePlacement is a legal dropping zone for on the given board for the given player
   *
   * @param {BoardState} boardState is a representation of the board and the current state of the game
   * @param {TilePlacement} tilePlacement is what is about to be done (eg. tile placement)
   * @param {Player} player is the player intending on the action
   * @returns {boolean} whether the tile placement is legal for that player
   */
  static checkPlacementLegality(boardState, tilePlacement, player) {
    const avatar = boardState.getAvatar(player.id);
    // Make sure we have our avatar, make sure the tile is empty, and make sure it is adjacent to the player.
    return (
      avatar &&
      !boardState.getTile(tilePlacement.coords) &&
      this._checkPlayerAdjacency(avatar, tilePlacement) &&
      player.hand.some(tile => tile.isEqualToRotated(tilePlacement.tile))
    );
  }

  /**
   * Returns whether the tilePlacement is a valid move where it does not result in the given player's suicide on the
   * given board.
   *
   * @param {BoardState} boardState is a representation of the board and the current state of the game
   * @param {TilePlacement} tilePlacement is what is about to be done (eg. tile placement)
   * @param {Player} player is the player intending on the action
   * @returns {boolean} whether the tile placement is valid
   */
  static checkPlacementValidity(boardState, tilePlacement, player) {
    // Copy the board to test tile placement results
    const boardCopy = new Board(boardState.copy());
    boardCopy.placeTile(tilePlacement.tile, tilePlacement.coords);
    const avatarCopy = boardCopy.getAvatar(player.id);

    return !Board.isAvatarOnOutsidePosition(avatarCopy.coords, avatarCopy.position);
  }

  /**
   * Check whether the tile placement is valid and, if not, whether the player has any valid moves within their hand.
   *
   * @param {BoardState} boardState is a representation of the board and the current state of the game
   * @param {TilePlacement} tilePlacement is what is about to be done (eg. tile placement)
   * @param {Player} player is the player intending on the action
   * @returns {boolean} whether the player has a valid move in their hand
   */
  static checkHandValidity(boardState, tilePlacement, player) {
    if (this.checkPlacementValidity(boardState, tilePlacement, player)) {
      return true;
    }
    return this._doesPlayerHaveValidMove(boardState, tilePlacement.coords, player);
  }

  /**
   * Returns whether the the given tilePlacement is adjacent to the given avatar
   *
   * @param {Avatar} avatar The avatar on the board
   * @param {TilePlacement} tilePlacement is what is about to be done (eg. tile placement)
   * @returns {boolean} whether an avatar is adjacent to the tile placement
   * @private
   */
  static _checkPlayerAdjacency(avatar, tilePlacement) {
    if (!avatar) {
      return false;
    }
    const { coords, position } = avatar;
    try {
      const newCoords = coords.copy().moveOne(position.direction);
      return newCoords.isEqualTo(tilePlacement.coords);
    } catch (e) {
      return false;
    }
  }

  /**
   * Returns whether any tile in the given player's hand keeps the player alive if placed at the given coord.
   *
   * @param {BoardState} boardState is a representation of the board and the current state of the game
   * @param {Coordinates} coords where the tile will be placed
   * @param {Player} player is the player intending on the action
   * @returns {boolean} true if any one tile keeps the player alive, false if all cards lead to death
   */
  static _doesPlayerHaveValidMove(boardState, coords, player) {
    const { hand, id } = player;
    // For each tile in hand, test for a tile that keeps the player alive
    return hand.some(tile => {
      // Test all four rotations
      for (let j = 0; j < 4; j++) {
        const boardCopy = new Board(boardState.copy());
        const tileCopy = tile.copy(j);
        boardCopy.placeTile(tileCopy, coords);
        const avatarCopy = boardCopy.getAvatar(id);
        // If the player does not end up at the edge, they are alive return true
        if (!Board.isAvatarOnOutsidePosition(avatarCopy.coords, avatarCopy.position)) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Checks whether the given player (playerId) can place their avatar in the given position (position) at the tile (tile)
   * located at the given Coord (coords) at the start of the game.
   *
   * @param {BoardState} boardState is a representation of the board and the current state of the game
   * @param {string} playerId The player's ID
   * @param {Coords} coords the coordinates to place the avatar at
   * @param {Tile} tile the tile the avatar is attempting to be placed on
   * @param {Position} position the position the avatar is attempting to be set as
   * @returns {boolean} whether the player can place their avatar at that initial position at the start of the game
   */
  static canPlaceAvatar(boardState, playerId, coords, tile, position) {
    return (
      Board.isAvatarOnOutsidePosition(coords, position) && // On the edge of the board
      !boardState.getAvatar(playerId) && // The avatar has not been placed
      !boardState.getTile(coords) && // This tile space is empty
      !boardState.hasNeighboringTiles(coords) && // There are no neighbors
      this.checkIsMoveOnBoard(coords, tile, position) // The move stays on the board
    );
  }

  /**
   * Checks to see if a move would move the player off the edge of the board.
   * @param {Coords} coords the coordinates to place the avatar at
   * @param {Tile} tile the tile the avatar is attempting to be placed on
   * @param {Position} position the position the avatar is attempting to be set as
   * @returns {boolean} whether the tile at that coordinates would put the player off the edge of the board.
   */
  static checkIsMoveOnBoard(coords, tile, position) {
    const coordsCopy = coords.copy();
    const { direction } = tile.getEndingPosition(position);
    try {
      coordsCopy.moveOne(direction);
      return true;
    } catch (e) {
      return false;
    }
  }
}
module.exports = RuleChecker;
