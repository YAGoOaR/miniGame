'use strict';
const net = require('net');
const input = require('./scripts/input.js');
const draw = require('./scripts/draw.js');

const connection = { port: 2000, host: '127.0.0.1' };
const START_MESSAGE = 'The game has started. Press \'q\' to quit \nConnecting to localhost';
const ERROR_MESSAGE = `There is no reachable server on ${connection.host}`;
const NO_CONNECTION_MESSAGE = 'no connection';
const RETRY_MESSAGE = 'Do you want to retry?\n(\'r\' -retry, \'c\' - change connection ip address, default - quit)';
const CONNECTION_MESSAGE = 'choose connection ip';

let curChar = '';
input.getStream((data) => { curChar = data; });
const movement = {x : 0, y : 0};

console.clear();
console.log(START_MESSAGE);

const socket = new net.Socket();
socket.setNoDelay(true);
socket.on('data', onData);
socket.on('error', () => {
	console.clear();
	console.log(ERROR_MESSAGE);
	retry();
});

connect();

function onData(data){
	const dataObj = JSON.parse(data);
	if(typeof dataObj === 'string'){
		console.clear();
		console.log(dataObj);
		retry();
		return;
	}
	const players = dataObj.players;
	const ball = dataObj.ball;
	draw.draw(players, ball, false);
	setTimeout(() => {
		control(movement);
		socket.write(JSON.stringify(movement));
	} , 50);
}

function control(movement){
	movement.y = 0;
	if(curChar === 'w') movement.y = -1;
	if(curChar === 's') movement.y = 1;
	curChar = '';
}

function retry(){
	disconnect();
	console.log(RETRY_MESSAGE);
	input.onData((message) => {
		if(message === 'c'){
			console.log(CONNECTION_MESSAGE);
			input.onData((message)=>{
				connection.host = message;
				connect();
			});
		}
		else if(message === 'r') {
			connect();
		}
		else {
			process.exit(0);
		}
	});
}

function connect(){
	try {
		socket.connect(connection);
	} catch (e) {
		console.log(NO_CONNECTION_MESSAGE);
		retry();
	}
}

function disconnect(){
	socket.end();
}

input.keyEvent(input.QUIT_BUTTON, () => {
	console.clear();
	process.exit(0);
});
