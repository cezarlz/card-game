// TODO: Implement vuejs, bind event on buttons
let $ = document.querySelector.bind(document);

let React = require('react');
let ReactDOM = require('react-dom');

let io = require('socket.io-client');
let socket = io.connect('http://localhost:8888');

// Components
let app = $('#app');


const PlayButton = ({user}) => {
  console.log(user);
  const play = () => socket.emit('play', user);

  return (
    <div id="play">
      <button onClick={play}>Play!</button>
    </div>
  );
};

PlayButton.propTypes = {
  battle: React.PropTypes.object
};

const WaitingOponent = () => {
  return (
    <div id="waiting-oponent">
      <p>Waiting a oponent!</p>
      <button id="cancel">Cancel</button>
    </div>
  );
};

const Field = ({battle}) => {
  return (
    <div id="field">
      <div id="cards"></div>
    </div>
  );
};

Field.propTypes = {
  battle: React.PropTypes.object.isRequired
};

const LoginForm = () => {
  let playerData = {};

  const login = e => {
    e.preventDefault();

    playerData = {
      nickname: $('#nickname').value,
      password: $('#password').value,
      firstName: $('#first-name').value,
      lastName: $('#last-name').value,
      connected: true
    };

    socket.emit('login', playerData);
  };

  return (
    <form id="login-form" onSubmit={login}>
      <input type="text" id="nickname" placeholder="Nickname" />
      <input type="text" id="password" placeholder="Password" defaultValue="sdaddasd" />
      <input type="text" id="first-name" placeholder="First name" defaultValue="sdaddasd" />
      <input type="text" id="last-name" placeholder="Last name" defaultValue="sdaddasd" />

      <button id="login-form">Enter!</button>
    </form>
  );
};

socket.on('logged', function (user) {
  // User was logged success
  ReactDOM.render(<PlayButton user={user} />, app);
});

socket.on('waiting a oponent', function () {
  ReactDOM.render(<WaitingOponent />, app);
});

socket.on('battle starts', function (battle) {
  console.log('battle starts', battle);

  ReactDOM.render(<Field battle={battle} />, app);

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

ReactDOM.render(<LoginForm />, app);
