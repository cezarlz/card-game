let Card = require('../Card');

module.exports = class Skill extends Card {
  constructor(skill = {}) {
    super(Card.TYPES.SKILL);

    this.card = skill;
  }
}
