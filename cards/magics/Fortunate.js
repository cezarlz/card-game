let Magic = require('./Magic');

module.exports = class FortunateMagic extends Magic {
  constructor() {
    super({
      type: 'magic'
    });
  }
};
