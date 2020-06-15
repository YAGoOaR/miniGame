'use strict';
const net = require('net');
const input = require('./input.js');
const game = require('./game.js');
const GameInstance = game.Game;

const START_MESSAGE = 'Waiting for client';
const ERROR_MESSAGE = 'Disconnected';
const END_MESSAGE = 'Match is ended \nWaiting for client';

const server = net.createServer();
server.listen(2000);
let currentGame;
console.log(START_MESSAGE);

server.on('connection', onConnection);

function onConnection(socket){
	if(currentGame) return;
	currentGame = new GameInstance(socket);
	socket.setNoDelay(true);
	socket.on( 'error', onError);
	socket.on( 'end', onEnd);
}

function onError(){
	endGame();
	console.clear();
	console.log(ERROR_MESSAGE);
}

function onEnd(){
	endGame();
	console.log(END_MESSAGE);
}

function endGame(){
	currentGame.stop();
	currentGame = null;
}

input.keyEvent(input.QUIT_BUTTON, () => {
	console.clear();
	process.exit(0);
});
