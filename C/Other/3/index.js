const Handler = require("./Handler");
const InputParser = require("./InputParser");
const getInput = require("./getInput.js");

/**
 * Inits a parser and handler to read task 3 JSON inputs. Parses at EOF.
 */
const main = () => {
  try {
    getInput().then(input => {
      const inputParser = new InputParser();
      const items = inputParser.parse(input);
      const handler = new Handler();
      items.forEach(handler.handle);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

module.exports = main;
