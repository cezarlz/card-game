let Hero =  require('./Hero');
let NormalAttack =  require('../skills/NormalAttack');

module.exports = class BlackGladiator extends Hero {
  constructor() {
    let hero = {
      number: 1,
      level: 'normal',
      name: 'Black Gladiator',
      description: 'The oldest gladiator on old Earth',
      attack: 2000,
      defense: 1450,
      elixir: 3,
      race: Hero.RACES.HUMAN,
      class: Hero.CLASSES.KNIGHT,
      skills: [new NormalAttack]
    };

    super(hero);
  }
}
