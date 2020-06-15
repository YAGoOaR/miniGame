'use strict';
const scrn = {height: 17, width: 30};

const PLAYER_HEIGHT = 2;
const SYMBOL = '█';

const getChar = (color, symbol = SYMBOL) => `\x1b[3${color}m${symbol}\x1b[0m`;

const invertColor = color => 3 - color;

const draw = (players, ball, host = true) => {
	let str = '';
	for (let j = 0; j <= scrn.height; j++){
		for (let i = 0; i <= scrn.width; i++){
			let char = ' ';
			for (const player of players){
				if(player.pos.x === i && Math.abs(player.pos.y- j) <= PLAYER_HEIGHT){
					if(host){
						char = getChar(player.color);
					}
					else {
						char = getChar(invertColor(player.color));
					}
				}
			}
			if(Math.round(ball.pos.x) === i && Math.round(ball.pos.y) === j){
				char = getChar(4);
			}
			if(j === scrn.height || j === 0){
				char = getChar(3);
			}
			str += char;
		}
		str += '\n';
	}
	console.clear();
	console.log(str);
};

module.exports = {draw, scrn};
