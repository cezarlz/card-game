let shuffle = require('lodash/shuffle');

let GameConfig = require('../GameConfig');
let Card = require('../cards/Card');

class Battle {
  constructor(battle = {}, socket) {
    let defaults = {
      players: {},
      turn: 0,
      turns: [],
      startsAt: Date.now(),
      winner: false,
      field: {},
    };

    this.battle = Object.assign({}, defaults, battle);

    this.battle.field[battle.turns[0]] = [Array(5), Array(5)];
    this.battle.field[battle.turns[1]] = [Array(5), Array(5)];

    this.socket = socket;

    // TODO: Do the buffs, magics and traps works
  }

  starts() {
    this.startsConfigs();

    this.socket.emit('battle starts', this.battle);
  }

  startsConfigs() {
    let players = this.battle.players;

    Object.keys(players).forEach(userNickname => {
      let deck = players[userNickname].player.deck.slice();

      players[userNickname].player.deck = shuffle(deck);
      players[userNickname].player.cardsOnHand = players[userNickname].player.deck.splice(0, GameConfig.INITIAL_CARDS_ON_HAND);
      players[userNickname].player.graveyard = [];
      players[userNickname].life = GameConfig.MAX_LIFE;
      players[userNickname].elixir = GameConfig.INITIAL_ELIXIR;
    });
  }

  closeTurn() {
    this.getCurrentPlayer().elixir += 1;

    this.battle.turn += 1;

    this.socket.emit('battle updated', {
      type: Battle.UPDATES.CLOSE_TURN,
      payload: {
        battle: this.battle,
        currentPlayer: this.getCurrentPlayer(),
        turn: this.battle.turn
      }
    });
  }

  drawCard(data = {}) {
    console.log('Drawing a card:', data);

    let {player} = this.getCurrentPlayer();
    let card = player.cardsOnHand[data.cardIndex];

    player.cardsOnHand.splice(data.cardIndex, 1);

    this.socket.emit('battle updated', {
      type: Battle.UPDATES.DRAW_CARD,
      payload: {
        battle: this.battle,
        currentPlayer: this.getCurrentPlayer(),
        cardDrawed: card,
        fieldPosition: data.fieldPosition
      }
    });

    this.drawCardOnField({
      card,
      fieldPosition: data.fieldPosition
    });
  }

  drawCardOnField(data = {}) {
    console.log('Drawing a card on field:', data);

    let playerIndex = this.getCurrentPlayerIndex();
    let cardType = (data.card.type === Card.TYPES.HERO) ? 0 : 1;
    let field = this.battle.field[playerIndex][cardType];

    if (!this.isFieldFull()) {
      field[data.fieldPosition] = data.card;

      this.socket.emit('battle updated', {
        type: Battle.UPDATES.DRAW_CARD_ON_FIELD,
        payload: {
          battle: this.battle,
          currentPlayer: this.getCurrentPlayer(),
          cardDrawed: data.card,
          fieldPosition: data.fieldPosition
        }
      });
    }
    else {
      throw {
        message: 'You have 5 cards on field. Select a card to remove from field.',
        error: 'DROP_CARD_FROM_FIELD',
        player: this.getCurrentPlayer().player
      };
    }
  }

  removeCardOnField(destroyedCard, playerIndex, fieldPosition) {
    let cardType = (destroyedCard.type === Card.TYPES.HERO) ? 0 : 1;
    let field = this.battle.field[playerIndex][cardType];

    field.splice(fieldPosition, 1);

    this.socket.emit('battle updated', {
      type: Battle.UPDATES.REMOVE_CARD_ON_FIELD,
      payload: {
        battle: this.battle,
        currentPlayer: this.getCurrentPlayer()
      }
    });
  }

  attackTo(oponentTargetFieldIndex, withCardOnFieldIndex, skillIndex) {
    let oponentIndex = this.getOponentPlayerIndex();
    let currentPlayerIndex = this.getCurrentPlayerIndex();

    let oponentPlayerCard = this.battle.field[oponentIndex][0][oponentTargetFieldIndex];
    let currentPlayerCard = this.battle.field[currentPlayerIndex][0][withCardOnFieldIndex];
    let currentPlayerCardSkill = currentPlayerCard.card.skills[skillIndex];

    let damage = currentPlayerCard.card.attack * currentPlayerCardSkill.card.power - oponentPlayerCard.card.defense * currentPlayerCardSkill.card.power;

    this.socket.emit('battle updated', {
      type: Battle.UPDATES.ATTACK_TO_STARTS,
      payload: {
        battle: this.battle,
        currentPlayer: this.getCurrentPlayer(),
        damage
      }
    });

    // Attack the oponent
    this.decreaseLife(damage);

    // Move the monster to the graveyard
    let destroyedCard = damage > 0 ? oponentPlayerCard : damage < 0 ? currentPlayerCard : null;
    let playerDamaged = damage > 0 ? this.getOponentPlayer() : damage < 0 ? this.getCurrentPlayer() : null;
    let fieldIndex    = damage > 0 ? oponentTargetFieldIndex : damage < 0 ? withCardOnFieldIndex : null;
    let playerIndex   = damage > 0 ? this.getOponentPlayerIndex() : damage < 0 ? this.getOponentPlayerIndex() : null;
    this.moveToGraveyard(destroyedCard, playerDamaged, fieldIndex, playerIndex);
  }

  moveToGraveyard(destroyedCard, playerDamaged, fieldIndex, playerIndex) {
    this.getCurrentPlayer().player.graveyard.push(destroyedCard);

    this.socket.emit('battle updated', {
      type: Battle.UPDATES.MOVE_TO_GRAVEYARD,
      payload: {
        battle: this.battle,
        currentPlayer: this.getCurrentPlayer(),
        card: destroyedCard
      }
    });

    this.removeCardOnField(destroyedCard, playerIndex, fieldIndex);
  }

  decreaseLife(lifeToDecrease) {
    this.getOponentPlayer().life -= lifeToDecrease;

    this.socket.emit('battle updated', {
      type: Battle.UPDATES.MOVE_TO_GRAVEYARD,
      payload: {
        battle: this.battle,
        currentPlayer: this.getCurrentPlayer(),
        lifeDecreased: lifeToDecrease,
        life: this.getOponentPlayer().life
      }
    });

    if (this.getOponentPlayer().life <= 0) {
      // TODO: We have a winner!
      this.battle.winner = this.getCurrentPlayer();

      this.socket.emit('battle updated', {
        type: Battle.UPDATES.BATTLE_ENDS,
        payload: {
          battle: this.battle,
          winner: this.getCurrentPlayer()
        }
      });
    }
  }

  isFieldFull(fieldType = 0) {
    let currentPlayerIndex = this.getCurrentPlayerIndex();

    return this.battle.field[currentPlayerIndex][fieldType] >= GameConfig.MAX_CARDS_ON_FIELD;
  }

  getCurrentPlayerIndex() {
    return this.battle.turn % 2 === 0 ? this.battle.turns[0] : this.battle.turns[1];
  }

  getCurrentPlayer() {
    return this.battle.players[this.getCurrentPlayerIndex()];
  }

  getOponentPlayerIndex() {
    return this.getCurrentPlayerIndex() === 0 ? this.battle.turns[1] : this.battle.turns[0];
  }

  getOponentPlayer() {
    return this.battle.players[this.getOponentPlayerIndex()];
  }

  getPlayerByIndex(index) {
    return this.battle.players[index]
  }

  buyCards(data = {}) {
    let luckyPlayer = this.getPlayerByIndex(data.playerIndex);
    let cardsBought = luckyPlayer.player.deck.splice(0, data.qty);

    luckyPlayer.player.cardsOnHand = luckyPlayer.player.cardsOnHand.concat(cardsBought);

    this.socket.emit('battle updated', {
      type: Battle.UPDATES.BUY_CARDS,
      payload: {
        battle: this.battle,
        currentPlayer: this.getCurrentPlayer(),
        qty: data.qty,
        cardsBought,
        cardsOnHand: luckyPlayer.player.cardsOnHand
      }
    });
  }
}

Battle.UPDATES = {
  BATTLE_STARTS: 'BATTLE_STARTS',
  DRAW_CARD: 'DRAW_CARD',
  DRAW_CARD_ON_FIELD: 'DRAW_CARD_ON_FIELD',
  CLOSE_TURN: 'CLOSE_TURN',
  REMOVE_CARD_ON_FIELD: 'REMOVE_CARD_ON_FIELD',
  ATTACK_TO_STARTS: 'ATTACK_TO_STARTS',
  ATTACK_TO_FINISHED: 'ATTACK_TO_FINISHED',
  MOVE_TO_GRAVEYARD: 'MOVE_TO_GRAVEYARD',
  DECREASE_LIFE: 'DECREASE_LIFE',
  BUY_CARDS: 'BUY_CARDS',
  BATTLE_ENDS: 'BATTLE_ENDS'
};

module.exports = Battle;
