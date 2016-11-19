class Card {
  constructor(type = '') {
    this.type = type;
  }
}

Card.TYPES = {
  HERO: 'Hero',
  MAGIC: 'Magic',
  BUFF: 'Buff',
  TRAP: 'Trap',
  SKILL: 'Skill'
};

module.exports = Card;
