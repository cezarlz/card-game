// Players
const Player = require('./players/Player');

// Cards
const BlackGladiator = require('./cards/heroes/BlackGladiator');

// Battle
const Battle = require('./battle/Battle');

let mockDeck = [];
for (let i = 0; i < 40; i++) {
  mockDeck.push(new BlackGladiator);
}

let playerOne = new Player({
  firstName: 'Cezar',
  lastName: 'Luiz',
  nickname: 'Dirtyphonicz',
  age: 23,
  deck: mockDeck.slice(mockDeck)
});

let playerTwo = new Player({
  firstName: 'Joao',
  lastName: 'Luiz',
  nickname: 'Joaozinho123',
  age: 14,
  deck: mockDeck.slice(mockDeck)
});

let battle = new Battle({
  players: [playerOne, playerTwo]
});

battle.starts();

battle.buyCards(1, 0);
battle.drawCard(0, 0); // P1

battle.buyCards(1, 1);
battle.drawCard(0, 0); // P2

battle.buyCards(1, 0);
battle.drawCard(1, 1); // P1
battle.attackTo(0, 0, 0); // Target Index Field Monster, With Monster, Using this Skill
battle.closeTurn();

battle.buyCards(1, 1);
battle.drawCard(1, 1); // P2
battle.attackTo(0, 1, 0); // P2 Attack
battle.closeTurn();

battle.buyCards(1, 0);
battle.drawCard(2, 2); // P1
battle.attackTo(1, 2, 0);
// battle.buyCards(3, 0); // Buy cards to P1
battle.closeTurn();

let p1Life = battle.battle.players[0].life;
let p2Life = battle.battle.players[1].life;

console.log(battle.battle.players);
console.log(p1Life > p2Life ? 'P1 WINNER' : p2Life > p1Life ? 'P2 WINNER' : 'WE HAVE A DRAW');
