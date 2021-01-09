'use strict';
const input = require('./input.js');
const draw = require('./draw.js');
const myMath = require('./myMath.js');
const Vector2 = myMath.Vector2;
let curChar = '';
input.getStream(data => { curChar = data; });

const PLAYER_HEIGHT = 2;
const SPEED_MULTIPLIER = 0.5;
const COLLIDER_SIZE_OFFSET = 0.2;
const SPEED_INCREASE_VALUE = 1.1;
const MAX_VERTICAL_VELOCITY = 0.6;
const MAX_HORIZONTAL_VELOCITY = 2.5;
const HEIGHT = draw.scrn.height;
const WIDTH = draw.scrn.width;
const SERVER_WIN_MESSAGE = 'Server won';
const CLIENT_WIN_MESSAGE = 'Client won';
const FRAMES_PER_SECOND = 10;
const TIME_BEFORE_START = 4000;

class Player {
  constructor(x = 0, color = 0) {
    const y = Math.floor(HEIGHT / 2);
    this.pos = new Vector2(x, y);
    this.prevPos = this.pos;
    this.velocity = 0;
    this.color = color;
  }
  move(movement) {
    this.pos = this.pos.add(movement);
  }
  update() {
    this.velocity = this.pos.y - this.prevY;
    this.prevY = this.pos.y;
  }
}

class Ball {
  constructor() {
    this.pos = new Vector2(WIDTH, HEIGHT).divide(2).ap(Math.floor);
    this.velocity = Vector2.zero();
  }

  setupVelocity() {
    const velocityX = -1;
    const velocityY = Math.random() - 0.5;
    this.velocity = new Vector2(velocityX, velocityY)
      .normalize()
      .multiply(SPEED_MULTIPLIER);
  }

  update(players) {
    const nextPos = this.pos.add(this.velocity);
    if (nextPos.y < 1 || nextPos.y > HEIGHT - 1) {
      this.velocity.y = -this.velocity.y;
      nextPos.y = this.pos.y + this.velocity.y;
    }

    for (const player of players) {
      const deltaX = Math.abs(nextPos.x - player.pos.x);
      const deltaY = Math.abs(nextPos.y - player.pos.y);
      if (deltaX < 1 + COLLIDER_SIZE_OFFSET &&
        deltaY <= PLAYER_HEIGHT + COLLIDER_SIZE_OFFSET) {
        this.velocity.x = -this.velocity.x;
        nextPos.x = this.pos.x + this.velocity.x;
        this.velocity.y += player.velocity / 4;
        const max = MAX_VERTICAL_VELOCITY;
        this.velocity.y = myMath.clamp(this.velocity.y, -max, max);
        this.increaseSpeed();
      }
    }
    this.pos = nextPos;
  }
  increaseSpeed() {
    this.velocity = this.velocity.multiply(SPEED_INCREASE_VALUE);
    const max = MAX_HORIZONTAL_VELOCITY;
    this.velocity.x = myMath.clamp(this.velocity.x, -max, max);
  }
}

class Game {
  constructor(opponentSocket) {
    let playerCounter = 0;
    this.opponentSocket = opponentSocket;
    const player2 = new Player(WIDTH, ++playerCounter);
    this.players = [ new Player(0, ++playerCounter), player2 ];
    this.ball = new Ball();
    this.start();
  }

  start() {
    this.opponentSocket.on('data', data => {
      this.players[1].move(JSON.parse(data));
    });

    this.gameLoop = setInterval(() => {
      this.update();
    }, 1000 / FRAMES_PER_SECOND);

    setTimeout(() => {
      this.ball.setupVelocity();
    }, TIME_BEFORE_START);

  }

  update() {
    const players = this.players;
    draw.draw(players, this.ball);
    this.control(players[0]);
    this.ball.update(players);
    for (const player of players) {
      const bottom = PLAYER_HEIGHT + 1;
      const top = HEIGHT - PLAYER_HEIGHT - 1;
      player.pos.y = myMath.clamp(player.pos.y, bottom, top);
      player.update();
    }
    this.checkGoal();
    this.sendToClient();
  }

  checkGoal() {
    if (this.ball.pos.x < -1) {
      this.gameOver(CLIENT_WIN_MESSAGE);
    } else if (this.ball.pos.x > WIDTH + 1) {
      this.gameOver(SERVER_WIN_MESSAGE);
    }
  }

  gameOver(reason) {
    clearInterval(this.gameLoop);
    setTimeout(() => {
      console.clear();
      this.opponentSocket.write(JSON.stringify(reason));
      console.log(reason);
    }, 1000);
  }

  stop() {
    clearInterval(this.gameLoop);
  }

  sendToClient() {
    this.opponentSocket.write(
      JSON.stringify({ players: this.players, ball: this.ball })
    );
  }

  control(player) {
    if (curChar === 'w') player.move({ x: 0, y: -1 });
    if (curChar === 's') player.move({ x: 0, y: 1 });
    curChar = '';
  }
}

module.exports = { Game };
