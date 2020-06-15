'use strict';
process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
process.stdin.on('data', sendData );

const QUIT_BUTTON = 'q';

let callbacks = [];

function keyEvent(key, fn) {
	process.stdin.on('data', char =>{
		if(char === key) fn();
	});
}

function onData(callback){
	process.stdin.setRawMode(false);
	callbacks.push(callback);
}

function sendData(data){
	process.stdin.setRawMode(true);
	const list = [...callbacks];
	callbacks = [];
	for(const callback of list){
		callback(refineData(data));
	}
}

function getStream (callback) {
	process.stdin.on('data', callback );
}

module.exports = {keyEvent, getStream, onData, QUIT_BUTTON};

function refineData(data){
	return data.trim().slice(0,data.length - 2);
}
