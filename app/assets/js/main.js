// TODO: Implement vuejs, bind event on buttons

let io = require('socket.io-client');

let socket = io.connect('http://localhost:8888');
let $ = document.querySelector.bind(document);

// Components
let loginForm = $('#login-form');
let play = $('#play');
let playButton = $('#play button');
let waitingOponent = $('#waiting-oponent');
let field = $('#field');
let cardsContainer = $('#cards');

let playerData = {};

$('#login-form').addEventListener('submit', e => {
  e.preventDefault();

  playerData = {
    nickname: $('#nickname').value,
    password: $('#password').value,
    firstName: $('#first-name').value,
    lastName: $('#last-name').value,
    connected: true
  };

  socket.emit('login', playerData);
});

socket.on('logged', function (user) {
  // User was logged success
  loginForm.classList.add('hidden');
  play.classList.remove('hidden');

  playButton.addEventListener('click', () => {
    socket.emit('play', user);
  });

  socket.on('waiting a oponent', function () {
    play.classList.add('hidden');
    waitingOponent.classList.remove('hidden');
  });

  socket.on('battle starts', function (battle) {
    console.log('battle starts', battle);

    play.classList.add('hidden');
    waitingOponent.classList.add('hidden');
    field.classList.remove('hidden');

    renderCards(battle.players[playerData.nickname].player.cardsOnHand);

    socket.on('battle updated', function (data) {
      let {payload, type} = data;
      let {currentPlayer, battle} = payload;
      let {player} = currentPlayer;

      switch (type) {
        case 'DRAW_CARD_ON_FIELD':
          console.log(`The player ${player.nickname} draw the card ${payload.cardDrawed.card.name}`);
          break;
      }
    });
  });
});

function renderCards(cards) {
  cardsContainer.innerHTML = '';

  cards.forEach(card => {
    let btn = document.createElement('button');
    btn.innerText = card.card.name;

    cardsContainer.appendChild(btn);
  });

  field.appendChild(cardsContainer);
}
