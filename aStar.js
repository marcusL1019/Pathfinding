import node from './node';
import binaryHeap from './binaryHeap';

export default function aStar(start, end, walls, algo) {
	let nodes = createNodes(walls, start, end);
	let history = [];

	let [yStart, xStart] = [start[0], start[1]];

	let openSet = new binaryHeap();
	openSet.insertNode(nodes[yStart][xStart]);

	while (!openSet.isEnd(end)) {
		if (!openSet.size()) return false;

		let current = openSet.heap[0];
		openSet.removeNode(openSet.heap[0]);
		current.visited = true;

		let item = [];
		item.push(current);

		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				if (
					nodes[current.y + i] === undefined ||
					nodes[current.y + i][current.x + j] === undefined ||
					nodes[current.y + i][current.x + j].isWall ||
					(i === 0 && j === 0)
				) {
					continue;
				}

				let neighbor = nodes[current.y + i][current.x + j];
				let cost = current.g + distance(current, neighbor);

				if (openSet.contains(neighbor) && cost < neighbor.g) {
					openSet.removeNode(neighbor);
				}

				if (neighbor.visited && cost < neighbor.g) {
					neighbor.visited = false;
				}

				if (!openSet.contains(neighbor) && !neighbor.visited) {
					neighbor.g = cost;
					neighbor.f = neighbor.g + h(neighbor, end, algo);
					neighbor.parent.x = current.x;
					neighbor.parent.y = current.y;
					openSet.insertNode(neighbor);
				}
				item.push(neighbor);
			} //loop 2
		} //loop 1
		history.push(item);
	} //while loop
	if (!openSet.size()) {
		return false;
	}
	history.push(nodes[end[0]][end[1]]);
	return { nodes: nodes, history: history };
}

function createNodes(walls, start, end, algo) {
	let nodes = Array(walls.length)
		.fill()
		.map((_, y) =>
			Array(walls[0].length)
				.fill()
				.map((_, x) => new node(x, y, walls[y][x]))
		);

	nodes[start[0]][start[1]].f = h(nodes[start[0]][start[1]], end, algo);
	nodes[start[0]][start[1]].g = 0;

	return nodes;
}

function h(neighbor, end, algo) {
	if (algo === 'Dijkstra') return 0;

	let dx = Math.abs(neighbor.x - end[1]);
	let dy = Math.abs(neighbor.y - end[0]);

	return 1.001 * (dy + dx + (Math.sqrt(2) - 2) * Math.min(dx, dy));
}

function distance(current, neighbor) {
	return Math.sqrt(
		Math.pow(current.x - neighbor.x, 2) + Math.pow(current.y - neighbor.y, 2)
	);
}
