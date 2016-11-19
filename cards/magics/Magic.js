let Card = require('../Card');

module.exports = class Magic extends Card {
  constructor() {
    super(Card.TYPES.MAGIC);
  }
};
