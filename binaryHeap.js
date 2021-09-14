class heap {
	constructor() {
		this.heap = []; //binary heap repesented as 1d array
	}

	//return length of binary heap
	size() {
		return this.heap.length;
	}

	//returns true if node is contained in binaryheap
	contains(node) {
		let x = node.x;
		let y = node.y;

		for (let i = 0; i < this.heap.length; i++) {
			if (x === this.heap[i].x && y === this.heap[i].y) {
				return true;
			}
		}
		return false;
	}

	//returns true if first node in binary heap is
	//the end point
	isEnd(end) {
		if (!this.heap.length) {
			return true;
		}

		let x = this.heap[0].x;
		let y = this.heap[0].y;

		if (x === end[1] && y === end[0]) return true;
		else return false;
	}

	//insert node into end of heap, then return if heap only
	//contains that node, else filter the node up to the correct spot
	//in the heap
	insertNode(node) {
		this.heap.push(node);

		if (this.heap.length === 1) {
			return;
		} else {
			this.filterUp(this.heap.length - 1);
		}
	}

	//remove node from heap
	removeNode(node) {
		let x = node.x;
		let y = node.y;
		let index;

		//find index of node in binary minheap
		for (let i = 0; i < this.heap.length; i++) {
			if (x === this.heap[i].x && y === this.heap[i].y) {
				index = i;
			}
		}

		//replace node to be removed with last node in minheap
		if (index < this.heap.length - 1) {
			this.heap[index] = this.heap[this.heap.length - 1];
			this.heap.splice(this.heap.length - 1);
		}

		let parent = Math.floor((index - 1) / 2);

		if (index === 0 && this.heap.length === 1) {
			this.heap.splice(0, 1);
		}

		//if node to be removed is root, or parent has lower f value filter down
		//else, filter up
		if (index === 0 || this.heap[parent].f < node.f) {
			this.filterDown(index);
		} else {
			this.filterUp(index);
		}
	}

	//filter node at position i down the heap
	filterDown(i) {
		let current = i;

		//while current node has atlest one child node
		while (2 * current + 1 <= this.heap.length - 1) {
			let left = 2 * current + 1;
			let right = 2 * current + 2;

			let fCurrent = this.heap[current].f;
			let fLeft = this.heap[left].f;

			//if current node has two child nodes
			if (right <= this.heap.length - 1) {
				let fRight = this.heap[right].f;

				//if current has lowest f value, then node in correct position, break
				//the loop
				if (fCurrent < fLeft && fCurrent < fRight) {
					break;
				} else {
					//else, swap current node with smallest of its children
					if (fLeft < fRight) {
						[this.heap[current], this.heap[left]] = [
							this.heap[left],
							this.heap[current],
						];

						current = left;
					} else {
						[this.heap[current], this.heap[right]] = [
							this.heap[right],
							this.heap[current],
						];

						current = right;
					}
				}
			} else {
				//else current node only has one child node

				//if current node f value is lower than child then node in correct
				//position, break loop
				if (fCurrent < fLeft) {
					break;
				} else {
					//else, swap current node with left child
					[this.heap[current], this.heap[left]] = [
						this.heap[left],
						this.heap[current],
					];

					current = left;
				}
			}
		}
	}

	//filter node at position i up the heap
	filterUp(i) {
		let current = i;

		//while current position isnt root of heap
		while (current) {
			let parent = Math.floor((current - 1) / 2);
			let fCurrent = this.heap[current].f;
			let fParent = this.heap[parent].f;

			//if current node < parent node, swap nodes
			if (fCurrent < fParent) {
				[this.heap[current], this.heap[parent]] = [
					this.heap[parent],
					this.heap[current],
				];

				current = parent;
			} else {
				//else node in correct position, so break loop
				break;
			}
		}
	}
}

export default heap;
