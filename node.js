class node {
	constructor(x, y, isWall) {
		this.x = x;
		this.y = y;
		this.isWall = isWall;
		this.g = Infinity;
		this.f = Infinity;
		this.parent = {
			x: null,
			y: null,
		};
		this.visited = false;
	}
}

export default node;
