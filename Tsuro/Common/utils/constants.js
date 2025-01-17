exports.BOARD_SIZE = 10;

exports.COLORS = {
  BLACK: 'black',
  BLUE: 'blue',
  GREEN: 'green',
  RED: 'red',
  WHITE: 'white',
};

exports.DEFAULT_CONN = {
  IP_ADDRESS: '127.0.0.1',
  PORT: 8000,
};

const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
};
exports.DIRECTIONS = DIRECTIONS;

exports.DIRECTIONS_CLOCKWISE = [
  DIRECTIONS.NORTH,
  DIRECTIONS.EAST,
  DIRECTIONS.SOUTH,
  DIRECTIONS.WEST,
];

exports.GAME_STATUS = {
  WAITING: 0,
  CURRENT_TURN: 1,
  GAME_OVER: 2,
};

const LETTERS = 'ABCDEFGH'.split('');
exports.LETTERS = LETTERS;

exports.LETTERS_MAP = LETTERS.reduce(
  (acc, letter, i) =>
    Object.assign(acc, {
      [letter]: i,
    }),
  {}
);

exports.MESSAGE_ACTIONS = {
  SET_UNIQUE_NAME: 'set_unique_name',
  SET_COLOR: 'set_color',
  TURN_STATUS: 'is_turn',
  DEAL_HAND: 'new_hand',
  PROMPT_FOR_ACTION: 'request_action',
  CLEAR_HAND: 'dump_hand',
  REMOVE_PLAYER: 'lose',
  UPDATE_STATE: 'update_view',
  GAME_OVER: 'game_over',
  DENY_ENTRY: 'fail_conn',
  REGISTER_CLIENT: 'register',
  SEND_ACTION: 'submit_action',
  INVALID_JSON: 'invalid_json',
  UNKNOWN_ACTION: 'unknown_action',
  INVALID_ID: 'invalid_id',
  UNKNOWN_STRAT: 'unknown_strat',
};

exports.PLAYER_POOL_SIZE = {
  MIN: 3,
  MAX: 5,
};

exports.PORTS = {
  ZERO: 0,
  ONE: 1,
};

exports.SECOND = 1000;

exports.STRATEGIES = {
  DUMB: 'dumb',
  LONELY: 'lonely',
};
