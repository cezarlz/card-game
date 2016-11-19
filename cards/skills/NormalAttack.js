let Skill = require('./Skill');

module.exports = class NormalAttack extends Skill {
  constructor() {
    super({
      number: 1,
      name: 'Normal Attack',
      description: 'A punch on your face!',
      level: 'normal',
      type: 'physical',
      power: 0.3,
      powerUpAgainst: [],
      powerDownAgainst: []
    });
  }
}
