let BlackGladiator = require('../cards/heroes/BlackGladiator');

let mockDeck = [];
for (let i = 0; i < 40; i++) {
  mockDeck.push(new BlackGladiator);
}

module.exports = class Player {
  constructor(player = {}) {
    this.player = Object.assign({}, {
      nickname: String(parseInt(Math.random() * 9999999)),
      firstName: '',
      lastName: '',
      age: 18,
      country: 'Brazil',
      deck: mockDeck.slice(mockDeck),
      battles: {
        win: 0,
        lose: 0,
        draw: 0
      },
      stars: 0,
      level: 0,
      connected: false
    }, player);
  }

  loadDeck(deck = []) {
    return this.player.deck = deck;
  }

  canPlay() {
    return this.player.deck.length == 40;
  }
}
