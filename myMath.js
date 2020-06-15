'use strict';

class Vector2{
	constructor(x, y){
		this.x = x;
		this.y = y;
	}

	invert(){
		return new Vector2(-this.x, -this.y);
	}

	add(vector){
		return new Vector2(this.x + vector.x, this.y + vector.y);
	}

	subtract(vector){
		return this.add(vector.invert());
	}

	multiply(value){
		return new Vector2(this.x * value, this.y * value);
	}

	divide(value){
		return new Vector2(this.x / value, this.y / value);
	}

	normalize(){
		const magnitude = Math.sqrt(square(this.x) + square(this.y));
		return this.divide(magnitude);
	}

	ap(fn){
		return new Vector2(fn(this.x), fn(this.y));
	}

	static from(vector){
		return new Vector2(vector.x, vector.y);
	}

	static zero(){
		return new Vector2(0,0);
	}
}

const square = x => x * x;

function clamp(x, a, b){
	if (x < a){
		return a;
	}
	else if (x > b) {
		return b;
	}
	return x;
}

module.exports = {Vector2, clamp, square};
