let Card = require('../Card');

// Skils
let NormalAttack = require('../skills/NormalAttack');


class Hero extends Card {
  constructor(hero = {}, battle = {}) {
    super(Card.TYPES.HERO);

    this.card = Object.assign({}, {
      attack: 1000,
      defense: 500,
      skills: [new NormalAttack]
    }, hero);
  }

  changePosition(position = '') {
    console.log('Changing position', position);

    if (position.match(/^(attack|defense)$/) !== null)
      return this.battle.position = position;

    throw new Error('The position must be "attack" or "defense".');
  }

  getPosition() {
    return this.battle.position;
  }

  changeFace(face = '') {
    console.log('Changing Face', face);

    if (face.match(/^(up|down)$/) !== null)
      return this.battle.face = face;

    throw new Error('The face must be "up" or "down".');
  }

  getFace() {
    return this.battle.face;
  }
}

Hero.RACES = {
  HUMAN: 'Human',
  ELF: 'Elf',
  ORC: 'Orc',
  GOD: 'God'
};

Hero.CLASSES = {
  KNIGHT: 'Knight',
  ARCHER: 'Archer',
  MAGE: 'Mage',
  DRUID: 'Druid',
  GUARDIAN: 'Guardian',
  NECROMANCER: 'Necromancer'
};

module.exports = Hero;
